import { IDL, TensorWhitelist } from "./idl/tensor_whitelist";
import {
  AccountInfo,
  Commitment,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import { Coder, Program, Provider } from "@project-serum/anchor";
import { TENSOR_WHITELIST_ADDR } from "./constants";
import {
  findMintProofPDA,
  findWhitelistAuthPDA,
  findWhitelistPDA,
} from "./pda";
import { v4 } from "uuid";
import MerkleTree from "merkletreejs";
import keccak256 from "keccak256";
import {
  decodeAcct,
  DiscMap,
  genDiscToDecoderMap,
  hexCode,
  removeNullBytes,
} from "../common";

export const TensorWhitelistIDL = IDL;

export type AuthorityAnchor = {
  bump: number;
  owner: PublicKey;
};

export type WhitelistAnchor = {
  version: number;
  bump: number;
  verified: boolean;
  rootHash: number[];
  uuid: number[];
  name: number[];
};

export type MintProofAnchor = {
  proofLen: number;
  proof: number[][];
};

export type TensorWhitelistPdaAnchor = AuthorityAnchor | WhitelistAnchor;

export type TaggedTensorWhitelistPdaAnchor =
  | {
      name: "authority";
      account: AuthorityAnchor;
    }
  | {
      name: "whitelist";
      account: WhitelistAnchor;
    }
  | {
      name: "mintProof";
      account: MintProofAnchor;
    };

export class TensorWhitelistSDK {
  program: Program<TensorWhitelist>;
  discMap: DiscMap<TensorWhitelist>;

  constructor({
    idl = IDL,
    addr = TENSOR_WHITELIST_ADDR,
    provider,
    coder,
  }: {
    idl?: any; //todo better typing
    addr?: PublicKey;
    provider?: Provider;
    coder?: Coder;
  }) {
    this.program = new Program<TensorWhitelist>(idl, addr, provider, coder);
    this.discMap = genDiscToDecoderMap(this.program);
  }

  // --------------------------------------- fetchers

  async fetchAuthority(authority: PublicKey, commitment?: Commitment) {
    return (await this.program.account.authority.fetch(
      authority,
      commitment
    )) as AuthorityAnchor;
  }

  async fetchWhitelist(whitelist: PublicKey, commitment?: Commitment) {
    return (await this.program.account.whitelist.fetch(
      whitelist,
      commitment
    )) as WhitelistAnchor;
  }

  async fetchMintProof(mintProof: PublicKey, commitment?: Commitment) {
    return (await this.program.account.mintProof.fetch(
      mintProof,
      commitment
    )) as MintProofAnchor;
  }

  // --------------------------------------- account methods

  decode(acct: AccountInfo<Buffer>): TaggedTensorWhitelistPdaAnchor | null {
    return decodeAcct(acct, this.discMap);
  }

  // --------------------------------------- authority methods

  //main signature: owner
  async initUpdateAuthority(owner: PublicKey, newOwner: PublicKey) {
    const [authPda] = findWhitelistAuthPDA({});

    const builder = this.program.methods
      .initUpdateAuthority(newOwner)
      .accounts({
        whitelistAuthority: authPda,
        owner,
        systemProgram: SystemProgram.programId,
      });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      authPda,
    };
  }

  // --------------------------------------- whitelist methods

  //main signature: owner
  async initUpdateWhitelist({
    owner,
    uuid,
    rootHash = null,
    name = null,
  }: {
    owner: PublicKey;
    uuid: number[];
    rootHash?: number[] | null;
    name?: number[] | null;
  }) {
    const [authPda] = findWhitelistAuthPDA({});
    const [whitelistPda] = findWhitelistPDA({
      uuid,
    });

    const builder = this.program.methods
      .initUpdateWhitelist(uuid, rootHash, name)
      .accounts({
        whitelist: whitelistPda,
        whitelistAuthority: authPda,
        owner,
        systemProgram: SystemProgram.programId,
      });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      authPda,
      whitelistPda,
    };
  }

  // --------------------------------------- mint proof methods

  //main signature: user
  async initUpdateMintProof({
    user,
    mint,
    whitelist,
    proof,
  }: {
    user: PublicKey;
    mint: PublicKey;
    whitelist: PublicKey;
    proof: Buffer[];
  }) {
    const [mintProofPda] = findMintProofPDA({ mint, whitelist });

    const builder = this.program.methods.initUpdateMintProof(proof).accounts({
      whitelist,
      mint,
      user,
      mintProof: mintProofPda,
      systemProgram: SystemProgram.programId,
    });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      mintProofPda,
    };
  }

  // --------------------------------------- helper methods

  getError(
    name: typeof IDL["errors"][number]["name"]
  ): typeof IDL["errors"][number] {
    return this.program.idl.errors.find((e) => e.name === name)!;
  }

  getErrorCodeHex(name: typeof IDL["errors"][number]["name"]): string {
    return hexCode(this.getError(name).code);
  }

  static uuidToBuffer = (uuid: string) => {
    return Buffer.from(uuid.replaceAll("-", "")).toJSON().data;
  };

  static bufferToUuid = (buffer: number[]) => {
    const raw = String.fromCharCode(...buffer);
    return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(
      12,
      16
    )}-${raw.slice(16, 20)}-${raw.slice(20)}`;
  };

  // NB: this truncates names to 32 bytes (32 chars if ascii, < if unicode).
  static nameToBuffer = (name: string) => {
    return Buffer.from(name.padEnd(32, "\0")).toJSON().data.slice(0, 32);
  };

  static bufferToName = (buffer: number[]) => {
    return removeNullBytes(String.fromCharCode(...buffer));
  };

  // Generates a Merkle tree + root hash + proofs for a set of mints.
  static createTreeForMints = (mints: PublicKey[]) => {
    const buffers = mints.map((m) => m.toBuffer());

    const tree = new MerkleTree(buffers, keccak256, {
      sort: true,
      hashLeaves: true,
    });
    const proofs: { mint: PublicKey; proof: Buffer[] }[] = mints.map((mint) => {
      const leaf = keccak256(mint.toBuffer());
      const proof = tree.getProof(leaf);
      const validProof: Buffer[] = proof.map((p) => p.data);
      return { mint, proof: validProof };
    });

    return { tree, root: tree.getRoot().toJSON().data, proofs };
  };

  genWhitelistUUID() {
    return v4().toString();
  }
}
