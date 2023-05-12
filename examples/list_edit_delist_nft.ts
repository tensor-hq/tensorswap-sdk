import { AnchorProvider, BN, Wallet } from "@project-serum/anchor";
import { LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";
import { TensorSwapSDK } from "@tensor-hq/tensorswap-sdk";
import { conn, keypair, nftMint, nftSource } from "./common";

const provider = new AnchorProvider(conn, new Wallet(keypair), {
  commitment: "confirmed",
});
const swapSdk = new TensorSwapSDK({ provider });

(async () => {
  // List the NFT.
  {
    const data = await swapSdk.list({
      owner: keypair.publicKey,
      nftMint,
      nftSource,
      // Create listing to sell for 0.1 SOL.
      price: new BN(0.1 * LAMPORTS_PER_SOL),
    });

    const tx = new Transaction().add(...data.tx.ixs);
    // Sign + send tx.
  }

  // Edit the listing.
  {
    const data = await swapSdk.editSingleListing({
      owner: keypair.publicKey,
      nftMint,
      // Change listing to 0.5 SOL.
      price: new BN(0.5 * LAMPORTS_PER_SOL),
    });

    const tx = new Transaction().add(...data.tx.ixs);
  }

  // Delist.
  {
    const data = await swapSdk.delist({
      owner: keypair.publicKey,
      nftMint,
      // (!!) Specify the destination ATA for the NFT.
      nftDest: nftSource,
    });

    const tx = new Transaction().add(...data.tx.ixs);
  }
})();
