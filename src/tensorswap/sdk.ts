import {
  AnchorProvider,
  BorshCoder,
  Coder,
  Event,
  EventParser,
  Instruction,
  Program,
} from "@coral-xyz/anchor";
import BN from "bn.js";
import {
  Account,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createRevokeInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  AccountInfo,
  AccountMeta,
  Commitment,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
  TransactionResponse,
} from "@solana/web3.js";
import {
  AcctDiscHexMap,
  AUTH_PROGRAM_ID,
  Cluster,
  decodeAnchorAcct,
  genAcctDiscHexMap,
  getRent,
  getRentSync,
  hexCode,
  isNullLike,
  parseAnchorIxs,
  ParsedAnchorIx,
  PnftArgs,
  prependComputeIxs,
  prepPnftAccounts,
  TMETA_PROGRAM_ID,
} from "@tensor-hq/tensor-common";
import { v4 } from "uuid";
import {
  AccountSuffix,
  DEFAULT_MICRO_LAMPORTS,
  DEFAULT_RULESET_ADDN_COMPUTE_UNITS,
  DEFAULT_XFER_COMPUTE_UNITS,
  evalMathExpr,
} from "../common";
import { findMintProofPDA } from "../tensor_whitelist";
import { ParsedAccount, PoolConfig } from "../types";
import { TENSORSWAP_ADDR, TSWAP_COSIGNER, TSWAP_OWNER } from "./constants";
import {
  findMarginPDA,
  findNextFreeMarginNr,
  findNftAuthorityPDA,
  findNftDepositReceiptPDA,
  findNftEscrowPDA,
  findPoolPDA,
  findSingleListingPDA,
  findSolEscrowPDA,
  findTSwapPDA,
} from "./pda";

/*
Guide for protocol rollout: https://www.notion.so/tensor-hq/Protocol-Deployment-playbook-d345244ec21e48fb8a1f37277b38e38e
 */
// ---------------------------------------- Versioned IDLs for backwards compat when parsing.
import {
  IDL as IDL_latest,
  Tensorswap as TSwap_latest,
} from "./idl/tensorswap";
import {
  IDL as IDL_v0_1_32,
  Tensorswap as TSwap_v0_1_32,
} from "./idl/tensorswap_v0_1_32";
import {
  IDL as IDL_v0_2_0,
  Tensorswap as TSwap_v0_2_0,
} from "./idl/tensorswap_v0_2_0";
import {
  IDL as IDL_v0_3_0,
  Tensorswap as TSwap_v0_3_0,
} from "./idl/tensorswap_v0_3_0";
import {
  IDL as IDL_v0_3_5,
  Tensorswap as TSwap_v0_3_5,
} from "./idl/tensorswap_v0_3_5";
import {
  IDL as IDL_v1_0_0,
  Tensorswap as TSwap_v1_0_0,
} from "./idl/tensorswap_v1_0_0";
import {
  IDL as IDL_v1_1_0,
  Tensorswap as TSwap_v1_1_0,
} from "./idl/tensorswap_v1_1_0";
import {
  IDL as IDL_v1_3_0,
  Tensorswap as TSwap_v1_3_0,
} from "./idl/tensorswap_v1_3_0";
import {
  IDL as IDL_v1_4_0,
  Tensorswap as TSwap_v1_4_0,
} from "./idl/tensorswap_v1_4_0";
import {
  IDL as IDL_v1_5_0,
  Tensorswap as TSwap_v1_5_0,
} from "./idl/tensorswap_v1_5_0";
import {
  IDL as IDL_v1_6_0,
  Tensorswap as TSwap_v1_6_0,
} from "./idl/tensorswap_v1_6_0";
import {
  IDL as IDL_v1_7_0,
  Tensorswap as TSwap_v1_7_0,
} from "./idl/tensorswap_v1_7_0";
import {
  castPoolConfigAnchor,
  curveTypeU8,
  MarginAccountAnchor,
  NftAuthorityAnchor,
  NftDepositReceiptAnchor,
  OrderType,
  PoolAnchor,
  PoolConfigAnchor,
  poolTypeU8,
  SingleListingAnchor,
  SolEscrowAnchor,
  TaggedTensorSwapPdaAnchor,
  TSwapAnchor,
  TSwapConfigAnchor,
} from "./types";

// https://solscan.io/tx/5ZWevmR3TLzUEVsPyE9bdUBqseeBdVMuELG45L15dx8rnXVCQZE2n1V1EbqEuGEaF6q4fND7rT7zwW8ZXjP1uC5s
export const TSwapIDL_v0_1_32 = IDL_v0_1_32;
export const TSwapIDL_v0_1_32_EffSlot_Mainnet = 150855169;

// remove cosigner: https://solscan.io/tx/5aswB2admCErRwPNgM3DeaYcbVYjAjpHuKVFAZenaSGEm8PKL8R2BmqsGFWdGfMR25NPrVSNKix18ZgLtVpHyXUJ
export const TSwapIDL_v0_2_0 = IDL_v0_2_0;
export const TSwapIDL_v0_2_0_EffSlot_Mainnet = 153016663;

// editable pools: https://solscan.io/tx/2NjcKJov7cm7Fa1PqEADMgjiFBS6UXAzXoaiLinCU35stFUAgVyLBniaPyLExPoz18TKis5ch9YxfBs7yAkbjXXn
export const TSwapIDL_v0_3_0 = IDL_v0_3_0;
export const TSwapIDL_v0_3_0_EffSlot_Mainnet = 154762923;

// remove pool migration ixs: https://solscan.io/tx/3YruQxQ2HGMEcNRogwGAXw2rXDH3uVKCjZYs655erEKX1T3FxcLBshHHgP5deTLQ4Jd28SZTVGFb2oBpGx6HqANe
export const TSwapIDL_v0_3_5 = IDL_v0_3_5;
export const TSwapIDL_v0_3_5_EffSlot_Mainnet = 154963721;

// sniping, cross-margin https://solscan.io/tx/5ogSWohwXU3A2xjdsVwcrF3Hm7gC4zvGfzcsYco4hCKB8SduvTH9aUQTdLZw49YuAVXd4n7B4Ny8q7nEqMaKxJ2N
export const TSwapIDL_v1_0_0 = IDL_v1_0_0;
export const TSwapIDL_v1_0_0_EffSlot_Mainnet = 172173995;

// purchase caps for margin orders: https://solscan.io/tx/5YSJCyjo7bKi6etipyHmv3HcSCCc1de2fuSVK1h918GL6HqSomNrukZDvUvMnihtQ21UV2ZAGjdFiRx6PYjcSnWA
export const TSwapIDL_v1_1_0 = IDL_v1_1_0;
export const TSwapIDL_v1_1_0_EffSlot_Mainnet = 173144552;

// 1_2_0 was pricing function upgrade

// pnft integration, taker-pays: https://solscan.io/tx/5vHiFK8ij7LRCpBWZt8PQEyPJcPHrUhuoFMD7FQfQcyJ6Fxp3WpHXNUxPKRYacQmqEV2Cw8tb3PjvCQKhvsGQbUa
export const TSwapIDL_v1_3_0 = IDL_v1_3_0;
export const TSwapIDL_v1_3_0_EffSlot_Mainnet = 176096448;

// add single listing: https://solscan.io/tx/JMWgwm6RdhZzdRoj9tBQHp5ZXstFr3vuFk94uD4qdq6DfQFKL6D9Zb7rj1reRsHBt87QfYcYwVYfKQ4qFyCcs6r
export const TSwapIDL_v1_4_0 = IDL_v1_4_0;
export const TSwapIDL_v1_4_0_EffSlot_Mainnet = 177428733;

// enable margin for MM pools + make MM profit withdrawable
// part 1 (everything except edit in place): https://solscan.io/tx/2uZgAZXfeabhqAhQTtWinnHkfJHnfuDzPKJcypxK9L3xuHsVwaz9Arb7EDMU3khbKmwGbigcZsweQEXNj8Pa9tcT
// part 2 (enabled mmCompoundFee in edit in place): https://solscan.io/tx/44aWhcQNx8a95PGGCFsTskLyJwxGbcvRnmsDaqvxsdD9dmKMP6NPRKzPoAiNiGhNfVMRq1ADg6seHPHxU6r8R7jZ
export const TSwapIDL_v1_5_0 = IDL_v1_5_0;
export const TSwapIDL_v1_5_0_EffSlot_Mainnet = 182023294;

// remove delegate from SELL NOW: https://solscan.io/tx/3hq9BG1xWEM5NcwTZiLVsNRsACXZxACXBjPNpamg4WMufi3K9Ej5jLHXxo1DEzw1C5vDr1XvKYYGPuciqqoEQiK8
export const TSwapIDL_v1_6_0 = IDL_v1_6_0;
export const TSwapIDL_v1_6_0_EffSlot_Mainnet = 182972833;

// add cpi ix for TBID + export acc size as constants
export const TSwapIDL_v1_7_0 = IDL_v1_7_0;
export const TSwapIDL_v1_7_0_EffSlot_Mainnet = 183869296; // https://solscan.io/tx/5jhCkfL622mQm6LXCmzsKbYCMHcyFjHcSLqJPV2G6HApS7iFK9UMyg7gaoeW8aUW6kPFsfAdraibpvNRe3fnSc3h
export const TSwapIDL_v1_7_0_EffSlot_Devnet = 213361116; // https://solscan.io/tx/GFL7tCbYtDFyG1kVqMDoZ1RTgmE7rGrpp99Ec8ZrUEpp2xH8oMsads6bUqxDhEXQH9caJzMGSCj6ZNZ69kykJYD?cluster=devnet

// add optional royalties + remove optional accs + add broker + add payer for list/delist
export const TSwapIDL_latest = IDL_latest;
export const TSwapIDL_latest_EffSlot_Mainnet = 186744215; // https://solscan.io/tx/JtcwNt69DQnJt7622LJwYFBeJbaBLwuabnWLes9YdncxxPR3nsSXpH1GqLcZQKVmWQhCqrUKSueirogrBVrTK811
export const TSwapIDL_latest_EffSlot_Devnet = 265356431; // https://solscan.io/tx/2Ad89TuMGGiu2QEBxcbMiso47rmiyJWJTTRUrGekaipecuWwrCm3G3KYsVGi8PWUSecuTzS8MCFKNsZMJBS1PSR3?cluster=devnet

export type TSwapIDL =
  | TSwap_v0_1_32
  | TSwap_v0_2_0
  | TSwap_v0_3_0
  | TSwap_v0_3_5
  | TSwap_v1_0_0
  | TSwap_v1_1_0
  | TSwap_v1_3_0
  | TSwap_v1_4_0
  | TSwap_v1_5_0
  | TSwap_v1_6_0
  | TSwap_v1_7_0
  | TSwap_latest;

// Use this function to figure out which IDL to use based on the slot # of historical txs.
export const triageIDL = (
  slot: number | bigint,
  cluster: Cluster
): TSwapIDL | null => {
  switch (cluster) {
    case Cluster.Mainnet:
      //cba to parse really old txs, this was before public launch
      if (slot < TSwapIDL_v0_1_32_EffSlot_Mainnet) return null;
      if (slot < TSwapIDL_v0_2_0_EffSlot_Mainnet) return TSwapIDL_v0_1_32;
      if (slot < TSwapIDL_v0_3_0_EffSlot_Mainnet) return TSwapIDL_v0_2_0;
      if (slot < TSwapIDL_v0_3_5_EffSlot_Mainnet) return TSwapIDL_v0_3_0;
      if (slot < TSwapIDL_v1_0_0_EffSlot_Mainnet) return TSwapIDL_v0_3_5;
      if (slot < TSwapIDL_v1_1_0_EffSlot_Mainnet) return TSwapIDL_v1_0_0;
      if (slot < TSwapIDL_v1_3_0_EffSlot_Mainnet) return TSwapIDL_v1_1_0;
      if (slot < TSwapIDL_v1_4_0_EffSlot_Mainnet) return TSwapIDL_v1_3_0;
      if (slot < TSwapIDL_v1_5_0_EffSlot_Mainnet) return TSwapIDL_v1_4_0;
      if (slot < TSwapIDL_v1_6_0_EffSlot_Mainnet) return TSwapIDL_v1_5_0;
      if (slot < TSwapIDL_v1_7_0_EffSlot_Mainnet) return TSwapIDL_v1_6_0;
      if (slot < TSwapIDL_latest_EffSlot_Mainnet) return TSwapIDL_v1_7_0;
      return TSwapIDL_latest;
    case Cluster.Devnet:
      if (slot < TSwapIDL_v1_7_0_EffSlot_Devnet) return null;
      if (slot < TSwapIDL_latest_EffSlot_Devnet) return TSwapIDL_v1_7_0;
      return TSwapIDL_latest;
  }
};

// --------------------------------------- constants

export const SNIPE_FEE_BPS: number = +IDL_latest.constants.find(
  (c) => c.name === "SNIPE_FEE_BPS"
)!.value;
export const SNIPE_PROFIT_SHARE_BPS: number = +IDL_latest.constants.find(
  (c) => c.name === "SNIPE_PROFIT_SHARE_BPS"
)!.value;
export const TAKER_BROKER_PCT: number = +IDL_latest.constants.find(
  (c) => c.name === "TAKER_BROKER_PCT"
)!.value;
export const SNIPE_MIN_FEE: number = 0.01 * LAMPORTS_PER_SOL;
export const TSWAP_SIZE: number = evalMathExpr(
  IDL_latest.constants.find((c) => c.name === "TSWAP_SIZE")!.value
);
export const POOL_SIZE: number = evalMathExpr(
  IDL_latest.constants.find((c) => c.name === "POOL_SIZE")!.value
);
export const MARGIN_SIZE: number = evalMathExpr(
  IDL_latest.constants.find((c) => c.name === "MARGIN_SIZE")!.value
);
export const SINGLE_LISTING_SIZE: number = evalMathExpr(
  IDL_latest.constants.find((c) => c.name === "SINGLE_LISTING_SIZE")!.value
);
export const DEPOSIT_RECEIPT_SIZE: number = evalMathExpr(
  IDL_latest.constants.find((c) => c.name === "DEPOSIT_RECEIPT_SIZE")!.value
);
export const NFT_AUTHORITY_SIZE: number = evalMathExpr(
  IDL_latest.constants.find((c) => c.name === "NFT_AUTHORITY_SIZE")!.value
);

export const APPROX_TSWAP_RENT = getRentSync(TSWAP_SIZE);
export const APPROX_POOL_RENT = getRentSync(POOL_SIZE);
export const APPROX_SOL_MARGIN_RENT = getRentSync(MARGIN_SIZE);
export const APPROX_SINGLE_LISTING_RENT = getRentSync(SINGLE_LISTING_SIZE);
export const APPROX_DEPOSIT_RECEIPT_RENT = getRentSync(DEPOSIT_RECEIPT_SIZE);
export const APPROX_NFT_AUTHORITY_RENT = getRentSync(NFT_AUTHORITY_SIZE);
export const APPROX_SOL_ESCROW_RENT = 946560; //token account owned by the program, keep hardcoded

export type BuySellEventAnchor = Event<typeof IDL_latest["events"][0]>;
export type DelistEventAnchor = Event<typeof IDL_latest["events"][1]>;

// ------------- Types for parsed ixs from raw tx.

export type TSwapIxName = typeof IDL_latest["instructions"][number]["name"];
export type TSwapIx = Omit<Instruction, "name"> & { name: TSwapIxName };
export type ParsedTSwapIx = ParsedAnchorIx<TSwap_latest>;
export type TSwapIxData = { config: PoolConfigAnchor };
export type EditPoolIxData = {
  oldConfig: PoolConfigAnchor;
  newConfig: PoolConfigAnchor;
};
export type WithdrawDepositSolData = TSwapIxData & { lamports: BN };
export type WithdrawTSwapOwnedSplData = TSwapIxData & { amount: BN };
export type ListEditListingData = TSwapIxData & { price: BN };

//decided to NOT build the tx inside the sdk (too much coupling - should not care about blockhash)
export class TensorSwapSDK {
  program: Program<TSwapIDL>;
  discMap: AcctDiscHexMap<TSwapIDL>;
  coder: BorshCoder;
  eventParser: EventParser;

  constructor({
    idl = IDL_latest,
    addr = TENSORSWAP_ADDR,
    provider,
    coder,
  }: {
    idl?: TSwapIDL;
    addr?: PublicKey;
    provider?: AnchorProvider;
    coder?: Coder;
  }) {
    this.program = new Program<TSwapIDL>(idl, addr, provider, coder);
    this.discMap = genAcctDiscHexMap(idl);
    this.coder = new BorshCoder(idl);
    this.eventParser = new EventParser(addr, this.coder);
  }

  // --------------------------------------- fetchers

  async fetchTSwap(tswap: PublicKey, commitment?: Commitment) {
    return (await this.program.account.tSwap.fetch(
      tswap,
      commitment
    )) as TSwapAnchor;
  }

  async fetchPool(pool: PublicKey, commitment?: Commitment) {
    return (await this.program.account.pool.fetch(
      pool,
      commitment
    )) as PoolAnchor;
  }

  async fetchReceipt(receipt: PublicKey, commitment?: Commitment) {
    return (await this.program.account.nftDepositReceipt.fetch(
      receipt,
      commitment
    )) as NftDepositReceiptAnchor;
  }

  async fetchSolEscrow(escrow: PublicKey, commitment?: Commitment) {
    return (await this.program.account.solEscrow.fetch(
      escrow,
      commitment
    )) as SolEscrowAnchor;
  }

  async fetchNftAuthority(authority: PublicKey, commitment?: Commitment) {
    return (await this.program.account.nftAuthority.fetch(
      authority,
      commitment
    )) as NftAuthorityAnchor;
  }

  async fetchMarginAccount(marginAccount: PublicKey, commitment?: Commitment) {
    return (await this.program.account.marginAccount.fetch(
      marginAccount,
      commitment
    )) as MarginAccountAnchor;
  }

  async fetchSingleListing(singleListing: PublicKey, commitment?: Commitment) {
    return (await this.program.account.singleListing.fetch(
      singleListing,
      commitment
    )) as SingleListingAnchor;
  }

  // --------------------------------------- account methods

  decode(acct: AccountInfo<Buffer>): TaggedTensorSwapPdaAnchor | null {
    if (!acct.owner.equals(this.program.programId)) return null;
    return decodeAnchorAcct(acct, this.discMap);
  }

  // --------------------------------------- tswap methods

  //main signature: owner
  async initUpdateTSwap({
    owner = TSWAP_OWNER,
    newOwner,
    config,
    feeVault,
    cosigner = TSWAP_COSIGNER,
  }: {
    owner?: PublicKey;
    newOwner: PublicKey;
    config: TSwapConfigAnchor;
    feeVault?: PublicKey;
    // Default to owner (ie anchor provider wallet).
    cosigner?: PublicKey;
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});

    const builder = this.program.methods.initUpdateTswap(config).accounts({
      tswap: tswapPda,
      owner,
      cosigner,
      newOwner,
      //tswap itself is the default fee vault
      feeVault: feeVault ?? tswapPda,
      systemProgram: SystemProgram.programId,
    });

    return {
      builder,
      tx: { ixs: [await builder.instruction()] },
      tswapPda,
      tswapBump,
    };
  }

  //main signature: owner
  async withdrawTswapFee({
    lamports,
    destination,
    owner = TSWAP_OWNER,
    cosigner = TSWAP_COSIGNER,
  }: {
    owner?: PublicKey;
    cosigner?: PublicKey;
    lamports: BN;
    destination: PublicKey;
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});

    const builder = this.program.methods.withdrawTswapFees(lamports).accounts({
      tswap: tswapPda,
      owner,
      cosigner,
      destination,
      systemProgram: SystemProgram.programId,
    });

    return {
      builder,
      tx: { ixs: [await builder.instruction()] },
      tswapPda,
      tswapBump,
    };
  }

  // --------------------------------------- pool methods

  //main signature: owner
  async initPool({
    owner,
    whitelist,
    config,
    customAuthSeed,
    isCosigned = false,
    orderType = OrderType.Standard,
    maxTakerSellCount,
  }: {
    owner: PublicKey;
    whitelist: PublicKey;
    config: PoolConfigAnchor;
    customAuthSeed?: number[];
    isCosigned?: boolean;
    orderType?: OrderType;
    maxTakerSellCount?: number;
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [poolPda, poolBump] = findPoolPDA({
      tswap: tswapPda,
      owner,
      whitelist,
      delta: config.delta,
      startingPrice: config.startingPrice,
      poolType: poolTypeU8(config.poolType),
      curveType: curveTypeU8(config.curveType),
    });
    const [solEscrowPda, solEscrowBump] = findSolEscrowPDA({ pool: poolPda });

    const authSeed =
      customAuthSeed ?? TensorSwapSDK.uuidToBuffer(v4().toString());
    if (authSeed.length != 32) {
      throw new Error("bad auth seed, expect it to be length 32");
    }
    const [nftAuthPda, nftAuthBump] = findNftAuthorityPDA({ authSeed });

    const builder = this.program.methods
      .initPool(
        config as any,
        authSeed,
        isCosigned,
        orderType,
        maxTakerSellCount ?? null
      )
      .accounts({
        tswap: tswapPda,
        pool: poolPda,
        solEscrow: solEscrowPda,
        nftAuthority: nftAuthPda,
        whitelist,
        owner,
        systemProgram: SystemProgram.programId,
      });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      authSeed,
      nftAuthPda,
      nftAuthBump,
      tswapPda,
      tswapBump,
      poolPda,
      poolBump,
      solEscrowPda,
      solEscrowBump,
    };
  }

  //main signature: owner
  async closePool({
    owner,
    whitelist,
    config,
  }: {
    owner: PublicKey;
    whitelist: PublicKey;
    config: PoolConfigAnchor;
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [poolPda, poolBump] = findPoolPDA({
      tswap: tswapPda,
      owner,
      whitelist,
      delta: config.delta,
      startingPrice: config.startingPrice,
      poolType: poolTypeU8(config.poolType),
      curveType: curveTypeU8(config.curveType),
    });
    const [solEscrowPda, solEscrowBump] = findSolEscrowPDA({ pool: poolPda });
    const poolAcc = await this.fetchPool(poolPda);

    const builder = this.program.methods.closePool(config as any).accounts({
      tswap: tswapPda,
      pool: poolPda,
      solEscrow: solEscrowPda,
      nftAuthority: poolAcc.nftAuthority,
      whitelist,
      owner,
      systemProgram: SystemProgram.programId,
    });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      nftAuthPda: poolAcc.nftAuthority,
      tswapPda,
      tswapBump,
      poolPda,
      poolBump,
      solEscrowPda,
      solEscrowBump,
    };
  }

  //main signature: owner
  async editPool({
    owner,
    whitelist,
    oldConfig,
    //(!) new config is OPTIONAL. If not passed, pool is edited IN PLACE.
    newConfig,
    isCosigned = null,
    maxTakerSellCount,
    mmCompoundFees = null,
  }: {
    owner: PublicKey;
    whitelist: PublicKey;
    oldConfig: PoolConfigAnchor;
    newConfig?: PoolConfigAnchor;
    isCosigned?: boolean | null;
    maxTakerSellCount?: number;
    mmCompoundFees?: boolean | null;
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [oldPoolPda, oldPoolBump] = findPoolPDA({
      tswap: tswapPda,
      owner,
      whitelist,
      delta: oldConfig.delta,
      startingPrice: oldConfig.startingPrice,
      poolType: poolTypeU8(oldConfig.poolType),
      curveType: curveTypeU8(oldConfig.curveType),
    });
    const poolAcc = await this.fetchPool(oldPoolPda);

    const [oldSolEscrowPda, oldSolEscrowBump] = findSolEscrowPDA({
      pool: oldPoolPda,
    });

    let newPoolPda = oldPoolPda;
    let newPoolBump = oldPoolBump;
    let newSolEscrowPda = oldSolEscrowPda;
    let newSolEscrowBump = oldSolEscrowBump;
    let builder;

    //in case someone passes this in separately thinking it will affect the pool in full edit ix
    if (newConfig && !isNullLike(mmCompoundFees)) {
      newConfig.mmCompoundFees = mmCompoundFees;
    }

    if (!isNullLike(newConfig)) {
      //full edit with pool migration
      [newPoolPda, newPoolBump] = findPoolPDA({
        tswap: tswapPda,
        owner,
        whitelist,
        delta: newConfig.delta,
        startingPrice: newConfig.startingPrice,
        poolType: poolTypeU8(newConfig.poolType),
        curveType: curveTypeU8(newConfig.curveType),
      });
      [newSolEscrowPda, newSolEscrowBump] = findSolEscrowPDA({
        pool: newPoolPda,
      });

      builder = this.program.methods
        .editPool(
          oldConfig as any,
          newConfig as any,
          isCosigned,
          maxTakerSellCount ?? null
        )
        .accounts({
          tswap: tswapPda,
          oldPool: oldPoolPda,
          newPool: newPoolPda,
          oldSolEscrow: oldSolEscrowPda,
          newSolEscrow: newSolEscrowPda,
          nftAuthority: poolAcc.nftAuthority,
          whitelist,
          owner,
          systemProgram: SystemProgram.programId,
        });
    } else {
      //in place edit w/o pool migration
      builder = this.program.methods
        .editPoolInPlace(
          oldConfig as any,
          isCosigned,
          maxTakerSellCount ?? null,
          mmCompoundFees
        )
        .accounts({
          tswap: tswapPda,
          pool: oldPoolPda,
          whitelist,
          owner,
          systemProgram: SystemProgram.programId,
        });
    }

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      nftAuthPda: poolAcc.nftAuthority,
      tswapPda,
      tswapBump,
      oldPoolPda,
      oldPoolBump,
      oldSolEscrowPda,
      oldSolEscrowBump,
      newPoolPda,
      newPoolBump,
      newSolEscrowPda,
      newSolEscrowBump,
    };
  }

  // --------------------------------------- deposit/withdraw methods

  // main signature: owner
  async depositNft({
    whitelist,
    nftMint,
    nftSource,
    owner,
    config,
    /** pnft args */
    metaCreators,
    authData = null,
    compute = DEFAULT_XFER_COMPUTE_UNITS,
    ruleSetAddnCompute = DEFAULT_RULESET_ADDN_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
  }: {
    whitelist: PublicKey;
    nftMint: PublicKey;
    nftSource: PublicKey;
    owner: PublicKey;
    config: PoolConfigAnchor;
  } & PnftArgs) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [poolPda, poolBump] = findPoolPDA({
      tswap: tswapPda,
      owner,
      whitelist,
      delta: config.delta,
      startingPrice: config.startingPrice,
      poolType: poolTypeU8(config.poolType),
      curveType: curveTypeU8(config.curveType),
    });

    const [escrowPda, escrowBump] = findNftEscrowPDA({ nftMint });
    const [receiptPda, receiptBump] = findNftDepositReceiptPDA({
      nftMint,
    });
    const [mintProofPda] = findMintProofPDA({ mint: nftMint, whitelist });

    //pnft
    const {
      meta,
      ownerTokenRecordBump,
      ownerTokenRecordPda,
      destTokenRecordBump,
      destTokenRecordPda,
      ruleSet,
      nftEditionPda,
      authDataSerialized,
    } = await prepPnftAccounts({
      connection: this.program.provider.connection,
      metaCreators,
      nftMint,
      destAta: escrowPda,
      authData,
      sourceAta: nftSource,
    });

    const builder = this.program.methods
      .depositNft(config as any, authDataSerialized, !!ruleSet)
      .accounts({
        tswap: tswapPda,
        pool: poolPda,
        whitelist,
        nftMint,
        nftSource,
        nftEscrow: escrowPda,
        nftReceipt: receiptPda,
        nftMetadata: meta,
        owner,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        mintProof: mintProofPda,
        nftEdition: nftEditionPda,
        destTokenRecord: destTokenRecordPda,
        ownerTokenRecord: ownerTokenRecordPda,
        pnftShared: {
          authorizationRulesProgram: AUTH_PROGRAM_ID,
          tokenMetadataProgram: TMETA_PROGRAM_ID,
          instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
        },
        authRules: ruleSet ?? SystemProgram.programId,
      });

    const ruleSetCompute = ruleSet ? ruleSetAddnCompute : null;
    const ixs = prependComputeIxs(
      [await builder.instruction()],
      isNullLike(compute) && isNullLike(ruleSetCompute)
        ? null
        : (compute ?? 0) + (ruleSetCompute ?? 0),
      priorityMicroLamports
    );

    return {
      builder,
      tx: {
        ixs,
        extraSigners: [],
      },
      tswapPda,
      tswapBump,
      poolPda,
      poolBump,
      escrowPda,
      escrowBump,
      receiptPda,
      receiptBump,
      mintProofPda,
      ownerTokenRecordPda,
      ownerTokenRecordBump,
      destTokenRecordPda,
      destTokenRecordBump,
      nftEditionPda,
      meta,
    };
  }

  // main signature: owner
  async depositSol({
    whitelist,
    owner,
    config,
    lamports,
  }: {
    whitelist: PublicKey;
    owner: PublicKey;
    config: PoolConfigAnchor;
    lamports: BN;
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [poolPda, poolBump] = findPoolPDA({
      tswap: tswapPda,
      owner,
      whitelist,
      delta: config.delta,
      startingPrice: config.startingPrice,
      poolType: poolTypeU8(config.poolType),
      curveType: curveTypeU8(config.curveType),
    });
    const [solEscrowPda, solEscrowBump] = findSolEscrowPDA({ pool: poolPda });

    const builder = this.program.methods
      .depositSol(config as any, lamports)
      .accounts({
        tswap: tswapPda,
        pool: poolPda,
        whitelist,
        solEscrow: solEscrowPda,
        owner,
        systemProgram: SystemProgram.programId,
      });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      tswapPda,
      tswapBump,
      poolPda,
      poolBump,
      solEscrowPda,
      solEscrowBump,
    };
  }

  // main signature: owner
  async withdrawNft({
    whitelist,
    nftMint,
    nftDest,
    owner,
    config,
    /** pnft args */
    metaCreators,
    authData = null,
    compute = DEFAULT_XFER_COMPUTE_UNITS,
    ruleSetAddnCompute = DEFAULT_RULESET_ADDN_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
  }: {
    whitelist: PublicKey;
    nftMint: PublicKey;
    nftDest: PublicKey;
    owner: PublicKey;
    config: PoolConfigAnchor;
  } & PnftArgs) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [poolPda, poolBump] = findPoolPDA({
      tswap: tswapPda,
      owner,
      whitelist,
      delta: config.delta,
      startingPrice: config.startingPrice,
      poolType: poolTypeU8(config.poolType),
      curveType: curveTypeU8(config.curveType),
    });

    const [escrowPda, escrowBump] = findNftEscrowPDA({ nftMint });
    const [receiptPda, receiptBump] = findNftDepositReceiptPDA({
      nftMint,
    });

    //pnft
    const {
      meta,
      ownerTokenRecordBump,
      ownerTokenRecordPda,
      destTokenRecordBump,
      destTokenRecordPda,
      ruleSet,
      nftEditionPda,
      authDataSerialized,
    } = await prepPnftAccounts({
      connection: this.program.provider.connection,
      metaCreators,
      nftMint,
      destAta: nftDest,
      authData,
      sourceAta: escrowPda,
    });

    const builder = this.program.methods
      .withdrawNft(config as any, authDataSerialized, !!ruleSet)
      .accounts({
        tswap: tswapPda,
        pool: poolPda,
        whitelist,
        nftMint,
        nftDest,
        nftEscrow: escrowPda,
        nftReceipt: receiptPda,
        owner,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
        nftMetadata: meta,
        nftEdition: nftEditionPda,
        destTokenRecord: destTokenRecordPda,
        ownerTokenRecord: ownerTokenRecordPda,
        pnftShared: {
          authorizationRulesProgram: AUTH_PROGRAM_ID,
          tokenMetadataProgram: TMETA_PROGRAM_ID,
          instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
        },
        authRules: ruleSet ?? SystemProgram.programId,
      });

    const ruleSetCompute = ruleSet ? ruleSetAddnCompute : null;
    const ixs = prependComputeIxs(
      [
        ...(await this.clearDelegate(nftDest, owner)),
        await builder.instruction(),
      ],
      isNullLike(compute) && isNullLike(ruleSetCompute)
        ? null
        : (compute ?? 0) + (ruleSetCompute ?? 0),
      priorityMicroLamports
    );

    return {
      builder,
      tx: {
        ixs,
        extraSigners: [],
      },
      tswapPda,
      tswapBump,
      poolPda,
      poolBump,
      escrowPda,
      escrowBump,
      receiptPda,
      receiptBump,
      ownerTokenRecordBump,
      ownerTokenRecordPda,
      destTokenRecordBump,
      destTokenRecordPda,
      meta,
    };
  }

  // main signature: owner
  async withdrawSol({
    whitelist,
    owner,
    config,
    lamports,
  }: {
    whitelist: PublicKey;
    owner: PublicKey;
    config: PoolConfigAnchor;
    lamports: BN;
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [poolPda, poolBump] = findPoolPDA({
      tswap: tswapPda,
      owner,
      whitelist,
      delta: config.delta,
      startingPrice: config.startingPrice,
      poolType: poolTypeU8(config.poolType),
      curveType: curveTypeU8(config.curveType),
    });
    const [solEscrowPda, solEscrowBump] = findSolEscrowPDA({ pool: poolPda });

    const builder = this.program.methods
      .withdrawSol(config as any, lamports)
      .accounts({
        tswap: tswapPda,
        pool: poolPda,
        whitelist,
        solEscrow: solEscrowPda,
        owner,
        systemProgram: SystemProgram.programId,
      });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      tswapPda,
      tswapBump,
      poolPda,
      poolBump,
      solEscrowPda,
      solEscrowBump,
    };
  }

  // main signature: owner
  async withdrawMmFee({
    whitelist,
    owner,
    config,
    lamports,
  }: {
    whitelist: PublicKey;
    owner: PublicKey;
    config: PoolConfigAnchor;
    //passing null will withdraw all fees
    lamports: BN;
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [poolPda, poolBump] = findPoolPDA({
      tswap: tswapPda,
      owner,
      whitelist,
      delta: config.delta,
      startingPrice: config.startingPrice,
      poolType: poolTypeU8(config.poolType),
      curveType: curveTypeU8(config.curveType),
    });
    const [solEscrowPda, solEscrowBump] = findSolEscrowPDA({ pool: poolPda });

    const builder = this.program.methods
      .withdrawMmFee(config as any, lamports)
      .accounts({
        tswap: tswapPda,
        pool: poolPda,
        whitelist,
        solEscrow: solEscrowPda,
        owner,
        systemProgram: SystemProgram.programId,
      });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      tswapPda,
      tswapBump,
      poolPda,
      poolBump,
      solEscrowPda,
      solEscrowBump,
    };
  }

  // --------------------------------------- trade (buy/sell) methods

  //main signature: buyer
  async buyNft({
    whitelist,
    nftMint,
    nftBuyerAcc,
    owner,
    buyer,
    config,
    maxPrice,
    marginNr = null,
    optionalRoyaltyPct = null,
    takerBroker = null,
    /** pnft args */
    metaCreators,
    authData = null,
    compute = DEFAULT_XFER_COMPUTE_UNITS,
    ruleSetAddnCompute = DEFAULT_RULESET_ADDN_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
  }: {
    whitelist: PublicKey;
    nftMint: PublicKey;
    nftBuyerAcc: PublicKey;
    owner: PublicKey;
    buyer: PublicKey;
    config: PoolConfigAnchor;
    maxPrice: BN;
    marginNr?: number | null;
    //optional % OF full royalty amount, so eg 50% of 10% royalty would be 5%
    optionalRoyaltyPct?: number | null;
    //optional taker broker account
    takerBroker?: PublicKey | null;
  } & PnftArgs) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [poolPda, poolBump] = findPoolPDA({
      tswap: tswapPda,
      owner,
      whitelist,
      delta: config.delta,
      startingPrice: config.startingPrice,
      poolType: poolTypeU8(config.poolType),
      curveType: curveTypeU8(config.curveType),
    });

    const [escrowPda, escrowBump] = findNftEscrowPDA({ nftMint });
    const [solEscrowPda, solEscrowBump] = findSolEscrowPDA({ pool: poolPda });
    const [receiptPda, receiptBump] = findNftDepositReceiptPDA({
      nftMint,
    });

    const tSwapAcc = await this.fetchTSwap(tswapPda);

    //pnft
    const {
      meta,
      creators,
      ownerTokenRecordBump,
      ownerTokenRecordPda,
      destTokenRecordBump,
      destTokenRecordPda,
      ruleSet,
      nftEditionPda,
      authDataSerialized,
    } = await prepPnftAccounts({
      connection: this.program.provider.connection,
      metaCreators,
      nftMint,
      destAta: nftBuyerAcc,
      authData,
      sourceAta: escrowPda,
    });

    let marginPda;
    let marginBump;
    if (!isNullLike(marginNr)) {
      [marginPda, marginBump] = findMarginPDA({
        tswap: tswapPda,
        owner,
        marginNr,
      });
    }

    const builder = this.program.methods
      // TODO: Proofs disabled for buys for now until tx size limit increases.
      .buyNft(
        config as any,
        maxPrice,
        !!ruleSet,
        authDataSerialized,
        optionalRoyaltyPct
      )
      .accounts({
        tswap: tswapPda,
        feeVault: tSwapAcc.feeVault,
        pool: poolPda,
        whitelist,
        nftMint,
        nftMetadata: meta,
        nftBuyerAcc,
        nftEscrow: escrowPda,
        nftReceipt: receiptPda,
        solEscrow: solEscrowPda,
        owner,
        buyer,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
        nftEdition: nftEditionPda,
        destTokenRecord: destTokenRecordPda,
        ownerTokenRecord: ownerTokenRecordPda,
        pnftShared: {
          authorizationRulesProgram: AUTH_PROGRAM_ID,
          tokenMetadataProgram: TMETA_PROGRAM_ID,
          instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
        },
        authRules: ruleSet ?? SystemProgram.programId,
        marginAccount: marginPda ?? buyer,
        takerBroker: takerBroker ?? tSwapAcc.feeVault,
      })
      .remainingAccounts(
        creators.map((c) => {
          return {
            pubkey: c,
            isWritable: true,
            isSigner: false,
          };
        })
      );

    const ruleSetCompute = ruleSet ? ruleSetAddnCompute : null;
    const ixs = prependComputeIxs(
      [
        // TODO: not including as it would incur an extra RPC call on every buy tx (slower). Let's see if needed.
        // ...(await this.clearDelegate(nftBuyerAcc, buyer)),
        await builder.instruction(),
      ],
      isNullLike(compute) && isNullLike(ruleSetCompute)
        ? null
        : (compute ?? 0) + (ruleSetCompute ?? 0),
      priorityMicroLamports
    );

    return {
      builder,
      tx: {
        ixs,
        extraSigners: [],
      },
      tswapPda,
      tswapBump,
      poolPda,
      poolBump,
      escrowPda,
      escrowBump,
      solEscrowPda,
      solEscrowBump,
      receiptPda,
      receiptBump,
      ownerTokenRecordBump,
      ownerTokenRecordPda,
      destTokenRecordBump,
      destTokenRecordPda,
      meta,
      ruleSet,
      marginBump,
      marginPda,
    };
  }

  //main signature: seller
  async sellNft({
    type,
    whitelist,
    nftMint,
    nftSellerAcc,
    owner,
    seller,
    config,
    minPrice,
    marginNr = null,
    isCosigned = false,
    cosigner = TSWAP_COSIGNER,
    optionalRoyaltyPct = null,
    takerBroker = null,
    /** pnft args */
    metaCreators,
    authData = null,
    compute = DEFAULT_XFER_COMPUTE_UNITS,
    ruleSetAddnCompute = DEFAULT_RULESET_ADDN_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
  }: {
    type: "trade" | "token";
    whitelist: PublicKey;
    nftMint: PublicKey;
    nftSellerAcc: PublicKey;
    owner: PublicKey;
    seller: PublicKey;
    config: PoolConfigAnchor;
    minPrice: BN;
    marginNr?: number | null;
    isCosigned?: boolean;
    cosigner?: PublicKey;
    /** optional % OF full royalty amount, so eg 50% of 10% royalty would be 5% */
    optionalRoyaltyPct?: number | null;
    /** optional taker broker account */
    takerBroker?: PublicKey | null;
  } & PnftArgs) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [poolPda, poolBump] = findPoolPDA({
      tswap: tswapPda,
      owner,
      whitelist,
      delta: config.delta,
      startingPrice: config.startingPrice,
      poolType: poolTypeU8(config.poolType),
      curveType: curveTypeU8(config.curveType),
    });
    const [solEscrowPda, solEscrowBump] = findSolEscrowPDA({ pool: poolPda });
    const ownerAtaAcc = getAssociatedTokenAddressSync(nftMint, owner, true);
    const [escrowPda, escrowBump] = findNftEscrowPDA({ nftMint });
    const [receiptPda, receiptBump] = findNftDepositReceiptPDA({ nftMint });
    const [mintProofPda] = findMintProofPDA({ mint: nftMint, whitelist });
    const tSwapAcc = await this.fetchTSwap(tswapPda);

    //prepare 2 pnft account sets
    const [
      {
        meta,
        creators,
        ownerTokenRecordBump,
        ownerTokenRecordPda,
        destTokenRecordBump: escrowDestTokenRecordBump,
        destTokenRecordPda: escrowDestTokenRecordPda,
        ruleSet,
        nftEditionPda,
        authDataSerialized,
      },
      {
        destTokenRecordBump: tokenDestTokenRecordBump,
        destTokenRecordPda: tokenDestTokenRecordPda,
      },
    ] = await Promise.all([
      prepPnftAccounts({
        connection: this.program.provider.connection,
        metaCreators,
        nftMint,
        destAta: escrowPda,
        authData,
        sourceAta: nftSellerAcc,
      }),
      prepPnftAccounts({
        connection: this.program.provider.connection,
        metaCreators,
        nftMint,
        destAta: ownerAtaAcc,
        authData,
        sourceAta: nftSellerAcc,
      }),
    ]);

    let marginPda;
    let marginBump;
    if (!isNullLike(marginNr)) {
      [marginPda, marginBump] = findMarginPDA({
        tswap: tswapPda,
        owner,
        marginNr,
      });
    }

    //1.optional cosigner
    const remAcc: AccountMeta[] = [];
    if (isCosigned && type === "token") {
      remAcc.push({
        pubkey: cosigner,
        isSigner: true,
        isWritable: false,
      });
    }

    //2.optional creators (last)
    creators.map((c) => {
      remAcc.push({
        pubkey: c,
        isWritable: true,
        isSigner: false,
      });
    });

    const shared = {
      tswap: tswapPda,
      feeVault: tSwapAcc.feeVault,
      pool: poolPda,
      whitelist,
      nftMint,
      nftMetadata: meta,
      nftSellerAcc,
      solEscrow: solEscrowPda,
      mintProof: mintProofPda,
      owner,
      seller,
    };

    const { method, accounts } =
      type === "trade"
        ? {
            method: this.program.methods.sellNftTradePool,
            accounts: {
              nftEscrow: escrowPda,
              nftReceipt: receiptPda,
              destTokenRecord: escrowDestTokenRecordPda,
            },
          }
        : {
            method: this.program.methods.sellNftTokenPool,
            accounts: {
              nftEscrow: escrowPda,
              ownerAtaAcc,
              destTokenRecord: tokenDestTokenRecordPda,
              tempEscrowTokenRecord: escrowDestTokenRecordPda,
            },
          };

    // TODO: Proofs passed through PDA instead of ix b/c of tx limit size.
    // const builder = method(config as any, proof, minPrice)
    const builder = method(
      config as any,
      minPrice,
      !!ruleSet,
      authDataSerialized,
      optionalRoyaltyPct
    )
      .accounts({
        shared,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        nftEdition: nftEditionPda,
        ownerTokenRecord: ownerTokenRecordPda,
        pnftShared: {
          authorizationRulesProgram: AUTH_PROGRAM_ID,
          tokenMetadataProgram: TMETA_PROGRAM_ID,
          instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
        },
        authRules: ruleSet ?? SystemProgram.programId,
        marginAccount: marginPda ?? seller,
        takerBroker: takerBroker ?? tSwapAcc.feeVault,
        ...accounts,
      })
      .remainingAccounts(remAcc);

    const ruleSetCompute = ruleSet ? ruleSetAddnCompute : null;
    const ixs = prependComputeIxs(
      [await builder.instruction()],
      isNullLike(compute) && isNullLike(ruleSetCompute)
        ? null
        : (compute ?? 0) + (ruleSetCompute ?? 0),
      priorityMicroLamports
    );

    return {
      builder,
      tx: {
        ixs,
        extraSigners: [],
      },
      tswapPda,
      tswapBump,
      poolPda,
      poolBump,
      solEscrowPda,
      solEscrowBump,
      ownerAtaAcc,
      escrowPda,
      escrowBump,
      receiptPda,
      receiptBump,
      marginPda,
      marginBump,
      ownerTokenRecordBump,
      ownerTokenRecordPda,
      destTokenRecordBump:
        type === "trade" ? escrowDestTokenRecordBump : tokenDestTokenRecordBump,
      destTokenRecordPda:
        type === "trade" ? escrowDestTokenRecordPda : tokenDestTokenRecordPda,
      meta,
    };
  }

  async reallocPool({
    owner,
    cosigner = TSWAP_COSIGNER,
    whitelist,
    config,
  }: {
    owner: PublicKey;
    cosigner: PublicKey;
    whitelist: PublicKey;
    config: PoolConfigAnchor;
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [poolPda, poolBump] = findPoolPDA({
      tswap: tswapPda,
      owner,
      whitelist,
      delta: config.delta,
      startingPrice: config.startingPrice,
      poolType: poolTypeU8(config.poolType),
      curveType: curveTypeU8(config.curveType),
    });

    const builder = this.program.methods.reallocPool(config as any).accounts({
      tswap: tswapPda,
      pool: poolPda,
      whitelist,
      owner,
      cosigner,
      systemProgram: SystemProgram.programId,
    });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      tswapPda,
      tswapBump,
      poolPda,
      poolBump,
    };
  }

  // --------------------------------------- margin

  //main signer: owner
  async initMarginAcc({
    owner,
    name,
    desiredNr,
  }: {
    owner: PublicKey;
    name: number[];
    desiredNr?: number;
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});

    let marginNr;
    let marginPda;
    let marginBump;

    if (isNullLike(desiredNr)) {
      ({ marginNr, marginPda, marginBump } = await findNextFreeMarginNr({
        connection: this.program.provider.connection,
        owner,
        tswap: tswapPda,
      }));
    } else {
      marginNr = desiredNr;
      [marginPda, marginBump] = findMarginPDA({
        tswap: tswapPda,
        owner,
        marginNr: desiredNr,
      });
    }

    const builder = this.program.methods
      .initMarginAccount(marginNr, name)
      .accounts({
        tswap: tswapPda,
        marginAccount: marginPda,
        owner,
        systemProgram: SystemProgram.programId,
      });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      tswapPda,
      tswapBump,
      marginPda,
      marginBump,
      marginNr,
    };
  }

  //main signer: owner
  async closeMarginAcc({
    marginNr,
    owner,
  }: {
    marginNr: number;
    owner: PublicKey;
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [marginPda, marginBump] = findMarginPDA({
      tswap: tswapPda,
      marginNr,
      owner,
    });

    const builder = this.program.methods.closeMarginAccount().accounts({
      tswap: tswapPda,
      marginAccount: marginPda,
      owner,
      systemProgram: SystemProgram.programId,
    });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      tswapPda,
      tswapBump,
      marginPda,
      marginBump,
    };
  }

  //main signer: owner
  async depositMarginAcc({
    marginNr,
    owner,
    amount,
  }: {
    marginNr: number;
    owner: PublicKey;
    amount: BN;
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [marginPda, marginBump] = findMarginPDA({
      tswap: tswapPda,
      marginNr,
      owner,
    });

    const builder = this.program.methods.depositMarginAccount(amount).accounts({
      tswap: tswapPda,
      marginAccount: marginPda,
      owner,
      systemProgram: SystemProgram.programId,
    });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      tswapPda,
      tswapBump,
      marginPda,
      marginBump,
    };
  }

  //main signer: owner
  async withdrawMarginAcc({
    marginNr,
    owner,
    amount,
  }: {
    marginNr: number;
    owner: PublicKey;
    amount: BN;
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [marginPda, marginBump] = findMarginPDA({
      tswap: tswapPda,
      marginNr,
      owner,
    });

    const builder = this.program.methods
      .withdrawMarginAccount(amount)
      .accounts({
        tswap: tswapPda,
        marginAccount: marginPda,
        owner,
        systemProgram: SystemProgram.programId,
      });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      tswapPda,
      tswapBump,
      marginPda,
      marginBump,
    };
  }

  //main signer: owner
  async attachPoolMargin({
    config,
    marginNr,
    owner,
    whitelist,
  }: {
    config: PoolConfigAnchor;
    marginNr: number;
    owner: PublicKey;
    whitelist: PublicKey;
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [marginPda, marginBump] = findMarginPDA({
      tswap: tswapPda,
      marginNr,
      owner,
    });
    const [poolPda, poolBump] = findPoolPDA({
      tswap: tswapPda,
      owner,
      whitelist,
      delta: config.delta,
      startingPrice: config.startingPrice,
      poolType: poolTypeU8(config.poolType),
      curveType: curveTypeU8(config.curveType),
    });
    const [solEscrowPda, solEscrowBump] = findSolEscrowPDA({ pool: poolPda });

    const builder = this.program.methods
      .attachPoolToMargin(config as any)
      .accounts({
        tswap: tswapPda,
        marginAccount: marginPda,
        pool: poolPda,
        whitelist,
        owner,
        solEscrow: solEscrowPda,
        systemProgram: SystemProgram.programId,
      });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      tswapPda,
      tswapBump,
      marginPda,
      marginBump,
      poolPda,
      poolBump,
      solEscrowPda,
      solEscrowBump,
    };
  }

  //main signer: owner
  async detachPoolMargin({
    config,
    marginNr,
    owner,
    amount = new BN(0),
    whitelist,
  }: {
    config: PoolConfigAnchor;
    marginNr: number;
    owner: PublicKey;
    //amount to be moved back to bid escrow
    amount?: BN;
    whitelist: PublicKey;
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [marginPda, marginBump] = findMarginPDA({
      tswap: tswapPda,
      marginNr,
      owner,
    });
    const [poolPda, poolBump] = findPoolPDA({
      tswap: tswapPda,
      owner,
      whitelist,
      delta: config.delta,
      startingPrice: config.startingPrice,
      poolType: poolTypeU8(config.poolType),
      curveType: curveTypeU8(config.curveType),
    });
    const [solEscrowPda, solEscrowBump] = findSolEscrowPDA({ pool: poolPda });

    const builder = this.program.methods
      .detachPoolFromMargin(config as any, amount)
      .accounts({
        tswap: tswapPda,
        marginAccount: marginPda,
        pool: poolPda,
        whitelist,
        owner,
        solEscrow: solEscrowPda,
        systemProgram: SystemProgram.programId,
      });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      tswapPda,
      tswapBump,
      marginPda,
      marginBump,
      poolPda,
      poolBump,
      solEscrowPda,
      solEscrowBump,
    };
  }

  // --------------------------------------- advanced ordering system

  //main signature cosigner
  async setPoolFreeze({
    whitelist,
    owner,
    config,
    marginNr,
    freeze,
    cosigner = TSWAP_COSIGNER,
  }: {
    whitelist: PublicKey;
    owner: PublicKey;
    config: PoolConfigAnchor;
    marginNr: number;
    freeze: boolean;
    cosigner?: PublicKey;
  }) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [poolPda, poolBump] = findPoolPDA({
      tswap: tswapPda,
      owner,
      whitelist,
      delta: config.delta,
      startingPrice: config.startingPrice,
      poolType: poolTypeU8(config.poolType),
      curveType: curveTypeU8(config.curveType),
    });
    const [marginPda, marginBump] = findMarginPDA({
      tswap: tswapPda,
      owner,
      marginNr,
    });
    const [solEscrowPda, solEscrowBump] = findSolEscrowPDA({ pool: poolPda });

    const builder = this.program.methods
      .setPoolFreeze(config as any, freeze)
      .accounts({
        tswap: tswapPda,
        pool: poolPda,
        whitelist,
        solEscrow: solEscrowPda,
        owner,
        cosigner,
        marginAccount: marginPda,
        systemProgram: SystemProgram.programId,
      });

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
      tswapPda,
      tswapBump,
      poolPda,
      poolBump,
      solEscrowPda,
      solEscrowBump,
      marginPda,
      marginBump,
    };
  }

  //main signature: cosigner
  async takeSnipe({
    whitelist,
    nftMint,
    nftSellerAcc,
    owner,
    seller,
    config,
    actualPrice,
    marginNr,
    cosigner = TSWAP_COSIGNER,
    /** pnft args */
    metaCreators,
    authData = null,
    compute = DEFAULT_XFER_COMPUTE_UNITS,
    ruleSetAddnCompute = DEFAULT_RULESET_ADDN_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
  }: {
    whitelist: PublicKey;
    nftMint: PublicKey;
    nftSellerAcc: PublicKey;
    owner: PublicKey;
    seller: PublicKey;
    config: PoolConfigAnchor;
    actualPrice: BN;
    marginNr: number;
    cosigner?: PublicKey;
  } & PnftArgs) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [poolPda, poolBump] = findPoolPDA({
      tswap: tswapPda,
      owner,
      whitelist,
      delta: config.delta,
      startingPrice: config.startingPrice,
      poolType: poolTypeU8(config.poolType),
      curveType: curveTypeU8(config.curveType),
    });
    const [solEscrowPda, solEscrowBump] = findSolEscrowPDA({ pool: poolPda });
    const ownerAtaAcc = getAssociatedTokenAddressSync(nftMint, owner, true);
    const [escrowPda, escrowBump] = findNftEscrowPDA({ nftMint });
    const [receiptPda, receiptBump] = findNftDepositReceiptPDA({ nftMint });
    const [mintProofPda] = findMintProofPDA({ mint: nftMint, whitelist });
    const tSwapAcc = await this.fetchTSwap(tswapPda);
    const [marginPda, marginBump] = findMarginPDA({
      tswap: tswapPda,
      owner,
      marginNr,
    });

    //pnft
    const {
      meta,
      ownerTokenRecordBump,
      ownerTokenRecordPda,
      destTokenRecordBump,
      destTokenRecordPda,
      ruleSet,
      nftEditionPda,
      authDataSerialized,
    } = await prepPnftAccounts({
      connection: this.program.provider.connection,
      metaCreators,
      nftMint,
      destAta: ownerAtaAcc,
      authData,
      sourceAta: nftSellerAcc,
    });
    const remAcc: AccountMeta[] = [];
    //1.optional ruleset
    if (!!ruleSet) {
      remAcc.push({ pubkey: ruleSet, isSigner: false, isWritable: false });
    }

    const builder = this.program.methods
      .takeSnipe(config as any, actualPrice, authDataSerialized)
      .accounts({
        shared: {
          tswap: tswapPda,
          feeVault: tSwapAcc.feeVault,
          pool: poolPda,
          whitelist,
          nftSellerAcc,
          nftMint,
          mintProof: mintProofPda,
          nftMetadata: meta,
          solEscrow: solEscrowPda,
          owner,
          seller,
        },
        ownerAtaAcc,
        marginAccount: marginPda,
        cosigner,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
        nftEdition: nftEditionPda,
        destTokenRecord: destTokenRecordPda,
        ownerTokenRecord: ownerTokenRecordPda,
        pnftShared: {
          authorizationRulesProgram: AUTH_PROGRAM_ID,
          tokenMetadataProgram: TMETA_PROGRAM_ID,
          instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
        },
      })
      .remainingAccounts(remAcc);

    const ruleSetCompute = ruleSet ? ruleSetAddnCompute : null;
    const ixs = prependComputeIxs(
      [await builder.instruction()],
      isNullLike(compute) && isNullLike(ruleSetCompute)
        ? null
        : (compute ?? 0) + (ruleSetCompute ?? 0),
      priorityMicroLamports
    );

    return {
      builder,
      tx: {
        ixs,
        extraSigners: [],
      },
      tswapPda,
      tswapBump,
      poolPda,
      poolBump,
      solEscrowPda,
      solEscrowBump,
      ownerAtaAcc,
      escrowPda,
      escrowBump,
      receiptPda,
      receiptBump,
      marginPda,
      marginBump,
      ownerTokenRecordBump,
      ownerTokenRecordPda,
      destTokenRecordBump,
      destTokenRecordPda,
      meta,
      ruleSet,
    };
  }

  // --------------------------------------- single listings

  //main signature owner + payer
  async list({
    nftMint,
    nftSource,
    owner,
    price,
    payer = null,
    /** pnft args */
    metaCreators,
    authData = null,
    compute = DEFAULT_XFER_COMPUTE_UNITS,
    ruleSetAddnCompute = DEFAULT_RULESET_ADDN_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
  }: {
    nftMint: PublicKey;
    nftSource: PublicKey;
    owner: PublicKey;
    price: BN;
    //optional separate payer account (useful when you want the listing to be done by another program)
    payer?: PublicKey | null;
  } & PnftArgs) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [singleListing, singleListingBump] = findSingleListingPDA({
      nftMint,
    });
    const [escrowPda, escrowBump] = findNftEscrowPDA({ nftMint });

    //pnft
    const {
      meta,
      ownerTokenRecordBump,
      ownerTokenRecordPda,
      destTokenRecordBump,
      destTokenRecordPda,
      ruleSet,
      nftEditionPda,
      authDataSerialized,
    } = await prepPnftAccounts({
      connection: this.program.provider.connection,
      metaCreators,
      nftMint,
      destAta: escrowPda,
      authData,
      sourceAta: nftSource,
    });

    const builder = this.program.methods
      .list(price, authDataSerialized, !!ruleSet)
      .accounts({
        tswap: tswapPda,
        nftMint,
        nftSource,
        nftEscrow: escrowPda,
        nftMetadata: meta,
        owner,
        singleListing,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        nftEdition: nftEditionPda,
        destTokenRecord: destTokenRecordPda,
        ownerTokenRecord: ownerTokenRecordPda,
        pnftShared: {
          authorizationRulesProgram: AUTH_PROGRAM_ID,
          tokenMetadataProgram: TMETA_PROGRAM_ID,
          instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
        },
        authRules: ruleSet ?? SystemProgram.programId,
        payer: payer ?? owner,
      });

    const ruleSetCompute = ruleSet ? ruleSetAddnCompute : null;
    const ixs = prependComputeIxs(
      [await builder.instruction()],
      isNullLike(compute) && isNullLike(ruleSetCompute)
        ? null
        : (compute ?? 0) + (ruleSetCompute ?? 0),
      priorityMicroLamports
    );

    return {
      builder,
      tx: {
        ixs,
        extraSigners: [],
      },
      tswapPda,
      tswapBump,
      escrowPda,
      escrowBump,
      ownerTokenRecordPda,
      ownerTokenRecordBump,
      destTokenRecordPda,
      destTokenRecordBump,
      nftEditionPda,
      meta,
      singleListing,
      singleListingBump,
    };
  }

  // main signature: owner
  async delist({
    nftMint,
    nftDest,
    owner,
    payer = null,
    /** pnft args */
    metaCreators,
    authData = null,
    compute = DEFAULT_XFER_COMPUTE_UNITS,
    ruleSetAddnCompute = DEFAULT_RULESET_ADDN_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
  }: {
    nftMint: PublicKey;
    nftDest: PublicKey;
    owner: PublicKey;
    //optional separate payer account (useful when you want the listing to be done by another program)
    payer?: PublicKey | null;
  } & PnftArgs) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [singleListing, singleListingBump] = findSingleListingPDA({
      nftMint,
    });
    const [escrowPda, escrowBump] = findNftEscrowPDA({ nftMint });

    //pnft
    const {
      meta,
      ownerTokenRecordBump,
      ownerTokenRecordPda,
      destTokenRecordBump,
      destTokenRecordPda,
      ruleSet,
      nftEditionPda,
      authDataSerialized,
    } = await prepPnftAccounts({
      connection: this.program.provider.connection,
      metaCreators,
      nftMint,
      destAta: nftDest,
      authData,
      sourceAta: escrowPda,
    });

    const builder = this.program.methods
      .delist(authDataSerialized, !!ruleSet)
      .accounts({
        tswap: tswapPda,
        singleListing,
        nftMint,
        nftDest,
        nftEscrow: escrowPda,
        owner,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
        nftMetadata: meta,
        nftEdition: nftEditionPda,
        destTokenRecord: destTokenRecordPda,
        ownerTokenRecord: ownerTokenRecordPda,
        pnftShared: {
          authorizationRulesProgram: AUTH_PROGRAM_ID,
          tokenMetadataProgram: TMETA_PROGRAM_ID,
          instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
        },
        authRules: ruleSet ?? SystemProgram.programId,
        payer: payer ?? owner,
      });

    const ruleSetCompute = ruleSet ? ruleSetAddnCompute : null;
    const ixs = prependComputeIxs(
      [
        ...(await this.clearDelegate(nftDest, owner)),
        await builder.instruction(),
      ],
      isNullLike(compute) && isNullLike(ruleSetCompute)
        ? null
        : (compute ?? 0) + (ruleSetCompute ?? 0),
      priorityMicroLamports
    );

    return {
      builder,
      tx: {
        ixs,
        extraSigners: [],
      },
      tswapPda,
      tswapBump,
      escrowPda,
      escrowBump,
      ownerTokenRecordBump,
      ownerTokenRecordPda,
      destTokenRecordBump,
      destTokenRecordPda,
      meta,
      singleListing,
      singleListingBump,
    };
  }

  //main signature: buyer
  async buySingleListing({
    nftMint,
    nftBuyerAcc,
    owner,
    buyer,
    maxPrice,
    optionalRoyaltyPct = null,
    takerBroker = null,
    /** pnft args */
    metaCreators,
    authData = null,
    compute = DEFAULT_XFER_COMPUTE_UNITS,
    ruleSetAddnCompute = DEFAULT_RULESET_ADDN_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
  }: {
    nftMint: PublicKey;
    nftBuyerAcc: PublicKey;
    owner: PublicKey;
    buyer: PublicKey;
    maxPrice: BN;
    //optional % OF full royalty amount, so eg 50% of 10% royalty would be 5%
    optionalRoyaltyPct?: number | null;
    //optional taker broker account
    takerBroker?: PublicKey | null;
  } & PnftArgs) {
    const [tswapPda, tswapBump] = findTSwapPDA({});
    const [singleListing, singleListingBump] = findSingleListingPDA({
      nftMint,
    });
    const [escrowPda, escrowBump] = findNftEscrowPDA({ nftMint });
    const tSwapAcc = await this.fetchTSwap(tswapPda);

    //pnft
    const {
      meta,
      creators,
      ownerTokenRecordBump,
      ownerTokenRecordPda,
      destTokenRecordBump,
      destTokenRecordPda,
      ruleSet,
      nftEditionPda,
      authDataSerialized,
    } = await prepPnftAccounts({
      connection: this.program.provider.connection,
      metaCreators,
      nftMint,
      destAta: nftBuyerAcc,
      authData,
      sourceAta: escrowPda,
    });

    const builder = this.program.methods
      .buySingleListing(
        maxPrice,
        !!ruleSet,
        authDataSerialized,
        optionalRoyaltyPct
      )
      .accounts({
        tswap: tswapPda,
        singleListing,
        feeVault: tSwapAcc.feeVault,
        nftMint,
        nftMetadata: meta,
        nftBuyerAcc,
        nftEscrow: escrowPda,
        owner,
        buyer,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
        nftEdition: nftEditionPda,
        destTokenRecord: destTokenRecordPda,
        ownerTokenRecord: ownerTokenRecordPda,
        pnftShared: {
          authorizationRulesProgram: AUTH_PROGRAM_ID,
          tokenMetadataProgram: TMETA_PROGRAM_ID,
          instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
        },
        authRules: ruleSet ?? SystemProgram.programId,
        takerBroker: takerBroker ?? tSwapAcc.feeVault,
      })
      .remainingAccounts(
        creators.map((c) => {
          return {
            pubkey: c,
            isWritable: true,
            isSigner: false,
          };
        })
      );

    const ruleSetCompute = ruleSet ? ruleSetAddnCompute : null;
    const ixs = prependComputeIxs(
      [
        // TODO: not including as it would incur an extra RPC call on every buy tx (slower). Let's see if needed.
        // ...(await this.clearDelegate(nftBuyerAcc, buyer)),
        await builder.instruction(),
      ],
      isNullLike(compute) && isNullLike(ruleSetCompute)
        ? null
        : (compute ?? 0) + (ruleSetCompute ?? 0),
      priorityMicroLamports
    );

    return {
      builder,
      tx: {
        ixs,
        extraSigners: [],
      },
      tswapPda,
      tswapBump,
      escrowPda,
      escrowBump,
      ownerTokenRecordBump,
      ownerTokenRecordPda,
      destTokenRecordBump,
      destTokenRecordPda,
      meta,
      ruleSet,
      singleListing,
      singleListingBump,
    };
  }

  // main signature: owner
  async editSingleListing({
    nftMint,
    owner,
    price,
  }: {
    nftMint: PublicKey;
    owner: PublicKey;
    price: BN;
  }) {
    const [singleListing, singleListingBump] = findSingleListingPDA({
      nftMint,
    });

    const builder = this.program.methods.editSingleListing(price).accounts({
      singleListing,
      nftMint,
      owner,
      systemProgram: SystemProgram.programId,
    });

    return {
      builder,
      tx: {
        ixs: [await builder.instruction()],
        extraSigners: [],
      },
      singleListing,
      singleListingBump,
    };
  }

  // --------------------------------------- helper methods

  // remove delegate if set, else a pNFT transfer will fail
  async clearDelegate(
    nftDest: PublicKey,
    owner: PublicKey
  ): Promise<TransactionInstruction[]> {
    let destAtaInfo: Account | null = null;
    // putting inside a try statement because a token account might not exist onchain and this would lead to errors
    try {
      destAtaInfo = await getAccount(this.program.provider.connection, nftDest);
    } catch {}
    if (!!destAtaInfo?.delegate) {
      return [createRevokeInstruction(nftDest, owner)];
    }
    return [];
  }

  async getTswapRent() {
    return await getRent(
      this.program.provider.connection,
      this.program.account.tSwap
    );
  }

  async getPoolRent() {
    return await getRent(
      this.program.provider.connection,
      this.program.account.pool
    );
  }

  async getMarginAccountRent() {
    return await getRent(
      this.program.provider.connection,
      this.program.account.marginAccount
    );
  }

  async getSingleListingRent() {
    return await getRent(
      this.program.provider.connection,
      this.program.account.singleListing
    );
  }

  async getNftDepositReceiptRent() {
    return await getRent(
      this.program.provider.connection,
      this.program.account.nftDepositReceipt
    );
  }

  async getNftAuthorityRent() {
    return await getRent(
      this.program.provider.connection,
      this.program.account.nftAuthority
    );
  }

  async getTokenAcctRent() {
    return await getMinimumBalanceForRentExemptAccount(
      this.program.provider.connection
    );
  }

  async getSolEscrowRent() {
    return await getRent(
      this.program.provider.connection,
      this.program.account.solEscrow
    );
  }

  getError(
    name: typeof IDL_latest["errors"][number]["name"]
  ): typeof IDL_latest["errors"][number] {
    //@ts-ignore (throwing weird ts errors for me)
    return this.program.idl.errors.find((e) => e.name === name)!;
  }

  getErrorCodeHex(name: typeof IDL_latest["errors"][number]["name"]): string {
    return hexCode(this.getError(name).code);
  }

  // --------------------------------------- parsing raw transactions

  /** This only works for the latest IDL. This is intentional: otherwise we'll need to switch/case all historical deprecated ixs downstream. */
  parseIxs(tx: TransactionResponse): ParsedTSwapIx[] {
    return parseAnchorIxs<TSwap_latest>({
      tx,
      coder: this.coder,
      eventParser: this.eventParser,
      programId: this.program.programId,
    });
  }

  getPoolConfig(ix: ParsedTSwapIx): PoolConfig | null {
    // No "default": this ensures we explicitly think about how to handle new ixs.
    switch (ix.ix.name) {
      case "initUpdateTswap":
      case "withdrawTswapFees":
      case "initMarginAccount":
      case "closeMarginAccount":
      case "depositMarginAccount":
      case "withdrawMarginAccount":
      case "withdrawMarginAccountCpi":
      case "withdrawMarginAccountCpiTcomp":
      case "withdrawMarginAccountCpiTlock":
      case "attachPoolToMargin":
      case "detachPoolFromMargin":
      case "takeSnipe":
      case "list":
      case "delist":
      case "buySingleListing":
      case "editSingleListing":
        return null;
      case "editPool": {
        const config = (ix.ix.data as EditPoolIxData).newConfig;
        return castPoolConfigAnchor(config);
      }
      case "initPool":
      case "closePool":
      case "depositNft":
      case "withdrawNft":
      case "depositSol":
      case "withdrawSol":
      case "withdrawMmFee":
      case "buyNft":
      case "sellNftTokenPool":
      case "sellNftTradePool":
      case "setPoolFreeze":
      case "editPoolInPlace":
      case "reallocPool": {
        const config = (ix.ix.data as TSwapIxData).config;
        return castPoolConfigAnchor(config);
      }
    }
  }

  getSolAmount(ix: ParsedTSwapIx): BN | null {
    switch (ix.ix.name) {
      case "buyNft":
      case "sellNftTradePool":
      case "sellNftTokenPool":
      case "takeSnipe":
      case "buySingleListing": {
        // NB: the actual sell price includes the "MM fee" (really a spread).
        const event = ix.events.find((e) => e.name === "BuySellEvent") as
          | BuySellEventAnchor
          | undefined;
        if (!event) return null;
        return event.data.currentPrice.sub(event.data.mmFee);
      }
      case "delist": {
        const event = ix.events.find((e) => e.name === "DelistEvent") as
          | DelistEventAnchor
          | undefined;
        if (!event) return null;
        return event.data.currentPrice;
      }
      case "depositSol":
      case "withdrawSol":
      case "withdrawMmFee":
      case "depositMarginAccount":
      case "withdrawMarginAccount":
      case "withdrawMarginAccountCpi":
      case "withdrawMarginAccountCpiTcomp":
      case "withdrawMarginAccountCpiTlock":
      case "withdrawTswapFees":
      case "detachPoolFromMargin":
        return (ix.ix.data as WithdrawDepositSolData).lamports;
      case "list":
      case "editSingleListing":
        return (ix.ix.data as ListEditListingData).price;
      case "initUpdateTswap":
      case "initPool":
      case "closePool":
      case "depositNft":
      case "withdrawNft":
      case "editPool":
      case "editPoolInPlace":
      case "reallocPool":
      case "initMarginAccount":
      case "closeMarginAccount":
      case "setPoolFreeze":
      case "attachPoolToMargin":
        return null;
    }
  }

  getFeeAmount(ix: ParsedTSwapIx): BN | null {
    switch (ix.ix.name) {
      // No "default": this ensures we explicitly think about how to handle new ixs.
      case "buyNft":
      case "sellNftTradePool":
      case "sellNftTokenPool":
      case "takeSnipe":
      case "buySingleListing":
        // TODO: Think of a better way to handle multiple events.
        const event = ix.events.find((e) => e.name === "BuySellEvent") as
          | BuySellEventAnchor
          | undefined;
        if (!event) return null;
        return event.data.tswapFee.add(event.data.creatorsFee);
      case "list":
      case "delist":
      case "initUpdateTswap":
      case "withdrawTswapFees":
      case "initPool":
      case "closePool":
      case "depositNft":
      case "withdrawNft":
      case "depositSol":
      case "withdrawSol":
      case "withdrawMmFee":
      case "editPool":
      case "editPoolInPlace":
      case "reallocPool":
      case "initMarginAccount":
      case "closeMarginAccount":
      case "depositMarginAccount":
      case "withdrawMarginAccount":
      case "withdrawMarginAccountCpi":
      case "withdrawMarginAccountCpiTcomp":
      case "withdrawMarginAccountCpiTlock":
      case "attachPoolToMargin":
      case "detachPoolFromMargin":
      case "setPoolFreeze":
      case "editSingleListing":
        return null;
    }
  }

  // FYI: accounts under InstructioNDisplay is the space-separated capitalized
  // version of the fields for the corresponding #[Accounts].
  // eg sol_escrow -> "Sol Escrow', or tswap -> "Tswap"
  // shared.sol_escrow -> "Shared > Sol Escrow"
  getAccountByName(
    ix: ParsedTSwapIx,
    name: AccountSuffix
  ): ParsedAccount | undefined {
    // We use endsWith since composite nested accounts (eg shared.sol_escrow)
    // will prefix it as "Shared > Sol Escrow"
    return ix.formatted?.accounts.find((acc) => acc.name?.endsWith(name));
  }

  static uuidToBuffer = (uuid: string) => {
    return Buffer.from(uuid.replaceAll("-", "")).toJSON().data;
  };
}
