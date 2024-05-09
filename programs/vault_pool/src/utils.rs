use anchor_lang::prelude::*;
use anchor_spl::token::TransferChecked;
use anchor_spl::token_2022::TransferChecked as TransferChecked2022;
use anchor_spl::token_interface::{ Mint, TokenInterface };

pub fn transfer_token_to_account<'info>(
    sender: AccountInfo<'info>,
    receiver: AccountInfo<'info>,
    authority: AccountInfo<'info>,
    amount: u64,
    mint: InterfaceAccount<'info, Mint>,
    token_program: Interface<'info, TokenInterface>,
    seeds: Option<&[&[&[u8]]]>
) -> Result<()> {
    if mint.to_account_info().owner.key() == anchor_spl::token::ID {
        let transfer_instruction_account = TransferChecked {
            from: sender.to_account_info(),
            to: receiver.to_account_info(),
            authority: authority.to_account_info(),
            mint: mint.to_account_info(),
        };
        let cpi_ctx;
        match seeds {
            Some(seeds) => {
                cpi_ctx = CpiContext::new_with_signer(
                    token_program.to_account_info(),
                    transfer_instruction_account,
                    seeds
                );
            }
            None => {
                cpi_ctx = CpiContext::new(
                    token_program.to_account_info(),
                    transfer_instruction_account
                );
            }
        }
        anchor_spl::token::transfer_checked(cpi_ctx, amount, mint.decimals)?;
    } else {
        let transfer_instruction_account = TransferChecked2022 {
            from: sender.to_account_info(),
            to: receiver.to_account_info(),
            authority: authority.to_account_info(),
            mint: mint.to_account_info(),
        };
        let cpi_ctx;
        match seeds {
            Some(seeds) => {
                cpi_ctx = CpiContext::new_with_signer(
                    token_program.to_account_info(),
                    transfer_instruction_account,
                    seeds
                );
            }
            None => {
                cpi_ctx = CpiContext::new(
                    token_program.to_account_info(),
                    transfer_instruction_account
                );
            }
        }
        anchor_spl::token_2022::transfer_checked(cpi_ctx, amount, mint.decimals)?;
    }

    Ok(())
}

pub fn create_account<'info>(
    from_pubkey: AccountInfo<'info>,
    to_pubkey: AccountInfo<'info>,
    space: usize,
    signers_seeds: &[&[&[u8]]],
    program: AccountInfo<'info>,
    rent: Sysvar<'info, Rent>
) -> Result<()> {
    let lamports = rent.minimum_balance(space);
    anchor_lang::solana_program::program::invoke_signed(
        &anchor_lang::solana_program::system_instruction::create_account(
            from_pubkey.key,
            to_pubkey.key,
            lamports,
            space as u64,
            &program.key()
        ),
        &[from_pubkey, to_pubkey, program],
        signers_seeds
    )?;
    Ok(())
}

pub fn i64_to_u64(num: i64) -> u64 {
    ((num as u64) ^ (1 << 63)) & (1 << 63) | (num as u64 & (u64::MAX >> 1))
}
