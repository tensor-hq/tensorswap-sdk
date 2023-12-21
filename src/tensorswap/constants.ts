import { PublicKey } from "@solana/web3.js";

// constants separated from sdk.ts, used by the frontend

//(!) Keep in sync with Tensorswap contract and TBID_FEE_BPS
export const TSWAP_TAKER_FEE_BPS: number = 150;
export const MAKER_REBATE_BPS: number = 25;

export const TENSORSWAP_ADDR = new PublicKey(
  process.env.TENSORSWAP_ADDR || "TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN"
);

//@Deprecated, not used inside of Tswap anymore
export const TSWAP_FEE_ACC = new PublicKey(
  process.env.TSWAP_FEE_ACC || "4zdNGgAtFsW1cQgHqkiWyRsxaAgxrSRRynnuunxzjxue"
);

export const TSWAP_COSIGNER = new PublicKey(
  process.env.TSWAP_COSIGNER || "6WQvG9Z6D1NZM76Ljz3WjgR7gGXRBJohHASdQxXyKi8q"
);

export const TSWAP_OWNER = new PublicKey(
  process.env.TSWAP_OWNER || "99cmWwQMqMFzMPx85rvZYKwusGSjZUDsu6mqYV4iisiz"
);
