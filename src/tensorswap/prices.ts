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

  //v1.1: for margin Token pools, statsTakerSellCount < maxTakerSellCount (o/w no taking).
  // TODO: market making pool
  maxTakerSellCount: number;
  statsTakerSellCount: number;

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
// In contrast, computeTakerPrice is what should be passed to the ix itself (has some noise slippage).
export const computeTakerDisplayPrice = (args: ComputePriceArgs) => {
  // Explicitly set slippage to 0.
  return computeTakerPrice({ ...args, slippage: 0 });
};

// This includes MM fees (when taker is selling into a trade pool).
// This should be used when computing deposit amounts + display (see computeTakerDisplayPrice) and nothing else.
// (doesn't take into account mm fees).
export const computeTakerPrice = (args: ComputePriceArgs): Big | null => {
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

// Computes the current (base) price of a pool (WITHOUT MM FEES),
// optionally with slippage (so minPrice for Sell, maxPrice for Buy).
// Note even w/ 0 slippage this price will differ from the on-chain current price
// for Exponential curves b/c of rounding differences.
// Will return null if price is neagtive (ie cannot sell anymore).
const computeCurrentPrice = ({
  config,
  takerSellCount,
  takerBuyCount,
  takerSide,
  maxTakerSellCount,
  statsTakerSellCount,
  extraNFTsSelected,
  // Default small tolerance for exponential curves.
  slippage = config.curveType === CurveType.Linear ? 0 : EXPO_SLIPPAGE,
}: ComputePriceArgs): Big | null => {
  // Cannot sell anymore into capped token pool.
  if (
    // TODO: maker pool.
    config.poolType === PoolType.Token &&
    maxTakerSellCount != 0 &&
    statsTakerSellCount >= maxTakerSellCount
  ) {
    return null;
  }

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
// What's special about this fn is we add a bit of negative slippage exponential `totalAmount`.
// This ensures that the maker deposits more than enough (for rounding issues).
export const computeMakerAmountCount = ({
  desired,
  maxCount = 1000,
  ...priceArgs
}: Omit<ComputePriceArgs, "slippage"> & {
  desired: { count: number } | { total: BN };
  // Necessary since for a sell curve exponential curve, this can be infinity.
  maxCount?: number;
}): {
  totalAmount: BN;
  allowedCount: number;
  initialPrice: BN | null;
} => {
  const currPriceArgs = {
    ...priceArgs,
    slippage: 0,
  };
  const initTakerPrice = computeTakerPrice(currPriceArgs);
  if (!initTakerPrice) {
    return { totalAmount: new BN(0), allowedCount: 0, initialPrice: null };
  }

  const initialPrice = new BN(initTakerPrice.round().toString());

  // For calculations, we need to apply MM fees AFTER we sum things up (for sells).
  const initTakerPriceNoMM = computeTakerPrice({
    ...currPriceArgs,
    config: {
      ...currPriceArgs.config,
      mmFeeBps: 0,
    },
  })!;

  const { takerSide, config } = priceArgs;

  /*
    Constants:
    p = initial price
    d = delta
    T = total amount
    n = allowed count
    +/- = plus (buying) / minus (selling)

    Linear:
      Solving for T: T = p +/- n(n-1)d/2
      Solving for n:
        BUYS (https://www.wolframalpha.com/input?i=solve+for+x+in+T+%3Dxp+%2B+x%28x-1%29d%2F2):
        only need positive root
          n = ( sqrt((d-2p)^2 + 8dT) + d - 2p ) / (2d)
        SELLS, (https://www.wolframalpha.com/input?i=solve+for+x+in+T+%3Dxp+-+x%28x-1%29d%2F2):
        only need negative root
          if (d-2p)62 - 8dT < 0 (ie we can buy until negative prices):
            n = maxSellCount (see above)
          else:
            n = ( - sqrt((d-2p)^2 - 8dT) + d + 2p ) / (2d)

    Exponential:
    r = (1 +/- delta)
      Solving for T: T = p (1 - r^n) / (1 - r)
      Solving for n:
      BUYS: (https://www.wolframalpha.com/input?i=solve+for+x+in+T+%3D+p%281-r%5Ex%29+%2F+%281-r%29)
        n = log[(r - 1)T/p + 1] / log(r)
      SELLS: infinite (can always sell at 0)
  */

  /*
    Specifically for sell,
    k = # of times we decrement delta before hitting 0 price
    p = initial price
    d = delta
    p - kd >= 0 --> k <= p / d
    So delta count = 1 + k
    Buying we just take desired count.
  */

  /// `undo` = add MM fee back; otherwise subtract MM fee.
  const adjustTotalMMFee = (total: Big, undo: boolean = false) => {
    if (config.poolType !== PoolType.Trade) return total;
    if (takerSide !== TakerSide.Sell) return total;

    const feePct = new Big(HUNDRED_PCT_BPS)
      .minus(config.mmFeeBps ?? 0)
      .div(HUNDRED_PCT_BPS);

    if (undo) {
      // Shouldn't be possible (mmFeeBps < 100_000), but if just return total.
      if (feePct.eq(0)) return total;
      return total.div(feePct);
    }
    return total.mul(feePct);
  };

  /// This is how many times to price can decrease when selling before we reach 0.
  const getMaxSellCountLinear = () => {
    if (initTakerPriceNoMM.eq(0)) {
      if (config.delta.eq(0)) return maxCount;
      return 1;
    }

    if (config.delta.eq(0)) return maxCount;

    return (
      1 +
      initTakerPriceNoMM.div(config.delta).round(0, Big.roundDown).toNumber()
    );
  };

  const getTotalAmountLinear = (desiredCount: number) => {
    const allowedCount =
      takerSide === TakerSide.Buy
        ? desiredCount
        : Math.min(desiredCount, getMaxSellCountLinear());

    // This is basically an arithmetic series:
    // T  = p + (p +/- d) + p +/- 2d) + ... + (p +/- (n-1) d)
    //    = p +/- n(n-1)d/2
    const base = initTakerPriceNoMM.mul(allowedCount);
    const deltas = config.delta.mul(allowedCount * (allowedCount - 1)).div(2);
    const totalAmount =
      takerSide === TakerSide.Buy ? base.add(deltas) : base.minus(deltas);

    return {
      allowedCount,
      totalAmount: new BN(adjustTotalMMFee(totalAmount).round().toString()),
    };
  };

  const getRateExp = () => {
    const base = 1 + config.delta.div(HUNDRED_PCT_BPS).toNumber();
    if (takerSide === TakerSide.Buy) return base;
    return 1 / base;
  };

  const getTotalAmountExp = (count: number) => {
    /*
      Exponential = geometric series.
      We have:
      r = decay (1 + delta for buy, 1 - delta for sell)
      Thus:
      T  = p + pr + pr^2 + ... + pr^(n-1)
         = p * geosum(r, n-1)
         = p * (1 - r^n) / (1 - r)
    */
    const r = getRateExp();
    const geosum = (1 - Math.pow(r, count)) / (1 - r);
    const totalAmount = initTakerPriceNoMM.mul(geosum);

    return {
      allowedCount: count,
      // Negative slippage.
      totalAmount: new BN(
        adjustTotalMMFee(totalAmount)
          .mul(1 + EXPO_SLIPPAGE)
          .round()
          .toString()
      ),
    };
  };

  // ====================== By count

  if ("count" in desired) {
    if (config.curveType === CurveType.Linear) {
      const { allowedCount, totalAmount } = getTotalAmountLinear(desired.count);
      return { totalAmount, allowedCount, initialPrice };
    } else {
      const { allowedCount, totalAmount } = getTotalAmountExp(desired.count);
      return { totalAmount, allowedCount, initialPrice };
    }
  }

  // ====================== By total

  // Since our series are done PRE-MM fee, we need to "undo" the MM fee for our
  // desired total first, o/w it won't add up.
  const total = adjustTotalMMFee(new Big(desired.total.toString()), true);
  if (total.lt(initTakerPriceNoMM)) {
    return { totalAmount: new BN(0), allowedCount: 0, initialPrice };
  }

  if (config.curveType === CurveType.Linear) {
    const twoP = initTakerPriceNoMM.mul(2);
    // These are the a, b, c in the quadratic formula.
    const fourAC = total.mul(config.delta).mul(8);
    const twoA = config.delta.mul(2);

    let tempCount: number;
    if (initTakerPriceNoMM.eq(0)) {
      // Protects against divide by 0.
      tempCount = maxCount;
    } else if (config.delta.eq(0)) {
      // Protects against divide by 0.
      tempCount = total
        .div(initTakerPriceNoMM)
        .round(0, Big.roundDown)
        .toNumber();
    } else {
      if (takerSide === TakerSide.Buy) {
        const bSquared = config.delta.minus(twoP).pow(2);
        // n = ( sqrt((d-2p)^2 + 8dT) + d - 2p ) / (2d)
        tempCount = bSquared
          .add(fourAC)
          .sqrt()
          .add(config.delta)
          .minus(twoP)
          .div(twoA)
          .round(0, Big.roundDown)
          .toNumber();
      } else {
        // if (d-2p)^2 - 8dT < 0 (ie we can buy until negative prices):
        //   n = maxSellCount (see above)
        // else:
        //   n = ( - sqrt((d+2p)^2 - 8dT) + d + 2p ) / (2d)
        const bSquared = config.delta.plus(twoP).pow(2);
        const operand = bSquared.minus(fourAC);
        if (operand.lt(0)) {
          tempCount = getMaxSellCountLinear();
        } else {
          tempCount = operand
            .sqrt()
            .mul(-1)
            .add(config.delta)
            .add(twoP)
            .div(twoA)
            .round(0, Big.roundDown)
            .toNumber();
        }
      }
    }
    tempCount = Math.max(0, tempCount);
    const { allowedCount, totalAmount } = getTotalAmountLinear(tempCount);
    return { allowedCount, totalAmount, initialPrice };
  }

  // Exponential.
  // n = log[(r - 1)T/p + 1] / log(r)
  const r = getRateExp();
  let tempCount: number;
  if (initTakerPriceNoMM.eq(0)) {
    // Protects against divide by 0.
    tempCount = maxCount;
  } else {
    const operand = total
      .mul(r - 1)
      .div(initTakerPriceNoMM)
      .add(1)
      .toNumber();

    if (operand <= 0) {
      // Only possible when r < 1 ie selling (since we can sell infinitely).
      tempCount = maxCount;
    } else {
      tempCount = Math.floor(Math.log(operand) / Math.log(r));
    }
  }
  tempCount = Math.max(0, tempCount);

  const { allowedCount, totalAmount } = getTotalAmountExp(tempCount);
  return { allowedCount, totalAmount, initialPrice };
};
