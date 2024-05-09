use anchor_lang::prelude::*;
use anchor_spl::token_interface::{ Mint, TokenAccount, TokenInterface };
use crate::utils::transfer_token_to_account;

use crate::{
    ConfigAccount,
    ExTokenAccount,
    CONFIG_PDA_SEED,
    EX_TOKEN_PDA_SEED,
    VAULT_EX_TOKEN_PDA_SEED,
};

pub fn deposit_handler(
    ctx: Context<Deposit>,
    amount: u64,
) -> Result<()> {
    transfer_token_to_account(
        ctx.accounts.user_ex_token_account.to_account_info(),
        ctx.accounts.vault_ex_token_account.to_account_info(),
        ctx.accounts.user.to_account_info(),
        amount,
        ctx.accounts.ex_token.clone(),
        ctx.accounts.token_program.clone(),
        None
    )?;

    let ex_token_account = &mut ctx.accounts.ex_token_account;
    ex_token_account.amount += amount;

    Ok(())
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(
        mut,
        seeds = [CONFIG_PDA_SEED, authority.key().as_ref()],
        bump = config_account.bump,
    )]
    pub config_account: Account<'info, ConfigAccount>,

    #[account(
        mut,
        seeds = [EX_TOKEN_PDA_SEED, config_account.key().as_ref(), ex_token.key().as_ref()],
        bump = ex_token_account.bump,
    )]
    pub ex_token_account: Account<'info, ExTokenAccount>,

    #[account(
        mut,
        seeds = [VAULT_EX_TOKEN_PDA_SEED, config_account.key().as_ref(), ex_token.key().as_ref()],
        bump = ex_token_account.vault_bump,
        token::mint = ex_token,
        token::authority = config_account,
        token::token_program = token_program
    )]
    pub vault_ex_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = ex_token,
        token::authority = user,
        token::token_program = token_program,
    )]
    pub user_ex_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(mint::token_program = token_program)]
    pub ex_token: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub authority: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
}