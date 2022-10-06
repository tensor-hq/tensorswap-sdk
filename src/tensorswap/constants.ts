import { PublicKey } from "@solana/web3.js";

export const TENSORSWAP_ADDR = new PublicKey(
  process.env.TENSORSWAP_ADDR || "TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN"
);

export const TSWAP_FEE_ACC = new PublicKey(
  process.env.TSWAP_FEE_ACC || "EuCpcygKBc39MY4iNkGUXE161houE4GYt6v1nGJC1GVQ"
);
