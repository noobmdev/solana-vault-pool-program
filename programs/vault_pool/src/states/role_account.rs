use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct RoleAccount {
    pub config_account: Pubkey,
    pub user: Pubkey,
    pub role: Role,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace, Copy)]
pub enum Role {
    Operator,
    Admin,
}
