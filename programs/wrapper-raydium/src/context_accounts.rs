use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount, Transfer};

/// Swap coin or pc from pool
#[derive(Accounts)]
pub struct SwapBaseIn<'info> {
    ///   0. `[]` Spl Token program id
    pub token_program: AccountInfo<'info>,

    /// amm
    ///   1. `[writable]` amm Account
    #[account(mut)]
    pub amm: AccountInfo<'info>,
    ///   2. `[]` $authority
    pub amm_authority: AccountInfo<'info>,
    ///   3. `[writable]` amm open_orders Account
    #[account(mut)]
    pub amm_open_orders: AccountInfo<'info>,
    ///   4. `[writable]` amm target_orders Account
    #[account(mut)]
    pub amm_target_orders: AccountInfo<'info>,
    ///   5. `[writable]` pool_token_coin Amm Account to swap FROM or To,
    #[account(mut)]
    pub pool_coin_token_account: AccountInfo<'info>,
    ///   6. `[writable]` pool_token_pc Amm Account to swap FROM or To,
    #[account(mut)]
    pub pool_pc_token_account: AccountInfo<'info>,

    /// serum
    ///   7. `[]` serum dex program id
    pub serum_program: AccountInfo<'info>,
    ///   8. `[writable]` serum market Account. serum_dex program is the owner.
    #[account(mut)]
    pub serum_market: AccountInfo<'info>,
    ///   9. `[writable]` bids Account
    #[account(mut)]
    pub serum_bids: AccountInfo<'info>,
    ///   10. `[writable]` asks Account
    #[account(mut)]
    pub serum_asks: AccountInfo<'info>,
    ///   11. `[writable]` event_q Account
    #[account(mut)]
    pub serum_event_que: AccountInfo<'info>,
    ///   12. `[writable]` coin_vault Account
    #[account(mut)]
    pub serum_coin_vault_account: AccountInfo<'info>,
    ///   13. `[writable]` pc_vault Account
    #[account(mut)]
    pub serum_pc_vault_account: AccountInfo<'info>,
    ///   14. '[]` vault_signer Account
    #[account(mut)]
    pub serum_vault_signer: AccountInfo<'info>,
    ///   15. `[writable]` user source token Account. user Account to swap from.
    #[account(mut)]
    pub user_source_token_account: Account<'info, TokenAccount>,
    ///   16. `[writable]` user destination token Account. user Account to swap to.
    #[account(mut)]
    pub user_dest_token_account: Account<'info, TokenAccount>,
    ///   17. `[singer]` user owner Account
    #[account(mut)]
    pub user_owner: Signer<'info>,

    /// Raydium program
    pub raydium_program: AccountInfo<'info>,
}

#[derive(Accounts)]
#[instruction(wrapper_state_bump: u8)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        seeds = [b"wrapper-state".as_ref()],
        bump = wrapper_state_bump,
        payer = signer
    )]
    pub wrapper_state: Account<'info, WrapperState>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(new_pool_info: PoolInfo)]
pub struct AddPoolInfo<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        constraint = *signer.key == wrapper_state.authority
    )]
    pub wrapper_state: Account<'info, WrapperState>,
    #[account(
        init,
        seeds = [b"wrapper-pool-info", new_pool_info.amm.as_ref()],
        bump,
        payer = signer
    )]
    pub pool_info: Box<Account<'info, PoolInfo>>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(new_pool_info: PoolInfo)]
pub struct UpdatePoolInfo<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        constraint = *signer.key == wrapper_state.authority
    )]
    pub wrapper_state: Account<'info, WrapperState>,
    #[account(
        mut,
        seeds = [b"wrapper-pool-info", new_pool_info.amm.as_ref()],
        bump
    )]
    pub pool_info: Box<Account<'info, PoolInfo>>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SwapTokens<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut)]
    pub pool_id: AccountInfo<'info>,
    #[account(
        seeds = [b"wrapper-pool-info", pool_id.key().as_ref()],
        bump,
    )]
    pub pool_info: Box<Account<'info, PoolInfo>>,
    #[account(mut)]
    pub user_source_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_dest_token_account: Account<'info, TokenAccount>,
    pub token_program: AccountInfo<'info>,
    pub serum_program: AccountInfo<'info>,
    pub raydium_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct RouteSwapBaseIn<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut)]
    pub from_pool_id: AccountInfo<'info>,
    #[account(
        seeds = [b"wrapper-pool-info", from_pool_id.key().as_ref()],
        bump,
    )]
    pub from_pool_info: Box<Account<'info, PoolInfo>>,
    #[account(mut)]
    pub to_pool_id: AccountInfo<'info>,
    #[account(mut)]
    pub user_source_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_mid_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_swap_pda_account: AccountInfo<'info>,
    pub token_program: AccountInfo<'info>,
    pub serum_program: AccountInfo<'info>,
    pub raydium_program: AccountInfo<'info>,
    pub route_swap_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RouteSwapBaseOut<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut)]
    pub from_pool_id: AccountInfo<'info>,
    #[account(mut)]
    pub to_pool_id: AccountInfo<'info>,
    #[account(
        seeds = [b"wrapper-pool-info", to_pool_id.key().as_ref()],
        bump,
    )]
    pub to_pool_info: Box<Account<'info, PoolInfo>>,
    #[account(mut)]
    pub user_mid_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_dest_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_swap_pda_account: AccountInfo<'info>,
    pub token_program: AccountInfo<'info>,
    pub serum_program: AccountInfo<'info>,
    pub raydium_program: AccountInfo<'info>,
    pub route_swap_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(Default)]
pub struct WrapperState {
    pub authority: Pubkey,
}

#[account]
#[derive(Default)]
pub struct PoolInfo {
    /// amm
    pub amm: Pubkey,
    pub amm_authority: Pubkey,
    pub amm_open_orders: Pubkey,
    pub amm_target_orders: Pubkey,
    pub pool_coin_token_account: Pubkey,
    pub pool_pc_token_account: Pubkey,
    /// serum
    pub serum_market: Pubkey,
    pub serum_bids: Pubkey,
    pub serum_asks: Pubkey,
    pub serum_event_que: Pubkey,
    pub serum_coin_vault_account: Pubkey,
    pub serum_pc_vault_account: Pubkey,
    pub serum_vault_signer: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct PoolInfoParam {
    /// amm
    pub amm: Pubkey,
    pub amm_authority: Pubkey,
    pub amm_open_orders: Pubkey,
    pub amm_target_orders: Pubkey,
    pub pool_coin_token_account: Pubkey,
    pub pool_pc_token_account: Pubkey,
    /// serum
    pub serum_market: Pubkey,
    pub serum_bids: Pubkey,
    pub serum_asks: Pubkey,
    pub serum_event_que: Pubkey,
    pub serum_coin_vault_account: Pubkey,
    pub serum_pc_vault_account: Pubkey,
    pub serum_vault_signer: Pubkey,
}
