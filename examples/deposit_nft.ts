import { AnchorProvider, BN, Wallet } from "@project-serum/anchor";
import { LAMPORTS_PER_SOL, PublicKey, Transaction } from "@solana/web3.js";
import {
  CurveTypeAnchor,
  PoolTypeAnchor,
  TensorSwapSDK,
} from "@tensor-hq/tensorswap-sdk";
import { conn, keypair, nftMint, nftSource, whitelist } from "./common";

const provider = new AnchorProvider(conn, new Wallet(keypair), {
  commitment: "confirmed",
});
const swapSdk = new TensorSwapSDK({ provider });

(async () => {
  const data = await swapSdk.depositNft({
    owner: keypair.publicKey,
    // Whitelist used to create the pool.
    whitelist,
    // NFT to deposit.
    nftMint,
    nftSource,
    // Use the original config of your pool.
    config: {
      poolType: PoolTypeAnchor.NFT,
      curveType: CurveTypeAnchor.Exponential,
      startingPrice: new BN(0.1 * LAMPORTS_PER_SOL),
      delta: new BN(0),
      mmCompoundFees: true,
      mmFeeBps: null,
    },
  });

  const tx = new Transaction().add(...data.tx.ixs);
})();
