# Tensorswap SDK

- [Getting Started](#getting-started)
- [Example Code](#example-code)
- [API Access](#api-access)

## Getting Started

```sh
git clone https://github.com/tensor-hq/tensorswap-sdk.git
cd tensorswap-sdk/
yarn
# Build JS files
yarn tsc
```

## Example Code

```ts
const { AnchorProvider, Wallet } = require("@project-serum/anchor");
const { Connection, Keypair } = require("@solana/web3.js");
const { TensorSwapSDK, TensorWhitelistSDK } = require(".");

const conn = new Connection("https://api.mainnet-beta.solana.com");
const provider = new AnchorProvider(conn, new Wallet(Keypair.generate()));
const swapSdk = new TensorSwapSDK({ provider });
const wlSdk = new TensorWhitelistSDK({ provider });

// ========= Buying
{
  const {
    tx: { ixs },
  } = await swapSdk.buyNft({
    // Whitelist PDA address where name = tensor slug (see TensorWhitelistSDK.nameToBuffer)
    whitelist,
    // NFT Mint address
    nftMint,
    // Buyer ATA account (destination)
    nftBuyerAcc,
    // owner of NFT (in pool PDA)
    owner,
    // buyer
    buyer,
    // PoolConfig object: construct from pool PDA
    config,
    // max price buyer is willing to pay (add ~0.1% for exponential pools b/c of rounding differences)
    maxPrice,
    // @deprecated
    proof: [],
  });
  const buyTx = new Transaction(...ixs);
}

// ========= Selling

// Step 1: Prepare the mint proof PDA.
{

  // List of buffers contain the merkle proof for this mint and WL (proof stored off-chain).
  // Fetch from Tensor API
  const proof = ...;

  const {
    tx: { ixs },
  } = await wlSDK.initUpdateMintProof({
    // User signing the tx (the seller)
    user,
    // Whitelist PDA address where name = tensor slug (see TensorWhitelistSDK.nameToBuffer)
    whitelist,
    // (NFT) Mint address
    mint,
    proof,
  });
  const proofTx = new Transaction(...ixs);
}

// Step 2: Send sell tx.
{
  const {

  } = await swapSdk.sellNft({
    type: "token", // or 'trade' for a trade pool
    // Whitelist PDA address where name = tensor slug (see TensorWhitelistSDK.nameToBuffer)
    whitelist,
    // NFT Mint address
    nftMint,
    // Token account holding seller's mint
    nftSellerAcc,
    // owner of NFT (in pool PDA)
    owner,
    // seller
    seller,
    // PoolConfig object: construct from pool PDA
    config,
    // min price seller is willing to receive (sub ~0.1% for exponential pools b/c of rounding differences)
    minPrice,
    // @deprecated
    proof: [],
  });
  const sellTx = new Transaction(...ixs);
}

// ========= TODO: initPool / closePool / editPool / withdrawNft / depositNft / withdrawSol / depositSol
```

## API Access

For the off-chain [merkle proofs](https://en.wikipedia.org/wiki/Merkle_tree) we use for collection whitelist, we store the proofs off-chain.

DM @oxrwu or @ilmoi on Telegram to get your API key!
