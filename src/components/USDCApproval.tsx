import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';
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
      <Alert className="mb-4 border-yellow-500/50 bg-yellow-500/10">
        <AlertCircle className="h-4 w-4 text-yellow-500" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <p className="font-semibold mb-1">USDC Approval Required</p>
            <p className="text-sm text-muted-foreground">
              You need to approve USDC before making posts, comments, or messages.
              {balanceAmount > 0 
                ? ` Your balance: ${balanceAmount.toFixed(2)} USDC`
                : ' You need USDC in your wallet first.'}
            </p>
          </div>
          <Button
            onClick={handleApprove}
            disabled={isPending || balanceAmount === 0}
            variant="outline"
            className="ml-4"
          >
            {isPending ? 'Approving...' : 'Approve USDC'}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4 border-green-500/50 bg-green-500/10">
      <CheckCircle2 className="h-4 w-4 text-green-500" />
      <AlertDescription>
        <p className="font-semibold">USDC Approved</p>
        <p className="text-sm text-muted-foreground">
          Allowance: {allowanceAmount.toFixed(2)} USDC | Balance: {balanceAmount.toFixed(2)} USDC
        </p>
      </AlertDescription>
    </Alert>
  );
}
