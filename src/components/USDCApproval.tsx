import { useAccount } from 'wagmi';
import { Button } from './ui/button';
import { useUsdcApprovalForFee } from '@/hooks/useUsdcApprovalForFee';

interface USDCApprovalProps {
  onApprovalComplete?: () => void;
}

export function USDCApproval({ onApprovalComplete }: USDCApprovalProps) {
  const { address } = useAccount();
  const { hasAllowance, isApproving, handleApprove, balanceHuman } = useUsdcApprovalForFee();

  if (!address) return null;

  if (!hasAllowance) {
    const handleClick = async () => {
      await handleApprove();
      onApprovalComplete?.();
    };

    return (
      <div className="flex items-center justify-end gap-3">
        <span className="text-sm text-muted-foreground">
          {balanceHuman === '0.00' ? 'No USDC balance' : 'Approve USDC first'}
        </span>
        <Button
          onClick={handleClick}
          disabled={isApproving || balanceHuman === '0.00'}
          variant="gradient"
          size="lg"
          className="rounded-full px-6"
        >
          {isApproving ? 'Approving...' : 'Approve'}
        </Button>
      </div>
    );
  }

  return null;
}

