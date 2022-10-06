import { PublicKey } from "@solana/web3.js";

export const TENSOR_WHITELIST_ADDR = new PublicKey(
  process.env.TWHITELIST_ADDR || "TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW"
);

export const MAX_PROOF_LEN = 28;
