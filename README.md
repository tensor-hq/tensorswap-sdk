# Tensorswap SDK

- [Getting Started](#getting-started)
- [Example Code](#example-code)
- [API Access](#api-access)

## Getting Started

### From npm/yarn (RECOMMENDED)

```
# yarn
yarn add @tensor-oss/tensorswap-sdk
# npm
npm install @tensor-oss/tensorswap-sdk
```

### From source

```sh
git clone https://github.com/tensor-hq/tensorswap-sdk.git
cd tensorswap-sdk/
yarn
# Build JS files
yarn tsc
```

## Example Code

Working examples can be found under `examples/`.

```ts
const { AnchorProvider, Wallet } = require("@project-serum/anchor");
const { Connection, Keypair, PublicKey } = require("@solana/web3.js");
const {
  TensorSwapSDK,
  TensorWhitelistSDK,
  computeTakerPrice,
  TakerSide,
  castPoolConfigAnchor,
  findWhitelistPDA,
} = require("@tensor-oss/tensorswap-sdk");

const conn = new Connection("https://api.mainnet-beta.solana.com");
const provider = new AnchorProvider(conn, new Wallet(Keypair.generate()));
const swapSdk = new TensorSwapSDK({ provider });
const wlSdk = new TensorWhitelistSDK({ provider });

// ========= Compute current price (Buy + sell)

// Fetch the pool PDA for its settings.
const pool = await swapSdk.fetchPool(new PublicKey("<address of target pool>"));
const config = castPoolConfigAnchor(pool.config);

const price = computeTakerPrice({
  takerSide: TakerSide.Buy, // or TakerSide.Sell for selling
  extraNFTsSelected: 0,

  // These fields can be extracted from the pool object above.
  config,
  takerSellCount: pool.takerSellCount,
  takerBuyCount: pool.takerBuyCount,
  maxTakerSellCount: pool.maxTakerSellCount,
  statsTakerSellCount: pool.stats.takerSellCount,
  slippage: <number>, // add optional slippage: in case pool updates on-chain
});



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
    // see `computeTakerPrice` above to get the current price
    maxPrice
  });
  const buyTx = new Transaction(...ixs);
}

// ========= Selling

// uuid = Tensor collection ID (see "Collection UUID" API endpoint below)
const uuid = "..."

// Remove "-" symbols from uuid, so it's within the 32 seed length limit. Additionally convert the uuid to a Uint8Array
const uuidArray = Buffer.from(uuid.replaceAll("-", "")).toJSON().data;

// Finding the PDA address
const wlAddr = findWhitelistPDA({uuid: uuidArray})[0];

// Step 1: Prepare the mint proof PDA (if required).
{
  const wl = await wlSdk.fetchWhitelist(wlAddr);

  // Proof is only required if rootHash is NOT a 0 array, o/w not necessary!
  if(JSON.stringify(wl.rootHash) !== JSON.stringify(Array(32).fill(0))) {
    // Off-chain merkle proof (see "Mint Proof" API endpoint below).
    const proof = ...;

    const {
      tx: { ixs },
    } = await wlSdk.initUpdateMintProof({
      // User signing the tx (the seller)
      user,
      whitelist: wlAddr,
      // (NFT) Mint address
      mint,
      proof,
    });
    const proofTx = new Transaction(...ixs);
  }
}

// Step 2: Send sell tx.
{
  const {
    tx: { ixs },
  } = await swapSdk.sellNft({
    type: "token", // or 'trade' for a trade pool
    whitelist: wlAddr,
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
    // see `computeTakerPrice` above to get the current price
    minPrice,
  });
  const sellTx = new Transaction(...ixs);
}

// ========= TODO: initPool / closePool / editPool / withdrawNft / depositNft / withdrawSol / depositSol
```

## API Access

Docs can be [found here](https://tensor-hq.notion.site/PUBLIC-Tensor-Trade-API-alpha-b18e1a196187473bac9b5d6de5b47032).

Ping us in our [Discord](https://www.discord.com/invite/a8spfqxEpC) for access.

### Collection UUID

You can query all Tensor collections and their metadata, including their `id` which
corresponds to `whitelist.uuid` with [this query](https://www.notion.so/tensor-hq/PUBLIC-Tensor-Trade-API-alpha-b18e1a196187473bac9b5d6de5b47032#56b333bfe0b641f8acad51a963a04f4f).

Alternative, you can find a collection for a corresponding mint:
1. [Get the mint's Tensor slug](https://www.notion.so/tensor-hq/PUBLIC-Tensor-Trade-API-alpha-b18e1a196187473bac9b5d6de5b47032#5ae4f2d0499a4c6ba3ceed4f9ee949ad)
2. [Get the collection's ID](https://www.notion.so/tensor-hq/PUBLIC-Tensor-Trade-API-alpha-b18e1a196187473bac9b5d6de5b47032#59c583754aa2477caacd2b436071d564)
3. Use the ID as the `uuid` for the whitelist

The ID for a collection will never change, so feel free to cache this locally.

A mint's collection will almost always never change (99% of the time), so feel free to cache this as needed and update if necessary.

### Mint Proof

For selling and depositing and for some collections (where `whitelist.rootHash` is not a 0-zero),
you will need to fetch the off-chain [merkle proofs](https://en.wikipedia.org/wiki/Merkle_tree) we use for collection whitelisting from our API.

Endpoint + example can be [found here](https://www.notion.so/tensor-hq/PUBLIC-Tensor-Trade-API-alpha-b18e1a196187473bac9b5d6de5b47032#9be7fb3fc59f49e08cc10a0d7d1d7ba7).

