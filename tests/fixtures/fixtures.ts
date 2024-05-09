import * as anchor from "@coral-xyz/anchor";
import VaultPoolSdk from "../../sdk/VaultPool";
import { VaultPool } from "../../target/types/vault_pool";
import { assert } from "chai";
import { mockFixtures } from "./utils";
import { NATIVE_MINT } from "@solana/spl-token";
import { getVaultExTokenAccountPubKey } from "../../sdk/accounts";
import {
	Connection,
	PublicKey,
	Keypair,
	Signer,
	sendAndConfirmTransaction,
} from "@solana/web3.js";

export const getTestLocalContext = async function (): Promise<{
	ctx: VaultPoolSdk;
	authority: Keypair;
	operator: Keypair;
	admin: Keypair;
	seller: Keypair;
	buyer: Keypair;
	feeWallet: PublicKey;
	anotherWallet: Keypair;
	exToken: PublicKey;
	authorityTokenAccount: PublicKey;
	buyerTokenAccount: PublicKey;
	sellerTokenAccount: PublicKey;
	vaultTokenAccount: PublicKey;
	feeExTokenAccount: PublicKey;
}> {
	const programId = require("../../target/idl/vault_pool.json")["metadata"]
		.address;

	let connection = new Connection(
		anchor.AnchorProvider.env().connection.rpcEndpoint,
		"confirmed"
	);
	const {
		authority,
		operator,
		admin,
		seller,
		buyer,
		feeWallet,
		anotherWallet,
		exToken,
		sellerTokenAccount,
		buyerTokenAccount,
		feeExTokenAccount,
		authorityTokenAccount,
	} = await mockFixtures(connection);

	// init context
	const ctx = new VaultPoolSdk(connection, programId);
	await initialize(ctx, authority, feeWallet);

	await setRole(ctx, authority, operator.publicKey, {
		operator: {},
	});
	await setRole(ctx, authority, admin.publicKey, { admin: {} });
	// await setRole(ctx, authority, operator.publicKey, {
	// 	admin: {},
	// });
	// await setRole(ctx, authority, operator.publicKey, {
	// 	operator: {},
	// });

	await ctx.bootstrap(authority.publicKey);

	// await createOtcToken(ctx, operator, otcTokenId, new anchor.BN(10));

	// await setAcceptedToken(ctx, operator, exToken, true);

	// await addExToken(ctx, authority, exToken);

	const vaultTokenAccount = getVaultExTokenAccountPubKey(
		ctx.program,
		ctx.configAccountPubKey,
		exToken
	);

	return {
		ctx: ctx,
		authority,
		operator,
		admin,
		feeWallet,
		seller,
		buyer,
		anotherWallet,
		exToken,
		authorityTokenAccount,
		sellerTokenAccount,
		buyerTokenAccount,
		vaultTokenAccount,
		feeExTokenAccount,
	};
};

export const initialize = async function (
	ctx: VaultPoolSdk,
	authority: Signer,
	feeWallet: PublicKey
): Promise<void> {
	const tx = await ctx.initialize(authority.publicKey, feeWallet);
	await sendAndConfirmTransaction(ctx.connection, tx, [authority], {
		maxRetries: 10,
	});

	await ctx.bootstrap(authority.publicKey);
	const configAccountData = ctx.configAccountData;

	assert(
		configAccountData.authority.equals(authority.publicKey),
		"Invalid authority"
	);
	assert(configAccountData.feeWallet.equals(feeWallet), "Invalid fee wallet");
};

export const setRole = async function (
	ctx: VaultPoolSdk,
	authority: Signer,
	user: PublicKey,
	role: anchor.IdlTypes<VaultPool>["Role"]
): Promise<void> {
	const tx = await ctx.setRole(authority.publicKey, user, role);
	await sendAndConfirmTransaction(ctx.connection, tx, [authority], {
		maxRetries: 10,
	});

	const roleAccountData = await ctx.fetchRoleAccount(user);
	assert(
		roleAccountData.configAccount.equals(ctx.configAccountPubKey),
		"Invalid config account sat in role account"
	);
	assert(roleAccountData.user.equals(user), "Invalid user sat on role account");
	assert(
		JSON.stringify(roleAccountData.role) === JSON.stringify(role),
		"Sat invalid role"
	);
};
