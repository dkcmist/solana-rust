//! Instruction types

#![allow(clippy::too_many_arguments)]

use solana_program::{
    instruction::{AccountMeta, Instruction},
    program_error::ProgramError,
    pubkey::Pubkey,
    system_program,
};
use std::convert::TryInto;
use std::mem::size_of;

#[repr(C)]
#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct RouteSwapInstructionBaseIn {
    // SOURCE amount to transfer, output to DESTINATION is based on the exchange rate
    pub amount_in: u64,
}

#[repr(C)]
#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct RouteSwapInstructionBaseOut {
    // SOURCE amount to transfer, output to DESTINATION is based on the exchange rate
    pub amount_out: u64,
}

#[repr(C)]
#[derive(Clone, Debug, PartialEq)]
pub enum RouteSwapInstruction {
    ///
    ///   0. `[]` System program id
    ///   1. `[]` Spl Token program id
    ///   2. `[]` amm program id
    ///   3. `[writable]` from amm Account
    ///   4. `[writable]` to amm Account
    ///   5. `[]` $authority
    ///   6. `[writable]` amm open_orders Account
    ///   7. `[writable]` pool_token_coin Amm Account to swap FROM or To,
    ///   8. `[writable]` pool_token_pc Amm Account to swap FROM or To,
    ///   9. `[writable]` serum market Account. serum_dex program is the owner.
    ///   10. `[]` serum dex program id
    ///   11. `[writable]` serum market Account. serum_dex program is the owner.
    ///   12. `[writable]` bids Account
    ///   13. `[writable]` asks Account
    ///   14. `[writable]` event_q Account
    ///   15. `[writable]` coin_vault Account
    ///   16. `[writable]` pc_vault Account
    ///   17. '[]` vault_signer Account
    ///   18. `[writable]` user source token Account. user Account to swap from.
    ///   19. `[writable]` user mid token Account. user Account to swap to.
    ///   20. `[writable]` user pda Account.
    ///   21. `[signer]` user owner Account
    RouteSwapIn(RouteSwapInstructionBaseIn),

    ///
    ///   0. `[]` Spl Token program id
    ///   1. `[]` amm program id
    ///   2. `[writable]` from amm Account
    ///   3. `[writable]` to amm Account
    ///   4. `[]` $authority
    ///   5. `[writable]` amm open_orders Account
    ///   6. `[writable]` pool_token_coin Amm Account to swap FROM or To,
    ///   7. `[writable]` pool_token_pc Amm Account to swap FROM or To,
    ///   8. `[writable]` serum market Account. serum_dex program is the owner.
    ///   9. `[]` serum dex program id
    ///   10. `[writable]` serum market Account. serum_dex program is the owner.
    ///   11. `[writable]` bids Account
    ///   12. `[writable]` asks Account
    ///   13. `[writable]` event_q Account
    ///   14. `[writable]` coin_vault Account
    ///   15. `[writable]` pc_vault Account
    ///   16. '[]` vault_signer Account
    ///   17. `[writable]` user mid token Account. user Account to swap from.
    ///   18. `[writable]` user destination token Account. user Account to swap to.
    ///   19. `[writable]` user pda Account.
    ///   20. `[signer]` user owner Account
    RouteSwapOut(RouteSwapInstructionBaseOut),
}

impl RouteSwapInstruction {
    /// Unpacks a byte buffer into a [AmmInstruction](enum.AmmInstruction.html).
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (&tag, rest) = input
            .split_first()
            .ok_or(ProgramError::InvalidInstructionData)?;
        Ok(match tag {
            0 => {
                let (amount_in, _rest) = Self::unpack_u64(rest)?;
                Self::RouteSwapIn(RouteSwapInstructionBaseIn { amount_in })
            }

            1 => {
                let (amount_out, _rest) = Self::unpack_u64(rest)?;
                Self::RouteSwapOut(RouteSwapInstructionBaseOut { amount_out })
            }

            _ => return Err(ProgramError::InvalidInstructionData.into()),
        })
    }

    fn unpack_u64(input: &[u8]) -> Result<(u64, &[u8]), ProgramError> {
        if input.len() >= 8 {
            let (amount, rest) = input.split_at(8);
            let amount = amount
                .get(..8)
                .and_then(|slice| slice.try_into().ok())
                .map(u64::from_le_bytes)
                .ok_or(ProgramError::InvalidInstructionData)?;
            Ok((amount, rest))
        } else {
            Err(ProgramError::InvalidInstructionData.into())
        }
    }

    pub fn pack(&self) -> Result<Vec<u8>, ProgramError> {
        let mut buf = Vec::with_capacity(size_of::<Self>());
        match &*self {
            Self::RouteSwapIn(RouteSwapInstructionBaseIn { amount_in }) => {
                buf.push(0);
                buf.extend_from_slice(&amount_in.to_le_bytes());
            }

            Self::RouteSwapOut(RouteSwapInstructionBaseOut { amount_out }) => {
                buf.push(1);
                buf.extend_from_slice(&amount_out.to_le_bytes());
            }
            _ => {}
        }
        Ok(buf)
    }
}

/// Creates a 'swap base in' instruction.
pub fn route_swap_base_in(
    program_id: &Pubkey,
    amm_program_id: &Pubkey,
    from_amm_id: &Pubkey,
    to_amm_id: &Pubkey,
    amm_authority: &Pubkey,
    amm_open_orders: &Pubkey,
    pool_coin_token_account: &Pubkey,
    pool_pc_token_account: &Pubkey,
    serum_program_id: &Pubkey,
    serum_market: &Pubkey,
    serum_bids: &Pubkey,
    serum_asks: &Pubkey,
    serum_event_queue: &Pubkey,
    serum_coin_vault_account: &Pubkey,
    serum_pc_vault_account: &Pubkey,
    serum_vault_signer: &Pubkey,
    user_source_token_account: &Pubkey,
    user_mid_token_account: &Pubkey,
    user_pda_account: &Pubkey,
    user_source_owner: &Pubkey,

    amount_in: u64,
) -> Result<Instruction, ProgramError> {
    let data =
        RouteSwapInstruction::RouteSwapIn(RouteSwapInstructionBaseIn { amount_in }).pack()?;

    let accounts = vec![
        // system program
        AccountMeta::new_readonly(system_program::id(), false),
        // spl token
        AccountMeta::new_readonly(spl_token::id(), false),
        // amm program
        AccountMeta::new_readonly(*amm_program_id, false),
        // amm
        AccountMeta::new(*from_amm_id, false),
        AccountMeta::new(*to_amm_id, false),
        AccountMeta::new_readonly(*amm_authority, false),
        AccountMeta::new(*amm_open_orders, false),
        AccountMeta::new(*pool_coin_token_account, false),
        AccountMeta::new(*pool_pc_token_account, false),
        // serum
        AccountMeta::new_readonly(*serum_program_id, false),
        AccountMeta::new(*serum_market, false),
        AccountMeta::new(*serum_bids, false),
        AccountMeta::new(*serum_asks, false),
        AccountMeta::new(*serum_event_queue, false),
        AccountMeta::new(*serum_coin_vault_account, false),
        AccountMeta::new(*serum_pc_vault_account, false),
        AccountMeta::new_readonly(*serum_vault_signer, false),
        // user
        AccountMeta::new(*user_source_token_account, false),
        AccountMeta::new(*user_mid_token_account, false),
        AccountMeta::new(*user_pda_account, false),
        AccountMeta::new_readonly(*user_source_owner, true),
    ];

    Ok(Instruction {
        program_id: *program_id,
        accounts,
        data,
    })
}

/// Creates a 'swap base out' instruction.
pub fn route_swap_base_out(
    program_id: &Pubkey,
    amm_program_id: &Pubkey,
    from_amm_id: &Pubkey,
    to_amm_id: &Pubkey,
    amm_authority: &Pubkey,
    amm_open_orders: &Pubkey,
    pool_coin_token_account: &Pubkey,
    pool_pc_token_account: &Pubkey,
    serum_program_id: &Pubkey,
    serum_market: &Pubkey,
    serum_bids: &Pubkey,
    serum_asks: &Pubkey,
    serum_event_queue: &Pubkey,
    serum_coin_vault_account: &Pubkey,
    serum_pc_vault_account: &Pubkey,
    serum_vault_signer: &Pubkey,
    user_mid_token_account: &Pubkey,
    user_destination_token_account: &Pubkey,
    user_pda_account: &Pubkey,
    user_source_owner: &Pubkey,

    amount_out: u64,
) -> Result<Instruction, ProgramError> {
    let data =
        RouteSwapInstruction::RouteSwapOut(RouteSwapInstructionBaseOut { amount_out }).pack()?;

    let accounts = vec![
        // spl token
        AccountMeta::new_readonly(spl_token::id(), false),
        // amm program
        AccountMeta::new_readonly(*amm_program_id, false),
        // amm
        AccountMeta::new(*from_amm_id, false),
        AccountMeta::new(*to_amm_id, false),
        AccountMeta::new_readonly(*amm_authority, false),
        AccountMeta::new(*amm_open_orders, false),
        AccountMeta::new(*pool_coin_token_account, false),
        AccountMeta::new(*pool_pc_token_account, false),
        // serum
        AccountMeta::new_readonly(*serum_program_id, false),
        AccountMeta::new(*serum_market, false),
        AccountMeta::new(*serum_bids, false),
        AccountMeta::new(*serum_asks, false),
        AccountMeta::new(*serum_event_queue, false),
        AccountMeta::new(*serum_coin_vault_account, false),
        AccountMeta::new(*serum_pc_vault_account, false),
        AccountMeta::new_readonly(*serum_vault_signer, false),
        // user
        AccountMeta::new(*user_mid_token_account, false),
        AccountMeta::new(*user_destination_token_account, false),
        AccountMeta::new(*user_pda_account, false),
        AccountMeta::new_readonly(*user_source_owner, true),
    ];

    Ok(Instruction {
        program_id: *program_id,
        accounts,
        data,
    })
}
