use anchor_lang::prelude::*;

pub mod states;
pub mod constants;
pub mod errors;
pub mod events;
pub mod utils;
pub mod instructions;

pub use states::*;
pub use constants::*;
pub use errors::*;
pub use events::*;
pub use utils::*;
pub use instructions::*;

declare_id!("7fhJ2K7sem2rZLXchD1JM65k1M2ytisYn8xvgeN6LHEP");

#[program]
pub mod vault_pool {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        system_instructions::initialize_handler(ctx)
    }

    pub fn set_role(ctx: Context<SetRole>, role: Role) -> Result<()> {
        system_instructions::set_role_handler(ctx, role)
    }

    pub fn add_ex_token(ctx: Context<AddExToken>) -> Result<()> {
        system_instructions::add_ex_token_handler(ctx)
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        user_instructions::deposit_handler(ctx, amount)
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        user_instructions::withdraw_handler(ctx, amount)
    }
}