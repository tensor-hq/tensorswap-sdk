export type TensorWhitelist = {
  "version": "0.2.0",
  "name": "tensor_whitelist",
  "instructions": [
    {
      "name": "initUpdateAuthority",
      "accounts": [
        {
          "name": "whitelistAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cosigner",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "both have to sign on any updates"
          ]
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
          "name": "newCosigner",
          "type": {
            "option": "publicKey"
          }
        },
        {
          "name": "newOwner",
          "type": {
            "option": "publicKey"
          }
        }
      ]
    },
    {
      "name": "initUpdateWhitelist",
      "docs": [
        "Store min 1, max 3, check in priority order"
      ],
      "accounts": [
        {
          "name": "whitelist",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "whitelistAuthority",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "there can only be 1 whitelist authority (due to seeds),",
            "and we're checking that 1)the correct cosigner is present on it, and 2)is a signer"
          ]
        },
        {
          "name": "cosigner",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "only cosigner has to sign for unfrozen, for frozen owner also has to sign"
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
          "name": "uuid",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "rootHash",
          "type": {
            "option": {
              "array": [
                "u8",
                32
              ]
            }
          }
        },
        {
          "name": "name",
          "type": {
            "option": {
              "array": [
                "u8",
                32
              ]
            }
          }
        },
        {
          "name": "voc",
          "type": {
            "option": "publicKey"
          }
        },
        {
          "name": "fvc",
          "type": {
            "option": "publicKey"
          }
        }
      ]
    },
    {
      "name": "initUpdateMintProof",
      "accounts": [
        {
          "name": "whitelist",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mintProof",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
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
      "name": "reallocAuthority",
      "accounts": [
        {
          "name": "whitelistAuthority",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "there can only be 1 whitelist authority (due to seeds),",
            "and we're checking that 1)the correct cosigner is present on it, and 2)is a signer"
          ]
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
      "args": []
    },
    {
      "name": "reallocWhitelist",
      "accounts": [
        {
          "name": "whitelist",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "whitelistAuthority",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "there can only be 1 whitelist authority (due to seeds),",
            "and we're checking that 1)the correct cosigner is present on it, and 2)is a signer"
          ]
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
      "args": []
    },
    {
      "name": "freezeWhitelist",
      "accounts": [
        {
          "name": "whitelist",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "whitelistAuthority",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "there can only be 1 whitelist authority (due to seeds),",
            "and we're checking that 1)the correct cosigner is present on it, and 2)is a signer"
          ]
        },
        {
          "name": "cosigner",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "freezing only requires cosigner"
          ]
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
      "name": "unfreezeWhitelist",
      "accounts": [
        {
          "name": "whitelist",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "whitelistAuthority",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "there can only be 1 whitelist authority (due to seeds),",
            "and we're checking that 1)the correct cosigner is present on it, and 2)is a signer"
          ]
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "unfreezing requires owner"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "authority",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "cosigner",
            "docs": [
              "cosigner of the whitelist - has rights to update it if unfrozen"
            ],
            "type": "publicKey"
          },
          {
            "name": "owner",
            "docs": [
              "owner of the whitelist (stricter, should be handled more carefully)",
              "has rights to 1)freeze, 2)unfreeze, 3)update frozen whitelists"
            ],
            "type": "publicKey"
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
      "name": "whitelist",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "verified",
            "type": "bool"
          },
          {
            "name": "rootHash",
            "docs": [
              "in the case when not present will be [u8; 32]"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "uuid",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
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
            "name": "frozen",
            "type": "bool"
          },
          {
            "name": "voc",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "fvc",
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
    },
    {
      "name": "mintProof",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proofLen",
            "type": "u8"
          },
          {
            "name": "proof",
            "type": {
              "array": [
                {
                  "array": [
                    "u8",
                    32
                  ]
                },
                28
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "FullMerkleProof",
      "type": {
        "kind": "struct",
        "fields": [
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
            "name": "leaf",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "BadCosigner",
      "msg": "passed in cosigner doesnt have the rights to do this"
    },
    {
      "code": 6001,
      "name": "MissingVerification",
      "msg": "missing all 3 verification methods: at least one must be present"
    },
    {
      "code": 6002,
      "name": "MissingName",
      "msg": "missing name"
    },
    {
      "code": 6003,
      "name": "BadWhitelist",
      "msg": "bad whitelist"
    },
    {
      "code": 6004,
      "name": "ProofTooLong",
      "msg": "proof provided exceeds the limit of 32 hashes"
    },
    {
      "code": 6005,
      "name": "BadOwner",
      "msg": "passed in owner doesnt have the rights to do this"
    },
    {
      "code": 6006,
      "name": "FailedVocVerification",
      "msg": "failed voc verification"
    },
    {
      "code": 6007,
      "name": "FailedFvcVerification",
      "msg": "failed fvc verification"
    },
    {
      "code": 6008,
      "name": "FailedMerkleProofVerification",
      "msg": "failed merkle proof verification"
    }
  ]
};

export const IDL: TensorWhitelist = {
  "version": "0.2.0",
  "name": "tensor_whitelist",
  "instructions": [
    {
      "name": "initUpdateAuthority",
      "accounts": [
        {
          "name": "whitelistAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cosigner",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "both have to sign on any updates"
          ]
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
          "name": "newCosigner",
          "type": {
            "option": "publicKey"
          }
        },
        {
          "name": "newOwner",
          "type": {
            "option": "publicKey"
          }
        }
      ]
    },
    {
      "name": "initUpdateWhitelist",
      "docs": [
        "Store min 1, max 3, check in priority order"
      ],
      "accounts": [
        {
          "name": "whitelist",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "whitelistAuthority",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "there can only be 1 whitelist authority (due to seeds),",
            "and we're checking that 1)the correct cosigner is present on it, and 2)is a signer"
          ]
        },
        {
          "name": "cosigner",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "only cosigner has to sign for unfrozen, for frozen owner also has to sign"
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
          "name": "uuid",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "rootHash",
          "type": {
            "option": {
              "array": [
                "u8",
                32
              ]
            }
          }
        },
        {
          "name": "name",
          "type": {
            "option": {
              "array": [
                "u8",
                32
              ]
            }
          }
        },
        {
          "name": "voc",
          "type": {
            "option": "publicKey"
          }
        },
        {
          "name": "fvc",
          "type": {
            "option": "publicKey"
          }
        }
      ]
    },
    {
      "name": "initUpdateMintProof",
      "accounts": [
        {
          "name": "whitelist",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mintProof",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
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
      "name": "reallocAuthority",
      "accounts": [
        {
          "name": "whitelistAuthority",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "there can only be 1 whitelist authority (due to seeds),",
            "and we're checking that 1)the correct cosigner is present on it, and 2)is a signer"
          ]
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
      "args": []
    },
    {
      "name": "reallocWhitelist",
      "accounts": [
        {
          "name": "whitelist",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "whitelistAuthority",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "there can only be 1 whitelist authority (due to seeds),",
            "and we're checking that 1)the correct cosigner is present on it, and 2)is a signer"
          ]
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
      "args": []
    },
    {
      "name": "freezeWhitelist",
      "accounts": [
        {
          "name": "whitelist",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "whitelistAuthority",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "there can only be 1 whitelist authority (due to seeds),",
            "and we're checking that 1)the correct cosigner is present on it, and 2)is a signer"
          ]
        },
        {
          "name": "cosigner",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "freezing only requires cosigner"
          ]
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
      "name": "unfreezeWhitelist",
      "accounts": [
        {
          "name": "whitelist",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "whitelistAuthority",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "there can only be 1 whitelist authority (due to seeds),",
            "and we're checking that 1)the correct cosigner is present on it, and 2)is a signer"
          ]
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "unfreezing requires owner"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "authority",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "cosigner",
            "docs": [
              "cosigner of the whitelist - has rights to update it if unfrozen"
            ],
            "type": "publicKey"
          },
          {
            "name": "owner",
            "docs": [
              "owner of the whitelist (stricter, should be handled more carefully)",
              "has rights to 1)freeze, 2)unfreeze, 3)update frozen whitelists"
            ],
            "type": "publicKey"
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
      "name": "whitelist",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "verified",
            "type": "bool"
          },
          {
            "name": "rootHash",
            "docs": [
              "in the case when not present will be [u8; 32]"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "uuid",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
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
            "name": "frozen",
            "type": "bool"
          },
          {
            "name": "voc",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "fvc",
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
    },
    {
      "name": "mintProof",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proofLen",
            "type": "u8"
          },
          {
            "name": "proof",
            "type": {
              "array": [
                {
                  "array": [
                    "u8",
                    32
                  ]
                },
                28
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "FullMerkleProof",
      "type": {
        "kind": "struct",
        "fields": [
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
            "name": "leaf",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "BadCosigner",
      "msg": "passed in cosigner doesnt have the rights to do this"
    },
    {
      "code": 6001,
      "name": "MissingVerification",
      "msg": "missing all 3 verification methods: at least one must be present"
    },
    {
      "code": 6002,
      "name": "MissingName",
      "msg": "missing name"
    },
    {
      "code": 6003,
      "name": "BadWhitelist",
      "msg": "bad whitelist"
    },
    {
      "code": 6004,
      "name": "ProofTooLong",
      "msg": "proof provided exceeds the limit of 32 hashes"
    },
    {
      "code": 6005,
      "name": "BadOwner",
      "msg": "passed in owner doesnt have the rights to do this"
    },
    {
      "code": 6006,
      "name": "FailedVocVerification",
      "msg": "failed voc verification"
    },
    {
      "code": 6007,
      "name": "FailedFvcVerification",
      "msg": "failed fvc verification"
    },
    {
      "code": 6008,
      "name": "FailedMerkleProofVerification",
      "msg": "failed merkle proof verification"
    }
  ]
};
