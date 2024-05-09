import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import * as buffer from "buffer";
import {
	ASSOCIATED_TOKEN_PROGRAM_ID,
	createAssociatedTokenAccountInstruction,
	createCloseAccountInstruction,
	createInitializeMintInstruction,
	createMintToInstruction,
	createSyncNativeInstruction,
	createTransferInstruction,
	getAssociatedTokenAddress,
	getAssociatedTokenAddressSync,
	getOrCreateAssociatedTokenAccount,
	MintLayout,
	NATIVE_MINT,
	TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { getNumberDecimals, randomInt } from "../../sdk/utils";
import * as errors from "./errors";

export function parseError(err: any) {
	const anchorError = anchor.AnchorError.parse(err.logs);
	if (anchorError) {
		// Parse Anchor error into another type such that it's consistent.
		return errors.NativeAnchorError.parse(anchorError);
	}

	const programError = anchor.ProgramError.parse(err, errors.idlErrors);
	if (typeof err == typeof 0 && errors.idlErrors.has(err)) {
		return new errors.NativeAnchorError(
			parseInt(err),
			errors.idlErrors.get(err),
			[],
			[]
		);
	}
	if (programError) {
		return programError;
	}

	let customErr = errors.parseCustomError(err);
	if (customErr != null) {
		return customErr;
	}

	let nativeErr = errors.NativeError.parse(err);
	if (nativeErr != null) {
		return nativeErr;
	}

	if (err.simulationResponse) {
		let simulatedError = anchor.AnchorError.parse(err.simulationResponse.logs);
		if (simulatedError) {
			return errors.NativeAnchorError.parse(simulatedError);
		}
	}

	return err;
}

export async function mockFixtures(connection: anchor.web3.Connection) {
	const authority = anchor.web3.Keypair.generate();

	const admin = anchor.web3.Keypair.generate();
	const operator = anchor.web3.Keypair.generate();
	const buyer = anchor.web3.Keypair.generate();
	const seller = anchor.web3.Keypair.generate();
	const feeWallet = anchor.web3.Keypair.generate();
	const anotherWallet = anchor.web3.Keypair.generate();

	// transfer SOL
	const tx = new anchor.web3.Transaction();
	tx.add(
		anchor.web3.SystemProgram.transfer({
			fromPubkey: anchor.AnchorProvider.env().wallet.publicKey,
			toPubkey: admin.publicKey,
			lamports: anchor.web3.LAMPORTS_PER_SOL * 1,
		}),
		anchor.web3.SystemProgram.transfer({
			fromPubkey: anchor.AnchorProvider.env().wallet.publicKey,
			toPubkey: authority.publicKey,
			lamports: anchor.web3.LAMPORTS_PER_SOL * 1,
		}),
		anchor.web3.SystemProgram.transfer({
			fromPubkey: anchor.AnchorProvider.env().wallet.publicKey,
			toPubkey: operator.publicKey,
			lamports: anchor.web3.LAMPORTS_PER_SOL * 10,
		}),
		anchor.web3.SystemProgram.transfer({
			fromPubkey: anchor.AnchorProvider.env().wallet.publicKey,
			toPubkey: buyer.publicKey,
			lamports: anchor.web3.LAMPORTS_PER_SOL * 10,
		}),
		anchor.web3.SystemProgram.transfer({
			fromPubkey: anchor.AnchorProvider.env().wallet.publicKey,
			toPubkey: seller.publicKey,
			lamports: anchor.web3.LAMPORTS_PER_SOL * 10,
		}),
		anchor.web3.SystemProgram.transfer({
			fromPubkey: anchor.AnchorProvider.env().wallet.publicKey,
			toPubkey: anotherWallet.publicKey,
			lamports: anchor.web3.LAMPORTS_PER_SOL * 1,
		})
	);

	await anchor.AnchorProvider.env().sendAndConfirm(tx);

	const exToken = await createToken(connection, authority, 6);

	const exTokenInfo = await connection.getParsedAccountInfo(exToken);
	const authorityTokenAccount = await mintTo(
		connection,
		authority.publicKey,
		authority,
		exToken,
		1000000
	);
	const buyerTokenAccount = await mintTo(
		connection,
		buyer.publicKey,
		authority,
		exToken,
		1000000
	);
	const sellerTokenAccount = await mintTo(
		connection,
		seller.publicKey,
		authority,
		exToken,
		1000000
	);

	const feeExTokenAccount = await getAssociatedTokenAddress(
		exToken,
		feeWallet.publicKey,
		false,
		exTokenInfo.value.owner
	);

	return {
		authority,
		operator,
		admin,
		seller,
		buyer,
		feeWallet: feeWallet.publicKey,
		anotherWallet,
		exToken,
		authorityTokenAccount,
		buyerTokenAccount,
		sellerTokenAccount,
		feeExTokenAccount,
	};
}

export async function transferSOL(
	connection: anchor.web3.Connection,
	authority: anchor.web3.Keypair,
	to: anchor.web3.PublicKey,
	amount: number
): Promise<void> {
	const tx = new anchor.web3.Transaction();
	tx.add(
		anchor.web3.SystemProgram.transfer({
			fromPubkey: authority.publicKey,
			toPubkey: to,
			lamports: anchor.web3.LAMPORTS_PER_SOL * amount,
		})
	);
	await anchor.web3.sendAndConfirmTransaction(connection, tx, [authority]);
}

export async function transferToken(
	connection: anchor.web3.Connection,
	authority: anchor.web3.Keypair,
	token: anchor.web3.PublicKey,
	to: anchor.web3.PublicKey,
	amount: number
): Promise<void> {
	const tokenInfo = await connection.getParsedAccountInfo(token);
	let sourceAccount = await getOrCreateAssociatedTokenAccount(
		connection,
		authority,
		token,
		authority.publicKey,
		false,
		null,
		null,
		tokenInfo.value.owner
	);

	let destinationAccount = await getOrCreateAssociatedTokenAccount(
		connection,
		authority,
		token,
		to,
		false,
		null,
		null,
		tokenInfo.value.owner
	);

	const numberDecimals = await getNumberDecimals(connection, token);
	const tx = new anchor.web3.Transaction();
	tx.add(
		createTransferInstruction(
			sourceAccount.address,
			destinationAccount.address,
			authority.publicKey,
			amount * Math.pow(10, numberDecimals),
			[],
			tokenInfo.value.owner
		)
	);
	await anchor.web3.sendAndConfirmTransaction(connection, tx, [authority]);
}

export async function createToken(
	connection: anchor.web3.Connection,
	authority: anchor.web3.Keypair,
	decimals: number,
	token_program = TOKEN_PROGRAM_ID
): Promise<anchor.web3.PublicKey> {
	const mintAddress = anchor.web3.Keypair.generate();
	const lamportsForMint = await connection.getMinimumBalanceForRentExemption(
		MintLayout.span
	);
	let tx = new anchor.web3.Transaction();

	// Allocate mint
	tx.add(
		anchor.web3.SystemProgram.createAccount({
			programId: token_program,
			space: MintLayout.span,
			fromPubkey: authority.publicKey,
			newAccountPubkey: mintAddress.publicKey,
			lamports: lamportsForMint,
		})
	);
	// Allocate wallet account
	tx.add(
		createInitializeMintInstruction(
			mintAddress.publicKey,
			decimals,
			authority.publicKey,
			authority.publicKey,
			token_program
		)
	);
	const providerPaidTokenAccount = getAssociatedTokenAddressSync(
		mintAddress.publicKey,
		mintAddress.publicKey,
		false,
		token_program,
		ASSOCIATED_TOKEN_PROGRAM_ID
	);
	tx.add(
		createAssociatedTokenAccountInstruction(
			authority.publicKey,
			providerPaidTokenAccount,
			mintAddress.publicKey,
			mintAddress.publicKey,
			token_program
		)
	);

	await anchor.web3.sendAndConfirmTransaction(connection, tx, [
		authority,
		mintAddress,
	]);
	return mintAddress.publicKey;
}

export async function mintTo(
	connection: anchor.web3.Connection,
	owner: anchor.web3.PublicKey,
	authority: anchor.web3.Keypair,
	mintAddress: anchor.web3.PublicKey,
	amount: number
): Promise<anchor.web3.PublicKey> {
	const tokenInfo = await connection.getParsedAccountInfo(mintAddress);
	const tokenProgram = tokenInfo.value.owner;
	// Create a token account for the user and mint some tokens
	const associatedTokenAccount = await getAssociatedTokenAddress(
		mintAddress,
		owner,
		false,
		tokenProgram,
		ASSOCIATED_TOKEN_PROGRAM_ID
	);
	let tx = new anchor.web3.Transaction();
	const accountInfo = await connection.getAccountInfo(associatedTokenAccount);
	if (!accountInfo || !accountInfo.data) {
		tx.add(
			createAssociatedTokenAccountInstruction(
				authority.publicKey,
				associatedTokenAccount,
				owner,
				mintAddress,
				tokenProgram,
				ASSOCIATED_TOKEN_PROGRAM_ID
			)
		);
	}

	tx.add(
		createMintToInstruction(
			mintAddress,
			associatedTokenAccount,
			authority.publicKey,
			amount * Math.pow(10, await getNumberDecimals(connection, mintAddress)),
			[],
			tokenProgram
		)
	);

	await anchor.web3.sendAndConfirmTransaction(connection, tx, [authority]);
	return associatedTokenAccount;
}

export async function buildInstructionsWrapSol(
	user: PublicKey,
	amount: number
) {
	const instructions: anchor.web3.TransactionInstruction[] = [];
	const associatedTokenAccount = getAssociatedTokenAddressSync(
		NATIVE_MINT,
		user
	);
	instructions.push(
		createAssociatedTokenAccountInstruction(
			user,
			associatedTokenAccount,
			user,
			NATIVE_MINT
		)
	);
	instructions.push(
		anchor.web3.SystemProgram.transfer({
			fromPubkey: user,
			toPubkey: associatedTokenAccount,
			lamports: anchor.web3.LAMPORTS_PER_SOL * amount,
		})
	);
	instructions.push(createSyncNativeInstruction(associatedTokenAccount));
	return instructions;
}

export async function buildInstructionsUnWrapSol(user: PublicKey) {
	const instructions: anchor.web3.TransactionInstruction[] = [];
	const associatedTokenAccount = getAssociatedTokenAddressSync(
		NATIVE_MINT,
		user
	);
	instructions.push(
		createCloseAccountInstruction(associatedTokenAccount, user, user)
	);
	return instructions;
}

export async function getTokenBalance(
	connection: anchor.web3.Connection,
	tokenAccount: anchor.web3.PublicKey
): Promise<anchor.BN> {
	try {
		const tokenBalance = await connection.getTokenAccountBalance(
			tokenAccount,
			"confirmed"
		);
		return new anchor.BN(tokenBalance.value.amount);
	} catch {
		return new anchor.BN(0);
	}
}
