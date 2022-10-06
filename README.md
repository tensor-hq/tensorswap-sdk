## Tensorswap SDK

Example:

```ts
const conn = new Connection("https://api.mainnet-beta.solana.com");
const provider = new anchor.AnchorProvider(conn);
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
  });
  const buyTx = new Transaction(...ixs);
}

// ========= Selling

// Step 1: Prepare the mint proof PDA.
{

  // List of buffers contain the merkle proof for this mint and WL (proof stored off-chain).
  // Fetch from Tensor API.
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
    tx: { ixs },
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
  });
  const sellTx = new Transaction(...ixs);
}
```
