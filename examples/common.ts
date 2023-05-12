import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";

export const conn = new Connection("https://api.mainnet-beta.solana.com");
export const keypair = Keypair.generate();

export const nftMint = new PublicKey(
  "AhzUD99Lq9wWXLWQHXF6y3gGZzmxyNU9uMBW7hdtpEg4"
);
export const nftSource = getAssociatedTokenAddressSync(
  nftMint,
  keypair.publicKey
);
export const whitelist = new PublicKey(
  "7GLDrSDBVoBkdX1odXQ6WM8qyTrAoje8mx5LeGbRY8PU"
);
