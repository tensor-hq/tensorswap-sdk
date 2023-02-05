import { AccountInfo, Connection, PublicKey } from "@solana/web3.js";
import { TENSORSWAP_ADDR } from "./constants";
import { BN } from "@project-serum/anchor";
import { PREFIX } from "@metaplex-foundation/mpl-token-auth-rules";
import { AUTH_PROG_ID, TMETA_PROG_ID } from "../common";

export const findPoolPDA = ({
  program,
  tswap,
  owner,
  whitelist,
  poolType,
  curveType,
  startingPrice,
  delta,
}: {
  program?: PublicKey;
  tswap: PublicKey;
  owner: PublicKey;
  whitelist: PublicKey;
  poolType: number;
  curveType: number;
  startingPrice: BN;
  delta: BN;
}): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [
      tswap.toBytes(),
      owner.toBytes(),
      whitelist.toBytes(),
      //u8s, hence 1 byte each
      new BN(poolType).toArrayLike(Uint8Array as any, "le", 1),
      new BN(curveType).toArrayLike(Uint8Array as any, "le", 1),
      //u64s, hence 8 bytes each
      startingPrice.toArrayLike(Uint8Array as any, "le", 8),
      delta.toArrayLike(Uint8Array as any, "le", 8),
    ],
    program ?? TENSORSWAP_ADDR
  );
};

export const findTSwapPDA = ({ program }: { program?: PublicKey }) => {
  return PublicKey.findProgramAddressSync([], program ?? TENSORSWAP_ADDR);
};

export type FindMarginArgs = {
  tswap: PublicKey;
  owner: PublicKey;
  marginNr: number;
  program?: PublicKey;
};
export const findMarginPDA = ({
  tswap,
  owner,
  marginNr,
  program,
}: FindMarginArgs) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("margin"),
      tswap.toBytes(),
      owner.toBytes(),
      //u16, hence 2 bytes
      new BN(marginNr).toArrayLike(Uint8Array as any, "le", 2),
    ],
    program ?? TENSORSWAP_ADDR
  );
};

export const findNextFreeMarginNr = async ({
  connection,
  startNr,
  tswap,
  owner,
  program,
}: {
  connection: Connection;
  startNr?: number;
} & Omit<FindMarginArgs, "marginNr">) => {
  let marginNr = startNr ?? 0;
  let marginPda;
  let marginBump;
  let account: AccountInfo<Buffer> | null = null;
  while (marginNr < 2 ** 16) {
    [marginPda, marginBump] = findMarginPDA({
      tswap,
      owner,
      marginNr,
      program,
    });
    account = await connection.getAccountInfo(marginPda);
    if (!account) {
      return { marginNr, marginPda, marginBump };
    }
    marginNr++;
  }
  throw new Error("margin number > u16::MAX");
};

export const findNftEscrowPDA = ({
  program,
  nftMint,
}: {
  program?: PublicKey;
  nftMint: PublicKey;
}) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("nft_escrow"), nftMint.toBytes()],
    program ?? TENSORSWAP_ADDR
  );
};

export const findNftDepositReceiptPDA = ({
  program,
  nftMint,
}: {
  program?: PublicKey;
  nftMint: PublicKey;
}) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("nft_receipt"), nftMint.toBytes()],
    program ?? TENSORSWAP_ADDR
  );
};

export const findSolEscrowPDA = ({
  program,
  pool,
}: {
  program?: PublicKey;
  pool: PublicKey;
}) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("sol_escrow"), pool.toBytes()],
    program ?? TENSORSWAP_ADDR
  );
};

export const findNftAuthorityPDA = ({
  program,
  authSeed,
}: {
  program?: PublicKey;
  authSeed: number[];
}) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("nft_auth"), Buffer.from(authSeed)],
    program ?? TENSORSWAP_ADDR
  );
};

// todo temp while mplex adds to sdk
export const findTokenRecordPDA = (mint: PublicKey, token: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TMETA_PROG_ID.toBuffer(),
      mint.toBuffer(),
      Buffer.from("token_record"),
      token.toBuffer(),
    ],
    TMETA_PROG_ID
  );
};

// todo temp while mplex adds to sdk
export const findRuleSetPDA = async (payer: PublicKey, name: string) => {
  return await PublicKey.findProgramAddress(
    [Buffer.from(PREFIX), payer.toBuffer(), Buffer.from(name)],
    AUTH_PROG_ID
  );
};
