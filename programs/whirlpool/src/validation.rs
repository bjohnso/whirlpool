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
    pub admin: AccountInfo<'info>,

    #[account(
        init,
        payer=admin,
        space=8 + 30 + 100 + 1,
        seeds=[b"pool-account", admin.key.as_ref()],
        bump
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
        seeds=[b"state-account", user.key.as_ref(), mint.key().as_ref()],
        bump
    )]
    pub state_account: Account<'info, EscrowState>,

    #[account(
        init,
        payer=user,
        seeds=[b"escrow-account", user.key.as_ref(), mint.key().as_ref()],
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

    pub token_program: Program<'info, Token>,

    pub system_program: Program<'info, System>,

    pub rent: Sysvar<'info, Rent>
}

#[derive(Accounts)]
#[instruction(state_bump: u8, escrow_bump: u8, pool_bump: u8)]
pub struct Stake<'info> {
    #[account(mut)]
    pub sender: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer=receiver,
        associated_token::mint=mint,
        associated_token::authority=receiver,
    )]
    pub recipient_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub admin: AccountInfo<'info>,

    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds=[b"state-account", sender.key.as_ref(), mint.key().as_ref()],
        has_one=sender,
        has_one=receiver,
        has_one=mint,
        bump=state_bump
    )]
    pub state_account: Account<'info, EscrowState>,

    #[account(
        mut,
        seeds=[b"escrow-account", sender.key.as_ref(), mint.key().as_ref()],
        bump=escrow_bump
    )]
    pub escrow_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds=[b"pool-account", admin.key.as_ref()],
        bump=pool_bump
    )]
    pub receiver: Account<'info, Pool>,

    pub token_program: Program<'info, Token>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub system_program: Program<'info, System>,

    pub rent: Sysvar<'info, Rent>
}

#[account]
pub struct Pool {
    pub name: String,
    pub description: String,
    pub admin: [u8; 32],
    pub bump: u8,
}

#[account]
pub struct EscrowState {
    pub sender: Pubkey,
    pub receiver: Pubkey,
    pub mint: Pubkey,
    pub escrow: Pubkey,
    pub token_amount: u64,
    pub stage: u8
}
