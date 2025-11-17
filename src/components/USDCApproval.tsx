import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { Button } from './ui/button';
import { PULSECHAT_CONTRACT_ADDRESS, USDC_ADDRESS, ERC20_ABI } from '@/lib/contracts';
import { toast } from 'sonner';
import { parseUnits } from 'viem';

export function USDCApproval() {
  const { address } = useAccount();

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address || '0x0', PULSECHAT_CONTRACT_ADDRESS],
  }) as { data: bigint; refetch: () => void };

  const { data: balance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address || '0x0'],
  }) as { data: bigint };

  const { writeContract, isPending } = useWriteContract();

  const handleApprove = () => {
    // Approve a large amount (1 million USDC)
    const approvalAmount = parseUnits('1000000', 6);
    
    writeContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [PULSECHAT_CONTRACT_ADDRESS, approvalAmount],
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

  const allowanceAmount = allowance ? Number(allowance) / 1e6 : 0;
  const balanceAmount = balance ? Number(balance) / 1e6 : 0;
  const needsApproval = allowanceAmount < 1;

  if (!address) return null;

  if (needsApproval) {
    return (
      <div className="flex items-center justify-end gap-3">
        <span className="text-sm text-muted-foreground">Need USDC approval first</span>
        <Button
          onClick={handleApprove}
          disabled={isPending || balanceAmount === 0}
          variant="gradient"
          size="lg"
          className="rounded-full px-6"
        >
          {isPending ? 'Approving...' : 'Approve'}
        </Button>
      </div>
    );
  }

  return null;
}
