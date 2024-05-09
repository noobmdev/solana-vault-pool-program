import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { VaultPool } from "../target/types/vault_pool";
import VaultPoolSdk from "../sdk/VaultPool";
import { getTestLocalContext } from "./fixtures/fixtures";
import { getTokenBalance, parseError } from "./fixtures/utils";
import { assert } from "chai";

describe("Vault Pool testing", () => {
	// Configure the client to use the local cluster.
	anchor.setProvider(anchor.AnchorProvider.env());

	let ctx: VaultPoolSdk;
	let authority: anchor.web3.Keypair;
	let operator: anchor.web3.Keypair;
	let admin: anchor.web3.Keypair;
	let seller: anchor.web3.Keypair;
	let feeWallet: anchor.web3.PublicKey;
	let anotherWallet: anchor.web3.Keypair;
	let exToken: anchor.web3.PublicKey;
	let authorityTokenAccount: anchor.web3.PublicKey;
	let sellerTokenAccount: anchor.web3.PublicKey;
	let vaultTokenAccount: anchor.web3.PublicKey;
	let feeExTokenAccount: anchor.web3.PublicKey;

	const program = anchor.workspace.VaultPool as Program<VaultPool>;

	beforeEach(async () => {
		const data = await getTestLocalContext();
		ctx = data.ctx;
		authority = data.authority;
		operator = data.operator;
		admin = data.admin;
		feeWallet = data.feeWallet;
		anotherWallet = data.anotherWallet;
		exToken = data.exToken;
		seller = data.seller;
		authorityTokenAccount = data.authorityTokenAccount;
		sellerTokenAccount = data.sellerTokenAccount;
		vaultTokenAccount = data.vaultTokenAccount;
		feeExTokenAccount = data.feeExTokenAccount;
	});

	it("Add ex token", async () => {
		// add ex token
		const tx = await ctx.addExToken(authority.publicKey, exToken);
		await anchor.web3.sendAndConfirmTransaction(
			ctx.connection,
			tx,
			[authority],
			{
				maxRetries: 10,
			}
		);

		await ctx.bootstrap(authority.publicKey);
		const exTokenAccountData = await ctx.fetchExTokenAccount(exToken);
		assert(exTokenAccountData.token.equals(exToken));
		assert(exTokenAccountData.vaultToken.equals(vaultTokenAccount));
		assert(exTokenAccountData.amount.eq(new anchor.BN(0)));
	});

	it("Deposit ex token", async () => {
		// add ex token
		const addExTokenTx = await ctx.addExToken(authority.publicKey, exToken);
		await anchor.web3.sendAndConfirmTransaction(
			ctx.connection,
			addExTokenTx,
			[authority],
			{
				maxRetries: 10,
			}
		);

		// get pre-balance of ex token
		const [preExTokenBalance, preVaultTokenBalance] = await Promise.all([
			getTokenBalance(ctx.connection, sellerTokenAccount),
			getTokenBalance(ctx.connection, vaultTokenAccount),
		]);

		// deposit ex token
		const depositAmount = new anchor.BN(1000);
		const depositTx = await ctx.deposit(
			seller.publicKey,
			exToken,
			depositAmount
		);
		await anchor.web3.sendAndConfirmTransaction(
			ctx.connection,
			depositTx,
			[seller],
			{
				maxRetries: 10,
			}
		);

		const exTokenAccount = await ctx.fetchExTokenAccount(exToken);
		assert(exTokenAccount.amount.eq(depositAmount));

		const [postExTokenBalance, postVaultTokenBalance] = await Promise.all([
			getTokenBalance(ctx.connection, sellerTokenAccount),
			getTokenBalance(ctx.connection, vaultTokenAccount),
		]);
		assert(preExTokenBalance.eq(postExTokenBalance.add(depositAmount)));
		assert(preVaultTokenBalance.eq(postVaultTokenBalance.sub(depositAmount)));
	});

	it("Withdraw ex token", async () => {
		// add ex token
		const addExTokenTx = await ctx.addExToken(authority.publicKey, exToken);
		await anchor.web3.sendAndConfirmTransaction(
			ctx.connection,
			addExTokenTx,
			[authority],
			{
				maxRetries: 10,
			}
		);

		// get pre-balance of ex token
		const [preDepositExTokenBalance, preDepositVaultTokenBalance] =
			await Promise.all([
				getTokenBalance(ctx.connection, sellerTokenAccount),
				getTokenBalance(ctx.connection, vaultTokenAccount),
			]);

		// deposit ex token
		const depositAmount = new anchor.BN(1000);
		const depositTx = await ctx.deposit(
			seller.publicKey,
			exToken,
			depositAmount
		);
		await anchor.web3.sendAndConfirmTransaction(
			ctx.connection,
			depositTx,
			[seller],
			{
				maxRetries: 10,
			}
		);

		// check ex token after deposit
		const exTokenAccount = await ctx.fetchExTokenAccount(exToken);
		assert(exTokenAccount.amount.eq(depositAmount));

		const [postDepositExTokenBalance, postDepositVaultTokenBalance] =
			await Promise.all([
				getTokenBalance(ctx.connection, sellerTokenAccount),
				getTokenBalance(ctx.connection, vaultTokenAccount),
			]);
		assert(
			preDepositExTokenBalance.eq(postDepositExTokenBalance.add(depositAmount))
		);
		assert(
			preDepositVaultTokenBalance.eq(
				postDepositVaultTokenBalance.sub(depositAmount)
			)
		);

		// withdraw ex token
		const withdrawAmount = new anchor.BN(500);
		const withdrawTx = await ctx.withdraw(
			seller.publicKey,
			exToken,
			withdrawAmount
		);
		await anchor.web3.sendAndConfirmTransaction(
			ctx.connection,
			withdrawTx,
			[seller],
			{
				maxRetries: 10,
			}
		);

		// check ex token balance after withdraw
		const [postWithdrawExTokenBalance, postWithdrawVaultTokenBalance] =
			await Promise.all([
				getTokenBalance(ctx.connection, sellerTokenAccount),
				getTokenBalance(ctx.connection, vaultTokenAccount),
			]);

		assert(
			postWithdrawExTokenBalance.eq(
				postDepositExTokenBalance.add(withdrawAmount)
			)
		);
		assert(
			postWithdrawVaultTokenBalance.eq(
				postDepositVaultTokenBalance.sub(withdrawAmount)
			)
		);
	});
});
