import { PublicKey } from "@solana/web3.js";
import { TBID_ADDR } from "./constants";
import { TENSORSWAP_ADDR } from "../tensorswap";

export const findBidStatePda = ({
  program,
  mint,
  owner,
}: {
  program?: PublicKey;
  mint: PublicKey;
  owner: PublicKey;
}) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("bid_state"), owner.toBytes(), mint.toBytes()],
    program ?? TBID_ADDR
  );
};

export const findNftTempPDA = ({
  program,
  nftMint,
}: {
  program?: PublicKey;
  nftMint: PublicKey;
}) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("nft_temp_acc"), nftMint.toBytes()],
    program ?? TBID_ADDR
  );
};
