import { BN, Event, Instruction } from "@project-serum/anchor";
import { InstructionDisplay } from "@project-serum/anchor/dist/cjs/coder/borsh/instruction";
import { PublicKey } from "@solana/web3.js";
import Big from "big.js";
import { CurveType, PoolConfig, PoolType } from "../types";
import { IDL, Tensorswap } from "./idl/tensorswap";
import {
  IDL as IDL_v0_1_32,
  Tensorswap as Tensorswap_v0_1_32,
} from "./idl/tensorswap_v0_1_32";

// Versioned IDLs for backwards compat when parsing.
export const TensorswapIDL_v0_1_32 = IDL_v0_1_32;
// https://solscan.io/tx/5ZWevmR3TLzUEVsPyE9bdUBqseeBdVMuELG45L15dx8rnXVCQZE2n1V1EbqEuGEaF6q4fND7rT7zwW8ZXjP1uC5s
// TODO: find exact slot + ix when the upgrade happened
export const TensorswapIDL_v0_1_32_EffSlot = 150855169;
export const TensorswapIDL_latest = IDL;
// https://solscan.io/tx/5aswB2admCErRwPNgM3DeaYcbVYjAjpHuKVFAZenaSGEm8PKL8R2BmqsGFWdGfMR25NPrVSNKix18ZgLtVpHyXUJ
export const TensorswapIDL_latest_EffSlot = 153016663;
export type TensorswapIDL = Tensorswap_v0_1_32 | Tensorswap;

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
