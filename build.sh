#!/bin/bash

# gen new program id
anchor keys list
PROGRAM_ID=$(solana address -k target/deploy/vault_pool-keypair.json)

# Set the file path
FILE_PATH="programs/vault_pool/src/lib.rs"

# Make sure the file exists
if [ ! -f "$FILE_PATH" ]; then
    echo "Error: File not found: $FILE_PATH"
    exit 1
fi

# Replace the existing declare_id! line with the new PROGRAM_ID
if [[ "$OSTYPE" == "darwin"* ]]; then
  # Mac OSX
  sed -i "" "s/declare_id!(\"[^\"]*\")/declare_id!(\"$PROGRAM_ID\")/g" "$FILE_PATH"
else
  # Linux and others
  sed -i "s/declare_id!(\"[^\"]*\")/declare_id!(\"$PROGRAM_ID\")/g" "$FILE_PATH"
fi

# Build the program 
anchor build 

# Copy the artifacts into the sdk
cp target/types/vault_pool.ts sdk/idl


FILE=sdk/idl/vault_pool.ts

sed -i "" "s/export type VaultPool/export type VaultPool/g" "$FILE"
sed -i "" "s/export const IDL: VaultPool/export const IDL: VaultPool/g" "$FILE"