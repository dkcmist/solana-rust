use anchor_lang::prelude::*;
use anchor_lang::solana_program;
use anchor_lang::solana_program::instruction::Instruction;
use anchor_lang::solana_program::system_instruction;
use anchor_spl::token::CloseAccount;
use anchor_spl::token::Transfer;
use anchor_spl::token::{TokenAccount};

use std::convert::Into;

declare_id!("8LRxyb7ftDYSbSsZ3pqbW9jjUZgMGSZhx69BLtLVBdBf");

#[program]
pub mod registry {
    use anchor_spl::token;

    use super::*;

    const NUM_SIGNATURES: u8 = 1;
    const MIN_ESCROW_LAMPORT: u64 = 50000;

    pub fn initialize(ctx: Context<Initialize>, _global_state_bump: u8) -> ProgramResult {
        ctx.accounts.global_state.main_authority = *ctx.accounts.initializer.key;
        Ok(())
    }

    pub fn set_execution_authority(
        ctx: Context<SetExecutionAuthority>,
        _global_state_bump: u8,
        execution_authority: Pubkey,
    ) -> ProgramResult {
        ctx.accounts.global_state.execution_authority = execution_authority;
        Ok(())
    }

    pub fn register_execution(
        ctx: Context<RegisterExecution>,
        _register_state_bump: u8,
        pid: Pubkey,
        accs: Vec<TransactionAccount>,
        data: Vec<u8>,
    ) -> ProgramResult {
        let request_id = ctx.accounts.register_state.next_request_id;
        ctx.accounts.register_state.next_request_id = request_id + 1;
        ctx.accounts.register_request.transaction = *ctx.accounts.transaction.to_account_info().key;

        let tx = &mut ctx.accounts.transaction;
        tx.program_id = pid;
        tx.accounts = accs.clone();
        tx.data = data;

        solana_program::program::invoke(
            &system_instruction::transfer(
                &ctx.accounts.register.to_account_info().key(),
                &ctx.accounts.register_request.to_account_info().key(),
                MIN_ESCROW_LAMPORT,
            ),
            &[
                ctx.accounts.register.to_account_info(),
                ctx.accounts.register_request.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        emit!(Register {
            register: ctx.accounts.register.to_account_info().key(),
            request_id,
            program_id: pid,
            accounts: accs
        });

        Ok(())
    }

    pub fn execute(
        ctx: Context<Execute>,
        _global_state_bump: u8,
        register_request_bump: u8,
        request_id: u64,
    ) -> ProgramResult {
        let mut ix: Instruction = (&*ctx.accounts.transaction).into();
        ix.accounts = ix
            .accounts
            .iter()
            .map(|acc| {
                let mut acc = acc.clone();
                if &acc.pubkey == ctx.accounts.register_request.to_account_info().key {
                    acc.is_signer = true;
                }
                acc
            })
            .collect();
        for acc in ctx.remaining_accounts.iter() {
            match ix.accounts.iter().position(|a| a.pubkey == acc.key()) {
                Some(usize) => {}
                None => {
                    if acc.is_writable {
                        ix.accounts.push(AccountMeta::new(acc.key(), false));
                    } else {
                        ix.accounts.push(AccountMeta::new_readonly(acc.key(), false));
                    }
                }
            }
        }

        let t = request_id.to_string();
        let seeds = &[
            ctx.accounts.register.to_account_info().key.as_ref(),
            b"register-request",
            t.as_bytes(),
            &[register_request_bump],
        ];
        let signer = &[&seeds[..]];
        let accounts = ctx.remaining_accounts;
        solana_program::program::invoke_signed(&ix, accounts, signer)?;

        let fee = ctx.accounts.fees.fee_calculator.lamports_per_signature * NUM_SIGNATURES as u64;
        let register_request_info = &mut ctx.accounts.register_request.to_account_info();
        let execution_authority_info = &mut ctx.accounts.execution_authority.to_account_info();

        // we can decrement the register_request account's lamports b/c we own it
        **register_request_info.try_borrow_mut_lamports()? = register_request_info
            .lamports()
            .checked_sub(fee)
            // or whatever, some error of your choosing
            .ok_or(ProgramError::InvalidArgument)?;

        // *incrementing* an account's lamports is always ok though
        **execution_authority_info.try_borrow_mut_lamports()? = execution_authority_info
            .lamports()
            .checked_add(fee)
            .ok_or(ProgramError::InvalidArgument)?;

        Ok(())
    }

    pub fn cancel(
        ctx: Context<Cancel>,
        register_request_bump: u8,
        request_id: u64,
    ) -> ProgramResult {
        token::transfer(
            ctx.accounts
                .into_return_to_register_context()
                .with_signer(&[&[ctx.accounts.register.key().as_ref(), b"register-request".as_ref(), request_id.to_string().as_bytes(), &[register_request_bump]]]),
            ctx.accounts.token_account.amount
        )?;
        token::close_account(
            ctx.accounts
                .into_close_context()
                .with_signer(&[&[ctx.accounts.register.key().as_ref(), b"register-request".as_ref(), request_id.to_string().as_bytes(), &[register_request_bump]]]),
        )?;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(global_state_bump: u8)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,
    #[account(
        init,
        seeds = [b"global-state".as_ref()],
        bump = global_state_bump,
        payer = initializer
    )]
    pub global_state: Account<'info, GlobalState>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(global_state_bump: u8)]
pub struct SetExecutionAuthority<'info> {
    #[account(mut)]
    pub main_authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"global-state".as_ref()],
        bump = global_state_bump,
        constraint = *main_authority.key == global_state.main_authority
    )]
    pub global_state: Account<'info, GlobalState>,
}

#[derive(Accounts)]
#[instruction(register_state_bump: u8)]
pub struct RegisterExecution<'info> {
    #[account(mut)]
    pub register: Signer<'info>,
    #[account(
        init_if_needed,
        seeds = [register.to_account_info().key.as_ref(), b"register-state"],
        bump = register_state_bump,
        payer = register
    )]
    pub register_state: Account<'info, RegisterState>,
    #[account(
        init,
        seeds = [register.to_account_info().key.as_ref(), b"register-request", register_state.next_request_id.to_string().as_bytes()],
        bump,
        payer = register
    )]
    pub register_request: Account<'info, RegisterRequest>,
    #[account(zero)]
    pub transaction: Box<Account<'info, Transaction>>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(global_state_bump: u8, register_request_bump: u8, request_id: u64)]
pub struct Execute<'info> {
    #[account(mut, constraint = global_state.execution_authority == *execution_authority.to_account_info().key)]
    pub execution_authority: Signer<'info>,
    #[account(
        seeds = [b"global-state".as_ref()],
        bump = global_state_bump,
    )]
    pub global_state: Account<'info, GlobalState>,
    #[account(mut)]
    pub register: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [register.to_account_info().key.as_ref(), b"register-request", request_id.to_string().as_bytes()],
        bump = register_request_bump,
        constraint = register_request.transaction == *transaction.to_account_info().key,
        close = register
    )]
    pub register_request: Account<'info, RegisterRequest>,
    #[account(mut, close = register)]
    transaction: Account<'info, Transaction>,
    pub fees: Sysvar<'info, Fees>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(register_request_bump: u8, request_id: u64)]
pub struct Cancel<'info> {
    #[account(mut)]
    pub register: Signer<'info>,
    #[account(
        mut,
        seeds = [register.to_account_info().key.as_ref(), b"register-request", request_id.to_string().as_bytes()],
        bump = register_request_bump,
        constraint = register_request.transaction == *transaction.to_account_info().key,
        close = register
    )]
    pub register_request: Account<'info, RegisterRequest>,
    #[account(
        mut,
    )]
    pub token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub receive_token_account: Account<'info, TokenAccount>,
    #[account(mut, close = register)]
    transaction: Account<'info, Transaction>,
    pub token_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

impl<'info> Cancel<'info> {
    pub fn into_return_to_register_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.token_account.to_account_info().clone(),
            to: self.receive_token_account.to_account_info().clone(),
            authority: self.register_request.to_account_info().clone(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }
 
    pub fn into_close_context(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        let cpi_accounts = CloseAccount {
            account: self.token_account.to_account_info().clone(),
            destination: self.register.to_account_info().clone(),
            authority: self.register_request.to_account_info().clone(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }
}

#[account]
#[derive(Default)]
pub struct GlobalState {
    pub main_authority: Pubkey,
    pub execution_authority: Pubkey,
}

#[account]
#[derive(Default)]
pub struct RegisterState {
    pub next_request_id: u64,
}

#[account]
#[derive(Default)]
pub struct RegisterRequest {
    pub transaction: Pubkey,
}

#[account]
#[derive(Default)]
pub struct Transaction {
    pub program_id: Pubkey,
    pub accounts: Vec<TransactionAccount>,
    pub data: Vec<u8>,
}

impl From<&Transaction> for Instruction {
    fn from(tx: &Transaction) -> Instruction {
        Instruction {
            program_id: tx.program_id,
            accounts: tx.accounts.iter().map(Into::into).collect(),
            data: tx.data.clone(),
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TransactionAccount {
    pub pubkey: Pubkey,
    pub is_signer: bool,
    pub is_writable: bool,
}

impl From<&TransactionAccount> for AccountMeta {
    fn from(account: &TransactionAccount) -> AccountMeta {
        match account.is_writable {
            false => AccountMeta::new_readonly(account.pubkey, account.is_signer),
            true => AccountMeta::new(account.pubkey, account.is_signer),
        }
    }
}

impl From<&AccountMeta> for TransactionAccount {
    fn from(account_meta: &AccountMeta) -> TransactionAccount {
        TransactionAccount {
            pubkey: account_meta.pubkey,
            is_signer: account_meta.is_signer,
            is_writable: account_meta.is_writable,
        }
    }
}

#[event]
pub struct Register {
    pub register: Pubkey,
    pub request_id: u64,
    pub program_id: Pubkey,
    pub accounts: Vec<TransactionAccount>,
}
