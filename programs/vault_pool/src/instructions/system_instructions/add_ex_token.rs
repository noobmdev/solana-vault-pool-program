use anchor_lang::prelude::*;
use anchor_spl::token_interface::{ TokenInterface, Mint, TokenAccount };

use crate::{ 
    ConfigAccount,
    ExTokenAccount,
    CONFIG_PDA_SEED,
    EX_TOKEN_PDA_SEED,
    VAULT_EX_TOKEN_PDA_SEED
};

pub fn add_ex_token_handler(ctx: Context<AddExToken>) -> Result<()> {
    let ex_token_account = &mut ctx.accounts.ex_token_account;

    ex_token_account.token = ctx.accounts.mint.key();
    ex_token_account.vault_token = ctx.accounts.vault_ex_token_account.key();
    ex_token_account.amount = 0;
    ex_token_account.bump = ctx.bumps.ex_token_account;
    ex_token_account.vault_bump = ctx.bumps.vault_ex_token_account;

    Ok(())
}

#[derive(Accounts)]
pub struct AddExToken<'info> {
    #[account(
        mut,
        seeds = [CONFIG_PDA_SEED, authority.key().as_ref()],
        bump = config_account.bump,
    )]
    pub config_account: Account<'info, ConfigAccount>,

    #[account(
        init_if_needed,
        payer = authority,
        seeds = [EX_TOKEN_PDA_SEED, config_account.key().as_ref(), mint.key().as_ref()],
        bump,
        space = 8 + ExTokenAccount::INIT_SPACE
    )]
    pub ex_token_account: Account<'info, ExTokenAccount>,

    #[account(
        init_if_needed,
        payer = authority,
        seeds = [VAULT_EX_TOKEN_PDA_SEED, config_account.key().as_ref(), mint.key().as_ref()],
        bump,
        token::mint = mint,
        token::authority = config_account,
        token::token_program = token_program
    )]
    pub vault_ex_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(mint::token_program = token_program)]
    pub mint: InterfaceAccount<'info, Mint>,
    
    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub rent: Sysvar<'info, Rent>,
}