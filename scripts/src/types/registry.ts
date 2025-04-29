export type Registry = {
  "version": "0.0.0",
  "name": "registry",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalState",
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
          "name": "globalStateBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "setExecutionAuthority",
      "accounts": [
        {
          "name": "mainAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalState",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "globalStateBump",
          "type": "u8"
        },
        {
          "name": "executionAuthority",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "registerExecution",
      "accounts": [
        {
          "name": "register",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "registerState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "registerRequest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "transaction",
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
          "name": "registerStateBump",
          "type": "u8"
        },
        {
          "name": "pid",
          "type": "publicKey"
        },
        {
          "name": "accs",
          "type": {
            "vec": {
              "defined": "TransactionAccount"
            }
          }
        },
        {
          "name": "data",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "execute",
      "accounts": [
        {
          "name": "executionAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "register",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "registerRequest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "transaction",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fees",
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
          "name": "globalStateBump",
          "type": "u8"
        },
        {
          "name": "registerRequestBump",
          "type": "u8"
        },
        {
          "name": "requestId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "cancel",
      "accounts": [
        {
          "name": "register",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "registerRequest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "transaction",
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
        }
      ],
      "args": [
        {
          "name": "registerRequestBump",
          "type": "u8"
        },
        {
          "name": "requestId",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "globalState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mainAuthority",
            "type": "publicKey"
          },
          {
            "name": "executionAuthority",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "registerState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nextRequestId",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "registerRequest",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "transaction",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "transaction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "programId",
            "type": "publicKey"
          },
          {
            "name": "accounts",
            "type": {
              "vec": {
                "defined": "TransactionAccount"
              }
            }
          },
          {
            "name": "data",
            "type": "bytes"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "TransactionAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pubkey",
            "type": "publicKey"
          },
          {
            "name": "isSigner",
            "type": "bool"
          },
          {
            "name": "isWritable",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "Register",
      "fields": [
        {
          "name": "register",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "requestId",
          "type": "u64",
          "index": false
        },
        {
          "name": "programId",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "accounts",
          "type": {
            "vec": {
              "defined": "TransactionAccount"
            }
          },
          "index": false
        }
      ]
    }
  ]
};

export const IDL: Registry = {
  "version": "0.0.0",
  "name": "registry",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalState",
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
          "name": "globalStateBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "setExecutionAuthority",
      "accounts": [
        {
          "name": "mainAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalState",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "globalStateBump",
          "type": "u8"
        },
        {
          "name": "executionAuthority",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "registerExecution",
      "accounts": [
        {
          "name": "register",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "registerState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "registerRequest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "transaction",
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
          "name": "registerStateBump",
          "type": "u8"
        },
        {
          "name": "pid",
          "type": "publicKey"
        },
        {
          "name": "accs",
          "type": {
            "vec": {
              "defined": "TransactionAccount"
            }
          }
        },
        {
          "name": "data",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "execute",
      "accounts": [
        {
          "name": "executionAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "register",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "registerRequest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "transaction",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fees",
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
          "name": "globalStateBump",
          "type": "u8"
        },
        {
          "name": "registerRequestBump",
          "type": "u8"
        },
        {
          "name": "requestId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "cancel",
      "accounts": [
        {
          "name": "register",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "registerRequest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "transaction",
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
        }
      ],
      "args": [
        {
          "name": "registerRequestBump",
          "type": "u8"
        },
        {
          "name": "requestId",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "globalState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mainAuthority",
            "type": "publicKey"
          },
          {
            "name": "executionAuthority",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "registerState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nextRequestId",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "registerRequest",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "transaction",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "transaction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "programId",
            "type": "publicKey"
          },
          {
            "name": "accounts",
            "type": {
              "vec": {
                "defined": "TransactionAccount"
              }
            }
          },
          {
            "name": "data",
            "type": "bytes"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "TransactionAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pubkey",
            "type": "publicKey"
          },
          {
            "name": "isSigner",
            "type": "bool"
          },
          {
            "name": "isWritable",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "Register",
      "fields": [
        {
          "name": "register",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "requestId",
          "type": "u64",
          "index": false
        },
        {
          "name": "programId",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "accounts",
          "type": {
            "vec": {
              "defined": "TransactionAccount"
            }
          },
          "index": false
        }
      ]
    }
  ]
};
