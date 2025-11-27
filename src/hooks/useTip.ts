import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { isAddress } from 'viem';
import { PAYMENT_CONTRACT } from '@/config/contracts';
import { MONX_PAYMENTS_ABI } from '@/abis/monxPayments';
import { useUSDC } from './useUSDC';
import { toast } from '@/hooks/use-toast';

interface UseTipParams {
  to: string;
  amountStr: string;
  note: string;
}

export function useTip() {
  const { parseUSDC, allowance, approve, isApproving, refetchAllowance } = useUSDC();
  const [needsApprove, setNeedsApprove] = useState(false);

  const { 
    writeContract: writeTip, 
    data: tipHash,
    isPending: isTipPending,
    error: tipError 
  } = useWriteContract();

  const { isLoading: isTipConfirming, isSuccess: isTipSuccess } = useWaitForTransactionReceipt({
    hash: tipHash,
  });

  const sendTip = async ({ to, amountStr, note }: UseTipParams) => {
    // Validate address
    if (!isAddress(to)) {
      toast({
        title: 'Invalid Address',
        description: 'Please enter a valid recipient address',
        variant: 'destructive',
      });
      return { success: false };
    }

    // Validate amount
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Amount must be greater than 0',
        variant: 'destructive',
      });
      return { success: false };
    }

    const amountWei = parseUSDC(amountStr);

    // Check allowance
    if (allowance < amountWei) {
      setNeedsApprove(true);
      try {
        await approve(amountWei);
        await refetchAllowance();
        setNeedsApprove(false);
      } catch (err: any) {
        return { success: false };
      }
    }

    // Send tip
    try {
      writeTip({
        address: PAYMENT_CONTRACT,
        abi: MONX_PAYMENTS_ABI,
        functionName: 'tip',
        args: [to as `0x${string}`, amountWei, note],
      } as any, {
        onSuccess: () => {
          toast({
            title: 'Tip Sent!',
            description: `Successfully sent ${amountStr} USDC`,
          });
        },
        onError: (err: any) => {
          if (err.message?.includes('user rejected')) {
            toast({
              title: 'Transaction Rejected',
              description: 'You rejected the transaction',
              variant: 'destructive',
            });
          } else if (err.message?.includes('paused')) {
            toast({
              title: 'Contract Paused',
              description: 'The tipping contract is currently paused',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Tip Failed',
              description: err.message || 'Failed to send tip',
              variant: 'destructive',
            });
          }
        },
      });

      return { success: true, hash: tipHash };
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'An error occurred',
        variant: 'destructive',
      });
      return { success: false };
    }
  };

  return {
    sendTip,
    needsApprove,
    isApproving,
    isTipping: isTipPending || isTipConfirming,
    isTipSuccess,
    txHash: tipHash,
    error: tipError,
  };
}
