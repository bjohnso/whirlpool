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
        let pool_account = &mut ctx.accounts.pool_account;
        let admin_account = &ctx.accounts.admin;

        pool_account.name = name;
        pool_account.description = description;
        pool_account.admin = <[u8; 32]>::try_from(admin_account.key.as_ref()).unwrap();
        pool_account.bump = bump;

        let pda = <[u8; 32]>::try_from(pool_account.to_account_info().key.as_ref()).unwrap();

        msg!("pool created with PDA {}", hex::encode(pda));
        msg!("pool created with name {}", pool_account.name);
        msg!("pool created with description {}", pool_account.description);
        msg!("pool created by admin {}", hex::encode(pool_account.admin));
        msg!("pool created with bump {}", pool_account.bump);

        Ok(())
    }

    pub fn update_pool(ctx: Context<UpdatePool>, bump: u8, name: String, description: String) -> ProgramResult {
        let admin_account = &ctx.accounts.admin;
        let pool_account = &mut ctx.accounts.pool_account;

        if name != pool_account.name {
            pool_account.name = name;
        }

        if description != pool_account.description {
            pool_account.description = description;
        }

        let admin = <[u8; 32]>::try_from(admin_account.to_account_info().key.as_ref()).unwrap();
        let pda = <[u8; 32]>::try_from(pool_account.key().as_ref()).unwrap();

        msg!("pool updated with PDA {}", hex::encode(pda));
        msg!("pool updated with name {}", pool_account.name);
        msg!("pool updated with description {}", pool_account.description);
        msg!("pool updated by admin {}", hex::encode(admin));
        msg!("pool updated with bump {}", bump);

        Ok(())
    }

    pub fn read_pool(ctx: Context<ReadPool>, bump: u8) -> ProgramResult {
        let admin_account = &ctx.accounts.admin;
        let pool_account = &mut ctx.accounts.pool_account;

        let admin = <[u8; 32]>::try_from(admin_account.to_account_info().key.as_ref()).unwrap();
        let pda = <[u8; 32]>::try_from(pool_account.key().as_ref()).unwrap();

        msg!("pool read with PDA {}", hex::encode(pda));
        msg!("pool read with name {}", pool_account.name);
        msg!("pool read with description {}", pool_account.description);
        msg!("pool read by admin {}", hex::encode(admin));
        msg!("pool read with bump {}", bump);

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
#[instruction(bump:u8)]
pub struct UpdatePool<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        mut,
        seeds=[b"pool-account", admin.key.as_ref()],
        bump=bump
    )]
    pub pool_account: Account<'info, Pool>,
    #[account(address=system_program::ID)]
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(bump:u8)]
pub struct ReadPool<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        mut,
        seeds=[b"pool-account", admin.key.as_ref()],
        bump=bump
    )]
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
