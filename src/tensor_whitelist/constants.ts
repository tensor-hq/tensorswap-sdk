import { PublicKey } from "@solana/web3.js";

export const TLIST_ADDR = new PublicKey(
  process.env.TLIST_ADDR || "TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW"
);

export const TLIST_COSIGNER = new PublicKey(
  process.env.TLIST_COSIGNER || "5aB7nyNJTuQZdKnhZXQHNhT16tBNevCuLRp14btvANxu"
);

export const TLIST_OWNER = new PublicKey(
  process.env.TLIST_OWNER || "99cmWwQMqMFzMPx85rvZYKwusGSjZUDsu6mqYV4iisiz"
);

export const MAX_PROOF_LEN = 28;
