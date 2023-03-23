export type TensorBid = {
  "version": "0.1.0",
  "name": "tensor_bid",
  "constants": [
    {
      "name": "CURRENT_TBID_VERSION",
      "type": "u8",
      "value": "1"
    },
    {
      "name": "TBID_FEE_BPS",
      "type": "u16",
      "value": "100"
    },
    {
      "name": "MAX_EXPIRY_SEC",
      "type": "i64",
      "value": "5184000"
    },
    {
      "name": "BID_STATE_SIZE",
      "type": {
        "defined": "usize"
      },
      "value": "8 + 1 + 8 + (32 * 2) + 1 + 8 + 33 + 64"
    }
  ],
  "instructions": [
    {
      "name": "bid",
      "accounts": [
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bidState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": true
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
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "marginAccount",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "lamports",
          "type": "u64"
        },
        {
          "name": "expireInSec",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "fundMargin",
          "type": "bool"
        }
      ]
    },
    {
      "name": "takeBid",
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
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftBidderAcc",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftSellerAcc",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftTempAcc",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "seller",
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
          "name": "sellerTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidderTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tempTokenRecord",
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
          "name": "tensorswapProgram",
          "isMut": false,
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
          "name": "lamports",
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
      "name": "cancelBid",
      "accounts": [
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bidState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": true
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
      "args": []
    },
    {
      "name": "closeExpiredBid",
      "accounts": [
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bidState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cosigner",
          "isMut": false,
          "isSigner": true
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
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "bidState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "bidAmount",
            "type": "u64"
          },
          {
            "name": "nftMint",
            "type": "publicKey"
          },
          {
            "name": "bidder",
            "type": "publicKey"
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
            "name": "expiry",
            "type": "i64"
          },
          {
            "name": "margin",
            "type": {
              "option": "publicKey"
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
    }
  ],
  "types": [
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
      "name": "BidEvent",
      "fields": [
        {
          "name": "lamports",
          "type": "u64",
          "index": false
        },
        {
          "name": "expiry",
          "type": "i64",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "bidder",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "TakeBidEvent",
      "fields": [
        {
          "name": "lamports",
          "type": "u64",
          "index": false
        },
        {
          "name": "tswapFee",
          "type": "u64",
          "index": false
        },
        {
          "name": "creatorsFee",
          "type": "u64",
          "index": false
        },
        {
          "name": "expiry",
          "type": "i64",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "bidder",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "BadMargin",
      "msg": "bad margin account passed in"
    },
    {
      "code": 6001,
      "name": "ExpiryTooLarge",
      "msg": "expiry date too far in the future, max expiry 60d"
    },
    {
      "code": 6002,
      "name": "PriceMismatch",
      "msg": "passed in amount doesnt match that stored"
    },
    {
      "code": 6003,
      "name": "BidExpired",
      "msg": "bid expired"
    },
    {
      "code": 6004,
      "name": "BidNotYetExpired",
      "msg": "bid hasn't reached expiry time yet"
    }
  ]
};

export const IDL: TensorBid = {
  "version": "0.1.0",
  "name": "tensor_bid",
  "constants": [
    {
      "name": "CURRENT_TBID_VERSION",
      "type": "u8",
      "value": "1"
    },
    {
      "name": "TBID_FEE_BPS",
      "type": "u16",
      "value": "100"
    },
    {
      "name": "MAX_EXPIRY_SEC",
      "type": "i64",
      "value": "5184000"
    },
    {
      "name": "BID_STATE_SIZE",
      "type": {
        "defined": "usize"
      },
      "value": "8 + 1 + 8 + (32 * 2) + 1 + 8 + 33 + 64"
    }
  ],
  "instructions": [
    {
      "name": "bid",
      "accounts": [
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bidState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": true
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
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "marginAccount",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "lamports",
          "type": "u64"
        },
        {
          "name": "expireInSec",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "fundMargin",
          "type": "bool"
        }
      ]
    },
    {
      "name": "takeBid",
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
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftBidderAcc",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftSellerAcc",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftTempAcc",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "seller",
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
          "name": "sellerTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidderTokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tempTokenRecord",
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
          "name": "tensorswapProgram",
          "isMut": false,
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
          "name": "lamports",
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
      "name": "cancelBid",
      "accounts": [
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bidState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": true
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
      "args": []
    },
    {
      "name": "closeExpiredBid",
      "accounts": [
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bidState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tswap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cosigner",
          "isMut": false,
          "isSigner": true
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
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "bidState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "bidAmount",
            "type": "u64"
          },
          {
            "name": "nftMint",
            "type": "publicKey"
          },
          {
            "name": "bidder",
            "type": "publicKey"
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
            "name": "expiry",
            "type": "i64"
          },
          {
            "name": "margin",
            "type": {
              "option": "publicKey"
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
    }
  ],
  "types": [
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
      "name": "BidEvent",
      "fields": [
        {
          "name": "lamports",
          "type": "u64",
          "index": false
        },
        {
          "name": "expiry",
          "type": "i64",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "bidder",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "TakeBidEvent",
      "fields": [
        {
          "name": "lamports",
          "type": "u64",
          "index": false
        },
        {
          "name": "tswapFee",
          "type": "u64",
          "index": false
        },
        {
          "name": "creatorsFee",
          "type": "u64",
          "index": false
        },
        {
          "name": "expiry",
          "type": "i64",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "bidder",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "BadMargin",
      "msg": "bad margin account passed in"
    },
    {
      "code": 6001,
      "name": "ExpiryTooLarge",
      "msg": "expiry date too far in the future, max expiry 60d"
    },
    {
      "code": 6002,
      "name": "PriceMismatch",
      "msg": "passed in amount doesnt match that stored"
    },
    {
      "code": 6003,
      "name": "BidExpired",
      "msg": "bid expired"
    },
    {
      "code": 6004,
      "name": "BidNotYetExpired",
      "msg": "bid hasn't reached expiry time yet"
    }
  ]
};
