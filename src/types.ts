import { PublicKey } from "@solana/web3.js";
import Big from "big.js";

//the side of the trade that the trader is taking
export enum TakerSide {
  Buy = "Buy",
  Sell = "Sell",
}

export enum PoolType {
  NFT = "NFT",
  Token = "Token",
  Trade = "Trade",
}

export enum CurveType {
  Linear = "Linear",
  Exponential = "Exponential",
}

export type PoolConfig = {
  poolType: PoolType;
  curveType: CurveType;
  // TODO: THESE SHOULD BE BNs, OTHERWISE WE'LL RUN INTO ALL SORTS OF RUN TIME ERRORS.
  startingPrice: Big;
  delta: Big;
  honorRoyalties: boolean;
  mmFeeBps: number | null; // null for non-trade pools
};

// Parsed account from a raw tx.
export type ParsedAccount = {
  name?: string | undefined;
  pubkey: PublicKey;
  isSigner: boolean;
  isWritable: boolean;
};
