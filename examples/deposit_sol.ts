import { AnchorProvider, Wallet, BN } from "@project-serum/anchor";
import { PublicKey, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import {
  TensorSwapSDK,
  CurveTypeAnchor,
  PoolTypeAnchor,
} from "@tensor-hq/tensorswap-sdk";
import { conn, keypair, whitelist } from "./common";

const provider = new AnchorProvider(conn, new Wallet(keypair), {
  commitment: "confirmed",
});
const swapSdk = new TensorSwapSDK({ provider });

(async () => {
  const data = await swapSdk.depositSol({
    owner: keypair.publicKey,
    // Whitelist used to create the pool.
    whitelist,
    // Deposit 55 SOL.
    lamports: new BN(55 * LAMPORTS_PER_SOL),
    // Use the original config of your pool.
    config: {
      poolType: PoolTypeAnchor.Token,
      curveType: CurveTypeAnchor.Exponential,
      startingPrice: new BN(0.1 * LAMPORTS_PER_SOL),
      delta: new BN(0),
      mmCompoundFees: true,
      mmFeeBps: null,
    },
  });

  const tx = new Transaction().add(...data.tx.ixs);
})();
