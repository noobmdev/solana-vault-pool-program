use anchor_lang::prelude::*;

use crate::{ 
    ConfigAccount, CustomError, Role, RoleAccount, SetRoleEvent, CONFIG_PDA_SEED, ROLE_PDA_SEED
};


pub fn set_role_handler(ctx: Context<SetRole>, role: Role) -> Result<()> {
    let role_account = &mut ctx.accounts.role_account;

    role_account.config_account = ctx.accounts.config_account.key();
    role_account.user = ctx.accounts.user.key();
    role_account.role = role;
    role_account.bump = ctx.bumps.role_account;

    emit!(SetRoleEvent {
        config_account: ctx.accounts.config_account.key(),
        user: ctx.accounts.user.key(),
        role,
    });
    Ok(())
}


#[derive(Accounts)]
pub struct SetRole<'info> {
    #[account(
        seeds = [CONFIG_PDA_SEED, authority.key().as_ref()],
        bump = config_account.bump,
        has_one = authority @ CustomError::Unauthorized
    )]
    pub config_account: Account<'info, ConfigAccount>,

    #[account(
        init_if_needed,
        payer = authority,
        seeds = [ROLE_PDA_SEED, config_account.key().as_ref(), user.key().as_ref()],
        bump,
        space = 8 + RoleAccount::INIT_SPACE
    )]
    pub role_account: Account<'info, RoleAccount>,

    /// CHECK: This is not dangerous because this account use to write into role_account
    #[account(constraint = user.data_is_empty())]
    pub user: AccountInfo<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
