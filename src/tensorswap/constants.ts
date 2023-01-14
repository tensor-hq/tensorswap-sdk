import { PublicKey } from "@solana/web3.js";

export const TENSORSWAP_ADDR = new PublicKey(
  process.env.TENSORSWAP_ADDR || "TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN"
);

export const TSWAP_FEE_ACC = new PublicKey(
  process.env.TSWAP_FEE_ACC || "EuCpcygKBc39MY4iNkGUXE161houE4GYt6v1nGJC1GVQ"
);

export const TSWAP_COSIGNER = new PublicKey(
  process.env.TSWAP_COSIGNER || "6WQvG9Z6D1NZM76Ljz3WjgR7gGXRBJohHASdQxXyKi8q"
);

export const TSWAP_OWNER = new PublicKey(
  process.env.TSWAP_OWNER || "99cmWwQMqMFzMPx85rvZYKwusGSjZUDsu6mqYV4iisiz"
);
