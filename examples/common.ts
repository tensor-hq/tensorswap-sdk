import { Connection, Keypair } from "@solana/web3.js";

export const conn = new Connection("https://api.mainnet-beta.solana.com");
export const keypair = Keypair.generate();
