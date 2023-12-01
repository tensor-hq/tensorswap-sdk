export type Tensorswap = {
  "version": "2.0.0",
  "name": "tensorswap",
  "constants": [
    {
      "name": "CURRENT_TSWAP_VERSION",
      "type": "u8",
      "value": "1"
    },
    {
      "name": "CURRENT_POOL_VERSION",
      "type": "u8",
      "value": "2"
    },
    {
      "name": "MAX_MM_FEES_BPS",
      "type": "u16",
      "value": "9999"
    },
    {
      "name": "HUNDRED_PCT_BPS",
      "type": "u16",
      "value": "10000"
    },
    {
      "name": "MAX_DELTA_BPS",
      "type": "u16",
      "value": "9999"
    },
    {
      "name": "SPREAD_TICKS",
      "type": "u8",
      "value": "1"
    },
    {
      "name": "TSWAP_TAKER_FEE_BPS",
      "type": "u16",
      "value": "140"
    },
    {
      "name": "MAKER_REBATE_BPS",
      "type": "u16",
      "value": "40"
    },
    {
      "name": "SNIPE_FEE_BPS",
      "type": "u16",
      "value": "150"
    },
    {
      "name": "SNIPE_MIN_FEE",
      "type": "u64",
      "value": "10000000"
    },
    {
      "name": "SNIPE_PROFIT_SHARE_BPS",
      "type": "u16",
      "value": "2000"
    },
    {
      "name": "TAKER_BROKER_PCT",
      "type": "u64",
      "value": "0"
    },
    {
      "name": "TSWAP_SIZE",
      "type": {
        "defined": "usize"
      },
      "value": "8 + 1 + 1 + 2 + 32 * 3"
    },
    {
      "name": "POOL_SIZE",
      "type": {
        "defined": "usize"
      },
      "value": "8 + (3 * 1) + 8 + (2 * 1) + (2 * 8) + 1 + 3 + (5 * 32) + (3 * 4) + (2 * 4) + 8 + 32 + 1 + 1 + 1 + 8 + 8 + 1 + 8 + 4"
    },
    {
      "name": "MARGIN_SIZE",
      "type": {
        "defined": "usize"
      },
      "value": "8 + 32 + 32 + 2 + 1 + 4 + 64"
    },
    {
      "name": "SINGLE_LISTING_SIZE",
      "type": {
        "defined": "usize"
      },
      "value": "8 + (32 * 2) + 8 + 1 + 64"
    },
    {
      "name": "DEPOSIT_RECEIPT_SIZE",
      "type": {
        "defined": "usize"
      },
      "value": "8 + 1 + 32 * 3"
    },
    {
      "name": "NFT_AUTHORITY_SIZE",
      "type": {
        "defined": "usize"
      },
      "value": "8 + 1 + 32 + 32"
    }
  ],
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
        },
        {
          "name": "newOwner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
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
        },
        {
          "name": "nftAuthority",
          "isMut": true,
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
          "name": "authSeeds",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "isCosigned",
          "type": "bool"
        },
        {
          "name": "orderType",
          "type": "u8"
        },
        {
          "name": "maxTakerSellCount",
          "type": {
            "option": "u32"
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
          "isSigner": false,
          "docs": [
            "(!) if the order is marginated this won't return any funds to the user, since margin isn't auto-closed"
          ]
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
        },
        {
          "name": "nftAuthority",
          "isMut": true,
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
        },
        {
          "name": "nftMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintProof",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftEdition",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ownerTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pnftShared",
          "accounts": [
            {
              "name": "tokenMetadataProgram",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "instructions",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "authorizationRulesProgram",
              "isMut": false,
              "isSigner": false
            }
          ]
        },
        {
          "name": "authRules",
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
          "name": "authorizationData",
          "type": {
            "option": {
              "defined": "AuthorizationDataLocal"
            }
          }
        },
        {
          "name": "rulesAccPresent",
          "type": "bool"
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
        },
        {
          "name": "nftMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftEdition",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ownerTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pnftShared",
          "accounts": [
            {
              "name": "tokenMetadataProgram",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "instructions",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "authorizationRulesProgram",
              "isMut": false,
              "isSigner": false
            }
          ]
        },
        {
          "name": "authRules",
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
          "name": "authorizationData",
          "type": {
            "option": {
              "defined": "AuthorizationDataLocal"
            }
          }
        },
        {
          "name": "rulesAccPresent",
          "type": "bool"
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
          "isMut": true,
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
        },
        {
          "name": "nftEdition",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ownerTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pnftShared",
          "accounts": [
            {
              "name": "tokenMetadataProgram",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "instructions",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "authorizationRulesProgram",
              "isMut": false,
              "isSigner": false
            }
          ]
        },
        {
          "name": "authRules",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "marginAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "takerBroker",
          "isMut": true,
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
          "name": "maxPrice",
          "type": "u64"
        },
        {
          "name": "rulesAccPresent",
          "type": "bool"
        },
        {
          "name": "authorizationData",
          "type": {
            "option": {
              "defined": "AuthorizationDataLocal"
            }
          }
        },
        {
          "name": "optionalRoyaltyPct",
          "type": {
            "option": "u16"
          }
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
              "isSigner": false,
              "docs": [
                "intentionally not deserializing, it would be dummy in the case of VOC/FVC based verification"
              ]
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
        },
        {
          "name": "nftEdition",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ownerTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pnftShared",
          "accounts": [
            {
              "name": "tokenMetadataProgram",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "instructions",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "authorizationRulesProgram",
              "isMut": false,
              "isSigner": false
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
          "name": "tempEscrowTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authRules",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "marginAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "takerBroker",
          "isMut": true,
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
          "name": "minPrice",
          "type": "u64"
        },
        {
          "name": "rulesAccPresent",
          "type": "bool"
        },
        {
          "name": "authorizationData",
          "type": {
            "option": {
              "defined": "AuthorizationDataLocal"
            }
          }
        },
        {
          "name": "optionalRoyaltyPct",
          "type": {
            "option": "u16"
          }
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
              "isSigner": false,
              "docs": [
                "intentionally not deserializing, it would be dummy in the case of VOC/FVC based verification"
              ]
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
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftEdition",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ownerTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pnftShared",
          "accounts": [
            {
              "name": "tokenMetadataProgram",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "instructions",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "authorizationRulesProgram",
              "isMut": false,
              "isSigner": false
            }
          ]
        },
        {
          "name": "authRules",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "marginAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "takerBroker",
          "isMut": true,
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
          "name": "minPrice",
          "type": "u64"
        },
        {
          "name": "rulesAccPresent",
          "type": "bool"
        },
        {
          "name": "authorizationData",
          "type": {
            "option": {
              "defined": "AuthorizationDataLocal"
            }
          }
        },
        {
          "name": "optionalRoyaltyPct",
          "type": {
            "option": "u16"
          }
        }
      ]
    },
    {
      "name": "editPool",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "oldPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "newPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oldSolEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "newSolEscrow",
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
          "name": "nftAuthority",
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
          "name": "oldConfig",
          "type": {
            "defined": "PoolConfig"
          }
        },
        {
          "name": "newConfig",
          "type": {
            "defined": "PoolConfig"
          }
        },
        {
          "name": "isCosigned",
          "type": {
            "option": "bool"
          }
        },
        {
          "name": "maxTakerSellCount",
          "type": {
            "option": "u32"
          }
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
          "name": "cosigner",
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
      "name": "initMarginAccount",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "marginAccount",
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
          "name": "marginNr",
          "type": "u16"
        },
        {
          "name": "name",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "closeMarginAccount",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "marginAccount",
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
      "args": []
    },
    {
      "name": "depositMarginAccount",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "marginAccount",
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
          "name": "lamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawMarginAccount",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "marginAccount",
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
          "name": "lamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "attachPoolToMargin",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "marginAccount",
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
            "Needed for pool seeds derivation / will be stored inside pool"
          ]
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
        }
      ]
    },
    {
      "name": "detachPoolFromMargin",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "marginAccount",
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
            "Needed for pool seeds derivation / will be stored inside pool"
          ]
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
      "name": "setPoolFreeze",
      "accounts": [
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
          "name": "freeze",
          "type": "bool"
        }
      ]
    },
    {
      "name": "takeSnipe",
      "accounts": [
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
          "name": "actualPrice",
          "type": "u64"
        },
        {
          "name": "authorizationData",
          "type": {
            "option": {
              "defined": "AuthorizationDataLocal"
            }
          }
        }
      ]
    },
    {
      "name": "editPoolInPlace",
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
          "name": "isCosigned",
          "type": {
            "option": "bool"
          }
        },
        {
          "name": "maxTakerSellCount",
          "type": {
            "option": "u32"
          }
        },
        {
          "name": "mmCompoundFees",
          "type": {
            "option": "bool"
          }
        }
      ]
    },
    {
      "name": "withdrawTswapFees",
      "accounts": [
        {
          "name": "tswap",
          "isMut": true,
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
          "name": "destination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "list",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
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
          "name": "singleListing",
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
        },
        {
          "name": "nftMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftEdition",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ownerTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pnftShared",
          "accounts": [
            {
              "name": "tokenMetadataProgram",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "instructions",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "authorizationRulesProgram",
              "isMut": false,
              "isSigner": false
            }
          ]
        },
        {
          "name": "authRules",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "authorizationData",
          "type": {
            "option": {
              "defined": "AuthorizationDataLocal"
            }
          }
        },
        {
          "name": "rulesAccPresent",
          "type": "bool"
        }
      ]
    },
    {
      "name": "delist",
      "accounts": [
        {
          "name": "tswap",
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
          "name": "singleListing",
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
        },
        {
          "name": "nftMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftEdition",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ownerTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pnftShared",
          "accounts": [
            {
              "name": "tokenMetadataProgram",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "instructions",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "authorizationRulesProgram",
              "isMut": false,
              "isSigner": false
            }
          ]
        },
        {
          "name": "authRules",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "authorizationData",
          "type": {
            "option": {
              "defined": "AuthorizationDataLocal"
            }
          }
        },
        {
          "name": "rulesAccPresent",
          "type": "bool"
        }
      ]
    },
    {
      "name": "buySingleListing",
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
          "name": "singleListing",
          "isMut": true,
          "isSigner": false
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
          "isMut": true,
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
        },
        {
          "name": "nftEdition",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ownerTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pnftShared",
          "accounts": [
            {
              "name": "tokenMetadataProgram",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "instructions",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "authorizationRulesProgram",
              "isMut": false,
              "isSigner": false
            }
          ]
        },
        {
          "name": "authRules",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "takerBroker",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "maxPrice",
          "type": "u64"
        },
        {
          "name": "rulesAccPresent",
          "type": "bool"
        },
        {
          "name": "authorizationData",
          "type": {
            "option": {
              "defined": "AuthorizationDataLocal"
            }
          }
        },
        {
          "name": "optionalRoyaltyPct",
          "type": {
            "option": "u16"
          }
        }
      ]
    },
    {
      "name": "editSingleListing",
      "accounts": [
        {
          "name": "singleListing",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
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
          "name": "price",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawMmFee",
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
      "name": "withdrawMarginAccountCpi",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "marginAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidState",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "destination",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        },
        {
          "name": "lamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawMarginAccountCpiTcomp",
      "accounts": [
        {
          "name": "marginAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidState",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "destination",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        },
        {
          "name": "bidId",
          "type": "publicKey"
        },
        {
          "name": "lamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawMarginAccountCpiTlock",
      "accounts": [
        {
          "name": "marginAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "orderState",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "destination",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        },
        {
          "name": "orderId",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "lamports",
          "type": "u64"
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
            "docs": [
              "@DEPRECATED, use constant above instead"
            ],
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
            "docs": [
              "Unix timestamp in seconds when pool was created"
            ],
            "type": "i64"
          },
          {
            "name": "config",
            "type": {
              "defined": "PoolConfig"
            }
          },
          {
            "name": "tswap",
            "type": "publicKey"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "whitelist",
            "type": "publicKey"
          },
          {
            "name": "solEscrow",
            "docs": [
              "Used by Trade / Token pools only, but always initiated",
              "Amount to spend is implied by balance - rent",
              "(!) for margin accounts this should always be empty EXCEPT when we move frozen amount in"
            ],
            "type": "publicKey"
          },
          {
            "name": "takerSellCount",
            "docs": [
              "How many times a taker has SOLD into the pool"
            ],
            "type": "u32"
          },
          {
            "name": "takerBuyCount",
            "docs": [
              "How many times a taker has BOUGHT from the pool"
            ],
            "type": "u32"
          },
          {
            "name": "nftsHeld",
            "type": "u32"
          },
          {
            "name": "nftAuthority",
            "type": "publicKey"
          },
          {
            "name": "stats",
            "docs": [
              "All stats incorporate both 1)carried over and 2)current data"
            ],
            "type": {
              "defined": "PoolStats"
            }
          },
          {
            "name": "margin",
            "docs": [
              "If margin account present, means it's a marginated pool (currently bids only)"
            ],
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "isCosigned",
            "docs": [
              "Offchain actor signs off to make sure an offchain condition is met (eg trait present)"
            ],
            "type": "bool"
          },
          {
            "name": "orderType",
            "docs": [
              "Order type for indexing ease (anchor enums annoying, so using a u8)",
              "0 = standard, 1 = sniping (in the future eg 2 = take profit, etc)"
            ],
            "type": "u8"
          },
          {
            "name": "frozen",
            "docs": [
              "Order is being executed by an offchain party and can't be modified at this time",
              "incl. deposit/withdraw/edit/close/buy/sell"
            ],
            "type": {
              "option": {
                "defined": "Frozen"
              }
            }
          },
          {
            "name": "lastTransactedSeconds",
            "docs": [
              "Last time a buy or sell order has been executed"
            ],
            "type": "i64"
          },
          {
            "name": "maxTakerSellCount",
            "docs": [
              "Limit how many buys a pool can execute - useful for cross-margin, else keeps buying into infinity"
            ],
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "marginAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "nr",
            "type": "u16"
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
            "name": "poolsAttached",
            "type": "u32"
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "singleListing",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "nftMint",
            "type": "publicKey"
          },
          {
            "name": "price",
            "type": "u64"
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
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
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
            "name": "nftAuthority",
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
      "name": "nftAuthority",
      "docs": [
        "Connector between a pool and all the NFTs in it, to be able to re-attach them to a different pool if needed"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "randomSeed",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
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
            "name": "pool",
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
            "name": "mmCompoundFees",
            "docs": [
              "Trade pools only"
            ],
            "type": "bool"
          },
          {
            "name": "mmFeeBps",
            "type": {
              "option": "u16"
            }
          }
        ]
      }
    },
    {
      "name": "PoolStats",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "takerSellCount",
            "type": "u32"
          },
          {
            "name": "takerBuyCount",
            "type": "u32"
          },
          {
            "name": "accumulatedMmProfit",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "Frozen",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "time",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "AuthorizationDataLocal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "payload",
            "type": {
              "vec": {
                "defined": "TaggedPayload"
              }
            }
          }
        ]
      }
    },
    {
      "name": "TaggedPayload",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "payload",
            "type": {
              "defined": "PayloadTypeLocal"
            }
          }
        ]
      }
    },
    {
      "name": "SeedsVecLocal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "seeds",
            "docs": [
              "The vector of derivation seeds."
            ],
            "type": {
              "vec": "bytes"
            }
          }
        ]
      }
    },
    {
      "name": "ProofInfoLocal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proof",
            "docs": [
              "The merkle proof."
            ],
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
    },
    {
      "name": "PayloadTypeLocal",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Pubkey",
            "fields": [
              "publicKey"
            ]
          },
          {
            "name": "Seeds",
            "fields": [
              {
                "defined": "SeedsVecLocal"
              }
            ]
          },
          {
            "name": "MerkleProof",
            "fields": [
              {
                "defined": "ProofInfoLocal"
              }
            ]
          },
          {
            "name": "Number",
            "fields": [
              "u64"
            ]
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
    },
    {
      "name": "DelistEvent",
      "fields": [
        {
          "name": "currentPrice",
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
      "name": "InsufficientTswapAccBalance",
      "msg": "insufficient Tswap account balance"
    },
    {
      "code": 6016,
      "name": "BadOwner",
      "msg": "bad owner"
    },
    {
      "code": 6017,
      "name": "FeesNotAllowed",
      "msg": "fees not allowed for non-trade pools"
    },
    {
      "code": 6018,
      "name": "BadMetadata",
      "msg": "metadata account does not match"
    },
    {
      "code": 6019,
      "name": "CreatorMismatch",
      "msg": "provided creator address does not match metadata creator"
    },
    {
      "code": 6020,
      "name": "WrongPoolVersion",
      "msg": "wrong pool version provided"
    },
    {
      "code": 6021,
      "name": "PoolsAreTheSame",
      "msg": "new pool should not match old pool"
    },
    {
      "code": 6022,
      "name": "WrongAuthority",
      "msg": "wrong nft authority account provided"
    },
    {
      "code": 6023,
      "name": "FrozenAmountMismatch",
      "msg": "amount frozen doesnt match current price"
    },
    {
      "code": 6024,
      "name": "BadMintProof",
      "msg": "mint proof account does not match"
    },
    {
      "code": 6025,
      "name": "BadCosigner",
      "msg": "bad cosigner passed - either wrong key or no signature"
    },
    {
      "code": 6026,
      "name": "PoolFrozen",
      "msg": "pool is frozen and cannot execute normal operations"
    },
    {
      "code": 6027,
      "name": "BadMargin",
      "msg": "bad margin account passed"
    },
    {
      "code": 6028,
      "name": "PoolNotMarginated",
      "msg": "expected a marginated pool to be passed in"
    },
    {
      "code": 6029,
      "name": "PoolMarginated",
      "msg": "expected a non-marginated pool to be passed in"
    },
    {
      "code": 6030,
      "name": "WrongOrderType",
      "msg": "wrong order type"
    },
    {
      "code": 6031,
      "name": "WrongFrozenStatus",
      "msg": "wrong frozen status"
    },
    {
      "code": 6032,
      "name": "MarginInUse",
      "msg": "margin account has pools open and is in use"
    },
    {
      "code": 6033,
      "name": "MaxTakerSellCountExceeded",
      "msg": "max taker sell count exceeded, pool cannot buy anymore NFTs"
    },
    {
      "code": 6034,
      "name": "MaxTakerSellCountTooSmall",
      "msg": "max taker sell count is too small"
    },
    {
      "code": 6035,
      "name": "BadRuleSet",
      "msg": "rule set for programmable nft does not match"
    },
    {
      "code": 6036,
      "name": "PoolFeesCompounded",
      "msg": "this pool compounds fees and they cannot be withdrawn separately"
    },
    {
      "code": 6037,
      "name": "BadRoyaltiesPct",
      "msg": "royalties percentage passed in must be between 0 and 100"
    },
    {
      "code": 6038,
      "name": "StartingPriceTooSmall",
      "msg": "starting price can't be smaller than 1 lamport"
    }
  ]
};

export const IDL: Tensorswap = {
  "version": "2.0.0",
  "name": "tensorswap",
  "constants": [
    {
      "name": "CURRENT_TSWAP_VERSION",
      "type": "u8",
      "value": "1"
    },
    {
      "name": "CURRENT_POOL_VERSION",
      "type": "u8",
      "value": "2"
    },
    {
      "name": "MAX_MM_FEES_BPS",
      "type": "u16",
      "value": "9999"
    },
    {
      "name": "HUNDRED_PCT_BPS",
      "type": "u16",
      "value": "10000"
    },
    {
      "name": "MAX_DELTA_BPS",
      "type": "u16",
      "value": "9999"
    },
    {
      "name": "SPREAD_TICKS",
      "type": "u8",
      "value": "1"
    },
    {
      "name": "TSWAP_TAKER_FEE_BPS",
      "type": "u16",
      "value": "140"
    },
    {
      "name": "MAKER_REBATE_BPS",
      "type": "u16",
      "value": "40"
    },
    {
      "name": "SNIPE_FEE_BPS",
      "type": "u16",
      "value": "150"
    },
    {
      "name": "SNIPE_MIN_FEE",
      "type": "u64",
      "value": "10000000"
    },
    {
      "name": "SNIPE_PROFIT_SHARE_BPS",
      "type": "u16",
      "value": "2000"
    },
    {
      "name": "TAKER_BROKER_PCT",
      "type": "u64",
      "value": "0"
    },
    {
      "name": "TSWAP_SIZE",
      "type": {
        "defined": "usize"
      },
      "value": "8 + 1 + 1 + 2 + 32 * 3"
    },
    {
      "name": "POOL_SIZE",
      "type": {
        "defined": "usize"
      },
      "value": "8 + (3 * 1) + 8 + (2 * 1) + (2 * 8) + 1 + 3 + (5 * 32) + (3 * 4) + (2 * 4) + 8 + 32 + 1 + 1 + 1 + 8 + 8 + 1 + 8 + 4"
    },
    {
      "name": "MARGIN_SIZE",
      "type": {
        "defined": "usize"
      },
      "value": "8 + 32 + 32 + 2 + 1 + 4 + 64"
    },
    {
      "name": "SINGLE_LISTING_SIZE",
      "type": {
        "defined": "usize"
      },
      "value": "8 + (32 * 2) + 8 + 1 + 64"
    },
    {
      "name": "DEPOSIT_RECEIPT_SIZE",
      "type": {
        "defined": "usize"
      },
      "value": "8 + 1 + 32 * 3"
    },
    {
      "name": "NFT_AUTHORITY_SIZE",
      "type": {
        "defined": "usize"
      },
      "value": "8 + 1 + 32 + 32"
    }
  ],
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
        },
        {
          "name": "newOwner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
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
        },
        {
          "name": "nftAuthority",
          "isMut": true,
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
          "name": "authSeeds",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "isCosigned",
          "type": "bool"
        },
        {
          "name": "orderType",
          "type": "u8"
        },
        {
          "name": "maxTakerSellCount",
          "type": {
            "option": "u32"
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
          "isSigner": false,
          "docs": [
            "(!) if the order is marginated this won't return any funds to the user, since margin isn't auto-closed"
          ]
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
        },
        {
          "name": "nftAuthority",
          "isMut": true,
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
        },
        {
          "name": "nftMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintProof",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftEdition",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ownerTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pnftShared",
          "accounts": [
            {
              "name": "tokenMetadataProgram",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "instructions",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "authorizationRulesProgram",
              "isMut": false,
              "isSigner": false
            }
          ]
        },
        {
          "name": "authRules",
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
          "name": "authorizationData",
          "type": {
            "option": {
              "defined": "AuthorizationDataLocal"
            }
          }
        },
        {
          "name": "rulesAccPresent",
          "type": "bool"
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
        },
        {
          "name": "nftMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftEdition",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ownerTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pnftShared",
          "accounts": [
            {
              "name": "tokenMetadataProgram",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "instructions",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "authorizationRulesProgram",
              "isMut": false,
              "isSigner": false
            }
          ]
        },
        {
          "name": "authRules",
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
          "name": "authorizationData",
          "type": {
            "option": {
              "defined": "AuthorizationDataLocal"
            }
          }
        },
        {
          "name": "rulesAccPresent",
          "type": "bool"
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
          "isMut": true,
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
        },
        {
          "name": "nftEdition",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ownerTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pnftShared",
          "accounts": [
            {
              "name": "tokenMetadataProgram",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "instructions",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "authorizationRulesProgram",
              "isMut": false,
              "isSigner": false
            }
          ]
        },
        {
          "name": "authRules",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "marginAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "takerBroker",
          "isMut": true,
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
          "name": "maxPrice",
          "type": "u64"
        },
        {
          "name": "rulesAccPresent",
          "type": "bool"
        },
        {
          "name": "authorizationData",
          "type": {
            "option": {
              "defined": "AuthorizationDataLocal"
            }
          }
        },
        {
          "name": "optionalRoyaltyPct",
          "type": {
            "option": "u16"
          }
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
              "isSigner": false,
              "docs": [
                "intentionally not deserializing, it would be dummy in the case of VOC/FVC based verification"
              ]
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
        },
        {
          "name": "nftEdition",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ownerTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pnftShared",
          "accounts": [
            {
              "name": "tokenMetadataProgram",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "instructions",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "authorizationRulesProgram",
              "isMut": false,
              "isSigner": false
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
          "name": "tempEscrowTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authRules",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "marginAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "takerBroker",
          "isMut": true,
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
          "name": "minPrice",
          "type": "u64"
        },
        {
          "name": "rulesAccPresent",
          "type": "bool"
        },
        {
          "name": "authorizationData",
          "type": {
            "option": {
              "defined": "AuthorizationDataLocal"
            }
          }
        },
        {
          "name": "optionalRoyaltyPct",
          "type": {
            "option": "u16"
          }
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
              "isSigner": false,
              "docs": [
                "intentionally not deserializing, it would be dummy in the case of VOC/FVC based verification"
              ]
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
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftEdition",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ownerTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pnftShared",
          "accounts": [
            {
              "name": "tokenMetadataProgram",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "instructions",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "authorizationRulesProgram",
              "isMut": false,
              "isSigner": false
            }
          ]
        },
        {
          "name": "authRules",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "marginAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "takerBroker",
          "isMut": true,
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
          "name": "minPrice",
          "type": "u64"
        },
        {
          "name": "rulesAccPresent",
          "type": "bool"
        },
        {
          "name": "authorizationData",
          "type": {
            "option": {
              "defined": "AuthorizationDataLocal"
            }
          }
        },
        {
          "name": "optionalRoyaltyPct",
          "type": {
            "option": "u16"
          }
        }
      ]
    },
    {
      "name": "editPool",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "oldPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "newPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oldSolEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "newSolEscrow",
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
          "name": "nftAuthority",
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
          "name": "oldConfig",
          "type": {
            "defined": "PoolConfig"
          }
        },
        {
          "name": "newConfig",
          "type": {
            "defined": "PoolConfig"
          }
        },
        {
          "name": "isCosigned",
          "type": {
            "option": "bool"
          }
        },
        {
          "name": "maxTakerSellCount",
          "type": {
            "option": "u32"
          }
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
          "name": "cosigner",
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
      "name": "initMarginAccount",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "marginAccount",
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
          "name": "marginNr",
          "type": "u16"
        },
        {
          "name": "name",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "closeMarginAccount",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "marginAccount",
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
      "args": []
    },
    {
      "name": "depositMarginAccount",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "marginAccount",
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
          "name": "lamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawMarginAccount",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "marginAccount",
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
          "name": "lamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "attachPoolToMargin",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "marginAccount",
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
            "Needed for pool seeds derivation / will be stored inside pool"
          ]
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
        }
      ]
    },
    {
      "name": "detachPoolFromMargin",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "marginAccount",
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
            "Needed for pool seeds derivation / will be stored inside pool"
          ]
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
      "name": "setPoolFreeze",
      "accounts": [
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
          "name": "freeze",
          "type": "bool"
        }
      ]
    },
    {
      "name": "takeSnipe",
      "accounts": [
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
          "name": "actualPrice",
          "type": "u64"
        },
        {
          "name": "authorizationData",
          "type": {
            "option": {
              "defined": "AuthorizationDataLocal"
            }
          }
        }
      ]
    },
    {
      "name": "editPoolInPlace",
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
          "name": "isCosigned",
          "type": {
            "option": "bool"
          }
        },
        {
          "name": "maxTakerSellCount",
          "type": {
            "option": "u32"
          }
        },
        {
          "name": "mmCompoundFees",
          "type": {
            "option": "bool"
          }
        }
      ]
    },
    {
      "name": "withdrawTswapFees",
      "accounts": [
        {
          "name": "tswap",
          "isMut": true,
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
          "name": "destination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "list",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
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
          "name": "singleListing",
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
        },
        {
          "name": "nftMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftEdition",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ownerTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pnftShared",
          "accounts": [
            {
              "name": "tokenMetadataProgram",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "instructions",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "authorizationRulesProgram",
              "isMut": false,
              "isSigner": false
            }
          ]
        },
        {
          "name": "authRules",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "authorizationData",
          "type": {
            "option": {
              "defined": "AuthorizationDataLocal"
            }
          }
        },
        {
          "name": "rulesAccPresent",
          "type": "bool"
        }
      ]
    },
    {
      "name": "delist",
      "accounts": [
        {
          "name": "tswap",
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
          "name": "singleListing",
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
        },
        {
          "name": "nftMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftEdition",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ownerTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pnftShared",
          "accounts": [
            {
              "name": "tokenMetadataProgram",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "instructions",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "authorizationRulesProgram",
              "isMut": false,
              "isSigner": false
            }
          ]
        },
        {
          "name": "authRules",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "authorizationData",
          "type": {
            "option": {
              "defined": "AuthorizationDataLocal"
            }
          }
        },
        {
          "name": "rulesAccPresent",
          "type": "bool"
        }
      ]
    },
    {
      "name": "buySingleListing",
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
          "name": "singleListing",
          "isMut": true,
          "isSigner": false
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
          "isMut": true,
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
        },
        {
          "name": "nftEdition",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ownerTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pnftShared",
          "accounts": [
            {
              "name": "tokenMetadataProgram",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "instructions",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "authorizationRulesProgram",
              "isMut": false,
              "isSigner": false
            }
          ]
        },
        {
          "name": "authRules",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "takerBroker",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "maxPrice",
          "type": "u64"
        },
        {
          "name": "rulesAccPresent",
          "type": "bool"
        },
        {
          "name": "authorizationData",
          "type": {
            "option": {
              "defined": "AuthorizationDataLocal"
            }
          }
        },
        {
          "name": "optionalRoyaltyPct",
          "type": {
            "option": "u16"
          }
        }
      ]
    },
    {
      "name": "editSingleListing",
      "accounts": [
        {
          "name": "singleListing",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
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
          "name": "price",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawMmFee",
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
      "name": "withdrawMarginAccountCpi",
      "accounts": [
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "marginAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidState",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "destination",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        },
        {
          "name": "lamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawMarginAccountCpiTcomp",
      "accounts": [
        {
          "name": "marginAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidState",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "destination",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        },
        {
          "name": "bidId",
          "type": "publicKey"
        },
        {
          "name": "lamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawMarginAccountCpiTlock",
      "accounts": [
        {
          "name": "marginAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "orderState",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "destination",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        },
        {
          "name": "orderId",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "lamports",
          "type": "u64"
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
            "docs": [
              "@DEPRECATED, use constant above instead"
            ],
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
            "docs": [
              "Unix timestamp in seconds when pool was created"
            ],
            "type": "i64"
          },
          {
            "name": "config",
            "type": {
              "defined": "PoolConfig"
            }
          },
          {
            "name": "tswap",
            "type": "publicKey"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "whitelist",
            "type": "publicKey"
          },
          {
            "name": "solEscrow",
            "docs": [
              "Used by Trade / Token pools only, but always initiated",
              "Amount to spend is implied by balance - rent",
              "(!) for margin accounts this should always be empty EXCEPT when we move frozen amount in"
            ],
            "type": "publicKey"
          },
          {
            "name": "takerSellCount",
            "docs": [
              "How many times a taker has SOLD into the pool"
            ],
            "type": "u32"
          },
          {
            "name": "takerBuyCount",
            "docs": [
              "How many times a taker has BOUGHT from the pool"
            ],
            "type": "u32"
          },
          {
            "name": "nftsHeld",
            "type": "u32"
          },
          {
            "name": "nftAuthority",
            "type": "publicKey"
          },
          {
            "name": "stats",
            "docs": [
              "All stats incorporate both 1)carried over and 2)current data"
            ],
            "type": {
              "defined": "PoolStats"
            }
          },
          {
            "name": "margin",
            "docs": [
              "If margin account present, means it's a marginated pool (currently bids only)"
            ],
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "isCosigned",
            "docs": [
              "Offchain actor signs off to make sure an offchain condition is met (eg trait present)"
            ],
            "type": "bool"
          },
          {
            "name": "orderType",
            "docs": [
              "Order type for indexing ease (anchor enums annoying, so using a u8)",
              "0 = standard, 1 = sniping (in the future eg 2 = take profit, etc)"
            ],
            "type": "u8"
          },
          {
            "name": "frozen",
            "docs": [
              "Order is being executed by an offchain party and can't be modified at this time",
              "incl. deposit/withdraw/edit/close/buy/sell"
            ],
            "type": {
              "option": {
                "defined": "Frozen"
              }
            }
          },
          {
            "name": "lastTransactedSeconds",
            "docs": [
              "Last time a buy or sell order has been executed"
            ],
            "type": "i64"
          },
          {
            "name": "maxTakerSellCount",
            "docs": [
              "Limit how many buys a pool can execute - useful for cross-margin, else keeps buying into infinity"
            ],
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "marginAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "nr",
            "type": "u16"
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
            "name": "poolsAttached",
            "type": "u32"
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "singleListing",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "nftMint",
            "type": "publicKey"
          },
          {
            "name": "price",
            "type": "u64"
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
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
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
            "name": "nftAuthority",
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
      "name": "nftAuthority",
      "docs": [
        "Connector between a pool and all the NFTs in it, to be able to re-attach them to a different pool if needed"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "randomSeed",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
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
            "name": "pool",
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
            "name": "mmCompoundFees",
            "docs": [
              "Trade pools only"
            ],
            "type": "bool"
          },
          {
            "name": "mmFeeBps",
            "type": {
              "option": "u16"
            }
          }
        ]
      }
    },
    {
      "name": "PoolStats",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "takerSellCount",
            "type": "u32"
          },
          {
            "name": "takerBuyCount",
            "type": "u32"
          },
          {
            "name": "accumulatedMmProfit",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "Frozen",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "time",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "AuthorizationDataLocal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "payload",
            "type": {
              "vec": {
                "defined": "TaggedPayload"
              }
            }
          }
        ]
      }
    },
    {
      "name": "TaggedPayload",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "payload",
            "type": {
              "defined": "PayloadTypeLocal"
            }
          }
        ]
      }
    },
    {
      "name": "SeedsVecLocal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "seeds",
            "docs": [
              "The vector of derivation seeds."
            ],
            "type": {
              "vec": "bytes"
            }
          }
        ]
      }
    },
    {
      "name": "ProofInfoLocal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proof",
            "docs": [
              "The merkle proof."
            ],
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
    },
    {
      "name": "PayloadTypeLocal",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Pubkey",
            "fields": [
              "publicKey"
            ]
          },
          {
            "name": "Seeds",
            "fields": [
              {
                "defined": "SeedsVecLocal"
              }
            ]
          },
          {
            "name": "MerkleProof",
            "fields": [
              {
                "defined": "ProofInfoLocal"
              }
            ]
          },
          {
            "name": "Number",
            "fields": [
              "u64"
            ]
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
    },
    {
      "name": "DelistEvent",
      "fields": [
        {
          "name": "currentPrice",
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
      "name": "InsufficientTswapAccBalance",
      "msg": "insufficient Tswap account balance"
    },
    {
      "code": 6016,
      "name": "BadOwner",
      "msg": "bad owner"
    },
    {
      "code": 6017,
      "name": "FeesNotAllowed",
      "msg": "fees not allowed for non-trade pools"
    },
    {
      "code": 6018,
      "name": "BadMetadata",
      "msg": "metadata account does not match"
    },
    {
      "code": 6019,
      "name": "CreatorMismatch",
      "msg": "provided creator address does not match metadata creator"
    },
    {
      "code": 6020,
      "name": "WrongPoolVersion",
      "msg": "wrong pool version provided"
    },
    {
      "code": 6021,
      "name": "PoolsAreTheSame",
      "msg": "new pool should not match old pool"
    },
    {
      "code": 6022,
      "name": "WrongAuthority",
      "msg": "wrong nft authority account provided"
    },
    {
      "code": 6023,
      "name": "FrozenAmountMismatch",
      "msg": "amount frozen doesnt match current price"
    },
    {
      "code": 6024,
      "name": "BadMintProof",
      "msg": "mint proof account does not match"
    },
    {
      "code": 6025,
      "name": "BadCosigner",
      "msg": "bad cosigner passed - either wrong key or no signature"
    },
    {
      "code": 6026,
      "name": "PoolFrozen",
      "msg": "pool is frozen and cannot execute normal operations"
    },
    {
      "code": 6027,
      "name": "BadMargin",
      "msg": "bad margin account passed"
    },
    {
      "code": 6028,
      "name": "PoolNotMarginated",
      "msg": "expected a marginated pool to be passed in"
    },
    {
      "code": 6029,
      "name": "PoolMarginated",
      "msg": "expected a non-marginated pool to be passed in"
    },
    {
      "code": 6030,
      "name": "WrongOrderType",
      "msg": "wrong order type"
    },
    {
      "code": 6031,
      "name": "WrongFrozenStatus",
      "msg": "wrong frozen status"
    },
    {
      "code": 6032,
      "name": "MarginInUse",
      "msg": "margin account has pools open and is in use"
    },
    {
      "code": 6033,
      "name": "MaxTakerSellCountExceeded",
      "msg": "max taker sell count exceeded, pool cannot buy anymore NFTs"
    },
    {
      "code": 6034,
      "name": "MaxTakerSellCountTooSmall",
      "msg": "max taker sell count is too small"
    },
    {
      "code": 6035,
      "name": "BadRuleSet",
      "msg": "rule set for programmable nft does not match"
    },
    {
      "code": 6036,
      "name": "PoolFeesCompounded",
      "msg": "this pool compounds fees and they cannot be withdrawn separately"
    },
    {
      "code": 6037,
      "name": "BadRoyaltiesPct",
      "msg": "royalties percentage passed in must be between 0 and 100"
    },
    {
      "code": 6038,
      "name": "StartingPriceTooSmall",
      "msg": "starting price can't be smaller than 1 lamport"
    }
  ]
};
