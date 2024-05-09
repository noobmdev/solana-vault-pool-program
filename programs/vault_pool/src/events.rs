use anchor_lang::prelude::*;
use crate::{ Role };

#[event]
pub struct InitializedEvent {
    pub authority: Pubkey,
}

#[event]
pub struct SetRoleEvent {
    pub config_account: Pubkey,
    pub user: Pubkey,
    pub role: Role,
}
