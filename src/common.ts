import { Metaplex } from "@metaplex-foundation/js";
import { AccountClient, BN, Idl, Program, utils } from "@project-serum/anchor";
import { AllAccountsMap } from "@project-serum/anchor/dist/cjs/program/namespace/types";
import { AccountInfo, Connection, PublicKey } from "@solana/web3.js";
import {
  AuthorizationData,
  Metadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { PREFIX } from "@metaplex-foundation/mpl-token-auth-rules";

export const getAccountRent = (
  conn: Connection,
  acct: AccountClient
): Promise<number> => {
  return conn.getMinimumBalanceForRentExemption(acct.size);
};

export const getLamports = async (
  conn: Connection,
  acct: PublicKey
): Promise<number | undefined> => {
  return (await conn.getAccountInfo(acct))?.lamports;
};

export const hexCode = (decCode: number) => "0x" + decCode.toString(16);

export const removeNullBytes = (str: string) => {
  return str
    .split("")
    .filter((char) => char.codePointAt(0))
    .join("");
};

type Decoder = (buffer: Buffer) => any;
export type DiscMap<T extends Idl> = Record<
  string,
  { decoder: Decoder; name: keyof AllAccountsMap<T> }
>;

export const genDiscToDecoderMap = <T extends Idl>(
  program: Program<T>
): DiscMap<T> => {
  return Object.fromEntries(
    program.idl.accounts?.map((acc) => {
      const name = acc.name as keyof AllAccountsMap<T>;
      const capName = name.at(0)!.toUpperCase() + name.slice(1);

      return [
        utils.sha256.hash(`account:${capName}`).slice(0, 8),
        {
          decoder: (buffer: Buffer) =>
            program.coder.accounts.decode(name, buffer),
          name,
        },
      ];
    }) ?? []
  );
};

export const decodeAcct = <T extends Idl>(
  acct: AccountInfo<Buffer>,
  discMap: DiscMap<T>
) => {
  const disc = acct.data.toString("hex").slice(0, 8);
  const meta = discMap[disc];
  if (!meta) return null;

  return {
    name: meta.name,
    account: meta.decoder(acct.data),
  };
};

export const fetchNft = async (conn: Connection, mint: PublicKey) => {
  const mplex = new Metaplex(conn);
  return await mplex.nfts().findByMint({ mintAddress: mint });
};

//#region Stringify function.

export const stringifyPKsAndBNs = (i: any) => {
  if (_isPk(i)) {
    return (<PublicKey>i).toBase58();
  } else if (i instanceof BN) {
    return i.toString();
  } else if (_parseType(i) === "array") {
    return _stringifyPKsAndBNInArray(i);
  } else if (_parseType(i) === "object") {
    return _stringifyPKsAndBNsInObject(i);
  }
  return i;
};

const _isPk = (obj: any): boolean => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj["toBase58"] === "function"
  );
};

const _stringifyPKsAndBNsInObject = (o: any) => {
  const newO = { ...o };
  for (const [k, v] of Object.entries(newO)) {
    if (_isPk(v)) {
      newO[k] = (<PublicKey>v).toBase58();
    } else if (v instanceof BN) {
      newO[k] = (v as BN).toString();
    } else if (_parseType(v) === "array") {
      newO[k] = _stringifyPKsAndBNInArray(v as any);
    } else if (_parseType(v) === "object") {
      newO[k] = _stringifyPKsAndBNsInObject(v);
    } else {
      newO[k] = v;
    }
  }
  return newO;
};

const _stringifyPKsAndBNInArray = (a: any[]): any[] => {
  const newA = [];
  for (const i of a) {
    if (_isPk(i)) {
      newA.push(i.toBase58());
    } else if (i instanceof BN) {
      newA.push(i.toString());
    } else if (_parseType(i) === "array") {
      newA.push(_stringifyPKsAndBNInArray(i));
    } else if (_parseType(i) === "object") {
      newA.push(stringifyPKsAndBNs(i));
    } else {
      newA.push(i);
    }
  }
  return newA;
};

const _parseType = <T>(v: T): string => {
  if (v === null || v === undefined) {
    return "null";
  }
  if (typeof v === "object") {
    if (v instanceof Array) {
      return "array";
    }
    if (v instanceof Date) {
      return "date";
    }
    return "object";
  }
  return typeof v;
};

export const isNullLike = <T>(v: T | null | undefined): v is null | undefined =>
  v === null || v === undefined;

// #endregion

export const SECONDS = 1000;
export const MINUTES = 60 * SECONDS;
export const HOURS = 60 * MINUTES;
export const DAYS = 24 * HOURS;

export { PROGRAM_ID as TMETA_PROG_ID } from "@metaplex-foundation/mpl-token-metadata";
export { PROGRAM_ID as AUTH_PROG_ID } from "@metaplex-foundation/mpl-token-auth-rules";
import { PROGRAM_ID as TMETA_PROG_ID } from "@metaplex-foundation/mpl-token-metadata";
import { PROGRAM_ID as AUTH_PROG_ID } from "@metaplex-foundation/mpl-token-auth-rules";

export const prepPnftAccounts = async ({
  connection,
  nftMetadata,
  nftCreators,
  nftMint,
  sourceAta,
  destAta,
  authData = null,
}: {
  connection: Connection;
  nftMetadata?: PublicKey;
  nftCreators?: PublicKey[];
  nftMint: PublicKey;
  sourceAta: PublicKey;
  destAta: PublicKey;
  authData?: AuthorizationData | null;
}) => {
  let meta;
  let creators: PublicKey[] = [];
  if (nftMetadata) {
    meta = nftMetadata;
    if (nftCreators) creators = nftCreators;
  } else {
    const nft = await fetchNft(connection, nftMint);
    meta = nft.metadataAddress;
    creators = nft.creators.map((c) => c.address);
  }

  const inflatedMeta = await Metadata.fromAccountAddress(connection, meta);
  const ruleSet = inflatedMeta.programmableConfig?.ruleSet;

  const [ownerTokenRecordPda, ownerTokenRecordBump] = findTokenRecordPDA(
    nftMint,
    sourceAta
  );
  const [destTokenRecordPda, destTokenRecordBump] = findTokenRecordPDA(
    nftMint,
    destAta
  );

  //retrieve edition PDA
  const mplex = new Metaplex(connection);
  const nftEditionPda = mplex.nfts().pdas().edition({ mint: nftMint });

  //have to re-serialize due to anchor limitations
  const authDataSerialized = authData
    ? {
        payload: Object.entries(authData.payload.map).map(([k, v]) => {
          return { name: k, payload: v };
        }),
      }
    : null;

  return {
    meta,
    creators,
    ownerTokenRecordBump,
    ownerTokenRecordPda,
    destTokenRecordBump,
    destTokenRecordPda,
    ruleSet,
    nftEditionPda,
    authDataSerialized,
  };
};

// pNFTs very expensive.
export const DEFAULT_COMPUTE_UNITS = 800_000;
export const DEFAULT_MICRO_LAMPORTS = 200_000;

export type AccountSuffix =
  | "Nft Mint"
  | "Sol Escrow"
  | "Old Sol Escrow"
  | "New Sol Escrow"
  | "Pool"
  | "Old Pool"
  | "New Pool"
  | "Nft Escrow"
  | "Whitelist"
  | "Nft Receipt"
  | "Buyer"
  | "Seller"
  | "Owner"
  | "Nft Authority"
  | "Margin Account"
  | "Single Listing"
  | "Bid State"
  | "Bidder";

export const parseStrFn = (str: string) => {
  return Function(`'use strict'; return (${str})`)();
};

// based on https://docs.solana.com/developing/programming-model/accounts#:~:text=The%20current%20maximum%20size%20of,per%20account%20and%20per%20instruction.
export const getRentSync = (dataSize: number) =>
  Math.trunc(19.055441478439427 * (128 + dataSize) * 365.25);

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
