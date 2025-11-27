import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { USDC_ADDRESS, PAYMENT_CONTRACT } from '@/config/contracts';
import { ERC20_ABI } from '@/abis/erc20';
import { toast } from '@/hooks/use-toast';

export function useUSDC() {
  const { address } = useAccount();

  // Read decimals (with fallback to 6)
  const { data: decimalsData } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'decimals',
  });
  const decimals = decimalsData ?? 6;

  // Read balance
  const { data: balanceData, refetch: refetchBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Read allowance
  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, PAYMENT_CONTRACT] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Write approve
  const { 
    writeContract: writeApprove, 
    data: approveHash,
    isPending: isApprovePending 
  } = useWriteContract();

  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const approve = async (amount: bigint) => {
    return new Promise<void>((resolve, reject) => {
      try {
        writeApprove({
          address: USDC_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [PAYMENT_CONTRACT, amount],
        } as any, {
          onSuccess: () => {
            toast({
              title: 'Approval Successful',
              description: 'USDC spending approved',
            });
            setTimeout(() => refetchAllowance(), 2000);
            resolve();
          },
          onError: (err: any) => {
            toast({
              title: 'Approval Failed',
              description: err.message || 'Failed to approve USDC',
              variant: 'destructive',
            });
            reject(err);
          },
        });
      } catch (err: any) {
        toast({
          title: 'Approval Failed',
          description: err.message || 'Failed to approve USDC',
          variant: 'destructive',
        });
        reject(err);
      }
    });
  };

  // Helper functions
  const parseUSDC = (amountStr: string): bigint => {
    return parseUnits(amountStr, decimals);
  };

  const formatUSDC = (amountBigint: bigint): string => {
    return formatUnits(amountBigint, decimals);
  };

  return {
    decimals,
    balance: balanceData ?? 0n,
    balanceFormatted: balanceData ? formatUSDC(balanceData) : '0',
    allowance: allowanceData ?? 0n,
    allowanceFormatted: allowanceData ? formatUSDC(allowanceData) : '0',
    approve,
    isApproving: isApprovePending || isApproveConfirming,
    parseUSDC,
    formatUSDC,
    refetchBalance,
    refetchAllowance,
  };
}
