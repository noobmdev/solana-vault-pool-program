use anchor_lang::prelude::*;

use crate::{ 
    ConfigAccount, InitializedEvent, CONFIG_PDA_SEED
};

pub fn initialize_handler(ctx: Context<Initialize>) -> Result<()> {
    let config_account = &mut ctx.accounts.config_account;

    config_account.bump = ctx.bumps.config_account;
    config_account.authority = ctx.accounts.authority.key();
    config_account.fee_wallet = ctx.accounts.fee_wallet.key();

    emit!(InitializedEvent {
        authority: ctx.accounts.authority.key(),
    });

    Ok(())
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        seeds = [CONFIG_PDA_SEED, authority.key().as_ref()],
        bump,
        space = 8 + ConfigAccount::INIT_SPACE
    )]
    pub config_account: Account<'info, ConfigAccount>,
    
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(constraint = fee_wallet.data_is_empty())]
    pub fee_wallet: AccountInfo<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}