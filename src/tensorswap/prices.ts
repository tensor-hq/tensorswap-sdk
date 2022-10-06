import { CurveType, PoolConfig, PoolType, TakerSide } from "../types";
import Big from "big.js";
import BN from "bn.js";

export const HUNDRED_PCT_BPS = 100_00;
// 0.1% seems to be enough to deal with truncation divergence b/w off-chain and on-chain.
const EXPO_SLIPPAGE = 0.001;

export type ComputePriceArgs = {
  config: PoolConfig;
  takerSellCount: number;
  takerBuyCount: number;
  takerSide: TakerSide;
  //single "extra" selection field, instead of 2 (nftsSelectedToBuy / nftsSelectedToSell)
  //that's because for Trade pools we don't want user's selection in buy tab to influence price in sell tab and vv
  //takerSide basically decides which way we add it
  extraNFTsSelected: number;

  // In addition to your standard slippage,
  // for exponential prices, we MUST add a small tolerance/slippage
  // since on-chain and off-chain rounding is not exactly the same.
  // 0.01 = 1%.
  slippage?: number;
};

// This is what should be displayed to the user ((!) no slippage, since slippage is only used for rounding errors).
// In contrast, computeCurrentPrice is what should be passed to the ix itself
// (doesn't take into account tswap/mm fees).
export const computeTakerDisplayPrice = (args: ComputePriceArgs) => {
  // Explicitly set slippage to 0.
  return computeTakerWithMMFeesPrice({ ...args, slippage: 0 });
};

// This includes MM fees (when taker is selling).
// This should be used when computing deposit amounts + display (see computeTakerDisplayPrice) and nothing else.
// In contrast, computeCurrentPrice is what should be passed to the ix itself
// (doesn't take into account tswap/mm fees).
const computeTakerWithMMFeesPrice = (args: ComputePriceArgs): Big | null => {
  let currentPrice = computeCurrentPrice(args);
  if (currentPrice === null) return null;

  let priceWithMMFees = currentPrice;
  if (
    args.config.poolType === PoolType.Trade &&
    args.takerSide === TakerSide.Sell
  ) {
    priceWithMMFees = priceWithMMFees.sub(
      priceWithMMFees.mul(args.config.mmFeeBps ?? 0).div(HUNDRED_PCT_BPS)
    );
  }

  return priceWithMMFees;
};

// Computes the current price of a pool (WITHOUT MM/TSWAP FEES),
// optionally with slippage (so minPrice for Sell, maxPrice for Buy).
// Note even w/ 0 slippage this price will differ from the on-chain current price
// for Exponential curves b/c of rounding differences.
// Will return null if price is neagtive (ie cannot sell anymore).
export const computeCurrentPrice = ({
  config,
  takerSellCount,
  takerBuyCount,
  takerSide,
  extraNFTsSelected,
  // Default small tolerance for exponential curves.
  slippage = config.curveType === CurveType.Linear ? 0 : EXPO_SLIPPAGE,
}: ComputePriceArgs): Big | null => {
  let basePrice = (() => {
    switch (config.poolType) {
      case PoolType.Token:
        return _shiftPriceByDelta(
          config.curveType,
          config.startingPrice,
          config.delta,
          "down",
          takerSellCount + extraNFTsSelected
        );
      case PoolType.NFT:
        return _shiftPriceByDelta(
          config.curveType,
          config.startingPrice,
          config.delta,
          "up",
          takerBuyCount + extraNFTsSelected
        );
      case PoolType.Trade:
        const isSelling = takerSide === TakerSide.Sell;
        const offset = isSelling ? 1 : 0;
        const modSellCount =
          takerSellCount + offset + +isSelling * extraNFTsSelected;
        const modBuyCount =
          takerBuyCount + (1 - +isSelling) * extraNFTsSelected;
        if (modBuyCount > modSellCount) {
          return _shiftPriceByDelta(
            config.curveType,
            config.startingPrice,
            config.delta,
            "up",
            modBuyCount - modSellCount
          );
        } else {
          return _shiftPriceByDelta(
            config.curveType,
            config.startingPrice,
            config.delta,
            "down",
            modSellCount - modBuyCount
          );
        }
    }
  })();

  if (basePrice.lt(0)) return null;

  basePrice = basePrice.mul(
    1 + (takerSide === TakerSide.Buy ? 1 : -1) * slippage
  );

  return basePrice;
};

const _shiftPriceByDelta = (
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

// Use this to figure out (from the maker perspective):
// (1) desired = count  - how much SOL lamports (totalAmount) required to sell/buy `count`
// (2) desired = total  - how many NFTs (allowedCount) one can sell/buy with `total`
// What's sepcial about this fn is we always use negative noise slippage (by default) in the case of
// exponential fns.
// This ensures that the maker deposits more than enough (for rounding issues).
export const computeMakerAmountCount = ({
  desired,
  maxCount = 1000,
  ...priceArgs
}: ComputePriceArgs & {
  desired: { count: number } | { total: BN };
  // Necessary since for a sell exponential curve, this can be infinity.
  maxCount?: number;
}) => {
  let totalAmount = new BN(0);
  let allowedCount = 0;

  const currPriceArgs = {
    ...priceArgs,
    slippage:
      priceArgs.slippage ??
      (priceArgs.config.curveType === CurveType.Linear
        ? 0
        : -1 * EXPO_SLIPPAGE),
  };
  const initTakerPrice = computeTakerWithMMFeesPrice(currPriceArgs);
  const initialPrice = initTakerPrice
    ? new BN(initTakerPrice.round().toString())
    : null;
  let currPrice = initialPrice;

  while (
    currPrice !== null &&
    allowedCount < maxCount &&
    (("count" in desired && allowedCount < desired.count) ||
      ("total" in desired && totalAmount.lte(desired.total.sub(currPrice))))
  ) {
    totalAmount = totalAmount.add(currPrice);
    allowedCount += 1;
    if (priceArgs.takerSide === TakerSide.Buy) {
      currPriceArgs.takerBuyCount++;
    } else {
      currPriceArgs.takerSellCount++;
    }

    const temp = computeTakerWithMMFeesPrice(currPriceArgs);
    // Need to round decimals since we only deal in BNs/lamports.
    currPrice = temp ? new BN(temp.round().toString()) : null;
  }

  return { totalAmount, allowedCount, initialPrice };
};
