use anchor_lang::prelude::*;

#[error]
pub enum ErrorCode {
    #[msg("LimitsStops: price too high")]
    PriceTooHighError
}