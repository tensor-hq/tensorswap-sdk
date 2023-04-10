import { AnchorProvider, BN, Wallet } from "@project-serum/anchor";
import { LAMPORTS_PER_SOL, PublicKey, Transaction } from "@solana/web3.js";
import {
  CurveTypeAnchor,
  OrderType,
  PoolTypeAnchor,
  TensorSwapSDK,
} from "@tensor-hq/tensorswap-sdk";
import { conn, keypair } from "./common";

const provider = new AnchorProvider(conn, new Wallet(keypair), {
  commitment: "confirmed",
});
const swapSdk = new TensorSwapSDK({ provider });

(async () => {
  const initPool = await swapSdk.initPool({
    owner: keypair.publicKey,
    whitelist: new PublicKey("DJYCoUYGBjugWLjpT9sdMmpXfxiM2PnvvkneRC6xymsC"),
    config: {
      poolType: PoolTypeAnchor.Token,
      curveType: CurveTypeAnchor.Exponential,
      startingPrice: new BN(0.1 * LAMPORTS_PER_SOL),
      delta: new BN(0),
      mmCompoundFees: true,
      mmFeeBps: null,
    },
    customAuthSeed: undefined,
    isCosigned: false,
    orderType: OrderType.Standard,
    maxTakerSellCount: 1,
  });
  console.log(initPool);
  const tx = new Transaction().add(...initPool.tx.ixs);
  console.log(tx);
})();
