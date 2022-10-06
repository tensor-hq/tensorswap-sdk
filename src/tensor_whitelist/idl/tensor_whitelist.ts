export type TensorWhitelist = {
  "version": "0.1.0",
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
        }
      ]
    },
    {
      "name": "initUpdateWhitelist",
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
            "and we're checking that 1)the correct owner is present on it, and 2)is a signer"
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
            "name": "owner",
            "type": "publicKey"
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
  "errors": [
    {
      "code": 6000,
      "name": "BadOwner",
      "msg": "passed in owner doesnt have the rights to do this"
    },
    {
      "code": 6001,
      "name": "MissingRootHash",
      "msg": "missing root hash"
    },
    {
      "code": 6002,
      "name": "MissingName",
      "msg": "missing name"
    },
    {
      "code": 6003,
      "name": "InvalidProof",
      "msg": "invalid merkle proof, token not whitelisted"
    },
    {
      "code": 6004,
      "name": "ProofTooLong",
      "msg": "proof provided exceeds the limit of 32 hashes"
    }
  ]
};

export const IDL: TensorWhitelist = {
  "version": "0.1.0",
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
        }
      ]
    },
    {
      "name": "initUpdateWhitelist",
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
            "and we're checking that 1)the correct owner is present on it, and 2)is a signer"
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
            "name": "owner",
            "type": "publicKey"
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
  "errors": [
    {
      "code": 6000,
      "name": "BadOwner",
      "msg": "passed in owner doesnt have the rights to do this"
    },
    {
      "code": 6001,
      "name": "MissingRootHash",
      "msg": "missing root hash"
    },
    {
      "code": 6002,
      "name": "MissingName",
      "msg": "missing name"
    },
    {
      "code": 6003,
      "name": "InvalidProof",
      "msg": "invalid merkle proof, token not whitelisted"
    },
    {
      "code": 6004,
      "name": "ProofTooLong",
      "msg": "proof provided exceeds the limit of 32 hashes"
    }
  ]
};
