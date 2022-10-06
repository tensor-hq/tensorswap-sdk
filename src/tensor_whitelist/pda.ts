import { PublicKey } from "@solana/web3.js";
import { TENSOR_WHITELIST_ADDR } from "./constants";

export const findWhitelistAuthPDA = ({ program }: { program?: PublicKey }) => {
  return PublicKey.findProgramAddressSync([], program ?? TENSOR_WHITELIST_ADDR);
};

export const findWhitelistPDA = ({
  program,
  uuid,
}: {
  program?: PublicKey;
  uuid: number[];
}) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(uuid)],
    program ?? TENSOR_WHITELIST_ADDR
  );
};

export const findMintProofPDA = ({
  program,
  mint,
  whitelist,
}: {
  program?: PublicKey;
  mint: PublicKey;
  whitelist: PublicKey;
}) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("mint_proof"), mint.toBytes(), whitelist.toBytes()],
    program ?? TENSOR_WHITELIST_ADDR
  );
};
