import {
  AnchorProvider,
  BorshCoder,
  Coder,
  EventParser,
  Instruction,
  Program,
} from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  getExtraAccountMetaAddress,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import {
  AccountInfo,
  AccountMeta,
  Commitment,
  PublicKey,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  TransactionResponse,
} from "@solana/web3.js";
import {
  AcctDiscHexMap,
  AUTH_PROGRAM_ID,
  Cluster,
  decodeAnchorAcct,
  genAcctDiscHexMap,
  getRent,
  getRentSync,
  hexCode,
  parseAnchorIxs,
  ParsedAnchorIx,
  PnftArgs,
  prependComputeIxs,
  prepPnftAccounts,
  TMETA_PROGRAM_ID,
} from "@tensor-hq/tensor-common";
import BN from "bn.js";
import {
  AccountSuffix,
  DEFAULT_MICRO_LAMPORTS,
  DEFAULT_XFER_COMPUTE_UNITS,
  evalMathExpr,
} from "../common";
import {
  WNS_PROGRAM_ID,
  WNS_DISTRIBUTION_PROGRAM_ID,
  getApprovalAccount,
  getDistributionAccount,
} from "../token2022";
import { findTSwapPDA, TensorSwapSDK, TENSORSWAP_ADDR } from "../tensorswap";
import { ParsedAccount } from "../types";
import { TBID_ADDR } from "./constants";
import { findBidStatePda, findNftTempPDA } from "./pda";

// ---------------------------------------- Versioned IDLs for backwards compat when parsing.
import {
  IDL as IDL_v0_1_0,
  TensorBid as TBid_v0_1_0,
} from "./idl/tensor_bid_v0_1_0";

import { IDL as IDL_latest, TensorBid as TBid_latest } from "./idl/tensor_bid";

// initial deployment: https://explorer.solana.com/tx/2pLEU4Bvvd6xtRasDMQa9pRjhEsJKzqRoaQ4oDBG38AWadHUPudi8WjNACrB4neR5ap1GAxK6kvgcMuYYRvSVg11
export const TBidIDL_v0_1_0 = IDL_v0_1_0;
export const TBidIDL_v0_1_0_EffSlot_Mainnet = 183865849;

// remove margin funding during bidding: https://solscan.io/tx/5A7XWvgicH1hDYAPtWhZd2SX7WCvUB2jjKDFqyRr6MwtfnGuTyfPkngTvQ7dFfcSTvjihLuBSETftPo1u5iixpp
export const TBidIDL_latest = IDL_latest;
export const TBidIDL_latest_EffSlot_Mainnet = 184669012;
export const TBidIDL_latest_EffSlot_Devnet = 203536603;

export type TBidIDL = TBid_v0_1_0 | TBid_latest;

// Use this function to figure out which IDL to use based on the slot # of historical txs.
export const triageBidIDL = (
  slot: number | bigint,
  cluster: Cluster
): TBidIDL | null => {
  switch (cluster) {
    case Cluster.Mainnet:
      if (slot < TBidIDL_v0_1_0_EffSlot_Mainnet) return null;
      if (slot < TBidIDL_latest_EffSlot_Mainnet) return TBidIDL_v0_1_0;
      return TBidIDL_latest;
    case Cluster.Devnet:
      if (slot < TBidIDL_latest_EffSlot_Devnet) return null;
      return TBidIDL_latest;
  }
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
  updatedAt: BN;
};

export type TensorBidPdaAnchor = BidStateAnchor;

export type TaggedTensorBidPdaAnchor = {
  name: "bidState";
  account: BidStateAnchor;
};

// ------------- Types for parsed ixs from raw tx.

export type TBidIxName = (typeof IDL_latest)["instructions"][number]["name"];
export type TBidIx = Omit<Instruction, "name"> & { name: TBidIxName };
export type ParsedTBidIx = ParsedAnchorIx<TBid_latest>;
export type TBidPricedIx = { lamports: BN };

// --------------------------------------- sdk

export class TensorBidSDK {
  program: Program<TBidIDL>;
  discMap: AcctDiscHexMap<TBidIDL>;
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
    provider?: AnchorProvider;
    coder?: Coder;
  }) {
    this.program = new Program<TBidIDL>(idl, addr, provider, coder);
    this.discMap = genAcctDiscHexMap(idl);
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
    return decodeAnchorAcct(acct, this.discMap);
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
    tokenProgram,
    margin = null,
    nftSellerAcc,
    meta,
    authData,
    compute = DEFAULT_XFER_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
    optionalRoyaltyPct = null,
    takerBroker = null,
  }: {
    bidder: PublicKey;
    seller: PublicKey;
    nftMint: PublicKey;
    lamports: BN;
    tokenProgram: PublicKey;
    margin?: PublicKey | null;
    nftSellerAcc: PublicKey;
    //optional % OF full royalty amount, so eg 50% of 10% royalty would be 5%
    optionalRoyaltyPct?: number | null;
    //optional taker broker account
    takerBroker?: PublicKey | null;
  } & PnftArgs) {
    const [bidState, bidStateBump] = findBidStatePda({
      mint: nftMint,
      owner: bidder,
    });
    const [tswapPda, tswapPdaBump] = findTSwapPDA({});

    const swapSdk = new TensorSwapSDK({
      provider: this.program.provider as AnchorProvider,
    });
    const tSwapAcc = await swapSdk.fetchTSwap(tswapPda);
    const [tempPda, tempPdaBump] = findNftTempPDA({ nftMint });

    const destAta = getAssociatedTokenAddressSync(
      nftMint,
      bidder,
      true,
      tokenProgram
    );

    //prepare 2 pnft account sets
    const {
      meta: newMeta,
      creators,
      ownerTokenRecordBump,
      ownerTokenRecordPda,
      destTokenRecordBump: tempDestTokenRecordBump,
      destTokenRecordPda: tempDestTokenRecordPda,
      ruleSet,
      nftEditionPda,
      authDataSerialized,
    } = await prepPnftAccounts({
      connection: this.program.provider.connection,
      meta,
      nftMint,
      destAta: tempPda,
      authData,
      sourceAta: nftSellerAcc,
    });
    meta = newMeta;
    const {
      destTokenRecordBump: destTokenRecordBump,
      destTokenRecordPda: destTokenRecordPda,
    } = await prepPnftAccounts({
      connection: this.program.provider.connection,
      meta,
      nftMint,
      destAta,
      authData,
      sourceAta: tempPda,
    });

    const builder = this.program.methods
      .takeBid(lamports, !!ruleSet, authDataSerialized, optionalRoyaltyPct)
      .accounts({
        nftMint,
        tswap: tswapPda,
        feeVault: tSwapAcc.feeVault,
        bidState,
        bidder,
        nftSellerAcc,
        nftMetadata: meta.address,
        nftBidderAcc: destAta,
        nftTempAcc: tempPda,
        seller,
        tensorswapProgram: TENSORSWAP_ADDR,
        tokenProgram,
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
          authorizationRulesProgram: AUTH_PROGRAM_ID,
          tokenMetadataProgram: TMETA_PROGRAM_ID,
          instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
        },
      })
      .remainingAccounts(
        creators.map((c) => ({
          pubkey: c.address,
          isWritable: c.share > 0, //only writable if they have a share
          isSigner: false,
        }))
      );

    return {
      builder,
      tx: {
        ixs: prependComputeIxs(
          [await builder.instruction()],
          compute,
          priorityMicroLamports
        ),
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

  // --------------------------------------- T22

  async takeBidT22({
    bidder,
    seller,
    nftMint,
    lamports,
    margin = null,
    nftSellerAcc,
    compute = DEFAULT_XFER_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
    takerBroker = null,
  }: {
    bidder: PublicKey;
    seller: PublicKey;
    nftMint: PublicKey;
    lamports: BN;
    margin?: PublicKey | null;
    nftSellerAcc: PublicKey;
    compute?: number | null | undefined;
    priorityMicroLamports?: number | null | undefined;
    //optional taker broker account
    takerBroker?: PublicKey | null;
  }) {
    const [bidState, bidStateBump] = findBidStatePda({
      mint: nftMint,
      owner: bidder,
    });
    const [tswapPda, tswapPdaBump] = findTSwapPDA({});

    const swapSdk = new TensorSwapSDK({
      provider: this.program.provider as AnchorProvider,
    });
    const tSwapAcc = await swapSdk.fetchTSwap(tswapPda);
    const [tempPda, tempPdaBump] = findNftTempPDA({ nftMint });

    const destAta = getAssociatedTokenAddressSync(
      nftMint,
      bidder,
      true,
      TOKEN_2022_PROGRAM_ID
    );

    const builder = this.program.methods.takeBidT22(lamports).accounts({
      nftMint,
      tswap: tswapPda,
      feeVault: tSwapAcc.feeVault,
      bidState,
      bidder,
      nftSellerAcc,
      nftBidderAcc: destAta,
      seller,
      tensorswapProgram: TENSORSWAP_ADDR,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
      marginAccount: margin ?? seller,
      takerBroker: takerBroker ?? tSwapAcc.feeVault,
    });

    return {
      builder,
      tx: {
        ixs: prependComputeIxs(
          [await builder.instruction()],
          compute,
          priorityMicroLamports
        ),
        extraSigners: [],
      },
      bidState,
      bidStateBump,
      tswapPda,
      tswapPdaBump,
      tempPda,
      tempPdaBump,
      nftbidderAcc: destAta,
    };
  }

  // --------------------------------------- WNS

  async wnsTakeBid({
    bidder,
    seller,
    nftMint,
    lamports,
    margin = null,
    nftSellerAcc,
    collectionMint,
    compute = DEFAULT_XFER_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
    takerBroker = null,
  }: {
    bidder: PublicKey;
    seller: PublicKey;
    nftMint: PublicKey;
    lamports: BN;
    margin?: PublicKey | null;
    nftSellerAcc: PublicKey;
    collectionMint: PublicKey;
    compute?: number | null | undefined;
    priorityMicroLamports?: number | null | undefined;
    //optional taker broker account
    takerBroker?: PublicKey | null;
  }) {
    const [bidState, bidStateBump] = findBidStatePda({
      mint: nftMint,
      owner: bidder,
    });
    const [tswapPda, tswapPdaBump] = findTSwapPDA({});

    const swapSdk = new TensorSwapSDK({
      provider: this.program.provider as AnchorProvider,
    });
    const tSwapAcc = await swapSdk.fetchTSwap(tswapPda);
    const [tempPda, tempPdaBump] = findNftTempPDA({ nftMint });

    const destAta = getAssociatedTokenAddressSync(
      nftMint,
      bidder,
      true,
      TOKEN_2022_PROGRAM_ID
    );

    const approveAccount = getApprovalAccount(nftMint);
    const distribution = getDistributionAccount(collectionMint);
    const extraMetas = getExtraAccountMetaAddress(nftMint, WNS_PROGRAM_ID);

    const builder = this.program.methods.wnsTakeBid(lamports).accounts({
      nftMint,
      tswap: tswapPda,
      feeVault: tSwapAcc.feeVault,
      bidState,
      bidder,
      nftSellerAcc,
      nftBidderAcc: destAta,
      seller,
      tensorswapProgram: TENSORSWAP_ADDR,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
      marginAccount: margin ?? seller,
      takerBroker: takerBroker ?? tSwapAcc.feeVault,
      approveAccount,
      distribution,
      distributionProgram: WNS_DISTRIBUTION_PROGRAM_ID,
      wnsProgram: WNS_PROGRAM_ID,
      extraMetas,
    });

    return {
      builder,
      tx: {
        ixs: prependComputeIxs(
          [await builder.instruction()],
          compute,
          priorityMicroLamports
        ),
        extraSigners: [],
      },
      bidState,
      bidStateBump,
      tswapPda,
      tswapPdaBump,
      tempPda,
      tempPdaBump,
      nftbidderAcc: destAta,
    };
  }

  // --------------------------------------- helpers

  async getBidStateRent() {
    return await getRent(
      this.program.provider.connection,
      this.program.account.bidState
    );
  }

  getError(
    name: (typeof IDL_latest)["errors"][number]["name"]
  ): (typeof IDL_latest)["errors"][number] {
    //@ts-ignore (throwing weird ts errors for me)
    return this.program.idl.errors.find((e) => e.name === name)!;
  }

  getErrorCodeHex(name: (typeof IDL_latest)["errors"][number]["name"]): string {
    return hexCode(this.getError(name).code);
  }

  // --------------------------------------- parsing raw txs

  /** This only works for the latest IDL. This is intentional: otherwise we'll need to switch/case all historical deprecated ixs downstream. */
  parseIxs(tx: TransactionResponse): ParsedTBidIx[] {
    return parseAnchorIxs<TBid_latest>({
      tx,
      coder: this.coder,
      eventParser: this.eventParser,
      programId: this.program.programId,
    });
  }

  getFeeAmount(ix: ParsedTBidIx): BN | null {
    switch (ix.ix.name) {
      case "takeBid":
      case "takeBidT22":
      case "wnsTakeBid": {
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
      case "takeBidT22":
      case "wnsTakeBid":
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
