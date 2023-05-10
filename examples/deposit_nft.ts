import { AnchorProvider, Wallet, BN } from "@project-serum/anchor";
import { PublicKey, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token"
import {
    TensorSwapSDK,
    CurveTypeAnchor,
    PoolTypeAnchor,
} from "@tensor-hq/tensorswap-sdk";
import { conn, keypair } from "./common";

const provider = new AnchorProvider(conn, new Wallet(keypair), {
    commitment: "confirmed",
});
const swapSdk = new TensorSwapSDK({ provider });

(async () => {
    const data = await swapSdk.depositNft({
        owner: keypair.publicKey,
        whitelist: new PublicKey("7GLDrSDBVoBkdX1odXQ6WM8qyTrAoje8mx5LeGbRY8PU"),
        nftMint: new PublicKey("AhzUD99Lq9wWXLWQHXF6y3gGZzmxyNU9uMBW7hdtpEg4"),
        nftSource: await getAssociatedTokenAddress(new PublicKey("AhzUD99Lq9wWXLWQHXF6y3gGZzmxyNU9uMBW7hdtpEg4"), keypair.publicKey),
        config: {
            poolType: PoolTypeAnchor.Token,
            curveType: CurveTypeAnchor.Exponential,
            startingPrice: new BN(0.1 * LAMPORTS_PER_SOL),
            delta: new BN(0),
            mmCompoundFees: true,
            mmFeeBps: null
        }
    })

    const tx = new Transaction().add(...data.tx.ixs);
})();