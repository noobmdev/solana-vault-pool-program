export type VaultPool = {
  "version": "0.1.0",
  "name": "vault_pool",
  "constants": [
    {
      "name": "CONFIG_PDA_SEED",
      "type": "bytes",
      "value": "[67, 79, 78, 70, 73, 71, 95, 80, 68, 65, 95, 83, 69, 69, 68]"
    },
    {
      "name": "ROLE_PDA_SEED",
      "type": "bytes",
      "value": "[82, 79, 76, 69, 95, 80, 68, 65, 95, 83, 69, 69, 68]"
    },
    {
      "name": "EX_TOKEN_PDA_SEED",
      "type": "bytes",
      "value": "[69, 88, 95, 84, 79, 75, 69, 78, 95, 80, 68, 65, 95, 83, 69, 69, 68]"
    },
    {
      "name": "VAULT_EX_TOKEN_PDA_SEED",
      "type": "bytes",
      "value": "[86, 65, 85, 76, 84, 95, 69, 88, 95, 84, 79, 75, 69, 78, 95, 80, 68, 65, 95, 83, 69, 69, 68]"
    }
  ],
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "configAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeWallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
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
      "name": "setRole",
      "accounts": [
        {
          "name": "configAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "roleAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
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
      "args": [
        {
          "name": "role",
          "type": {
            "defined": "Role"
          }
        }
      ]
    },
    {
      "name": "addExToken",
      "accounts": [
        {
          "name": "configAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
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
      "name": "deposit",
      "accounts": [
        {
          "name": "configAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
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
      "name": "withdraw",
      "accounts": [
        {
          "name": "configAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
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
    }
  ],
  "accounts": [
    {
      "name": "configAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "feeWallet",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "exTokenAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "token",
            "type": "publicKey"
          },
          {
            "name": "vaultToken",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "vaultBump",
            "type": "u8"
          },
          {
            "name": "configAccount",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "roleAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "configAccount",
            "type": "publicKey"
          },
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "role",
            "type": {
              "defined": "Role"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Role",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Operator"
          },
          {
            "name": "Admin"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "InitializedEvent",
      "fields": [
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "SetRoleEvent",
      "fields": [
        {
          "name": "configAccount",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "role",
          "type": {
            "defined": "Role"
          },
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "Initialized",
      "msg": "Initialized"
    },
    {
      "code": 6001,
      "name": "Unauthorized",
      "msg": "Unauthorized"
    }
  ]
};

export const IDL: VaultPool = {
  "version": "0.1.0",
  "name": "vault_pool",
  "constants": [
    {
      "name": "CONFIG_PDA_SEED",
      "type": "bytes",
      "value": "[67, 79, 78, 70, 73, 71, 95, 80, 68, 65, 95, 83, 69, 69, 68]"
    },
    {
      "name": "ROLE_PDA_SEED",
      "type": "bytes",
      "value": "[82, 79, 76, 69, 95, 80, 68, 65, 95, 83, 69, 69, 68]"
    },
    {
      "name": "EX_TOKEN_PDA_SEED",
      "type": "bytes",
      "value": "[69, 88, 95, 84, 79, 75, 69, 78, 95, 80, 68, 65, 95, 83, 69, 69, 68]"
    },
    {
      "name": "VAULT_EX_TOKEN_PDA_SEED",
      "type": "bytes",
      "value": "[86, 65, 85, 76, 84, 95, 69, 88, 95, 84, 79, 75, 69, 78, 95, 80, 68, 65, 95, 83, 69, 69, 68]"
    }
  ],
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "configAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeWallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
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
      "name": "setRole",
      "accounts": [
        {
          "name": "configAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "roleAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
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
      "args": [
        {
          "name": "role",
          "type": {
            "defined": "Role"
          }
        }
      ]
    },
    {
      "name": "addExToken",
      "accounts": [
        {
          "name": "configAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
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
      "name": "deposit",
      "accounts": [
        {
          "name": "configAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
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
      "name": "withdraw",
      "accounts": [
        {
          "name": "configAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userExTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
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
    }
  ],
  "accounts": [
    {
      "name": "configAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "feeWallet",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "exTokenAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "token",
            "type": "publicKey"
          },
          {
            "name": "vaultToken",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "vaultBump",
            "type": "u8"
          },
          {
            "name": "configAccount",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "roleAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "configAccount",
            "type": "publicKey"
          },
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "role",
            "type": {
              "defined": "Role"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Role",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Operator"
          },
          {
            "name": "Admin"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "InitializedEvent",
      "fields": [
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "SetRoleEvent",
      "fields": [
        {
          "name": "configAccount",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "role",
          "type": {
            "defined": "Role"
          },
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "Initialized",
      "msg": "Initialized"
    },
    {
      "code": 6001,
      "name": "Unauthorized",
      "msg": "Unauthorized"
    }
  ]
};
