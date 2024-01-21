import { PublicKey } from "@solana/web3.js";
import { AnchorProvider, Wallet, BN } from "@coral-xyz/anchor";
import { TensorSwapSDK, TakerSide, CurveType, PoolType, castPoolConfigAnchor, computeMakerAmountCount } from "@tensor-oss/tensorswap-sdk";
import { conn, keypair } from "./common";
import Big from "big.js";

const provider = new AnchorProvider(conn, new Wallet(keypair), {
  commitment: "confirmed",
});
const swapSdk = new TensorSwapSDK({ provider });
const HUNDRED_PCT_BPS = 100_00;

async function getPoolBidDetails(poolAddress) {

  // fetch pool 
  const pool = await swapSdk.fetchPool(new PublicKey(poolAddress));
  const config = castPoolConfigAnchor(pool.config);

  // return early if pool is one-sided listing-only
  if (config.poolType == PoolType.NFT) {
    console.log("Listing-only pool can not bid.");
    return null;
  }

  // fetch balance of margin account if pool is attached to escrow, fetch balance of solEscrow instead if pool is not attached to escrow
  const solBalanceLamports = pool.margin != null ? new BN(await conn.getBalance(pool.margin)) : new BN(await conn.getBalance(pool.solEscrow));

  // retrieve amount of possible bids, total lamports needed for that amount of bids and initial price of the pool
  const { allowedCount, totalAmount, initialPrice } = computeMakerAmountCount({
    desired: { total: solBalanceLamports },
    maxCountWhenInfinite: 1000,
    takerSide: TakerSide.Sell,
    extraNFTsSelected: 0,
    config,
    takerSellCount: pool.takerSellCount,
    takerBuyCount: pool.takerBuyCount,
    maxTakerSellCount: pool.maxTakerSellCount,
    statsTakerSellCount: pool.stats.takerSellCount,
    statsTakerBuyCount: pool.stats.takerBuyCount,
    marginated: pool.margin !== null,
  });

  // return early if amount of possible bids is 0
  if (allowedCount == 0) {
    console.log("Pool is out of funds or reached maxTakerSellCount and won't bid anymore.");
    return null;
  }

  // retrieve initial highest bid price if pool is double sided (config.startingPrice would be the initial lowest list price in that case)
  var startingPriceBidSide: Number;
  if (config.poolType == PoolType.Trade) {

    // on linear curvetype, subtract delta once and multiply by (1 - mmFee)
    if (config.curveType == CurveType.Linear) {
      startingPriceBidSide = config.startingPrice
        .sub(config.delta)
        .mul(Big(1)
          .sub(Big(config.mmFeeBps)
            .div(Big(HUNDRED_PCT_BPS))
          )
        );
    }

    // on exponential curvetype, divide by (1 + delta) once and multiply by (1 - mmFee)
    else if (config.curveType == CurveType.Exponential) {
      startingPriceBidSide = config.startingPrice
        .div(Big(1)
          .add(config.delta
            .div(Big(HUNDRED_PCT_BPS))
          )
        )
        .mul(Big(1)
          .sub(Big(config.mmFeeBps)
            .div(Big(HUNDRED_PCT_BPS))
          )
        );
    }
  }

  // else if one-sided bidding-only pool, config.startingPrice matches initial highest bid already
  else if (config.poolType == PoolType.Token) {
    startingPriceBidSide = config.startingPrice;
  }

  // get the current lowest bid price by shifting price down by allowedCountWithLimit - 1 (since arg = 0 would be the initial highest bid) + pool.takerSellCount - pool.takerBuyCount (to do x less steps depending on how many bids already got fulfilled)
  const currentLowestBidPrice = shiftPriceByDelta(
    config.curveType,
    startingPriceBidSide!,
    config.delta,
    "down",
    allowedCount - 1 + pool.takerSellCount - pool.takerBuyCount
  );

  // get the highest bid price by shifting up or down x times depending on how many bids already got fulfilled
  var currentHighestBidPrice = pool.takerSellCount - pool.takerBuyCount >= 0 ?
    shiftPriceByDelta(config.curveType,
      startingPriceBidSide!,
      config.delta,
      "down",
      pool.takerSellCount - pool.takerBuyCount
    ) :
    shiftPriceByDelta(config.curveType,
      startingPriceBidSide!,
      config.delta,
      "up",
      (pool.takerSellCount - pool.takerBuyCount) * -1
    );

  console.log("Pool has " + allowedCount + " bids left, bid range is: " + Number(currentHighestBidPrice / 1_000_000_000) + "-" + Number(currentLowestBidPrice / 1_000_000_000) + " SOL.");
}

// helper function copied from https://github.com/tensor-hq/tensorswap-sdk/blob/main/src/tensorswap/prices.ts#L145
const shiftPriceByDelta = (
  curveType: CurveType,
  startingPrice: Big,
  delta: Big,
  direction: "up" | "down",
  times: number
): Big => {
  switch (curveType) {
    case CurveType.Exponential:
      switch (direction) {
        // price * (1 + delta)^trade_count
        case "up":
          return startingPrice.mul(
            new Big(1).add(delta.div(HUNDRED_PCT_BPS)).pow(times)
          );
        case "down":
          return startingPrice.div(
            new Big(1).add(delta.div(HUNDRED_PCT_BPS)).pow(times)
          );
      }
      break;
    case CurveType.Linear:
      switch (direction) {
        case "up":
          return startingPrice.add(delta.mul(times));
        case "down":
          return startingPrice.sub(delta.mul(times));
      }
  }
};

getPoolBidDetails("G498NY38Jxdab9BbGfaKiHze1pcr94ZLqusDoxUwoWsm");
