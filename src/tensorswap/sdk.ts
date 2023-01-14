import {
  AccountInfo,
  Commitment,
  LAMPORTS_PER_SOL,
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
import {
  TENSORSWAP_ADDR,
  TSWAP_COSIGNER,
  TSWAP_FEE_ACC,
  TSWAP_OWNER,
} from "./constants";
import {
  findMarginPDA,
  findNextFreeMarginNr,
  findNftAuthorityPDA,
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
  isNullLike,
} from "../common";
import { InstructionDisplay } from "@project-serum/anchor/dist/cjs/coder/borsh/instruction";
import { CurveType, ParsedAccount, PoolConfig, PoolType } from "../types";
import { findMintProofPDA } from "../tensor_whitelist";
import { v4 } from "uuid";

// ---------------------------------------- Versioned IDLs for backwards compat when parsing.
//v0.1
import {
  IDL as IDL_v0_1_32,
  Tensorswap as Tensorswap_v0_1_32,
} from "./idl/tensorswap_v0.1.32";

//v0.2 (remove cosigner)
import {
  IDL as IDL_v0_2_0,
  Tensorswap as Tensorswap_v0_2_0,
} from "./idl/tensorswap_v0.2.0";

//v0.3 (editable pools)
import {
  IDL as IDL_v0_3_0,
  Tensorswap as Tensorswap_v0_3_0,
} from "./idl/tensorswap_v0.3.0";

//v0.3.5 (removed v0.2 -> v0.3 migration ixs)
import {
  IDL as IDL_v0_3_5,
  Tensorswap as Tensorswap_v0_3_5,
} from "./idl/tensorswap_v0.3.5";

//v1.0 (added sniping)
import {
  IDL as IDL_latest,
  Tensorswap as Tensorswap_latest,
} from "./idl/tensorswap";

export const STANDARD_FEE_BPS: number = +IDL_latest.constants.find(
  (c) => c.name === "STANDARD_FEE_BPS"
)!.value;
export const SNIPE_FEE_BPS: number = +IDL_latest.constants.find(
  (c) => c.name === "SNIPE_FEE_BPS"
)!.value;
export const SNIPE_PROFIT_SHARE_BPS: number = +IDL_latest.constants.find(
  (c) => c.name === "SNIPE_PROFIT_SHARE_BPS"
)!.value;
export const SNIPE_MIN_FEE: number = 0.01 * LAMPORTS_PER_SOL;

// rollout 0.1.32: https://solscan.io/tx/5ZWevmR3TLzUEVsPyE9bdUBqseeBdVMuELG45L15dx8rnXVCQZE2n1V1EbqEuGEaF6q4fND7rT7zwW8ZXjP1uC5s
export const TensorswapIDL_v0_1_32 = IDL_v0_1_32;
export const TensorswapIDL_v0_1_32_EffSlot = 150855169;

// rollout 0.2.0: https://solscan.io/tx/5aswB2admCErRwPNgM3DeaYcbVYjAjpHuKVFAZenaSGEm8PKL8R2BmqsGFWdGfMR25NPrVSNKix18ZgLtVpHyXUJ
export const TensorswapIDL_v0_2_0 = IDL_v0_2_0;
export const TensorswapIDL_v0_2_0_EffSlot = 153016663;

// rollout 0.3.0: https://solscan.io/tx/2NjcKJov7cm7Fa1PqEADMgjiFBS6UXAzXoaiLinCU35stFUAgVyLBniaPyLExPoz18TKis5ch9YxfBs7yAkbjXXn
export const TensorswapIDL_v0_3_0 = IDL_v0_3_0;
export const TensorswapIDL_v0_3_0_EffSlot = 154762923;

// rollout 0.3.5: https://solscan.io/tx/3YruQxQ2HGMEcNRogwGAXw2rXDH3uVKCjZYs655erEKX1T3FxcLBshHHgP5deTLQ4Jd28SZTVGFb2oBpGx6HqANe
export const TensorswapIDL_v0_3_5 = IDL_v0_3_5;
export const TensorswapIDL_v0_3_5_EffSlot = 154963721;

// rollout 1.0.0 https://solscan.io/tx/5ogSWohwXU3A2xjdsVwcrF3Hm7gC4zvGfzcsYco4hCKB8SduvTH9aUQTdLZw49YuAVXd4n7B4Ny8q7nEqMaKxJ2N
export const TensorswapIDL_latest = IDL_latest;
export const TensorswapIDL_latest_EffSlot = 172173995;

export type TensorswapIDL =
  | Tensorswap_v0_1_32
  | Tensorswap_v0_2_0
  | Tensorswap_v0_3_0
  | Tensorswap_v0_3_5
  | Tensorswap_latest;

// Use this function to figure out which IDL to use based on the slot # of historical txs.
export const triageIDL = (slot: number | bigint): TensorswapIDL | null => {
  //cba to parse really old txs, this was before public launch
  if (slot < TensorswapIDL_v0_1_32_EffSlot) return null;
  if (slot < TensorswapIDL_v0_2_0_EffSlot) return TensorswapIDL_v0_1_32;
  if (slot < TensorswapIDL_v0_3_0_EffSlot) return TensorswapIDL_v0_2_0;
  if (slot < TensorswapIDL_v0_3_5_EffSlot) return TensorswapIDL_v0_3_0;
  if (slot < TensorswapIDL_latest_EffSlot) return TensorswapIDL_v0_3_5;
  return TensorswapIDL_latest;
};

export const APPROX_SOL_ESCROW_RENT = 946560;
export const APPROX_SOL_MARGIN_RENT = 1886160;

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

// --------------------------------------- state accounts

export enum OrderType {
  Standard = 0,
  Sniping = 1,
}

export type Frozen = {
  amount: BN;
  time: BN;
};

export type PoolStatsAnchor = {
  takerSellCount: number;
  takerBuyCount: number;
  accumulatedMmProfit: BN;
};

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
  //v0.3
  nftAuthority: PublicKey;
  stats: PoolStatsAnchor;
  //v1.0
  margin: PublicKey | null;
  isCosigned: boolean;
  orderType: OrderType;
  frozen: Frozen | null;
  lastTransactedSeconds: BN;
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
  nftAuthority: PublicKey;
  nftMint: PublicKey;
  nftEscrow: PublicKey;
};

export type NftAuthorityAnchor = {
  randomSeed: number[];
  bump: number[];
  pool: PublicKey;
};

export type MarginAccountAnchor = {
  owner: PublicKey;
  name: number[];
  nr: number;
  bump: number[];
  poolsAttached: number;
};

// ----------- together

export type TensorSwapPdaAnchor =
  | PoolAnchor
  | SolEscrowAnchor
  | TSwapAnchor
  | NftDepositReceiptAnchor
  | NftAuthorityAnchor
  | MarginAccountAnchor;

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
    }
  | {
      name: "nftAuthority";
      account: NftAuthorityAnchor;
    }
  | {
      name: "marginAccount";
      account: MarginAccountAnchor;
    };

export type TensorSwapEventAnchor = Event<typeof IDL_latest["events"][number]>;

export type AccountSuffix =
  | "Nft Mint"
  | "Sol Escrow"
  | "Old Sol Escrow"
  | "New Sol Escrow"
  | "Pool"
  | "Old Pool"
  | "New Pool"
  | "Nft Escrow"
  | "Whitelist"
  | "Nft Receipt"
  | "Buyer"
  | "Seller"
  | "Owner"
  | "Nft Authority"
  | "Margin Account";

// ------------- Types for parsed ixs from raw tx.

export type TSwapIxName = typeof IDL_latest["instructions"][number]["name"];
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
export type EditPoolIxData = {
  oldConfig: PoolConfigAnchor;
  newConfig: PoolConfigAnchor;
};
export type WithdrawDepositSolData = TSwapIxData & { lamports: BN };

//decided to NOT build the tx inside the sdk (too much coupling - should not care about blockhash)
export class TensorSwapSDK {
  program: Program<TensorswapIDL>;
  discMap: DiscMap<TensorswapIDL>;
  coder: BorshCoder;
  eventParser: EventParser;

  //can build ixs without provider, but need provider for
  constructor({
    idl = IDL_latest,
    addr = TENSORSWAP_ADDR,
    provider,
    coder,
  }: {
    idl?: TensorswapIDL;
    addr?: PublicKey;
    provider?: AnchorProvider;
    coder?: Coder;
  }) {
    this.program = new Program<TensorswapIDL>(
      // yucky but w/e
      idl as typeof IDL_latest,
      addr,
      provider,
      coder
    );
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
    return (await this.program.account.solEscrow.fetch(
      escrow,
      commitment
    )) as SolEscrowAnchor;
  }

  async fetchNftAuthority(authority: PublicKey, commitment?: Commitment) {
    return (await this.program.account.nftAuthority.fetch(
      authority,
      commitment
    )) as NftAuthorityAnchor;
  }

  async fetchMarginAccount(marginAccount: PublicKey, commitment?: Commitment) {
    return (await this.program.account.marginAccount.fetch(
      marginAccount,
      commitment
    )) as MarginAccountAnchor;
  }

  // --------------------------------------- account methods

  decode(acct: AccountInfo<Buffer>): TaggedTensorSwapPdaAnchor | null {
    return decodeAcct(acct, this.discMap);
  }

  // --------------------------------------- tswap methods

  //main signature: owner
  async initUpdateTSwap({
    owner = TSWAP_OWNER,
    newOwner,
    config,
    feeVault = TSWAP_FEE_ACC,
    cosigner = TSWAP_COSIGNER,
  }: {
    owner?: PublicKey;
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
    customAuthSeed,
    isCosigned = false,
    orderType = OrderType.Standard,
  }: {
    owner: PublicKey;
    whitelist: PublicKey;
    config: PoolConfigAnchor;
    customAuthSeed?: number[];
    isCosigned?: boolean;
    orderType?: OrderType;
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

    const authSeed =
      customAuthSeed ?? TensorSwapSDK.uuidToBuffer(v4().toString());
    if (authSeed.length != 32) {
      throw new Error("bad auth seed, expect it to be length 32");
    }
    const [nftAuthPda, nftAuthBump] = findNftAuthorityPDA({ authSeed });

    const builder = this.program.methods
      .initPool(config as any, authSeed, isCosigned, orderType)
      .accounts({
        tswap: tswapPda,
        pool: poolPda,
        solEscrow: solEscrowPda,
        nftAuthority: nftAuthPda,
        whitelist,
        owner,
        systemProgram: SystemProgram.programId,
      });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      authSeed,
      nftAuthPda,
      nftAuthBump,
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
    const poolAcc = await this.fetchPool(poolPda);

    const builder = this.program.methods.closePool(config as any).accounts({
      tswap: tswapPda,
      pool: poolPda,
      solEscrow: solEscrowPda,
      nftAuthority: poolAcc.nftAuthority,
      whitelist,
      owner,
      systemProgram: SystemProgram.programId,
    });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      nftAuthPda: poolAcc.nftAuthority,
      tswapPda,
      tswapBump,
      poolPda,
      poolBump,
      solEscrowPda,
      solEscrowBump,
    };
  }

  //main signature: owner
  async editPool({
    owner,
    whitelist,
    oldConfig,
    //(!) if the user edits the pool but doesn't touch the SP, we set new SP = current price of old pool
    newConfig,
    isCosigned = null,
  }: {
    owner: PublicKey;
    whitelist: PublicKey;
    oldConfig: PoolConfigAnchor;
    newConfig: PoolConfigAnchor;
    isCosigned?: boolean | null;
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [oldPoolPda, oldPoolBump] = findPoolPDA({
      tswap: tswapPda,
      owner,
      whitelist,
      delta: oldConfig.delta,
      startingPrice: oldConfig.startingPrice,
      poolType: poolTypeU8(oldConfig.poolType),
      curveType: curveTypeU8(oldConfig.curveType),
    });

    const [oldSolEscrowPda, oldSolEscrowBump] = findSolEscrowPDA({
      pool: oldPoolPda,
    });

    const [newPoolPda, newPoolBump] = findPoolPDA({
      tswap: tswapPda,
      owner,
      whitelist,
      delta: newConfig.delta,
      startingPrice: newConfig.startingPrice,
      poolType: poolTypeU8(newConfig.poolType),
      curveType: curveTypeU8(newConfig.curveType),
    });
    const [newSolEscrowPda, newSolEscrowBump] = findSolEscrowPDA({
      pool: newPoolPda,
    });

    const poolAcc = await this.fetchPool(oldPoolPda);

    const builder = this.program.methods
      .editPool(oldConfig as any, newConfig as any, isCosigned)
      .accounts({
        tswap: tswapPda,
        oldPool: oldPoolPda,
        newPool: newPoolPda,
        oldSolEscrow: oldSolEscrowPda,
        newSolEscrow: newSolEscrowPda,
        nftAuthority: poolAcc.nftAuthority,
        whitelist,
        owner,
        systemProgram: SystemProgram.programId,
      });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      nftAuthPda: poolAcc.nftAuthority,
      tswapPda,
      tswapBump,
      oldPoolPda,
      oldPoolBump,
      oldSolEscrowPda,
      oldSolEscrowBump,
      newPoolPda,
      newPoolBump,
      newSolEscrowPda,
      newSolEscrowBump,
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
    //one of these 2 is necessary for verification to work
    nftMetadata,
    proof,
  }: {
    whitelist: PublicKey;
    nftMint: PublicKey;
    nftSource: PublicKey;
    owner: PublicKey;
    config: PoolConfigAnchor;
    nftMetadata?: PublicKey;
    proof?: Buffer[];
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

    let meta;
    if (nftMetadata) {
      meta = nftMetadata;
    } else {
      const nft = await fetchNft(this.program.provider.connection, nftMint);
      meta = nft.metadataAddress;
    }

    const builder = this.program.methods
      .depositNft(config as any, proof ?? [])
      .accounts({
        tswap: tswapPda,
        pool: poolPda,
        whitelist,
        nftMint,
        nftSource,
        nftEscrow: escrowPda,
        nftReceipt: receiptPda,
        nftMetadata: meta,
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
      // TODO: Proofs disabled for buys for now until tx size limit increases.
      // .buyNft(config as any, proof, maxPrice)
      .buyNft(config as any, maxPrice)
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
    marginNr = null,
    isCosigned = false,
    cosigner = TSWAP_COSIGNER,
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
    marginNr?: number | null;
    isCosigned?: boolean;
    cosigner?: PublicKey;
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

    //optional cosigner
    const remAcc =
      isCosigned && type === "token"
        ? [{ pubkey: cosigner, isSigner: true, isWritable: false }]
        : [];

    //optional margin
    let marginPda;
    let marginBump;
    if (!isNullLike(marginNr)) {
      [marginPda, marginBump] = findMarginPDA({
        tswap: tswapPda,
        owner,
        marginNr,
      });
      remAcc.push({ pubkey: marginPda, isSigner: false, isWritable: true });
    }

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
    remAcc.push(
      ...creators.map((c) => ({
        pubkey: c,
        isSigner: false,
        isWritable: true,
      }))
    );

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

    // TODO: Proofs passed through PDA instead of ix b/c of tx limit size.
    // const builder = method(config as any, proof, minPrice)
    const builder = method(config as any, minPrice)
      .accounts({
        shared,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
        ...accounts,
      })
      .remainingAccounts(remAcc);

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
      marginPda,
      marginBump,
    };
  }

  async reallocPool({
    owner,
    cosigner = TSWAP_COSIGNER,
    whitelist,
    config,
  }: {
    owner: PublicKey;
    cosigner: PublicKey;
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

    const builder = this.program.methods.reallocPool(config as any).accounts({
      tswap: tswapPda,
      pool: poolPda,
      whitelist,
      owner,
      cosigner,
      systemProgram: SystemProgram.programId,
    });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      tswapPda,
      tswapBump,
      poolPda,
      poolBump,
    };
  }

  // --------------------------------------- margin

  //main signer: owner
  async initMarginAcc({
    owner,
    name,
    desiredNr,
  }: {
    owner: PublicKey;
    name: number[];
    desiredNr?: number;
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});

    let marginNr;
    let marginPda;
    let marginBump;

    if (isNullLike(desiredNr)) {
      ({ marginNr, marginPda, marginBump } = await findNextFreeMarginNr({
        connection: this.program.provider.connection,
        owner,
        tswap: tswapPda,
      }));
    } else {
      marginNr = desiredNr;
      [marginPda, marginBump] = findMarginPDA({
        tswap: tswapPda,
        owner,
        marginNr: desiredNr,
      });
    }

    const builder = this.program.methods
      .initMarginAccount(marginNr, name)
      .accounts({
        tswap: tswapPda,
        marginAccount: marginPda,
        owner,
        systemProgram: SystemProgram.programId,
      });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      tswapPda,
      tswapBump,
      marginPda,
      marginBump,
      marginNr,
    };
  }

  //main signer: owner
  async closeMarginAcc({
    marginNr,
    owner,
  }: {
    marginNr: number;
    owner: PublicKey;
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [marginPda, marginBump] = findMarginPDA({
      tswap: tswapPda,
      marginNr,
      owner,
    });

    const builder = this.program.methods.closeMarginAccount().accounts({
      tswap: tswapPda,
      marginAccount: marginPda,
      owner,
      systemProgram: SystemProgram.programId,
    });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      tswapPda,
      tswapBump,
      marginPda,
      marginBump,
    };
  }

  //main signer: owner
  async depositMarginAcc({
    marginNr,
    owner,
    amount,
  }: {
    marginNr: number;
    owner: PublicKey;
    amount: BN;
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [marginPda, marginBump] = findMarginPDA({
      tswap: tswapPda,
      marginNr,
      owner,
    });

    const builder = this.program.methods.depositMarginAccount(amount).accounts({
      tswap: tswapPda,
      marginAccount: marginPda,
      owner,
      systemProgram: SystemProgram.programId,
    });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      tswapPda,
      tswapBump,
      marginPda,
      marginBump,
    };
  }

  //main signer: owner
  async withdrawMarginAcc({
    marginNr,
    owner,
    amount,
  }: {
    marginNr: number;
    owner: PublicKey;
    amount: BN;
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [marginPda, marginBump] = findMarginPDA({
      tswap: tswapPda,
      marginNr,
      owner,
    });

    const builder = this.program.methods
      .withdrawMarginAccount(amount)
      .accounts({
        tswap: tswapPda,
        marginAccount: marginPda,
        owner,
        systemProgram: SystemProgram.programId,
      });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      tswapPda,
      tswapBump,
      marginPda,
      marginBump,
    };
  }

  //main signer: owner
  async attachPoolMargin({
    config,
    marginNr,
    owner,
    whitelist,
  }: {
    config: PoolConfigAnchor;
    marginNr: number;
    owner: PublicKey;
    whitelist: PublicKey;
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [marginPda, marginBump] = findMarginPDA({
      tswap: tswapPda,
      marginNr,
      owner,
    });
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
      .attachPoolToMargin(config as any)
      .accounts({
        tswap: tswapPda,
        marginAccount: marginPda,
        pool: poolPda,
        whitelist,
        owner,
        solEscrow: solEscrowPda,
        systemProgram: SystemProgram.programId,
      });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      tswapPda,
      tswapBump,
      marginPda,
      marginBump,
      poolPda,
      poolBump,
      solEscrowPda,
      solEscrowBump,
    };
  }

  //main signer: owner
  async detachPoolMargin({
    config,
    marginNr,
    owner,
    amount = new BN(0),
    whitelist,
  }: {
    config: PoolConfigAnchor;
    marginNr: number;
    owner: PublicKey;
    //amount to be moved back to bid escrow
    amount?: BN;
    whitelist: PublicKey;
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [marginPda, marginBump] = findMarginPDA({
      tswap: tswapPda,
      marginNr,
      owner,
    });
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
      .detachPoolFromMargin(config as any, amount)
      .accounts({
        tswap: tswapPda,
        marginAccount: marginPda,
        pool: poolPda,
        whitelist,
        owner,
        solEscrow: solEscrowPda,
        systemProgram: SystemProgram.programId,
      });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      tswapPda,
      tswapBump,
      marginPda,
      marginBump,
      poolPda,
      poolBump,
      solEscrowPda,
      solEscrowBump,
    };
  }

  // --------------------------------------- advanced ordering system

  //main signature cosigner
  async setPoolFreeze({
    whitelist,
    owner,
    config,
    marginNr,
    freeze,
    cosigner = TSWAP_COSIGNER,
  }: {
    whitelist: PublicKey;
    owner: PublicKey;
    config: PoolConfigAnchor;
    marginNr: number;
    freeze: boolean;
    cosigner?: PublicKey;
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
    const [marginPda, marginBump] = findMarginPDA({
      tswap: tswapPda,
      owner,
      marginNr,
    });
    const [solEscrowPda, solEscrowBump] = findSolEscrowPDA({ pool: poolPda });

    const builder = this.program.methods
      .setPoolFreeze(config as any, freeze)
      .accounts({
        tswap: tswapPda,
        pool: poolPda,
        whitelist,
        solEscrow: solEscrowPda,
        owner,
        cosigner,
        marginAccount: marginPda,
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
      marginPda,
      marginBump,
    };
  }

  //main signature: cosigner
  async takeSnipe({
    whitelist,
    nftMint,
    nftSellerAcc,
    owner,
    seller,
    config,
    actualPrice,
    nftMetadata,
    marginNr,
    cosigner = TSWAP_COSIGNER,
  }: {
    whitelist: PublicKey;
    nftMint: PublicKey;
    nftSellerAcc: PublicKey;
    owner: PublicKey;
    seller: PublicKey;
    config: PoolConfigAnchor;
    actualPrice: BN;
    // If provided, skips RPC call to fetch on-chain metadata + creators.
    nftMetadata?: PublicKey;
    marginNr: number;
    cosigner?: PublicKey;
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
    const [marginPda, marginBump] = findMarginPDA({
      tswap: tswapPda,
      owner,
      marginNr,
    });

    let meta;
    if (nftMetadata) {
      meta = nftMetadata;
    } else {
      const nft = await fetchNft(this.program.provider.connection, nftMint);
      meta = nft.metadataAddress;
    }

    const builder = this.program.methods
      .takeSnipe(config as any, actualPrice)
      .accounts({
        shared: {
          tswap: tswapPda,
          feeVault: tSwapAcc.feeVault,
          pool: poolPda,
          whitelist,
          nftSellerAcc,
          nftMint,
          mintProof: mintProofPda,
          nftMetadata: meta,
          solEscrow: solEscrowPda,
          owner,
          seller,
        },
        ownerAtaAcc,
        marginAccount: marginPda,
        cosigner,
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
      solEscrowPda,
      solEscrowBump,
      ownerAtaAcc,
      escrowPda,
      escrowBump,
      receiptPda,
      receiptBump,
      marginPda,
      marginBump,
    };
  }

  // --------------------------------------- helper methods

  async getSolEscrowRent() {
    return await getAccountRent(
      this.program.provider.connection,
      this.program.account.solEscrow
    );
  }

  async getMarginAccountRent() {
    return await getAccountRent(
      this.program.provider.connection,
      this.program.account.marginAccount
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
    name: typeof IDL_latest["errors"][number]["name"]
  ): typeof IDL_latest["errors"][number] {
    //@ts-ignore (throwing weird ts errors for me)
    return this.program.idl.errors.find((e) => e.name === name)!;
  }

  getErrorCodeHex(name: typeof IDL_latest["errors"][number]["name"]): string {
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
    // No "default": this ensures we explicitly think about how to handle new ixs.
    switch (ix.ix.name) {
      case "initUpdateTswap":
      case "initMarginAccount":
      case "closeMarginAccount":
      case "depositMarginAccount":
      case "withdrawMarginAccount":
      case "attachPoolToMargin":
      case "detachPoolFromMargin":
      case "takeSnipe":
        return null;
      case "editPool": {
        const config = (ix.ix.data as EditPoolIxData).newConfig;
        return castPoolConfigAnchor(config);
      }
      case "initPool":
      case "closePool":
      case "depositNft":
      case "withdrawNft":
      case "depositSol":
      case "withdrawSol":
      case "buyNft":
      case "sellNftTokenPool":
      case "sellNftTradePool":
      case "setPoolFreeze":
      case "reallocPool": {
        const config = (ix.ix.data as TSwapIxData).config;
        return castPoolConfigAnchor(config);
      }
    }
  }

  getSolAmount(ix: ParsedTSwapIx): BN | null {
    // No "default": this ensures we explicitly think about how to handle new ixs.
    switch (ix.ix.name) {
      case "buyNft":
      case "sellNftTradePool":
      case "sellNftTokenPool":
      case "takeSnipe":
        // NB: the actual sell price includes the "MM fee" (really a spread).
        const event = ix.events[0].data;
        return event.currentPrice.sub(event.mmFee);
      case "depositSol":
      case "withdrawSol":
      case "depositMarginAccount":
      case "withdrawMarginAccount":
      case "detachPoolFromMargin":
        return (ix.ix.data as WithdrawDepositSolData).lamports;
      case "initUpdateTswap":
      case "initPool":
      case "closePool":
      case "depositNft":
      case "withdrawNft":
      case "editPool":
      case "reallocPool":
      case "initMarginAccount":
      case "closeMarginAccount":
      case "setPoolFreeze":
      case "attachPoolToMargin":
        return null;
    }
  }

  getFeeAmount(ix: ParsedTSwapIx): BN | null {
    switch (ix.ix.name) {
      // No "default": this ensures we explicitly think about how to handle new ixs.
      case "buyNft":
      case "sellNftTradePool":
      case "sellNftTokenPool":
      case "takeSnipe":
        const event = ix.events[0].data;
        return event.tswapFee.add(event.creatorsFee);
      case "initUpdateTswap":
      case "initPool":
      case "closePool":
      case "depositNft":
      case "withdrawNft":
      case "depositSol":
      case "withdrawSol":
      case "editPool":
      case "reallocPool":
      case "initMarginAccount":
      case "closeMarginAccount":
      case "depositMarginAccount":
      case "withdrawMarginAccount":
      case "attachPoolToMargin":
      case "detachPoolFromMargin":
      case "setPoolFreeze":
        return null;
    }
  }

  // FYI: accounts under InstructioNDisplay is the space-separated capitalized
  // version of the fields for the corresponding #[Accounts].
  // eg sol_escrow -> "Sol Escrow', or tswap -> "Tswap"
  // shared.sol_escrow -> "Shared > Sol Escrow"
  getAccountByName(
    ix: ParsedTSwapIx,
    name: AccountSuffix
  ): ParsedAccount | undefined {
    // We use endsWith since composite nested accounts (eg shared.sol_escrow)
    // will prefix it as "Shared > Sol Escrow"
    return ix.formatted?.accounts.find((acc) => acc.name?.endsWith(name));
  }

  static uuidToBuffer = (uuid: string) => {
    return Buffer.from(uuid.replaceAll("-", "")).toJSON().data;
  };
}
