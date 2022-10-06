import {
  AccountInfo,
  Commitment,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionResponse,
} from "@solana/web3.js";
import {
  AnchorProvider,
  BN,
  BorshCoder,
  Coder,
  Event,
  EventParser,
  Instruction,
  Program,
} from "@project-serum/anchor";
import Big from "big.js";
import { IDL, Tensorswap } from "./idl/tensorswap";
import { TENSORSWAP_ADDR, TSWAP_FEE_ACC } from "./constants";
import {
  findNftDepositReceiptPDA,
  findNftEscrowPDA,
  findPoolPDA,
  findSolEscrowPDA,
  findTSwapPDA,
} from "./pda";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  decodeAcct,
  DiscMap,
  fetchNft,
  genDiscToDecoderMap,
  getAccountRent,
  hexCode,
} from "../common";
import { InstructionDisplay } from "@project-serum/anchor/dist/cjs/coder/borsh/instruction";
import { CurveType, ParsedAccount, PoolConfig, PoolType } from "../types";
import { findMintProofPDA } from "../tensor_whitelist";

export const TensorswapIDL = IDL;

// --------------------------------------- pool type

export const PoolTypeAnchor = {
  Token: { token: {} },
  NFT: { nft: {} },
  Trade: { trade: {} },
};
type PoolTypeAnchor = typeof PoolTypeAnchor[keyof typeof PoolTypeAnchor];

export const poolTypeU8 = (poolType: PoolTypeAnchor): 0 | 1 | 2 => {
  const order: Record<string, 0 | 1 | 2> = {
    token: 0,
    nft: 1,
    trade: 2,
  };
  return order[Object.keys(poolType)[0]];
};

export const castPoolTypeAnchor = (poolType: PoolTypeAnchor): PoolType =>
  ({
    0: PoolType.Token,
    1: PoolType.NFT,
    2: PoolType.Trade,
  }[poolTypeU8(poolType)]);

export const castPoolType = (poolType: PoolType): PoolTypeAnchor =>
  poolType === PoolType.NFT
    ? PoolTypeAnchor.NFT
    : poolType === PoolType.Token
    ? PoolTypeAnchor.Token
    : PoolTypeAnchor.Trade;

// --------------------------------------- curve type

export const CurveTypeAnchor = {
  Linear: { linear: {} },
  Exponential: { exponential: {} },
};

type CurveTypeAnchor = typeof CurveTypeAnchor[keyof typeof CurveTypeAnchor];

export const curveTypeU8 = (curveType: CurveTypeAnchor): 0 | 1 => {
  const order: Record<string, 0 | 1> = {
    linear: 0,
    exponential: 1,
  };
  return order[Object.keys(curveType)[0]];
};

export const castCurveTypeAnchor = (curveType: CurveTypeAnchor): CurveType =>
  ({
    0: CurveType.Linear,
    1: CurveType.Exponential,
  }[curveTypeU8(curveType)]);

export const castCurveType = (curveType: CurveType): CurveTypeAnchor =>
  curveType === CurveType.Linear
    ? CurveTypeAnchor.Linear
    : CurveTypeAnchor.Exponential;

// --------------------------------------- config

export type TSwapConfigAnchor = {
  feeBps: number;
};

export type PoolConfigAnchor = {
  poolType: PoolTypeAnchor;
  curveType: CurveTypeAnchor;
  startingPrice: BN;
  delta: BN;
  honorRoyalties: boolean;
  mmFeeBps: number | null; // null for non-trade pools
};

export const castPoolConfigAnchor = (config: PoolConfigAnchor): PoolConfig => ({
  poolType: castPoolTypeAnchor(config.poolType),
  curveType: castCurveTypeAnchor(config.curveType),
  startingPrice: new Big(config.startingPrice.toString()),
  delta: new Big(config.delta.toString()),
  honorRoyalties: config.honorRoyalties,
  mmFeeBps: config.mmFeeBps,
});

export const castPoolConfig = (config: PoolConfig): PoolConfigAnchor => ({
  poolType: castPoolType(config.poolType),
  curveType: castCurveType(config.curveType),
  startingPrice: new BN(config.startingPrice.round().toString()),
  delta: new BN(config.delta.round().toString()),
  honorRoyalties: config.honorRoyalties,
  mmFeeBps: config.mmFeeBps,
});

// --------------------------------------- rest

export type PoolAnchor = {
  version: number;
  bump: number[];
  solEscrowBump: number[];
  createdUnixSeconds: BN;
  config: PoolConfigAnchor;
  tswap: PublicKey;
  owner: PublicKey;
  whitelist: PublicKey;
  solEscrow: PublicKey;
  takerSellCount: number;
  takerBuyCount: number;
  nftsHeld: number;
};

export type SolEscrowAnchor = {};
export type TSwapAnchor = {
  version: number;
  bump: number[];
  config: TSwapConfigAnchor;
  owner: PublicKey;
  feeVault: PublicKey;
  cosigner: PublicKey;
};

export type NftDepositReceiptAnchor = {
  bump: number;
  pool: PublicKey;
  nftMint: PublicKey;
  nftEscrow: PublicKey;
};

export type TensorSwapPdaAnchor =
  | PoolAnchor
  | SolEscrowAnchor
  | TSwapAnchor
  | NftDepositReceiptAnchor;

export type TaggedTensorSwapPdaAnchor =
  | {
      name: "pool";
      account: PoolAnchor;
    }
  | {
      name: "solEscrow";
      account: SolEscrowAnchor;
    }
  | {
      name: "tSwap";
      account: TSwapAnchor;
    }
  | {
      name: "nftDepositReceipt";
      account: NftDepositReceiptAnchor;
    };

export type TensorSwapEventAnchor = Event<typeof IDL["events"][number]>;

// ------------- Types for parsed ixs from raw tx.

export type TSwapIxName = typeof IDL["instructions"][number]["name"];
export type TSwapIx = Omit<Instruction, "name"> & { name: TSwapIxName };
export type ParsedTSwapIx = {
  ixIdx: number;
  ix: TSwapIx;
  events: TensorSwapEventAnchor[];
  // FYI: accounts under InstructioNDisplay is the space-separated capitalized
  // version of the fields for the corresponding #[Accounts].
  // eg sol_escrow -> "Sol Escrow', or tswap -> "Tswap"
  formatted: InstructionDisplay | null;
};
export type TSwapIxData = { config: PoolConfigAnchor };
export type WithdrawDepositSolData = TSwapIxData & { lamports: BN };

//decided to NOT build the tx inside the sdk (too much coupling - should not care about blockhash)
export class TensorSwapSDK {
  program: Program<Tensorswap>;
  discMap: DiscMap<Tensorswap>;
  coder: BorshCoder;
  eventParser: EventParser;

  //can build ixs without provider, but need provider for
  constructor({
    idl = IDL,
    addr = TENSORSWAP_ADDR,
    provider,
    coder,
  }: {
    idl?: any; //todo better typing
    addr?: PublicKey;
    provider?: AnchorProvider;
    coder?: Coder;
  }) {
    this.program = new Program<Tensorswap>(idl, addr, provider, coder);
    this.discMap = genDiscToDecoderMap(this.program);
    this.coder = new BorshCoder(idl);
    this.eventParser = new EventParser(addr, this.coder);
  }

  // --------------------------------------- fetchers

  async fetchTSwap(tswap: PublicKey, commitment?: Commitment) {
    return (await this.program.account.tSwap.fetch(
      tswap,
      commitment
    )) as TSwapAnchor;
  }

  async fetchPool(pool: PublicKey, commitment?: Commitment) {
    return (await this.program.account.pool.fetch(
      pool,
      commitment
    )) as PoolAnchor;
  }

  async fetchReceipt(receipt: PublicKey, commitment?: Commitment) {
    return (await this.program.account.nftDepositReceipt.fetch(
      receipt,
      commitment
    )) as NftDepositReceiptAnchor;
  }

  async fetchSolEscrow(escrow: PublicKey, commitment?: Commitment) {
    return this.program.account.solEscrow.fetch(
      escrow,
      commitment
    ) as SolEscrowAnchor;
  }

  // --------------------------------------- account methods

  decode(acct: AccountInfo<Buffer>): TaggedTensorSwapPdaAnchor | null {
    return decodeAcct(acct, this.discMap);
  }

  // --------------------------------------- tswap methods

  //main signature: owner
  async initUpdateTSwap({
    owner,
    newOwner,
    config,
    feeVault = TSWAP_FEE_ACC,
    cosigner = owner,
  }: {
    owner: PublicKey;
    newOwner: PublicKey;
    config: TSwapConfigAnchor;
    feeVault?: PublicKey;
    // Default to owner (ie anchor provider wallet).
    cosigner?: PublicKey;
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});

    const builder = this.program.methods
      .initUpdateTswap(newOwner, config)
      .accounts({
        tswap: tswapPda,
        owner,
        cosigner,
        feeVault,
        systemProgram: SystemProgram.programId,
      });

    return {
      builder,
      tx: { ixs: [await builder.instruction()] },
      tswapPda,
      tswapBump,
    };
  }

  // --------------------------------------- pool methods

  //main signature: owner
  async initPool({
    owner,
    whitelist,
    config,
  }: {
    owner: PublicKey;
    whitelist: PublicKey;
    config: PoolConfigAnchor;
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [poolPda, poolBump] = findPoolPDA({
      tswap: tswapPda,
      owner,
      whitelist,
      delta: config.delta,
      startingPrice: config.startingPrice,
      poolType: poolTypeU8(config.poolType),
      curveType: curveTypeU8(config.curveType),
    });
    const [solEscrowPda, solEscrowBump] = findSolEscrowPDA({ pool: poolPda });

    const builder = this.program.methods.initPool(config as any).accounts({
      tswap: tswapPda,
      pool: poolPda,
      solEscrow: solEscrowPda,
      whitelist,
      owner,
      systemProgram: SystemProgram.programId,
    });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      tswapPda,
      tswapBump,
      poolPda,
      poolBump,
      solEscrowPda,
      solEscrowBump,
    };
  }

  //main signature: owner
  async closePool({
    owner,
    whitelist,
    config,
  }: {
    owner: PublicKey;
    whitelist: PublicKey;
    config: PoolConfigAnchor;
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [poolPda, poolBump] = findPoolPDA({
      tswap: tswapPda,
      owner,
      whitelist,
      delta: config.delta,
      startingPrice: config.startingPrice,
      poolType: poolTypeU8(config.poolType),
      curveType: curveTypeU8(config.curveType),
    });
    const [solEscrowPda, solEscrowBump] = findSolEscrowPDA({ pool: poolPda });

    const builder = this.program.methods.closePool(config as any).accounts({
      tswap: tswapPda,
      pool: poolPda,
      solEscrow: solEscrowPda,
      whitelist,
      owner,
      systemProgram: SystemProgram.programId,
    });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      tswapPda,
      tswapBump,
      poolPda,
      poolBump,
      solEscrowPda,
      solEscrowBump,
    };
  }

  // --------------------------------------- deposit/withdraw methods

  // main signature: owner
  async depositNft({
    whitelist,
    nftMint,
    nftSource,
    owner,
    config,
    proof,
  }: {
    whitelist: PublicKey;
    nftMint: PublicKey;
    nftSource: PublicKey;
    owner: PublicKey;
    config: PoolConfigAnchor;
    proof: Buffer[];
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [poolPda, poolBump] = findPoolPDA({
      tswap: tswapPda,
      owner,
      whitelist,
      delta: config.delta,
      startingPrice: config.startingPrice,
      poolType: poolTypeU8(config.poolType),
      curveType: curveTypeU8(config.curveType),
    });

    const [escrowPda, escrowBump] = findNftEscrowPDA({ nftMint });
    const [receiptPda, receiptBump] = findNftDepositReceiptPDA({
      nftMint,
    });

    const builder = this.program.methods
      .depositNft(config as any, proof)
      .accounts({
        tswap: tswapPda,
        pool: poolPda,
        whitelist,
        nftMint,
        nftSource,
        nftEscrow: escrowPda,
        nftReceipt: receiptPda,
        owner,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      tswapPda,
      tswapBump,
      poolPda,
      poolBump,
      escrowPda,
      escrowBump,
      receiptPda,
      receiptBump,
    };
  }

  // main signature: owner
  async depositSol({
    whitelist,
    owner,
    config,
    lamports,
  }: {
    whitelist: PublicKey;
    owner: PublicKey;
    config: PoolConfigAnchor;
    lamports: BN;
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [poolPda, poolBump] = findPoolPDA({
      tswap: tswapPda,
      owner,
      whitelist,
      delta: config.delta,
      startingPrice: config.startingPrice,
      poolType: poolTypeU8(config.poolType),
      curveType: curveTypeU8(config.curveType),
    });

    const [solEscrowPda, solEscrowBump] = findSolEscrowPDA({ pool: poolPda });

    const builder = this.program.methods
      .depositSol(config as any, lamports)
      .accounts({
        tswap: tswapPda,
        pool: poolPda,
        whitelist,
        solEscrow: solEscrowPda,
        owner,
        systemProgram: SystemProgram.programId,
      });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      tswapPda,
      tswapBump,
      poolPda,
      poolBump,
      solEscrowPda,
      solEscrowBump,
    };
  }

  // main signature: owner
  async withdrawNft({
    whitelist,
    nftMint,
    nftDest,
    owner,
    config,
  }: {
    whitelist: PublicKey;
    nftMint: PublicKey;
    nftDest: PublicKey;
    owner: PublicKey;
    config: PoolConfigAnchor;
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [poolPda, poolBump] = findPoolPDA({
      tswap: tswapPda,
      owner,
      whitelist,
      delta: config.delta,
      startingPrice: config.startingPrice,
      poolType: poolTypeU8(config.poolType),
      curveType: curveTypeU8(config.curveType),
    });

    const [escrowPda, escrowBump] = findNftEscrowPDA({ nftMint });
    const [receiptPda, receiptBump] = findNftDepositReceiptPDA({
      nftMint,
    });

    const builder = this.program.methods.withdrawNft(config as any).accounts({
      tswap: tswapPda,
      pool: poolPda,
      whitelist,
      nftMint,
      nftDest,
      nftEscrow: escrowPda,
      nftReceipt: receiptPda,
      owner,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      tswapPda,
      tswapBump,
      poolPda,
      poolBump,
      escrowPda,
      escrowBump,
      receiptPda,
      receiptBump,
    };
  }

  // main signature: owner
  async withdrawSol({
    whitelist,
    owner,
    config,
    lamports,
  }: {
    whitelist: PublicKey;
    owner: PublicKey;
    config: PoolConfigAnchor;
    lamports: BN;
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [poolPda, poolBump] = findPoolPDA({
      tswap: tswapPda,
      owner,
      whitelist,
      delta: config.delta,
      startingPrice: config.startingPrice,
      poolType: poolTypeU8(config.poolType),
      curveType: curveTypeU8(config.curveType),
    });

    const [solEscrowPda, solEscrowBump] = findSolEscrowPDA({ pool: poolPda });

    const builder = this.program.methods
      .withdrawSol(config as any, lamports)
      .accounts({
        tswap: tswapPda,
        pool: poolPda,
        whitelist,
        solEscrow: solEscrowPda,
        owner,
        systemProgram: SystemProgram.programId,
      });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      tswapPda,
      tswapBump,
      poolPda,
      poolBump,
      solEscrowPda,
      solEscrowBump,
    };
  }

  // --------------------------------------- trade (buy/sell) methods

  //main signature: buyer
  async buyNft({
    whitelist,
    nftMint,
    nftBuyerAcc,
    owner,
    buyer,
    config,
    maxPrice,
    metaCreators,
  }: {
    whitelist: PublicKey;
    nftMint: PublicKey;
    nftBuyerAcc: PublicKey;
    owner: PublicKey;
    buyer: PublicKey;
    config: PoolConfigAnchor;
    maxPrice: BN;
    // If provided, skips RPC call to fetch on-chain metadata + creators.
    metaCreators?: {
      metadata: PublicKey;
      creators: PublicKey[];
    };
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [poolPda, poolBump] = findPoolPDA({
      tswap: tswapPda,
      owner,
      whitelist,
      delta: config.delta,
      startingPrice: config.startingPrice,
      poolType: poolTypeU8(config.poolType),
      curveType: curveTypeU8(config.curveType),
    });

    const [escrowPda, escrowBump] = findNftEscrowPDA({ nftMint });
    const [solEscrowPda, solEscrowBump] = findSolEscrowPDA({ pool: poolPda });
    const [receiptPda, receiptBump] = findNftDepositReceiptPDA({
      nftMint,
    });

    const tSwapAcc = await this.fetchTSwap(tswapPda);

    // Fetch creators + metadata (if necessary).
    let nftMetadata: PublicKey;
    let creators: PublicKey[];
    if (metaCreators) {
      ({ metadata: nftMetadata, creators } = metaCreators);
    } else {
      const nft = await fetchNft(this.program.provider.connection, nftMint);
      nftMetadata = nft.metadataAddress;
      creators = nft.creators.map((c) => c.address);
    }

    const builder = this.program.methods
      .buyNft(config as any, [], maxPrice)
      .accounts({
        tswap: tswapPda,
        feeVault: tSwapAcc.feeVault,
        pool: poolPda,
        whitelist,
        nftMint,
        nftMetadata,
        nftBuyerAcc,
        nftEscrow: escrowPda,
        nftReceipt: receiptPda,
        solEscrow: solEscrowPda,
        owner,
        buyer,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .remainingAccounts(
        creators.map((c) => ({
          pubkey: c,
          isWritable: true,
          isSigner: false,
        }))
      );

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      tswapPda,
      tswapBump,
      poolPda,
      poolBump,
      escrowPda,
      escrowBump,
      solEscrowPda,
      solEscrowBump,
      receiptPda,
      receiptBump,
    };
  }

  //main signature: seller
  async sellNft({
    type,
    whitelist,
    nftMint,
    nftSellerAcc,
    owner,
    seller,
    config,
    minPrice,
    metaCreators,
  }: {
    type: "trade" | "token";
    whitelist: PublicKey;
    nftMint: PublicKey;
    nftSellerAcc: PublicKey;
    owner: PublicKey;
    seller: PublicKey;
    config: PoolConfigAnchor;
    minPrice: BN;
    // If provided, skips RPC call to fetch on-chain metadata + creators.
    metaCreators?: {
      metadata: PublicKey;
      creators: PublicKey[];
    };
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [poolPda, poolBump] = findPoolPDA({
      tswap: tswapPda,
      owner,
      whitelist,
      delta: config.delta,
      startingPrice: config.startingPrice,
      poolType: poolTypeU8(config.poolType),
      curveType: curveTypeU8(config.curveType),
    });
    const [solEscrowPda, solEscrowBump] = findSolEscrowPDA({ pool: poolPda });
    const ownerAtaAcc = await getAssociatedTokenAddress(nftMint, owner);
    const [escrowPda, escrowBump] = findNftEscrowPDA({ nftMint });
    const [receiptPda, receiptBump] = findNftDepositReceiptPDA({ nftMint });
    const [mintProofPda] = findMintProofPDA({ mint: nftMint, whitelist });
    const tSwapAcc = await this.fetchTSwap(tswapPda);

    // Fetch creators + metadata (if necessary).
    let nftMetadata: PublicKey;
    let creators: PublicKey[];
    if (metaCreators) {
      ({ metadata: nftMetadata, creators } = metaCreators);
    } else {
      const nft = await fetchNft(this.program.provider.connection, nftMint);
      nftMetadata = nft.metadataAddress;
      creators = nft.creators.map((c) => c.address);
    }

    const shared = {
      tswap: tswapPda,
      feeVault: tSwapAcc.feeVault,
      pool: poolPda,
      whitelist,
      nftMint,
      nftMetadata,
      nftSellerAcc,
      solEscrow: solEscrowPda,
      mintProof: mintProofPda,
      owner,
      seller,
    };

    const { method, accounts } =
      type === "trade"
        ? {
            method: this.program.methods.sellNftTradePool,
            accounts: {
              nftEscrow: escrowPda,
              nftReceipt: receiptPda,
            },
          }
        : {
            method: this.program.methods.sellNftTokenPool,
            accounts: {
              ownerAtaAcc,
              associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            },
          };

    // Proof passed through PDA instead of ix b/c of tx limit size.
    const builder = method(config as any, [], minPrice)
      .accounts({
        shared,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
        ...accounts,
      })
      .remainingAccounts(
        creators.map((c) => ({
          pubkey: c,
          isSigner: false,
          isWritable: true,
        }))
      );

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      tswapPda,
      tswapBump,
      poolPda,
      poolBump,
      solEscrowPda,
      solEscrowBump,
      ownerAtaAcc,
      escrowPda,
      escrowBump,
      receiptPda,
      receiptBump,
    };
  }

  // --------------------------------------- helper methods

  async getSolEscrowRent() {
    return await getAccountRent(
      this.program.provider.connection,
      this.program.account.solEscrow
    );
  }

  async getNftDepositReceiptRent() {
    return await getAccountRent(
      this.program.provider.connection,
      this.program.account.nftDepositReceipt
    );
  }

  async getTokenAcctRent() {
    return await getMinimumBalanceForRentExemptAccount(
      this.program.provider.connection
    );
  }

  getError(
    name: typeof IDL["errors"][number]["name"]
  ): typeof IDL["errors"][number] {
    return this.program.idl.errors.find((e) => e.name === name)!;
  }

  getErrorCodeHex(name: typeof IDL["errors"][number]["name"]): string {
    return hexCode(this.getError(name).code);
  }

  // --------------------------------------- parsing raw transactions

  // Stolen from https://github.com/saber-hq/saber-common/blob/4b533d77af8ad5c26f033fd5e69bace96b0e1840/packages/anchor-contrib/src/utils/coder.ts#L171-L185
  parseEvents = (logs: string[] | undefined | null) => {
    if (!logs) {
      return [];
    }

    const events: TensorSwapEventAnchor[] = [];
    const parsedLogsIter = this.eventParser.parseLogs(logs ?? []);
    let parsedEvent = parsedLogsIter.next();
    while (!parsedEvent.done) {
      events.push(parsedEvent.value as unknown as TensorSwapEventAnchor);
      parsedEvent = parsedLogsIter.next();
    }

    return events;
  };

  parseIxs(tx: TransactionResponse): ParsedTSwapIx[] {
    const message = tx.transaction.message;
    const logs = tx.meta?.logMessages;

    const ixs: ParsedTSwapIx[] = [];
    message.instructions.forEach((rawIx, ixIdx) => {
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
      ixs.push({ ixIdx, ix: ix as TSwapIx, events, formatted });
    });

    return ixs;
  }

  getPoolConfig(ix: ParsedTSwapIx): PoolConfig | null {
    switch (ix.ix.name) {
      case "initUpdateTswap":
        return null;
      default:
        const config = (ix.ix.data as TSwapIxData).config;
        return castPoolConfigAnchor(config);
    }
  }

  getSolAmount(ix: ParsedTSwapIx): BN | null {
    switch (ix.ix.name) {
      case "buyNft":
      case "sellNftTradePool":
      case "sellNftTokenPool":
        // NB: the actual sell price includes the "MM fee" (really a spread).
        const event = ix.events[0].data;
        return event.currentPrice.sub(event.mmFee);
      case "depositSol":
      case "withdrawSol":
        return (ix.ix.data as WithdrawDepositSolData).lamports;
      default:
        return null;
    }
  }

  getFeeAmount(ix: ParsedTSwapIx): BN | null {
    switch (ix.ix.name) {
      case "buyNft":
      case "sellNftTradePool":
      case "sellNftTokenPool":
        const event = ix.events[0].data;
        return event.tswapFee.add(event.creatorsFee);
      default:
        return null;
    }
  }

  // FYI: accounts under InstructioNDisplay is the space-separated capitalized
  // version of the fields for the corresponding #[Accounts].
  // eg sol_escrow -> "Sol Escrow', or tswap -> "Tswap"
  // shared.sol_escrow -> "Shared > Sol Escrow"
  getAccountByName(
    ix: ParsedTSwapIx,
    name:
      | "Nft Mint"
      | "Sol Escrow"
      | "Pool"
      | "Nft Escrow"
      | "Whitelist"
      | "NftReceipt"
      | "Buyer"
      | "Seller"
      | "Owner"
  ): ParsedAccount | undefined {
    // We use endsWith since composite nested accounts (eg shared.sol_escrow)
    // will prefix it as "Shared > Sol Escrow"
    return ix.formatted?.accounts.find((acc) => acc.name?.endsWith(name));
  }
}
