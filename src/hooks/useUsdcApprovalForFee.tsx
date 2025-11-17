import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { PULSECHAT_CONTRACT_ADDRESS, PULSECHAT_ABI, ERC20_ABI } from '@/lib/contracts';
import { toast } from 'sonner';

export function useUsdcApprovalForFee() {
  const { address } = useAccount();

  // Read USDC token address from contract
  const { data: usdcAddress } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'usdc',
  }) as { data: `0x${string}` };

  // Read current USDC fee from contract
  const { data: feeAmount } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'feeAmount',
  }) as { data: bigint };

  // Read USDC decimals from token contract
  const { data: usdcDecimals } = useReadContract({
    address: usdcAddress,
    abi: ERC20_ABI,
    functionName: 'decimals',
    query: {
      enabled: !!usdcAddress,
    },
  }) as { data: number };

  // Read user's USDC allowance for PulseChainSocial contract
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: usdcAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address || '0x0', PULSECHAT_CONTRACT_ADDRESS],
    query: {
      enabled: !!usdcAddress && !!address,
    },
  }) as { data: bigint; refetch: () => void };

  // Read user's USDC balance
  const { data: balance } = useReadContract({
    address: usdcAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address || '0x0'],
    query: {
      enabled: !!usdcAddress && !!address,
    },
  }) as { data: bigint };

  const { writeContract, isPending: isApproving } = useWriteContract();

  const handleApprove = () => {
    if (!usdcAddress || !feeAmount) {
      toast.error('Cannot read contract data');
      return;
    }

    // Approve feeAmount * 1000 for multiple transactions
    const approveAmount = feeAmount * 1000n;
    
    writeContract({
      address: usdcAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [PULSECHAT_CONTRACT_ADDRESS, approveAmount],
    } as any, {
      onSuccess: () => {
        toast.success('USDC approved successfully!');
        setTimeout(() => refetchAllowance(), 2000);
      },
      onError: (error) => {
        toast.error('Approval failed: ' + error.message);
      },
    });
  };

  const decimals = usdcDecimals || 6;
  const hasAllowance = allowance && feeAmount ? allowance >= feeAmount : false;
  const feeHuman = feeAmount ? (Number(feeAmount) / 10 ** decimals).toFixed(2) : '0.01';
  const balanceHuman = balance ? (Number(balance) / 10 ** decimals).toFixed(2) : '0.00';
  const allowanceHuman = allowance ? (Number(allowance) / 10 ** decimals).toFixed(2) : '0.00';

  return {
    usdcAddress,
    feeAmount,
    allowance,
    balance,
    hasAllowance,
    isApproving,
    handleApprove,
    feeHuman,
    balanceHuman,
    allowanceHuman,
    decimals,
  };
}
