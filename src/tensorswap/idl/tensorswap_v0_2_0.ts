export type Tensorswap = {
  "version": "0.2.0",
  "name": "tensorswap",
  "instructions": [
    {
      "name": "initUpdateTswap",
      "accounts": [
        {
          "name": "tswap",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeVault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cosigner",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "We ask also for a signature just to make sure this wallet can actually sign things"
          ]
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newOwner",
          "type": "publicKey"
        },
        {
          "name": "config",
          "type": {
            "defined": "TSwapConfig"
          }
        }
      ]
    },
    {
      "name": "initPool",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "solEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "whitelist",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Needed for pool seeds derivation / will be stored inside pool"
          ]
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "config",
          "type": {
            "defined": "PoolConfig"
          }
        }
      ]
    },
    {
      "name": "closePool",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "solEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "whitelist",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "config",
          "type": {
            "defined": "PoolConfig"
          }
        }
      ]
    },
    {
      "name": "depositNft",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "whitelist",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Needed for pool seeds derivation, also checked via has_one on pool"
          ]
        },
        {
          "name": "nftSource",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftEscrow",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Implicitly checked via transfer. Will fail if wrong account"
          ]
        },
        {
          "name": "nftReceipt",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "config",
          "type": {
            "defined": "PoolConfig"
          }
        },
        {
          "name": "proof",
          "type": {
            "vec": {
              "array": [
                "u8",
                32
              ]
            }
          }
        }
      ]
    },
    {
      "name": "withdrawNft",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "whitelist",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftDest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftEscrow",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Implicitly checked via transfer. Will fail if wrong account",
            "This is closed below (dest = owner)"
          ]
        },
        {
          "name": "nftReceipt",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Tied to the pool because used to verify pool seeds"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "config",
          "type": {
            "defined": "PoolConfig"
          }
        }
      ]
    },
    {
      "name": "depositSol",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "whitelist",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "solEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "config",
          "type": {
            "defined": "PoolConfig"
          }
        },
        {
          "name": "lamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawSol",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "whitelist",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "solEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Tied to the pool because used to verify pool seeds"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "config",
          "type": {
            "defined": "PoolConfig"
          }
        },
        {
          "name": "lamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "buyNft",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "whitelist",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Needed for pool seeds derivation, has_one = whitelist on pool"
          ]
        },
        {
          "name": "nftBuyerAcc",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftMetadata",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftEscrow",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Implicitly checked via transfer. Will fail if wrong account.",
            "This is closed below (dest = owner)"
          ]
        },
        {
          "name": "nftReceipt",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "solEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "config",
          "type": {
            "defined": "PoolConfig"
          }
        },
        {
          "name": "proof",
          "type": {
            "vec": {
              "array": [
                "u8",
                32
              ]
            }
          }
        },
        {
          "name": "maxPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "sellNftTokenPool",
      "accounts": [
        {
          "name": "shared",
          "accounts": [
            {
              "name": "tswap",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "feeVault",
              "isMut": true,
              "isSigner": false
            },
            {
              "name": "pool",
              "isMut": true,
              "isSigner": false
            },
            {
              "name": "whitelist",
              "isMut": false,
              "isSigner": false,
              "docs": [
                "Needed for pool seeds derivation, also checked via has_one on pool"
              ]
            },
            {
              "name": "mintProof",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "nftSellerAcc",
              "isMut": true,
              "isSigner": false
            },
            {
              "name": "nftMint",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "nftMetadata",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "solEscrow",
              "isMut": true,
              "isSigner": false
            },
            {
              "name": "owner",
              "isMut": true,
              "isSigner": false
            },
            {
              "name": "seller",
              "isMut": true,
              "isSigner": true
            }
          ]
        },
        {
          "name": "ownerAtaAcc",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "config",
          "type": {
            "defined": "PoolConfig"
          }
        },
        {
          "name": "proof",
          "type": {
            "vec": {
              "array": [
                "u8",
                32
              ]
            }
          }
        },
        {
          "name": "minPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "sellNftTradePool",
      "accounts": [
        {
          "name": "shared",
          "accounts": [
            {
              "name": "tswap",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "feeVault",
              "isMut": true,
              "isSigner": false
            },
            {
              "name": "pool",
              "isMut": true,
              "isSigner": false
            },
            {
              "name": "whitelist",
              "isMut": false,
              "isSigner": false,
              "docs": [
                "Needed for pool seeds derivation, also checked via has_one on pool"
              ]
            },
            {
              "name": "mintProof",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "nftSellerAcc",
              "isMut": true,
              "isSigner": false
            },
            {
              "name": "nftMint",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "nftMetadata",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "solEscrow",
              "isMut": true,
              "isSigner": false
            },
            {
              "name": "owner",
              "isMut": true,
              "isSigner": false
            },
            {
              "name": "seller",
              "isMut": true,
              "isSigner": true
            }
          ]
        },
        {
          "name": "nftEscrow",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Implicitly checked via transfer. Will fail if wrong account"
          ]
        },
        {
          "name": "nftReceipt",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "config",
          "type": {
            "defined": "PoolConfig"
          }
        },
        {
          "name": "proof",
          "type": {
            "vec": {
              "array": [
                "u8",
                32
              ]
            }
          }
        },
        {
          "name": "minPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "reallocPool",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "whitelist",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Needed for pool seeds derivation / will be stored inside pool"
          ]
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tswapOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "config",
          "type": {
            "defined": "PoolConfig"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "tSwap",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "config",
            "type": {
              "defined": "TSwapConfig"
            }
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "feeVault",
            "type": "publicKey"
          },
          {
            "name": "cosigner",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "solEscrowBump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "createdUnixSeconds",
            "type": "i64"
          },
          {
            "name": "config",
            "docs": [
              "Config & calc"
            ],
            "type": {
              "defined": "PoolConfig"
            }
          },
          {
            "name": "tswap",
            "docs": [
              "Ownership & belonging"
            ],
            "type": "publicKey"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "whitelist",
            "docs": [
              "Collection stuff"
            ],
            "type": "publicKey"
          },
          {
            "name": "solEscrow",
            "docs": [
              "Used by Trade / Token pools only",
              "Amount to spend is implied by balance - rent"
            ],
            "type": "publicKey"
          },
          {
            "name": "takerSellCount",
            "docs": [
              "Accounting"
            ],
            "type": "u32"
          },
          {
            "name": "takerBuyCount",
            "type": "u32"
          },
          {
            "name": "nftsHeld",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "nftDepositReceipt",
      "docs": [
        "Represents NFTs deposited into our protocol.",
        "Always associated to (1) NFT mint (2) NFT escrow and (3) pool (every type)."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "nftMint",
            "type": "publicKey"
          },
          {
            "name": "nftEscrow",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "solEscrow",
      "docs": [
        "Need dummy Anchor account so we can use `close` constraint."
      ],
      "type": {
        "kind": "struct",
        "fields": []
      }
    }
  ],
  "types": [
    {
      "name": "TSwapConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feeBps",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "PoolConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "poolType",
            "type": {
              "defined": "PoolType"
            }
          },
          {
            "name": "curveType",
            "type": {
              "defined": "CurveType"
            }
          },
          {
            "name": "startingPrice",
            "type": "u64"
          },
          {
            "name": "delta",
            "type": "u64"
          },
          {
            "name": "honorRoyalties",
            "type": "bool"
          },
          {
            "name": "mmFeeBps",
            "docs": [
              "Trade pools only"
            ],
            "type": {
              "option": "u16"
            }
          }
        ]
      }
    },
    {
      "name": "PoolType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Token"
          },
          {
            "name": "NFT"
          },
          {
            "name": "Trade"
          }
        ]
      }
    },
    {
      "name": "CurveType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Linear"
          },
          {
            "name": "Exponential"
          }
        ]
      }
    },
    {
      "name": "Direction",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Up"
          },
          {
            "name": "Down"
          }
        ]
      }
    },
    {
      "name": "TakerSide",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Buy"
          },
          {
            "name": "Sell"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "BuySellEvent",
      "fields": [
        {
          "name": "currentPrice",
          "type": "u64",
          "index": true
        },
        {
          "name": "tswapFee",
          "type": "u64",
          "index": true
        },
        {
          "name": "mmFee",
          "type": "u64",
          "index": true
        },
        {
          "name": "creatorsFee",
          "type": "u64",
          "index": true
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidProof",
      "msg": "invalid merkle proof, token not whitelisted"
    },
    {
      "code": 6001,
      "name": "WhitelistNotVerified",
      "msg": "whitelist not verified -- currently only verified pools supported"
    },
    {
      "code": 6002,
      "name": "BadWhitelist",
      "msg": "unexpected whitelist address"
    },
    {
      "code": 6003,
      "name": "WrongPoolType",
      "msg": "operation not permitted on this pool type"
    },
    {
      "code": 6004,
      "name": "BadFeeAccount",
      "msg": "fee account doesn't match that stored on pool"
    },
    {
      "code": 6005,
      "name": "BadEscrowAccount",
      "msg": "escrow account doesn't match that stored on pool"
    },
    {
      "code": 6006,
      "name": "MissingFees",
      "msg": "when setting up a Trade pool, must provide fee bps & fee vault"
    },
    {
      "code": 6007,
      "name": "FeesTooHigh",
      "msg": "fees entered above allowed threshold"
    },
    {
      "code": 6008,
      "name": "DeltaTooLarge",
      "msg": "delta too large"
    },
    {
      "code": 6009,
      "name": "ArithmeticError",
      "msg": "arithmetic error"
    },
    {
      "code": 6010,
      "name": "WrongPool",
      "msg": "this nft doesnt belong to this pool"
    },
    {
      "code": 6011,
      "name": "RoyaltiesEnabled",
      "msg": "royalties are enabled always"
    },
    {
      "code": 6012,
      "name": "PriceMismatch",
      "msg": "specified price not within current price"
    },
    {
      "code": 6013,
      "name": "ExistingNfts",
      "msg": "cannot close pool with nfts in escrow -- withdraw all before closing"
    },
    {
      "code": 6014,
      "name": "WrongMint",
      "msg": "wrong mint passed for provided accounts"
    },
    {
      "code": 6015,
      "name": "InsufficientSolEscrowBalance",
      "msg": "insufficient SOL escrow balance"
    },
    {
      "code": 6016,
      "name": "BadTSwapOwner",
      "msg": "bad tswap owner"
    },
    {
      "code": 6017,
      "name": "FeesNotAllowed",
      "msg": "fees not allowed for non-trade pools"
    },
    {
      "code": 6018,
      "name": "BadMetadata",
      "msg": "metadata account does not match mint"
    },
    {
      "code": 6019,
      "name": "CreatorMismatch",
      "msg": "provided creator address does not match metadata creator"
    }
  ]
};

export const IDL: Tensorswap = {
  "version": "0.2.0",
  "name": "tensorswap",
  "instructions": [
    {
      "name": "initUpdateTswap",
      "accounts": [
        {
          "name": "tswap",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeVault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cosigner",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "We ask also for a signature just to make sure this wallet can actually sign things"
          ]
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newOwner",
          "type": "publicKey"
        },
        {
          "name": "config",
          "type": {
            "defined": "TSwapConfig"
          }
        }
      ]
    },
    {
      "name": "initPool",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "solEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "whitelist",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Needed for pool seeds derivation / will be stored inside pool"
          ]
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "config",
          "type": {
            "defined": "PoolConfig"
          }
        }
      ]
    },
    {
      "name": "closePool",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "solEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "whitelist",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "config",
          "type": {
            "defined": "PoolConfig"
          }
        }
      ]
    },
    {
      "name": "depositNft",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "whitelist",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Needed for pool seeds derivation, also checked via has_one on pool"
          ]
        },
        {
          "name": "nftSource",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftEscrow",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Implicitly checked via transfer. Will fail if wrong account"
          ]
        },
        {
          "name": "nftReceipt",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "config",
          "type": {
            "defined": "PoolConfig"
          }
        },
        {
          "name": "proof",
          "type": {
            "vec": {
              "array": [
                "u8",
                32
              ]
            }
          }
        }
      ]
    },
    {
      "name": "withdrawNft",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "whitelist",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftDest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftEscrow",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Implicitly checked via transfer. Will fail if wrong account",
            "This is closed below (dest = owner)"
          ]
        },
        {
          "name": "nftReceipt",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Tied to the pool because used to verify pool seeds"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "config",
          "type": {
            "defined": "PoolConfig"
          }
        }
      ]
    },
    {
      "name": "depositSol",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "whitelist",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "solEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "config",
          "type": {
            "defined": "PoolConfig"
          }
        },
        {
          "name": "lamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawSol",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "whitelist",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "solEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Tied to the pool because used to verify pool seeds"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "config",
          "type": {
            "defined": "PoolConfig"
          }
        },
        {
          "name": "lamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "buyNft",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "whitelist",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Needed for pool seeds derivation, has_one = whitelist on pool"
          ]
        },
        {
          "name": "nftBuyerAcc",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftMetadata",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftEscrow",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Implicitly checked via transfer. Will fail if wrong account.",
            "This is closed below (dest = owner)"
          ]
        },
        {
          "name": "nftReceipt",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "solEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "config",
          "type": {
            "defined": "PoolConfig"
          }
        },
        {
          "name": "proof",
          "type": {
            "vec": {
              "array": [
                "u8",
                32
              ]
            }
          }
        },
        {
          "name": "maxPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "sellNftTokenPool",
      "accounts": [
        {
          "name": "shared",
          "accounts": [
            {
              "name": "tswap",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "feeVault",
              "isMut": true,
              "isSigner": false
            },
            {
              "name": "pool",
              "isMut": true,
              "isSigner": false
            },
            {
              "name": "whitelist",
              "isMut": false,
              "isSigner": false,
              "docs": [
                "Needed for pool seeds derivation, also checked via has_one on pool"
              ]
            },
            {
              "name": "mintProof",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "nftSellerAcc",
              "isMut": true,
              "isSigner": false
            },
            {
              "name": "nftMint",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "nftMetadata",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "solEscrow",
              "isMut": true,
              "isSigner": false
            },
            {
              "name": "owner",
              "isMut": true,
              "isSigner": false
            },
            {
              "name": "seller",
              "isMut": true,
              "isSigner": true
            }
          ]
        },
        {
          "name": "ownerAtaAcc",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "config",
          "type": {
            "defined": "PoolConfig"
          }
        },
        {
          "name": "proof",
          "type": {
            "vec": {
              "array": [
                "u8",
                32
              ]
            }
          }
        },
        {
          "name": "minPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "sellNftTradePool",
      "accounts": [
        {
          "name": "shared",
          "accounts": [
            {
              "name": "tswap",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "feeVault",
              "isMut": true,
              "isSigner": false
            },
            {
              "name": "pool",
              "isMut": true,
              "isSigner": false
            },
            {
              "name": "whitelist",
              "isMut": false,
              "isSigner": false,
              "docs": [
                "Needed for pool seeds derivation, also checked via has_one on pool"
              ]
            },
            {
              "name": "mintProof",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "nftSellerAcc",
              "isMut": true,
              "isSigner": false
            },
            {
              "name": "nftMint",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "nftMetadata",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "solEscrow",
              "isMut": true,
              "isSigner": false
            },
            {
              "name": "owner",
              "isMut": true,
              "isSigner": false
            },
            {
              "name": "seller",
              "isMut": true,
              "isSigner": true
            }
          ]
        },
        {
          "name": "nftEscrow",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Implicitly checked via transfer. Will fail if wrong account"
          ]
        },
        {
          "name": "nftReceipt",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "config",
          "type": {
            "defined": "PoolConfig"
          }
        },
        {
          "name": "proof",
          "type": {
            "vec": {
              "array": [
                "u8",
                32
              ]
            }
          }
        },
        {
          "name": "minPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "reallocPool",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "whitelist",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Needed for pool seeds derivation / will be stored inside pool"
          ]
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tswapOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "config",
          "type": {
            "defined": "PoolConfig"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "tSwap",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "config",
            "type": {
              "defined": "TSwapConfig"
            }
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "feeVault",
            "type": "publicKey"
          },
          {
            "name": "cosigner",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "solEscrowBump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "createdUnixSeconds",
            "type": "i64"
          },
          {
            "name": "config",
            "docs": [
              "Config & calc"
            ],
            "type": {
              "defined": "PoolConfig"
            }
          },
          {
            "name": "tswap",
            "docs": [
              "Ownership & belonging"
            ],
            "type": "publicKey"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "whitelist",
            "docs": [
              "Collection stuff"
            ],
            "type": "publicKey"
          },
          {
            "name": "solEscrow",
            "docs": [
              "Used by Trade / Token pools only",
              "Amount to spend is implied by balance - rent"
            ],
            "type": "publicKey"
          },
          {
            "name": "takerSellCount",
            "docs": [
              "Accounting"
            ],
            "type": "u32"
          },
          {
            "name": "takerBuyCount",
            "type": "u32"
          },
          {
            "name": "nftsHeld",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "nftDepositReceipt",
      "docs": [
        "Represents NFTs deposited into our protocol.",
        "Always associated to (1) NFT mint (2) NFT escrow and (3) pool (every type)."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "nftMint",
            "type": "publicKey"
          },
          {
            "name": "nftEscrow",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "solEscrow",
      "docs": [
        "Need dummy Anchor account so we can use `close` constraint."
      ],
      "type": {
        "kind": "struct",
        "fields": []
      }
    }
  ],
  "types": [
    {
      "name": "TSwapConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feeBps",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "PoolConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "poolType",
            "type": {
              "defined": "PoolType"
            }
          },
          {
            "name": "curveType",
            "type": {
              "defined": "CurveType"
            }
          },
          {
            "name": "startingPrice",
            "type": "u64"
          },
          {
            "name": "delta",
            "type": "u64"
          },
          {
            "name": "honorRoyalties",
            "type": "bool"
          },
          {
            "name": "mmFeeBps",
            "docs": [
              "Trade pools only"
            ],
            "type": {
              "option": "u16"
            }
          }
        ]
      }
    },
    {
      "name": "PoolType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Token"
          },
          {
            "name": "NFT"
          },
          {
            "name": "Trade"
          }
        ]
      }
    },
    {
      "name": "CurveType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Linear"
          },
          {
            "name": "Exponential"
          }
        ]
      }
    },
    {
      "name": "Direction",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Up"
          },
          {
            "name": "Down"
          }
        ]
      }
    },
    {
      "name": "TakerSide",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Buy"
          },
          {
            "name": "Sell"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "BuySellEvent",
      "fields": [
        {
          "name": "currentPrice",
          "type": "u64",
          "index": true
        },
        {
          "name": "tswapFee",
          "type": "u64",
          "index": true
        },
        {
          "name": "mmFee",
          "type": "u64",
          "index": true
        },
        {
          "name": "creatorsFee",
          "type": "u64",
          "index": true
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidProof",
      "msg": "invalid merkle proof, token not whitelisted"
    },
    {
      "code": 6001,
      "name": "WhitelistNotVerified",
      "msg": "whitelist not verified -- currently only verified pools supported"
    },
    {
      "code": 6002,
      "name": "BadWhitelist",
      "msg": "unexpected whitelist address"
    },
    {
      "code": 6003,
      "name": "WrongPoolType",
      "msg": "operation not permitted on this pool type"
    },
    {
      "code": 6004,
      "name": "BadFeeAccount",
      "msg": "fee account doesn't match that stored on pool"
    },
    {
      "code": 6005,
      "name": "BadEscrowAccount",
      "msg": "escrow account doesn't match that stored on pool"
    },
    {
      "code": 6006,
      "name": "MissingFees",
      "msg": "when setting up a Trade pool, must provide fee bps & fee vault"
    },
    {
      "code": 6007,
      "name": "FeesTooHigh",
      "msg": "fees entered above allowed threshold"
    },
    {
      "code": 6008,
      "name": "DeltaTooLarge",
      "msg": "delta too large"
    },
    {
      "code": 6009,
      "name": "ArithmeticError",
      "msg": "arithmetic error"
    },
    {
      "code": 6010,
      "name": "WrongPool",
      "msg": "this nft doesnt belong to this pool"
    },
    {
      "code": 6011,
      "name": "RoyaltiesEnabled",
      "msg": "royalties are enabled always"
    },
    {
      "code": 6012,
      "name": "PriceMismatch",
      "msg": "specified price not within current price"
    },
    {
      "code": 6013,
      "name": "ExistingNfts",
      "msg": "cannot close pool with nfts in escrow -- withdraw all before closing"
    },
    {
      "code": 6014,
      "name": "WrongMint",
      "msg": "wrong mint passed for provided accounts"
    },
    {
      "code": 6015,
      "name": "InsufficientSolEscrowBalance",
      "msg": "insufficient SOL escrow balance"
    },
    {
      "code": 6016,
      "name": "BadTSwapOwner",
      "msg": "bad tswap owner"
    },
    {
      "code": 6017,
      "name": "FeesNotAllowed",
      "msg": "fees not allowed for non-trade pools"
    },
    {
      "code": 6018,
      "name": "BadMetadata",
      "msg": "metadata account does not match mint"
    },
    {
      "code": 6019,
      "name": "CreatorMismatch",
      "msg": "provided creator address does not match metadata creator"
    }
  ]
};
