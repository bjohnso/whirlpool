#![allow(dead_code)]
#![allow(unused_variables)]

use anchor_spl::{associated_token::AssociatedToken, token::{CloseAccount, Mint, Token, TokenAccount, Transfer}};
use anchor_lang::{prelude::*, context::CpiContext};

use solana_program::{
    system_program,
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    program_error::ProgramError,
    pubkey::Pubkey,
    rent::Rent,
};

#[derive(Accounts)]
pub struct CreatePool<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer=admin,
        space=1000,
        seeds=[b"pool-account", admin.key.as_ref()],
        bump
    )]
    pub pool_account: Account<'info, Pool>,

    #[account(
        init,
        payer=admin,
        seeds=[b"pool-token-account", admin.key.as_ref(), mint.key().as_ref()],
        bump,
        token::mint=mint,
        token::authority=pool_account,
    )]
    pub token_account: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,

    #[account(address=system_program::ID)]
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>
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

#[derive(Accounts)]
#[instruction(state_bump: u8, escrow_bump: u8, pool_bump: u8, token_amount: u64)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        constraint=donor_account.owner == user.key(),
        constraint=donor_account.mint == mint.key()
    )]
    pub donor_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub admin: AccountInfo<'info>,

    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer=user,
        space=1000,
        seeds=[b"state-account", user.key.as_ref()],
        bump
    )]
    pub state_account: Account<'info, EscrowState>,

    #[account(
        init,
        payer=user,
        seeds=[b"escrow-account", user.key.as_ref()],
        token::mint=mint,
        token::authority=state_account,
        bump
    )]
    pub escrow_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds=[b"pool-account", admin.key.as_ref()],
        bump=pool_bump
    )]
    pub pool_account: Account<'info, Pool>,

    #[account(address=system_program::ID)]
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>
}

#[derive(Accounts)]
#[instruction(pool_bump: u8)]
pub struct Stake<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds=[b"pool-account", admin.key.as_ref()],
        bump=pool_bump
    )]
    pub pool_account: Account<'info, Pool>,

    #[account(address=system_program::ID)]
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Pool {
    pub name: String,
    pub description: String,
    pub admin: Pubkey,
    pub mint: Pubkey,
    pub state_account: Pubkey,
    pub token_account: Pubkey,
    pub state_account_bump: u8,
    pub token_account_bump: u8,
}

#[account]
pub struct EscrowState {
    pub user: Pubkey,
    pub escrow: Pubkey,
    pub escrow_bump: u8,
    pub token_amount: u64,
    pub stage: u8
}
