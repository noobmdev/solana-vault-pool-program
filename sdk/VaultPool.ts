import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { BN, BorshCoder, EventParser, web3 } from "@coral-xyz/anchor";
import { VaultPool, IDL } from "./idl/vault_pool";
import {
	getConfigAccountPubKey,
	getRoleAccountPubKey,
	getExTokenAccountPubKey,
	getVaultExTokenAccountPubKey,
} from "./accounts";
import {
	createAssociatedTokenAccountInstruction,
	getAccount,
	getAssociatedTokenAddress,
	getAssociatedTokenAddressSync,
	NATIVE_MINT,
	TOKEN_2022_PROGRAM_ID,
	TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import _ from "lodash";
import { buildInstructionsWrapSol, getNumberDecimals } from "./utils";

export default class VaultPoolSdk {
	public connection: Connection;
	public program: anchor.Program<VaultPool>;

	// @ts-ignore
	public configAccountPubKey: PublicKey;
	// @ts-ignore
	public configAccountData: anchor.IdlAccounts<VaultPool>["configAccount"];

	constructor(connection: Connection, programId: string) {
		this.connection = connection;
		this.program = new anchor.Program(IDL, new PublicKey(programId), {
			connection: this.connection,
		});
	}

	async bootstrap(authority: PublicKey) {
		this.configAccountPubKey = getConfigAccountPubKey(this.program, authority);
		await this.fetchConfigAccount(this.configAccountPubKey);
	}

	async fetchConfigAccount(
		configAccountPubKey: PublicKey,
		commitment?: anchor.web3.Commitment
	): Promise<anchor.IdlAccounts<VaultPool>["configAccount"]> {
		this.configAccountData = await this.program.account.configAccount.fetch(
			configAccountPubKey,
			commitment
		);
		return this.configAccountData;
	}

	async fetchRoleAccount(
		user: PublicKey,
		configAccountPubKey?: PublicKey
	): Promise<anchor.IdlAccounts<VaultPool>["roleAccount"]> {
		const configAccount = configAccountPubKey ?? this.configAccountPubKey;
		if (!configAccount) {
			throw new Error(`Config Account not found`);
		}
		const roleAccount = getRoleAccountPubKey(
			this.program,
			this.configAccountPubKey,
			user
		);
		return await this.program.account.roleAccount.fetch(
			roleAccount,
			"confirmed"
		);
	}

	fetchExTokenAccount(
		token: PublicKey
	): Promise<anchor.IdlAccounts<VaultPool>["exTokenAccount"]> {
		return this.program.account.exTokenAccount.fetch(
			getExTokenAccountPubKey(this.program, this.configAccountPubKey, token)
		);
	}

	initialize(signer: PublicKey, feeWallet: PublicKey): Promise<Transaction> {
		if (this.configAccountPubKey) {
			throw new Error("Config account already exists");
		}
		this.configAccountPubKey = getConfigAccountPubKey(this.program, signer);
		return this.program.methods
			.initialize()
			.accounts({
				configAccount: this.configAccountPubKey,
				authority: signer,
				feeWallet: feeWallet,
			})
			.transaction();
	}

	setRole(
		signer: PublicKey,
		user: PublicKey,
		role: anchor.IdlTypes<VaultPool>["Role"]
	): Promise<Transaction> {
		this.configAccountPubKey = getConfigAccountPubKey(this.program, signer);
		const roleAccount = getRoleAccountPubKey(
			this.program,
			this.configAccountPubKey,
			user
		);
		return this.program.methods
			.setRole(role)
			.accounts({
				configAccount: this.configAccountPubKey,
				roleAccount: roleAccount,
				user: user,
				authority: signer,
			})
			.transaction();
	}

	async addExToken(signer: PublicKey, exToken: PublicKey) {
		const exTokenAccountPubkey = getExTokenAccountPubKey(
			this.program,
			this.configAccountPubKey,
			exToken
		);
		const vaultExTokenAccountPubkey = getVaultExTokenAccountPubKey(
			this.program,
			this.configAccountPubKey,
			exToken
		);

		const exTokenInfo = await this.connection.getParsedAccountInfo(exToken);

		return this.program.methods
			.addExToken()
			.accounts({
				configAccount: this.configAccountPubKey,
				exTokenAccount: exTokenAccountPubkey,
				vaultExTokenAccount: vaultExTokenAccountPubkey,
				mint: exToken,
				authority: signer,
				tokenProgram: exTokenInfo.value.owner,
			})
			.transaction();
	}

	async deposit(
		user: PublicKey,
		exToken: PublicKey,
		amount: BN
	): Promise<Transaction> {
		const exTokenAccountPubkey = getExTokenAccountPubKey(
			this.program,
			this.configAccountPubKey,
			exToken
		);
		const vaultExTokenAccountPubkey = getVaultExTokenAccountPubKey(
			this.program,
			this.configAccountPubKey,
			exToken
		);

		const exTokenInfo = await this.connection.getParsedAccountInfo(exToken);

		const userExTokenAccountPubkey = await getAssociatedTokenAddress(
			exToken,
			user,
			false,
			exTokenInfo.value.owner
		);

		return this.program.methods
			.deposit(amount)
			.accounts({
				configAccount: this.configAccountPubKey,
				exTokenAccount: exTokenAccountPubkey,
				vaultExTokenAccount: vaultExTokenAccountPubkey,
				userExTokenAccount: userExTokenAccountPubkey,
				exToken,
				user,
				authority: this.configAccountData.authority,
				tokenProgram: exTokenInfo.value.owner,
			})
			.transaction();
	}

	async withdraw(
		user: PublicKey,
		exToken: PublicKey,
		amount: BN
	): Promise<Transaction> {
		const exTokenAccountPubkey = getExTokenAccountPubKey(
			this.program,
			this.configAccountPubKey,
			exToken
		);
		const vaultExTokenAccountPubkey = getVaultExTokenAccountPubKey(
			this.program,
			this.configAccountPubKey,
			exToken
		);

		const exTokenInfo = await this.connection.getParsedAccountInfo(exToken);

		const userExTokenAccountPubkey = await getAssociatedTokenAddress(
			exToken,
			user,
			false,
			exTokenInfo.value.owner
		);

		return this.program.methods
			.withdraw(amount)
			.accounts({
				configAccount: this.configAccountPubKey,
				exTokenAccount: exTokenAccountPubkey,
				vaultExTokenAccount: vaultExTokenAccountPubkey,
				userExTokenAccount: userExTokenAccountPubkey,
				exToken,
				user,
				authority: this.configAccountData.authority,
				tokenProgram: exTokenInfo.value.owner,
			})
			.transaction();
	}
}
