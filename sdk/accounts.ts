import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { VaultPool } from "./idl/vault_pool";

const getSeed = (seed: string, program: Program<VaultPool>): Buffer => {
	return Buffer.from(
		// @ts-ignore
		JSON.parse(program.idl.constants.find((c) => c.name === seed)!.value)
	);
};

const toBuffer = (value: anchor.BN, endian?: any, length?: any) => {
	try {
		return value.toBuffer(endian, length);
	} catch (error) {
		return value.toArrayLike(Buffer, endian, length);
	}
};

export const getConfigAccountPubKey = (
	program: Program<VaultPool>,
	configAuthority: PublicKey
) => {
	return anchor.web3.PublicKey.findProgramAddressSync(
		[getSeed("CONFIG_PDA_SEED", program), configAuthority.toBuffer()],
		program.programId
	)[0];
};

export const getRoleAccountPubKey = (
	program: Program<VaultPool>,
	configAccount: PublicKey,
	user: PublicKey
) => {
	return anchor.web3.PublicKey.findProgramAddressSync(
		[
			getSeed("ROLE_PDA_SEED", program),
			configAccount.toBuffer(),
			user.toBuffer(),
		],
		program.programId
	)[0];
};

export const getExTokenAccountPubKey = (
	program: Program<VaultPool>,
	configAccount: PublicKey,
	tokenMint: PublicKey
) => {
	return anchor.web3.PublicKey.findProgramAddressSync(
		[
			getSeed("EX_TOKEN_PDA_SEED", program),
			configAccount.toBuffer(),
			tokenMint.toBuffer(),
		],
		program.programId
	)[0];
};

export const getVaultExTokenAccountPubKey = (
	program: Program<VaultPool>,
	configAccount: PublicKey,
	tokenMint: PublicKey
) => {
	return anchor.web3.PublicKey.findProgramAddressSync(
		[
			getSeed("VAULT_EX_TOKEN_PDA_SEED", program),
			configAccount.toBuffer(),
			tokenMint.toBuffer(),
		],
		program.programId
	)[0];
};

// export const getOfferAccountPubKey = (
// 	program: Program<VaultPool>,
// 	configAccount: PublicKey,
// 	offerId: anchor.BN
// ) => {
// 	return anchor.web3.PublicKey.findProgramAddressSync(
// 		[
// 			getSeed("OFFER_PDA_SEED", program),
// 			configAccount.toBuffer(),
// 			toBuffer(offerId, "be", 8),
// 		],
// 		program.programId
// 	)[0];
// };
