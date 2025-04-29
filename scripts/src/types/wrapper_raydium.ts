export type WrapperRaydium = {
  version: "0.0.0";
  name: "wrapper_raydium";
  instructions: [
    {
      name: "initialize";
      accounts: [
        {
          name: "signer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "wrapperState";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "wrapperStateBump";
          type: "u8";
        }
      ];
    },
    {
      name: "addPoolInfo";
      accounts: [
        {
          name: "signer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "wrapperState";
          isMut: false;
          isSigner: false;
        },
        {
          name: "poolInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "poolInfo";
          type: {
            defined: "PoolInfoParam";
          };
        }
      ];
    },
    {
      name: "updatePoolInfo";
      accounts: [
        {
          name: "signer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "wrapperState";
          isMut: false;
          isSigner: false;
        },
        {
          name: "poolInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "poolInfo";
          type: {
            defined: "PoolInfoParam";
          };
        }
      ];
    },
    {
      name: "swapTokens";
      accounts: [
        {
          name: "signer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "poolId";
          isMut: true;
          isSigner: false;
        },
        {
          name: "poolInfo";
          isMut: false;
          isSigner: false;
        },
        {
          name: "userSourceTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userDestTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "serumProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "raydiumProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "amountIn";
          type: "u64";
        },
        {
          name: "minimumAmountOut";
          type: "u64";
        },
        {
          name: "maximumAmountOut";
          type: "u64";
        }
      ];
    },
    {
      name: "swapTokensBaseIn";
      accounts: [
        {
          name: "signer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "fromPoolId";
          isMut: true;
          isSigner: false;
        },
        {
          name: "fromPoolInfo";
          isMut: false;
          isSigner: false;
        },
        {
          name: "toPoolId";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userSourceTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userMidTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userSwapPdaAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "serumProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "raydiumProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "routeSwapProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "amountIn";
          type: "u64";
        }
      ];
    },
    {
      name: "swapTokensBaseOut";
      accounts: [
        {
          name: "signer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "fromPoolId";
          isMut: true;
          isSigner: false;
        },
        {
          name: "toPoolId";
          isMut: true;
          isSigner: false;
        },
        {
          name: "toPoolInfo";
          isMut: false;
          isSigner: false;
        },
        {
          name: "userMidTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userDestTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userSwapPdaAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "serumProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "raydiumProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "routeSwapProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "minimumAmountOut";
          type: "u64";
        },
        {
          name: "maximumAmountOut";
          type: "u64";
        }
      ];
    }
  ];
  accounts: [
    {
      name: "wrapperState";
      type: {
        kind: "struct";
        fields: [
          {
            name: "authority";
            type: "publicKey";
          }
        ];
      };
    },
    {
      name: "poolInfo";
      type: {
        kind: "struct";
        fields: [
          {
            name: "amm";
            type: "publicKey";
          },
          {
            name: "ammAuthority";
            type: "publicKey";
          },
          {
            name: "ammOpenOrders";
            type: "publicKey";
          },
          {
            name: "ammTargetOrders";
            type: "publicKey";
          },
          {
            name: "poolCoinTokenAccount";
            type: "publicKey";
          },
          {
            name: "poolPcTokenAccount";
            type: "publicKey";
          },
          {
            name: "serumMarket";
            type: "publicKey";
          },
          {
            name: "serumBids";
            type: "publicKey";
          },
          {
            name: "serumAsks";
            type: "publicKey";
          },
          {
            name: "serumEventQue";
            type: "publicKey";
          },
          {
            name: "serumCoinVaultAccount";
            type: "publicKey";
          },
          {
            name: "serumPcVaultAccount";
            type: "publicKey";
          },
          {
            name: "serumVaultSigner";
            type: "publicKey";
          }
        ];
      };
    }
  ];
  types: [
    {
      name: "PoolInfoParam";
      type: {
        kind: "struct";
        fields: [
          {
            name: "amm";
            type: "publicKey";
          },
          {
            name: "ammAuthority";
            type: "publicKey";
          },
          {
            name: "ammOpenOrders";
            type: "publicKey";
          },
          {
            name: "ammTargetOrders";
            type: "publicKey";
          },
          {
            name: "poolCoinTokenAccount";
            type: "publicKey";
          },
          {
            name: "poolPcTokenAccount";
            type: "publicKey";
          },
          {
            name: "serumMarket";
            type: "publicKey";
          },
          {
            name: "serumBids";
            type: "publicKey";
          },
          {
            name: "serumAsks";
            type: "publicKey";
          },
          {
            name: "serumEventQue";
            type: "publicKey";
          },
          {
            name: "serumCoinVaultAccount";
            type: "publicKey";
          },
          {
            name: "serumPcVaultAccount";
            type: "publicKey";
          },
          {
            name: "serumVaultSigner";
            type: "publicKey";
          }
        ];
      };
    },
    {
      name: "AmmInstruction";
      type: {
        kind: "enum";
        variants: [
          {
            name: "Initialize";
            fields: [
              {
                defined: "InitializeInstruction";
              }
            ];
          },
          {
            name: "Reserved";
          },
          {
            name: "Reserved0";
          },
          {
            name: "Deposit";
            fields: [
              {
                defined: "DepositInstruction";
              }
            ];
          },
          {
            name: "Withdraw";
            fields: [
              {
                defined: "WithdrawInstruction";
              }
            ];
          },
          {
            name: "Reserved1";
          },
          {
            name: "Reserved2";
          },
          {
            name: "Reserved3";
          },
          {
            name: "Reserved4";
          },
          {
            name: "SwapBaseIn";
            fields: [
              {
                defined: "SwapInstructionBaseIn";
              }
            ];
          },
          {
            name: "PreInitialize";
            fields: [
              {
                defined: "InitializeInstruction";
              }
            ];
          },
          {
            name: "SwapBaseOut";
            fields: [
              {
                defined: "SwapInstructionBaseOut";
              }
            ];
          },
          {
            name: "Reserved5";
          }
        ];
      };
    },
    {
      name: "RouteSwapInstruction";
      type: {
        kind: "enum";
        variants: [
          {
            name: "RouteSwapIn";
            fields: [
              {
                defined: "RouteSwapInstructionBaseIn";
              }
            ];
          },
          {
            name: "RouteSwapOut";
            fields: [
              {
                defined: "RouteSwapInstructionBaseOut";
              }
            ];
          }
        ];
      };
    }
  ];
  errors: [
    {
      code: 300;
      name: "PriceTooHighError";
      msg: "LimitsStops: price too high";
    }
  ];
};

export const IDL: WrapperRaydium = {
  version: "0.0.0",
  name: "wrapper_raydium",
  instructions: [
    {
      name: "initialize",
      accounts: [
        {
          name: "signer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "wrapperState",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "wrapperStateBump",
          type: "u8",
        },
      ],
    },
    {
      name: "addPoolInfo",
      accounts: [
        {
          name: "signer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "wrapperState",
          isMut: false,
          isSigner: false,
        },
        {
          name: "poolInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "poolInfo",
          type: {
            defined: "PoolInfoParam",
          },
        },
      ],
    },
    {
      name: "updatePoolInfo",
      accounts: [
        {
          name: "signer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "wrapperState",
          isMut: false,
          isSigner: false,
        },
        {
          name: "poolInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "poolInfo",
          type: {
            defined: "PoolInfoParam",
          },
        },
      ],
    },
    {
      name: "swapTokens",
      accounts: [
        {
          name: "signer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "poolId",
          isMut: true,
          isSigner: false,
        },
        {
          name: "poolInfo",
          isMut: false,
          isSigner: false,
        },
        {
          name: "userSourceTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userDestTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "serumProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "raydiumProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amountIn",
          type: "u64",
        },
        {
          name: "minimumAmountOut",
          type: "u64",
        },
        {
          name: "maximumAmountOut",
          type: "u64",
        },
      ],
    },
    {
      name: "swapTokensBaseIn",
      accounts: [
        {
          name: "signer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "fromPoolId",
          isMut: true,
          isSigner: false,
        },
        {
          name: "fromPoolInfo",
          isMut: false,
          isSigner: false,
        },
        {
          name: "toPoolId",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userSourceTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userMidTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userSwapPdaAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "serumProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "raydiumProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "routeSwapProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amountIn",
          type: "u64",
        },
      ],
    },
    {
      name: "swapTokensBaseOut",
      accounts: [
        {
          name: "signer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "fromPoolId",
          isMut: true,
          isSigner: false,
        },
        {
          name: "toPoolId",
          isMut: true,
          isSigner: false,
        },
        {
          name: "toPoolInfo",
          isMut: false,
          isSigner: false,
        },
        {
          name: "userMidTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userDestTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userSwapPdaAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "serumProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "raydiumProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "routeSwapProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "minimumAmountOut",
          type: "u64",
        },
        {
          name: "maximumAmountOut",
          type: "u64",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "wrapperState",
      type: {
        kind: "struct",
        fields: [
          {
            name: "authority",
            type: "publicKey",
          },
        ],
      },
    },
    {
      name: "poolInfo",
      type: {
        kind: "struct",
        fields: [
          {
            name: "amm",
            type: "publicKey",
          },
          {
            name: "ammAuthority",
            type: "publicKey",
          },
          {
            name: "ammOpenOrders",
            type: "publicKey",
          },
          {
            name: "ammTargetOrders",
            type: "publicKey",
          },
          {
            name: "poolCoinTokenAccount",
            type: "publicKey",
          },
          {
            name: "poolPcTokenAccount",
            type: "publicKey",
          },
          {
            name: "serumMarket",
            type: "publicKey",
          },
          {
            name: "serumBids",
            type: "publicKey",
          },
          {
            name: "serumAsks",
            type: "publicKey",
          },
          {
            name: "serumEventQue",
            type: "publicKey",
          },
          {
            name: "serumCoinVaultAccount",
            type: "publicKey",
          },
          {
            name: "serumPcVaultAccount",
            type: "publicKey",
          },
          {
            name: "serumVaultSigner",
            type: "publicKey",
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "PoolInfoParam",
      type: {
        kind: "struct",
        fields: [
          {
            name: "amm",
            type: "publicKey",
          },
          {
            name: "ammAuthority",
            type: "publicKey",
          },
          {
            name: "ammOpenOrders",
            type: "publicKey",
          },
          {
            name: "ammTargetOrders",
            type: "publicKey",
          },
          {
            name: "poolCoinTokenAccount",
            type: "publicKey",
          },
          {
            name: "poolPcTokenAccount",
            type: "publicKey",
          },
          {
            name: "serumMarket",
            type: "publicKey",
          },
          {
            name: "serumBids",
            type: "publicKey",
          },
          {
            name: "serumAsks",
            type: "publicKey",
          },
          {
            name: "serumEventQue",
            type: "publicKey",
          },
          {
            name: "serumCoinVaultAccount",
            type: "publicKey",
          },
          {
            name: "serumPcVaultAccount",
            type: "publicKey",
          },
          {
            name: "serumVaultSigner",
            type: "publicKey",
          },
        ],
      },
    },
    {
      name: "AmmInstruction",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Initialize",
            fields: [
              {
                defined: "InitializeInstruction",
              },
            ],
          },
          {
            name: "Reserved",
          },
          {
            name: "Reserved0",
          },
          {
            name: "Deposit",
            fields: [
              {
                defined: "DepositInstruction",
              },
            ],
          },
          {
            name: "Withdraw",
            fields: [
              {
                defined: "WithdrawInstruction",
              },
            ],
          },
          {
            name: "Reserved1",
          },
          {
            name: "Reserved2",
          },
          {
            name: "Reserved3",
          },
          {
            name: "Reserved4",
          },
          {
            name: "SwapBaseIn",
            fields: [
              {
                defined: "SwapInstructionBaseIn",
              },
            ],
          },
          {
            name: "PreInitialize",
            fields: [
              {
                defined: "InitializeInstruction",
              },
            ],
          },
          {
            name: "SwapBaseOut",
            fields: [
              {
                defined: "SwapInstructionBaseOut",
              },
            ],
          },
          {
            name: "Reserved5",
          },
        ],
      },
    },
    {
      name: "RouteSwapInstruction",
      type: {
        kind: "enum",
        variants: [
          {
            name: "RouteSwapIn",
            fields: [
              {
                defined: "RouteSwapInstructionBaseIn",
              },
            ],
          },
          {
            name: "RouteSwapOut",
            fields: [
              {
                defined: "RouteSwapInstructionBaseOut",
              },
            ],
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 300,
      name: "PriceTooHighError",
      msg: "LimitsStops: price too high",
    },
  ],
};
