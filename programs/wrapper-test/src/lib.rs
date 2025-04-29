use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer, TokenAccount};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod wrapper_test {
    use super::*;
    pub fn transfer_tokens(ctx: Context<TransferTokens>, amount: u64) -> ProgramResult {
        token::transfer(
            ctx.accounts.into_transfer_context(),
            amount
        )?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct TransferTokens<'info> {
    #[account(mut)]
    pub from: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = from.mint == to.mint
    )]
    pub to: Account<'info, TokenAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub token_program: AccountInfo<'info>,
}

impl<'info> TransferTokens<'info> {
    fn into_transfer_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self
                .from
                .to_account_info()
                .clone(),
            to: self
                .to
                .to_account_info()
                .clone(),
            authority: self.authority.to_account_info().clone(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }
}