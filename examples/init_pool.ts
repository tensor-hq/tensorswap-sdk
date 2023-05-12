import { AnchorProvider, BN, Wallet } from "@project-serum/anchor";
import { LAMPORTS_PER_SOL, PublicKey, Transaction } from "@solana/web3.js";
import {
  CurveTypeAnchor,
  OrderType,
  PoolTypeAnchor,
  TensorSwapSDK,
} from "@tensor-hq/tensorswap-sdk";
import { conn, keypair, whitelist } from "./common";

const provider = new AnchorProvider(conn, new Wallet(keypair), {
  commitment: "confirmed",
});
const swapSdk = new TensorSwapSDK({ provider });

(async () => {
  const initPool = await swapSdk.initPool({
    owner: keypair.publicKey,
    whitelist,
    config: {
      // Token = Collection-wide bid
      // NFT = Listing NFTs on a curve.
      // Trade = market-making order.
      poolType: PoolTypeAnchor.Token,
      // Exponential = % change.
      // Linear = SOL change.
      curveType: CurveTypeAnchor.Exponential,
      startingPrice: new BN(0.1 * LAMPORTS_PER_SOL),
      // If curveType = Exponential, this is in BPS (delta = 100 = 1%).
      // If curveType = Linear, this is in lamports (delta = 1e8 = 0.1 SOL).
      delta: new BN(0),
      // ===== These are only valid for poolType = Trade =====
      // If true, fees deposited back into pool to buy more NFTs.
      mmCompoundFees: true,
      // How much fee to collect for each buy + sell (mmFeeBps = 100 = 1%).
      mmFeeBps: null,
    },
    // Maximum # of NFTs to buy from the pool in its lifetime (important to set for shared escrows!).
    maxTakerSellCount: 1,
    // keep these as is.
    customAuthSeed: undefined,
    isCosigned: false,
    orderType: OrderType.Standard,
  });
  console.log(initPool);
  const tx = new Transaction().add(...initPool.tx.ixs);
  console.log(tx);
})();
