use anchor_lang::prelude::*;
use solana_program::{
    system_program,
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    program_error::ProgramError,
    pubkey::Pubkey,
    rent::Rent,
    sysvar::Sysvar,
};

declare_id!("AJjyLsVoEfhz7ds1ZM9RU44Zkf6bNakFC86PxXM4B7kT");

#[program]
pub mod whirlpool {
    use std::convert::TryFrom;
    use super::*;

    pub fn create_pool(ctx: Context<CreatePool>, bump: u8, name: String, description: String) -> ProgramResult {
        let pool = &mut ctx.accounts.pool_account;
        let admin = &ctx.accounts.admin;

        // require!(name.bytes().len() > 30, ArgumentValidationError::NameTooLarge);
        // require!(description.bytes().len() > 200, ArgumentValidationError::DescriptionTooLarge);

        pool.name = name;
        pool.description = description;
        pool.admin = <[u8; 32]>::try_from(admin.key.as_ref()).unwrap();
        pool.bump = bump;

        let pda = <[u8; 32]>::try_from(pool.to_account_info().key.as_ref()).unwrap();

        msg!("pool created with PDA {}", hex::encode(pda));
        msg!("pool created with name {}", pool.name);
        msg!("pool created with description {}", pool.description);
        msg!("pool created with admin {}", hex::encode(pool.admin));
        msg!("pool created with bump {}", pool.bump);

        Ok(())
    }

    pub fn update_pool(ctx: Context<UpdatePool>, name: String, description: String) -> ProgramResult {
        let pool = &mut ctx.accounts.pool_account;

        // require!(name.bytes().len() > 30, ArgumentValidationError::NameTooLarge);
        // require!(description.bytes().len() > 200, ArgumentValidationError::DescriptionTooLarge);

        if name != pool.name {
            pool.name = name;
        }

        if description != pool.description {
            pool.description = description;
        }

        let pool_program_address = Pubkey::create_program_address(&[b"pool-account", &[pool.bump]], ctx.program_id);

        msg!("pool created with PDA {}", pool_program_address.unwrap_or_default());
        msg!("pool updated with name {}", pool.name);
        msg!("pool updated with description {}", pool.description);
        msg!("pool updated with bump {}", pool.bump);

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(bump:u8)]
pub struct CreatePool<'info> {
    pub admin: AccountInfo<'info>,
    #[account(
        init,
        payer=admin,
        space=8 + 30 + 100 + 1,
        seeds=[b"pool-account", admin.key.as_ref()],
        bump=bump
    )]
    pub pool_account: Account<'info, Pool>,
    #[account(address=system_program::ID)]
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdatePool<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut, seeds=[b"pool-account", authority.key().as_ref()], bump=pool_account.bump)]
    pub pool_account: Account<'info, Pool>,
    #[account(address=system_program::ID)]
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Pool {
    pub name: String,
    pub description: String,
    pub admin: [u8; 32],
    pub bump: u8
}

// #[error_code]
// pub enum ArgumentValidationError {
//     #[msg("Name may not be greater than 30 bytes")]
//     NameTooLarge,
//     #[msg("Description may not be greater than 100 bytes")]
//     DescriptionTooLarge
// }
