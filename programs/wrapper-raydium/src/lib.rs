use anchor_lang::prelude::*;

pub mod amm_instruction;
pub mod context_accounts;
pub mod error;
pub mod route_swap_instruction;

use crate::amm_instruction::swap_base_in;
use crate::context_accounts::*;
use crate::error::ErrorCode;
use crate::route_swap_instruction::{route_swap_base_in, route_swap_base_out};

declare_id!("G3gAj3jDFwPNwWVsXR52AQFNv6jGoRUKPmzuLPYoupiC");

#[program]
pub mod wrapper_raydium {

    use super::*;

    pub fn initialize(ctx: Context<Initialize>, _wrapper_state_bump: u8) -> ProgramResult {
        ctx.accounts.wrapper_state.authority = *ctx.accounts.signer.key;
        Ok(())
    }

    pub fn add_pool_info(ctx: Context<AddPoolInfo>, pool_info: PoolInfoParam) -> ProgramResult {
        ctx.accounts.pool_info.amm = pool_info.amm;
        ctx.accounts.pool_info.amm_authority = pool_info.amm_authority;
        ctx.accounts.pool_info.amm_open_orders = pool_info.amm_open_orders;
        ctx.accounts.pool_info.amm_target_orders = pool_info.amm_target_orders;
        ctx.accounts.pool_info.pool_coin_token_account = pool_info.pool_coin_token_account;
        ctx.accounts.pool_info.pool_pc_token_account = pool_info.pool_pc_token_account;
        ctx.accounts.pool_info.serum_market = pool_info.serum_market;
        ctx.accounts.pool_info.serum_bids = pool_info.serum_bids;
        ctx.accounts.pool_info.serum_asks = pool_info.serum_asks;
        ctx.accounts.pool_info.serum_event_que = pool_info.serum_event_que;
        ctx.accounts.pool_info.serum_coin_vault_account = pool_info.serum_coin_vault_account;
        ctx.accounts.pool_info.serum_pc_vault_account = pool_info.serum_pc_vault_account;
        ctx.accounts.pool_info.serum_vault_signer = pool_info.serum_vault_signer;
        Ok(())
    }

    pub fn update_pool_info(
        ctx: Context<UpdatePoolInfo>,
        pool_info: PoolInfoParam,
    ) -> ProgramResult {
        ctx.accounts.pool_info.amm = pool_info.amm;
        ctx.accounts.pool_info.amm_authority = pool_info.amm_authority;
        ctx.accounts.pool_info.amm_open_orders = pool_info.amm_open_orders;
        ctx.accounts.pool_info.amm_target_orders = pool_info.amm_target_orders;
        ctx.accounts.pool_info.pool_coin_token_account = pool_info.pool_coin_token_account;
        ctx.accounts.pool_info.pool_pc_token_account = pool_info.pool_pc_token_account;
        ctx.accounts.pool_info.serum_market = pool_info.serum_market;
        ctx.accounts.pool_info.serum_bids = pool_info.serum_bids;
        ctx.accounts.pool_info.serum_asks = pool_info.serum_asks;
        ctx.accounts.pool_info.serum_event_que = pool_info.serum_event_que;
        ctx.accounts.pool_info.serum_coin_vault_account = pool_info.serum_coin_vault_account;
        ctx.accounts.pool_info.serum_pc_vault_account = pool_info.serum_pc_vault_account;
        ctx.accounts.pool_info.serum_vault_signer = pool_info.serum_vault_signer;
        Ok(())
    }

    pub fn swap_tokens<'a, 'b, 'c, 'info>(
        ctx: Context<'a, 'b, 'c, 'info, SwapTokens<'info>>,
        amount_in: u64,
        minimum_amount_out: u64,
        maximum_amount_out: u64,
    ) -> ProgramResult {
        let ix = swap_base_in(
            ctx.accounts.raydium_program.key,
            &ctx.accounts.pool_info.amm,
            &ctx.accounts.pool_info.amm_authority,
            &ctx.accounts.pool_info.amm_open_orders,
            &ctx.accounts.pool_info.amm_target_orders,
            &ctx.accounts.pool_info.pool_coin_token_account,
            &ctx.accounts.pool_info.pool_pc_token_account,
            ctx.accounts.serum_program.key,
            &ctx.accounts.pool_info.serum_market,
            &ctx.accounts.pool_info.serum_bids,
            &ctx.accounts.pool_info.serum_asks,
            &ctx.accounts.pool_info.serum_event_que,
            &ctx.accounts.pool_info.serum_coin_vault_account,
            &ctx.accounts.pool_info.serum_pc_vault_account,
            &ctx.accounts.pool_info.serum_vault_signer,
            &ctx.accounts.user_source_token_account.key(),
            &ctx.accounts.user_dest_token_account.key(),
            ctx.accounts.signer.key,
            amount_in,
            minimum_amount_out,
        )?;

        let balance_before_swap = ctx.accounts.user_dest_token_account.amount;
        solana_program::program::invoke(
            &ix,
            &[
                &[
                    ctx.accounts.token_program.to_account_info().clone(),
                    ctx.accounts.serum_program.to_account_info().clone(),
                    ctx.accounts
                        .user_source_token_account
                        .to_account_info()
                        .clone(),
                    ctx.accounts
                        .user_dest_token_account
                        .to_account_info()
                        .clone(),
                    ctx.accounts.signer.to_account_info().clone(),
                    ctx.accounts.pool_id.to_account_info().clone(),
                ],
                ctx.remaining_accounts,
            ]
            .concat(),
        )?;

        ctx.accounts.user_dest_token_account.reload();

        let balance_after_swap = ctx.accounts.user_dest_token_account.amount;

        if balance_after_swap - balance_before_swap > maximum_amount_out {
            return Err(ErrorCode::PriceTooHighError.into());
        }

        Ok(())
    }

    pub fn swap_tokens_base_in<'a, 'b, 'c, 'info>(
        ctx: Context<'a, 'b, 'c, 'info, RouteSwapBaseIn<'info>>,
        amount_in: u64,
    ) -> ProgramResult {
        let ix = route_swap_base_in(
            ctx.accounts.route_swap_program.key,
            ctx.accounts.raydium_program.key,
            &ctx.accounts.from_pool_info.amm,
            ctx.accounts.to_pool_id.key,
            &ctx.accounts.from_pool_info.amm_authority,
            &ctx.accounts.from_pool_info.amm_open_orders,
            &ctx.accounts.from_pool_info.pool_coin_token_account,
            &ctx.accounts.from_pool_info.pool_pc_token_account,
            ctx.accounts.serum_program.key,
            &ctx.accounts.from_pool_info.serum_market,
            &ctx.accounts.from_pool_info.serum_bids,
            &ctx.accounts.from_pool_info.serum_asks,
            &ctx.accounts.from_pool_info.serum_event_que,
            &ctx.accounts.from_pool_info.serum_coin_vault_account,
            &ctx.accounts.from_pool_info.serum_pc_vault_account,
            &ctx.accounts.from_pool_info.serum_vault_signer,
            &ctx.accounts.user_source_token_account.key(),
            &ctx.accounts.user_mid_token_account.key(),
            &ctx.accounts.user_swap_pda_account.key(),
            ctx.accounts.signer.key,
            amount_in,
        )?;

        solana_program::program::invoke(
            &ix,
            &[
                &[
                    ctx.accounts.token_program.to_account_info().clone(),
                    ctx.accounts.serum_program.to_account_info().clone(),
                    ctx.accounts.route_swap_program.to_account_info().clone(),
                    ctx.accounts.system_program.to_account_info().clone(),
                    ctx.accounts.to_pool_id.to_account_info().clone(),
                    ctx.accounts
                        .user_source_token_account
                        .to_account_info()
                        .clone(),
                    ctx.accounts
                        .user_mid_token_account
                        .to_account_info()
                        .clone(),
                    ctx.accounts.user_swap_pda_account.to_account_info().clone(),
                    ctx.accounts.signer.to_account_info().clone(),
                ],
                ctx.remaining_accounts,
            ]
            .concat(),
        )?;

        Ok(())
    }

    pub fn swap_tokens_base_out<'a, 'b, 'c, 'info>(
        ctx: Context<'a, 'b, 'c, 'info, RouteSwapBaseOut<'info>>,
        minimum_amount_out: u64,
        maximum_amount_out: u64,
    ) -> ProgramResult {
        let ix = route_swap_base_out(
            ctx.accounts.route_swap_program.key,
            ctx.accounts.raydium_program.key,
            ctx.accounts.from_pool_id.key,
            &ctx.accounts.to_pool_info.amm,
            &ctx.accounts.to_pool_info.amm_authority,
            &ctx.accounts.to_pool_info.amm_open_orders,
            &ctx.accounts.to_pool_info.pool_coin_token_account,
            &ctx.accounts.to_pool_info.pool_pc_token_account,
            ctx.accounts.serum_program.key,
            &ctx.accounts.to_pool_info.serum_market,
            &ctx.accounts.to_pool_info.serum_bids,
            &ctx.accounts.to_pool_info.serum_asks,
            &ctx.accounts.to_pool_info.serum_event_que,
            &ctx.accounts.to_pool_info.serum_coin_vault_account,
            &ctx.accounts.to_pool_info.serum_pc_vault_account,
            &ctx.accounts.to_pool_info.serum_vault_signer,
            &ctx.accounts.user_mid_token_account.key(),
            &ctx.accounts.user_dest_token_account.key(),
            &ctx.accounts.user_swap_pda_account.key(),
            ctx.accounts.signer.key,
            minimum_amount_out,
        )?;

        let balance_before_swap = ctx.accounts.user_dest_token_account.amount;

        solana_program::program::invoke(
            &ix,
            &[
                &[
                    ctx.accounts.token_program.to_account_info().clone(),
                    ctx.accounts.serum_program.to_account_info().clone(),
                    ctx.accounts.route_swap_program.to_account_info().clone(),
                    ctx.accounts.from_pool_id.to_account_info().clone(),
                    ctx.accounts
                        .user_mid_token_account
                        .to_account_info()
                        .clone(),
                    ctx.accounts
                        .user_dest_token_account
                        .to_account_info()
                        .clone(),
                    ctx.accounts.user_swap_pda_account.to_account_info().clone(),
                    ctx.accounts.signer.to_account_info().clone(),
                ],
                ctx.remaining_accounts,
            ]
            .concat(),
        )?;

        ctx.accounts.user_dest_token_account.reload();

        let balance_after_swap = ctx.accounts.user_dest_token_account.amount;

        if balance_after_swap - balance_before_swap > maximum_amount_out {
            return Err(ErrorCode::PriceTooHighError.into());
        }

        Ok(())
    }

    // pub fn swap_tokens(
    //     ctx: Context<SwapBaseIn>,
    //     amount_in: u64,
    //     minimum_amount_out: u64,
    //     maximum_amount_out: u64,
    // ) -> ProgramResult {
    //     let ix = swap_base_in(
    //         ctx.accounts.raydium_program.key,
    //         ctx.accounts.amm.key,
    //         ctx.accounts.amm_authority.key,
    //         ctx.accounts.amm_open_orders.key,
    //         ctx.accounts.amm_target_orders.key,
    //         ctx.accounts.pool_coin_token_account.key,
    //         ctx.accounts.pool_pc_token_account.key,
    //         ctx.accounts.serum_program.key,
    //         ctx.accounts.serum_market.key,
    //         ctx.accounts.serum_bids.key,
    //         ctx.accounts.serum_asks.key,
    //         ctx.accounts.serum_event_que.key,
    //         ctx.accounts.serum_coin_vault_account.key,
    //         ctx.accounts.serum_pc_vault_account.key,
    //         ctx.accounts.serum_vault_signer.key,
    //         &ctx.accounts.user_source_token_account.key(),
    //         &ctx.accounts.user_dest_token_account.key(),
    //         ctx.accounts.user_owner.key,
    //         amount_in,
    //         minimum_amount_out,
    //     )?;

    //     let balance_before_swap = ctx.accounts.user_dest_token_account.amount;

    //     solana_program::program::invoke(
    //         &ix,
    //         &[
    //             ctx.accounts.token_program.to_account_info().clone(),
    //             ctx.accounts.amm.to_account_info().clone(),
    //             ctx.accounts.amm_authority.to_account_info().clone(),
    //             ctx.accounts.amm_open_orders.to_account_info().clone(),
    //             ctx.accounts.amm_target_orders.to_account_info().clone(),
    //             ctx.accounts
    //                 .pool_coin_token_account
    //                 .to_account_info()
    //                 .clone(),
    //             ctx.accounts.pool_pc_token_account.to_account_info().clone(),
    //             ctx.accounts.serum_program.to_account_info().clone(),
    //             ctx.accounts.serum_market.to_account_info().clone(),
    //             ctx.accounts.serum_bids.to_account_info().clone(),
    //             ctx.accounts.serum_asks.to_account_info().clone(),
    //             ctx.accounts.serum_event_que.to_account_info().clone(),
    //             ctx.accounts
    //                 .serum_coin_vault_account
    //                 .to_account_info()
    //                 .clone(),
    //             ctx.accounts
    //                 .serum_pc_vault_account
    //                 .to_account_info()
    //                 .clone(),
    //             ctx.accounts.serum_vault_signer.to_account_info().clone(),
    //             ctx.accounts
    //                 .user_source_token_account
    //                 .to_account_info()
    //                 .clone(),
    //             ctx.accounts
    //                 .user_dest_token_account
    //                 .to_account_info()
    //                 .clone(),
    //             ctx.accounts.user_owner.to_account_info().clone(),
    //         ],
    //     )?;

    //     ctx.accounts.user_dest_token_account.reload();

    //     let balance_after_swap = ctx.accounts.user_dest_token_account.amount;

    //     if balance_after_swap - balance_before_swap > maximum_amount_out {
    //         return Err(ErrorCode::PriceTooHighError.into());
    //     }

    //     Ok(())
    // }
}
