import { PublicKey } from "@solana/web3.js";
import Big from "big.js";
import BN from "bn.js";
import { CurveType, PoolConfig, PoolType } from "../types";

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
  mmCompoundFees: boolean;
  mmFeeBps: number | null; // null for non-trade pools
};

export const castPoolConfigAnchor = (config: PoolConfigAnchor): PoolConfig => ({
  poolType: castPoolTypeAnchor(config.poolType),
  curveType: castCurveTypeAnchor(config.curveType),
  startingPrice: new Big(config.startingPrice.toString()),
  delta: new Big(config.delta.toString()),
  mmCompoundFees: config.mmCompoundFees,
  mmFeeBps: config.mmFeeBps,
});

export const castPoolConfig = (config: PoolConfig): PoolConfigAnchor => ({
  poolType: castPoolType(config.poolType),
  curveType: castCurveType(config.curveType),
  startingPrice: new BN(config.startingPrice.round().toString()),
  delta: new BN(config.delta.round().toString()),
  mmCompoundFees: config.mmCompoundFees,
  mmFeeBps: config.mmFeeBps,
});

// --------------------------------------- rest

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
  maxTakerSellCount: number;
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

// --------------------------------------- state accounts

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

export type SingleListingAnchor = {
  owner: PublicKey;
  nftMint: PublicKey;
  price: BN;
  bump: number[];
};

// ----------- together

export type TensorSwapPdaAnchor =
  | PoolAnchor
  | SolEscrowAnchor
  | TSwapAnchor
  | NftDepositReceiptAnchor
  | NftAuthorityAnchor
  | MarginAccountAnchor
  | SingleListingAnchor;

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
    }
  | {
      name: "singleListing";
      account: SingleListingAnchor;
    };
