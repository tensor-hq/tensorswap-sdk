import Mexp from "math-expression-evaluator";

// pNFTs can be very expensive: just over allocate.
export const DEFAULT_XFER_COMPUTE_UNITS = 800_000;
export const DEFAULT_RULESET_ADDN_COMPUTE_UNITS = 400_000;
export const DEFAULT_MICRO_LAMPORTS = 10_000;

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
  | "Margin Account"
  | "Single Listing"
  | "Bid State"
  | "Bidder";

export const evalMathExpr = (str: string) => {
  const mexp = new Mexp();
  return mexp.eval(str, [], {});
};
