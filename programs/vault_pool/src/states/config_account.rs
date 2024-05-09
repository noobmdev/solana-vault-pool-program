use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct ConfigAccount {
    pub authority: Pubkey,
    pub fee_wallet: Pubkey,
    pub bump: u8
}
