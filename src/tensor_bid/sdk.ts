import {
  AnchorProvider,
  BorshCoder,
  Coder,
  Event,
  EventParser,
  Instruction,
  Program,
  Provider,
  Wallet,
} from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  AccountInfo,
  Commitment,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  TransactionResponse,
} from "@solana/web3.js";
import {
  AuthorizationData,
  AUTH_PROG_ID,
  prepPnftAccounts,
  TMETA_PROG_ID,
} from "@tensor-hq/tensor-common";
import BN from "bn.js";
import {
  AccountSuffix,
  decodeAcct,
  DEFAULT_MICRO_LAMPORTS,
  DEFAULT_NFT_TRANSFER_COMPUTE_UNITS,
  DiscMap,
  evalMathExpr,
  genDiscToDecoderMap,
  getAccountRent,
  getRentSync,
  hexCode,
} from "../common";
import {
  findTSwapPDA,
  getTotalComputeIxs,
  TensorSwapSDK,
  TENSORSWAP_ADDR,
} from "../tensorswap";
import { InstructionDisplay, ParsedAccount } from "../types";
import { TBID_ADDR } from "./constants";
import { findBidStatePda, findNftTempPDA } from "./pda";

// ---------------------------------------- Versioned IDLs for backwards compat when parsing.
import {
  IDL as IDL_v0_1_0,
  TensorBid as TensorBid_v0_1_0,
} from "./idl/tensor_bid_v0_1_0";

import {
  IDL as IDL_latest,
  TensorBid as TensorBid_latest,
} from "./idl/tensor_bid";

// initial deployment: https://explorer.solana.com/tx/2pLEU4Bvvd6xtRasDMQa9pRjhEsJKzqRoaQ4oDBG38AWadHUPudi8WjNACrB4neR5ap1GAxK6kvgcMuYYRvSVg11
export const TensorBidIDL_v0_1_0 = IDL_v0_1_0;
export const TensorBidIDL_v0_1_0_EffSlot = 183865849;

// remove margin funding during bidding: https://solscan.io/tx/5A7XWvgicH1hDYAPtWhZd2SX7WCvUB2jjKDFqyRr6MwtfnGuTyfPkngTvQ7dFfcSTvjihLuBSETftPo1u5iixpp
export const TensorBidIDL_latest = IDL_latest;
export const TensorBidIDL_latest_EffSlot = 184669012;

export type TensorBidIDL = TensorBid_v0_1_0 | TensorBid_latest;

// Use this function to figure out which IDL to use based on the slot # of historical txs.
export const triageBidIDL = (slot: number | bigint): TensorBidIDL | null => {
  if (slot < TensorBidIDL_v0_1_0_EffSlot) return null;
  if (slot < TensorBidIDL_latest_EffSlot) return TensorBidIDL_v0_1_0;
  return TensorBidIDL_latest;
};

// --------------------------------------- constants

export const CURRENT_TBID_VERSION: number = +IDL_latest.constants.find(
  (c) => c.name === "CURRENT_TBID_VERSION"
)!.value;
export const TBID_TAKER_FEE_BPS: number = +IDL_latest.constants.find(
  (c) => c.name === "TBID_TAKER_FEE_BPS"
)!.value;
export const MAX_EXPIRY_SEC: number = +IDL_latest.constants.find(
  (c) => c.name === "MAX_EXPIRY_SEC"
)!.value;
export const BID_STATE_SIZE: number = evalMathExpr(
  IDL_latest.constants.find((c) => c.name === "BID_STATE_SIZE")!.value
);

export const APPROX_BID_STATE_RENT = getRentSync(BID_STATE_SIZE);

// --------------------------------------- state structs

export type BidStateAnchor = {
  version: number;
  bidAmount: BN;
  nftMint: PublicKey;
  bidder: PublicKey;
  bump: number[];
  expiry: BN;
  margin: PublicKey | null;
};

export type TensorBidPdaAnchor = BidStateAnchor;

export type TaggedTensorBidPdaAnchor = {
  name: "bidState";
  account: BidStateAnchor;
};

export type TensorBidEventAnchor = Event<typeof IDL_latest["events"][number]>;

// ------------- Types for parsed ixs from raw tx.

export type TBidIxName = typeof IDL_latest["instructions"][number]["name"];
export type TBidIx = Omit<Instruction, "name"> & { name: TBidIxName };
export type ParsedTBidIx = {
  ixIdx: number;
  ix: TBidIx;
  events: TensorBidEventAnchor[];
  // FYI: accounts under InstructioNDisplay is the space-separated capitalized
  // version of the fields for the corresponding #[Accounts].
  // eg sol_escrow -> "Sol Escrow', or tswap -> "Tswap"
  formatted: InstructionDisplay | null;
};
export type TBidPricedIx = { lamports: BN };

// --------------------------------------- sdk

export class TensorBidSDK {
  program: Program<TensorBidIDL>;
  discMap: DiscMap<TensorBidIDL>;
  coder: BorshCoder;
  eventParser: EventParser;

  constructor({
    idl = IDL_latest,
    addr = TBID_ADDR,
    provider,
    coder,
  }: {
    idl?: any; //todo better typing
    addr?: PublicKey;
    provider?: Provider;
    coder?: Coder;
  }) {
    this.program = new Program<TensorBidIDL>(idl, addr, provider, coder);
    this.discMap = genDiscToDecoderMap(this.program);
    this.coder = new BorshCoder(idl);
    this.eventParser = new EventParser(addr, this.coder);
  }

  // --------------------------------------- fetchers

  async fetchBidState(bidState: PublicKey, commitment?: Commitment) {
    return (await this.program.account.bidState.fetch(
      bidState,
      commitment
    )) as BidStateAnchor;
  }

  // --------------------------------------- account methods

  decode(acct: AccountInfo<Buffer>): TaggedTensorBidPdaAnchor | null {
    if (!acct.owner.equals(this.program.programId)) return null;
    return decodeAcct(acct, this.discMap);
  }

  // --------------------------------------- ixs

  async bid({
    bidder,
    nftMint,
    lamports,
    margin = null,
    expireIn = null,
  }: {
    bidder: PublicKey;
    nftMint: PublicKey;
    lamports: BN;
    margin?: PublicKey | null;
    expireIn?: BN | null;
  }) {
    const [bidState, bidStateBump] = findBidStatePda({
      mint: nftMint,
      owner: bidder,
    });
    const [tswapPda, tswapPdaBump] = findTSwapPDA({});

    const builder = this.program.methods.bid(lamports, expireIn).accounts({
      nftMint,
      bidder,
      bidState,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
      tswap: tswapPda,
      //optional, as a default pick another mutable account
      marginAccount: margin ?? bidder,
    });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      bidState,
      bidStateBump,
      tswapPda,
      tswapPdaBump,
    };
  }

  async takeBid({
    bidder,
    seller,
    nftMint,
    lamports,
    margin = null,
    metaCreators,
    nftSellerAcc,
    authData,
    compute = DEFAULT_NFT_TRANSFER_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
    optionalRoyaltyPct = null,
    takerBroker = null,
  }: {
    bidder: PublicKey;
    seller: PublicKey;
    nftMint: PublicKey;
    lamports: BN;
    margin?: PublicKey | null;
    /// If provided, skips RPC call to fetch on-chain metadata + creators.
    metaCreators?: {
      metadata: PublicKey;
      creators: PublicKey[];
    };
    nftSellerAcc: PublicKey;
    authData?: AuthorizationData | null;
    //passing in null or undefined means these ixs are NOT included
    compute?: number | null;
    priorityMicroLamports?: number | null;
    //optional % OF full royalty amount, so eg 50% of 10% royalty would be 5%
    optionalRoyaltyPct?: number | null;
    //optional taker broker account
    takerBroker?: PublicKey | null;
  }) {
    const [bidState, bidStateBump] = findBidStatePda({
      mint: nftMint,
      owner: bidder,
    });
    const [tswapPda, tswapPdaBump] = findTSwapPDA({});

    //figure out fee wallet
    const wallet = new Wallet(Keypair.generate());
    const provider = new AnchorProvider(
      this.program.provider.connection,
      wallet,
      {
        commitment: "confirmed",
        preflightCommitment: "confirmed",
        skipPreflight: true,
      }
    );
    const swapSdk = new TensorSwapSDK({ provider });
    const tSwapAcc = await swapSdk.fetchTSwap(tswapPda);
    const [tempPda, tempPdaBump] = findNftTempPDA({ nftMint });

    const destAta = getAssociatedTokenAddressSync(nftMint, bidder, true);

    //prepare 2 pnft account sets
    const [
      {
        meta,
        creators,
        ownerTokenRecordBump,
        ownerTokenRecordPda,
        destTokenRecordBump: tempDestTokenRecordBump,
        destTokenRecordPda: tempDestTokenRecordPda,
        ruleSet,
        nftEditionPda,
        authDataSerialized,
      },
      {
        destTokenRecordBump: destTokenRecordBump,
        destTokenRecordPda: destTokenRecordPda,
      },
    ] = await Promise.all([
      prepPnftAccounts({
        connection: this.program.provider.connection,
        metaCreators,
        nftMint,
        destAta: tempPda,
        authData,
        sourceAta: nftSellerAcc,
      }),
      prepPnftAccounts({
        connection: this.program.provider.connection,
        metaCreators,
        nftMint,
        destAta,
        authData,
        sourceAta: tempPda,
      }),
    ]);

    const builder = this.program.methods
      .takeBid(lamports, !!ruleSet, authDataSerialized, optionalRoyaltyPct)
      .accounts({
        nftMint,
        tswap: tswapPda,
        feeVault: tSwapAcc.feeVault,
        bidState,
        bidder,
        nftSellerAcc,
        nftMetadata: meta,
        nftBidderAcc: destAta,
        nftTempAcc: tempPda,
        seller,
        tensorswapProgram: TENSORSWAP_ADDR,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
        nftEdition: nftEditionPda,
        bidderTokenRecord: destTokenRecordPda,
        sellerTokenRecord: ownerTokenRecordPda,
        tempTokenRecord: tempDestTokenRecordPda,
        marginAccount: margin ?? seller,
        authRules: ruleSet ?? SystemProgram.programId,
        takerBroker: takerBroker ?? tSwapAcc.feeVault,
        pnftShared: {
          authorizationRulesProgram: AUTH_PROG_ID,
          tokenMetadataProgram: TMETA_PROG_ID,
          instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
        },
      })
      .remainingAccounts(
        creators.map((c) => ({
          pubkey: c,
          isWritable: true,
          isSigner: false,
        }))
      );

    const computeIxs = getTotalComputeIxs(compute, priorityMicroLamports);

    return {
      builder,
      tx: {
        ixs: [...computeIxs, await builder.instruction()],
        extraSigners: [],
      },
      bidState,
      bidStateBump,
      tswapPda,
      tswapPdaBump,
      tempPda,
      tempPdaBump,
      meta,
      ownerTokenRecordBump,
      ownerTokenRecordPda,
      destTokenRecordBump,
      destTokenRecordPda,
      tempDestTokenRecordBump,
      tempDestTokenRecordPda,
      ruleSet,
      nftEditionPda,
      authDataSerialized,
      nftbidderAcc: destAta,
    };
  }

  async cancelBid({
    bidder,
    nftMint,
  }: {
    bidder: PublicKey;
    nftMint: PublicKey;
  }) {
    const [bidState, bidStateBump] = findBidStatePda({
      mint: nftMint,
      owner: bidder,
    });

    const builder = this.program.methods.cancelBid().accounts({
      nftMint,
      bidder,
      bidState,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
    });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      bidState,
      bidStateBump,
    };
  }

  async closeExpiredBid({
    bidder,
    nftMint,
  }: {
    bidder: PublicKey;
    nftMint: PublicKey;
  }) {
    const [bidState, bidStateBump] = findBidStatePda({
      mint: nftMint,
      owner: bidder,
    });
    const builder = this.program.methods.closeExpiredBid().accounts({
      nftMint,
      bidder,
      bidState,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
    });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      bidState,
      bidStateBump,
    };
  }

  // --------------------------------------- helpers

  async getBidStateRent() {
    return await getAccountRent(
      this.program.provider.connection,
      this.program.account.bidState
    );
  }

  getError(
    name: typeof IDL_latest["errors"][number]["name"]
  ): typeof IDL_latest["errors"][number] {
    //@ts-ignore (throwing weird ts errors for me)
    return this.program.idl.errors.find((e) => e.name === name)!;
  }

  getErrorCodeHex(name: typeof IDL_latest["errors"][number]["name"]): string {
    return hexCode(this.getError(name).code);
  }

  // --------------------------------------- parsing raw txs

  // Stolen from https://github.com/saber-hq/saber-common/blob/4b533d77af8ad5c26f033fd5e69bace96b0e1840/packages/anchor-contrib/src/utils/coder.ts#L171-L185
  parseEvents = (logs: string[] | undefined | null) => {
    if (!logs) {
      return [];
    }

    const events: TensorBidEventAnchor[] = [];
    const parsedLogsIter = this.eventParser.parseLogs(logs ?? []);
    let parsedEvent = parsedLogsIter.next();
    while (!parsedEvent.done) {
      events.push(parsedEvent.value as unknown as TensorBidEventAnchor);
      parsedEvent = parsedLogsIter.next();
    }

    return events;
  };

  parseIxs(tx: TransactionResponse): ParsedTBidIx[] {
    const message = tx.transaction.message;
    const logs = tx.meta?.logMessages;

    const programIdIndex = message.accountKeys.findIndex((k) =>
      k.equals(this.program.programId)
    );

    const ixs: ParsedTBidIx[] = [];
    [
      // Top-level ixs.
      ...message.instructions.map((rawIx, ixIdx) => ({ rawIx, ixIdx })),
      // Inner ixs (eg in CPI calls).
      ...(tx.meta?.innerInstructions?.flatMap(({ instructions, index }) =>
        instructions.map((rawIx) => ({ rawIx, ixIdx: index }))
      ) ?? []),
    ].forEach(({ rawIx, ixIdx }) => {
      // Ignore ixs that are not from our program.
      if (rawIx.programIdIndex !== programIdIndex) return;

      // Instruction data.
      const ix = this.coder.instruction.decode(rawIx.data, "base58");
      if (!ix) return;
      const accountMetas = rawIx.accounts.map((acctIdx) => {
        const pubkey = message.accountKeys[acctIdx];
        return {
          pubkey,
          isSigner: message.isAccountSigner(acctIdx),
          isWritable: message.isAccountWritable(acctIdx),
        };
      });
      const formatted = this.coder.instruction.format(ix, accountMetas);

      // Events data.

      const events = this.parseEvents(logs);
      ixs.push({ ixIdx, ix: ix as TBidIx, events, formatted });
    });

    return ixs;
  }

  getFeeAmount(ix: ParsedTBidIx): BN | null {
    switch (ix.ix.name) {
      case "takeBid": {
        const event = ix.events[0].data;
        return event.tswapFee.add(event.creatorsFee);
      }
      case "bid":
      case "cancelBid":
      case "closeExpiredBid":
        return null;
    }
  }

  getSolAmount(ix: ParsedTBidIx): BN | null {
    switch (ix.ix.name) {
      case "takeBid":
      case "bid":
        return (ix.ix.data as TBidPricedIx).lamports;
      case "cancelBid":
      case "closeExpiredBid":
        return null;
    }
  }

  // FYI: accounts under InstructioNDisplay is the space-separated capitalized
  // version of the fields for the corresponding #[Accounts].
  // eg sol_escrow -> "Sol Escrow', or tswap -> "Tswap"
  // shared.sol_escrow -> "Shared > Sol Escrow"
  getAccountByName(
    ix: ParsedTBidIx,
    name: AccountSuffix
  ): ParsedAccount | undefined {
    // We use endsWith since composite nested accounts (eg shared.sol_escrow)
    // will prefix it as "Shared > Sol Escrow"
    return ix.formatted?.accounts.find((acc) => acc.name?.endsWith(name));
  }
}
