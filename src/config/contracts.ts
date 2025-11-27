// Monad Contract Addresses
export const USDC_ADDRESS = '0x754704Bc059F8C67012fEd69BC8A327a5aafb603' as const;
export const PAYMENT_CONTRACT = '0x6Fae5CCf7996f7d0502aA5C32d38e0e31FC37CE5' as const;
export const TREASURY = '0x6bA6285C16880fbACED253C48B5F575C429fD884' as const;

// Fee configuration
export const FEE_BPS = 100; // 1% = 100 basis points

// Helper functions
export const calcFee = (amount: bigint): bigint => {
  return (amount * BigInt(FEE_BPS)) / BigInt(10000);
};

export const calcNet = (amount: bigint): bigint => {
  return amount - calcFee(amount);
};

// Action fees (optional - for display/reference)
export const POST_FEE_USDC = '0.02';
export const COMMENT_FEE_USDC = '0.01';
export const DM_FEE_USDC = '0.01';
