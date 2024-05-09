#[macro_export]
macro_rules! vault_pool_signer_seeds {
    ($vault_pool:expr) => {
        &[
          &$vault_pool.nonce.to_le_bytes(),
          $vault_pool.mint.as_ref(),
          $vault_pool.creator.as_ref(),
          b"stakePool",
          &[$vault_pool.bump_seed],
        ]
    };
}