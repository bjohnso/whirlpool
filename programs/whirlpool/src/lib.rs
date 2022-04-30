#![allow(dead_code)]
#![allow(unused_variables)]

extern crate core;

use std::{convert::TryFrom};
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

declare_id!("AJjyLsVoEfhz7ds1ZM9RU44Zkf6bNakFC86PxXM4B7kT");

#[program]
pub mod whirlpool {
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

    pub fn deposit(ctx: Context<Deposit>, state_bump: u8, escrow_bump: u8, pool_bump: u8, token_amount: u64) -> ProgramResult {
        let state_account = &mut ctx.accounts.state_account;

        state_account.sender = ctx.accounts.user.key().clone();
        state_account.receiver = ctx.accounts.pool_account.key().clone();
        state_account.mint = ctx.accounts.mint.key().clone();
        state_account.escrow = ctx.accounts.escrow_account.key().clone();
        state_account.token_amount = token_amount;

        let state_pda = <[u8; 32]>::try_from(state_account.key().as_ref()).unwrap();
        let state_sender = <[u8; 32]>::try_from(state_account.sender.as_ref()).unwrap();
        let state_receiver = <[u8; 32]>::try_from(state_account.receiver.as_ref()).unwrap();
        let state_mint = <[u8; 32]>::try_from(state_account.mint.as_ref()).unwrap();
        let state_escrow = <[u8; 32]>::try_from(state_account.escrow.as_ref()).unwrap();

        msg!("escrow state created with PDA {}", hex::encode(state_pda));
        msg!("escrow state created with sender {}", hex::encode(state_sender));
        msg!("escrow state created with receiver {}", hex::encode(state_receiver));
        msg!("escrow state created with mint {}", hex::encode(state_mint));
        msg!("escrow state created with escrow {}", hex::encode(state_escrow));
        msg!("escrow state created with token amount {}", state_account.token_amount);

        let user_key = ctx.accounts.user.key;
        let mint_key = ctx.accounts.mint.key().clone();
        let state_bump_bytes = state_bump.to_le_bytes();

        let vector = vec![
            b"state-account".as_ref(),
            user_key.as_ref(),
            mint_key.as_ref(),
            state_bump_bytes.as_ref()
        ];

        let signer_seeds = vec![vector.as_slice()];

        let transfer_instruction = Transfer {
            from: ctx.accounts.donor_account.to_account_info(),
            to: ctx.accounts.escrow_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info()
        };

        let cpi_context= CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
            signer_seeds.as_slice()
        );

        anchor_spl::token::transfer(cpi_context, state_account.token_amount)?;

        state_account.stage = EscrowStage::Deposited.to_u8();

        Ok(())
    }

    pub fn withdraw(ctx: Context<Deposit>, state_bump: u8, escrow_bump: u8, pool_bump: u8, token_amount: u64) -> ProgramResult {
        if EscrowStage::to_escrow_stage(ctx.accounts.state_account.stage)? != EscrowStage::Deposited {
            msg!("Escrow Stage {} is invalid", ctx.accounts.state_account.stage);
            return Err(ErrorCode::StageInvalid.into());
        }

        // TODO: TRANSFER OUT OF ESCROW

        Ok(())
    }
}

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
#[instruction(state_bump: u8, escrow_bump: u8, pool_bump: u8, token_amount: u64)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub user: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer=pool_account,
        associated_token::mint = mint,
        associated_token::authority == pool_account
    )]
    pub recipient_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub admin: AccountInfo<'info>,

    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        has_one=user,
        has_one=pool_account,
        has_one=mint,
        seeds=[b"state-account", user.key.as_ref(), mint.key().as_ref()],
        bump=state_bump
    )]
    pub state_account: Account<'info, EscrowState>,

    #[account(
        mut,
        seeds=[b"escrow-account", user.key.as_ref(), mint.key().as_ref()],
        bump=escrow_bump
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

#[account]
pub struct Pool {
    pub name: String,
    pub description: String,
    pub admin: [u8; 32],
    pub bump: u8,
}

#[account]
pub struct EscrowState {
    sender: Pubkey,
    receiver: Pubkey,
    mint: Pubkey,
    escrow: Pubkey,
    token_amount: u64,
    stage: u8
}

#[derive(Clone, Copy, PartialEq)]
pub enum EscrowStage {
    Deposited = 0,
    Complete = 1,
    Reversed = 2
}

impl EscrowStage {
    fn to_u8(&self) -> u8 {
       *self as u8
    }

    fn to_escrow_stage(stage: u8) -> Option<EscrowStage> {
        match stage {
            0 => Some(EscrowStage::Deposited),
            1 => Some(EscrowStage::Complete),
            2 => Some(EscrowStage::Reversed),
            _ => None
        }
    }
}

#[error]
pub enum ErrorCode {
    #[msg("Stage is invalid")]
    StageInvalid
}
