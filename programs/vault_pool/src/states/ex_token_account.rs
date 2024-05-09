use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct ExTokenAccount {
    pub token: Pubkey,
    pub vault_token: Pubkey,
    pub amount: u64,
    pub bump: u8,
    pub vault_bump: u8,
    pub config_account: Pubkey,
}
