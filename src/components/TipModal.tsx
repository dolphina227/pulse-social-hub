import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Avatar } from './ui/avatar';
import { PULSECHAT_CONTRACT_ADDRESS, PULSECHAT_ABI, ERC20_ABI } from '@/lib/contracts';
import { formatAddress } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { EmojiPicker } from './EmojiPicker';
import { DollarSign } from 'lucide-react';

interface TipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: bigint;
  postAuthor: `0x${string}`;
  authorName?: string;
  authorAvatar?: string;
}

export function TipModal({ 
  open, 
  onOpenChange, 
  postId, 
  postAuthor, 
  authorName,
  authorAvatar 
}: TipModalProps) {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState(`Tip for post #${postId}`);

  // Read USDC address from contract
  const { data: usdcAddress } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'usdc',
  }) as { data: `0x${string}` | undefined };

  // Read fee amount
  const { data: feeAmount } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'feeAmount',
  });

  // Read USDC decimals
  const { data: usdcDecimals } = useReadContract({
    address: usdcAddress,
    abi: ERC20_ABI,
    functionName: 'decimals',
  }) as { data: number | undefined };

  // Read user USDC balance
  const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
    address: usdcAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Read USDC allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: usdcAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, PULSECHAT_CONTRACT_ADDRESS] : undefined,
  });

  const { writeContract: approveUsdc, isPending: isApproving } = useWriteContract();
  const { writeContract: sendTip, isPending: isSending } = useWriteContract();

  // Calculate values
  const decimals = usdcDecimals || 6;
  const feeHuman = feeAmount ? (Number(feeAmount) / Math.pow(10, decimals)).toFixed(2) : '0.01';
  const balanceHuman = usdcBalance ? (Number(usdcBalance) / Math.pow(10, decimals)).toFixed(2) : '0.00';

  const tipAmountSmallest = amount && parseFloat(amount) > 0 
    ? BigInt(Math.floor(parseFloat(amount) * Math.pow(10, decimals)))
    : 0n;

  const totalRequired = tipAmountSmallest + (feeAmount || 0n);
  const totalRequiredHuman = totalRequired ? (Number(totalRequired) / Math.pow(10, decimals)).toFixed(2) : '0.00';

  const hasEnoughBalance = usdcBalance && totalRequired ? usdcBalance >= totalRequired : false;
  const hasEnoughAllowance = allowance && totalRequired ? allowance >= totalRequired : false;
  const canSendTip = hasEnoughBalance && hasEnoughAllowance && parseFloat(amount) > 0;

  const handleApprove = () => {
    if (!usdcAddress) return;

    // Approve large amount to avoid frequent approvals (1000 USDC)
    const approveAmount = BigInt(1000 * Math.pow(10, decimals));

    approveUsdc({
      address: usdcAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [PULSECHAT_CONTRACT_ADDRESS, approveAmount],
    } as any, {
      onSuccess: () => {
        toast.success('USDC approved successfully!');
        setTimeout(() => {
          refetchAllowance();
        }, 2000);
      },
      onError: (error) => {
        toast.error('Failed to approve USDC: ' + error.message);
      },
    });
  };

  const handleSendTip = () => {
    if (!canSendTip) {
      toast.error('Please check amount and balance');
      return;
    }

    sendTip({
      address: PULSECHAT_CONTRACT_ADDRESS,
      abi: PULSECHAT_ABI,
      functionName: 'tipUSDC',
      args: [postAuthor, tipAmountSmallest, note || ''],
    } as any, {
      onSuccess: () => {
        toast.success(`You tipped ${amount} USDC (+${feeHuman} USDC fee) to the author of Post #${postId.toString()}`);
        setAmount('');
        setNote(`Tip for post #${postId}`);
        onOpenChange(false);
        refetchBalance();
        refetchAllowance();
      },
      onError: (error) => {
        toast.error('Failed to send tip: ' + error.message);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Tip with USDC
          </DialogTitle>
          <DialogDescription>
            Send USDC directly to the author on-chain
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Recipient Info */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
            {authorAvatar ? (
              <img src={authorAvatar} alt="Author" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-pulse flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {formatAddress(postAuthor).slice(0, 2)}
                </span>
              </div>
            )}
            <div className="flex-1">
              <p className="font-semibold text-foreground">
                {authorName || formatAddress(postAuthor)}
              </p>
              <p className="text-xs text-muted-foreground">
                @{formatAddress(postAuthor)}
              </p>
              <p className="text-xs text-primary mt-1">
                Tipping author of Post #{postId.toString()}
              </p>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <Label htmlFor="tip-amount" className="text-sm font-medium">
              Tip Amount (USDC)
            </Label>
            <Input
              id="tip-amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="mt-1.5"
            />
          </div>

          {/* Note Input */}
          <div>
            <Label htmlFor="tip-note" className="text-sm font-medium">
              Note (optional)
            </Label>
            <div className="flex gap-2 mt-1.5">
              <Textarea
                id="tip-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a message..."
                className="flex-1 min-h-[80px]"
              />
              <EmojiPicker onEmojiSelect={(emoji) => setNote(note + emoji)} />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-4 rounded-lg border border-primary/20 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tip amount:</span>
              <span className="font-semibold text-foreground">{amount || '0.00'} USDC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform fee:</span>
              <span className="font-semibold text-foreground">{feeHuman} USDC</span>
            </div>
            <div className="border-t border-border/50 pt-2 flex justify-between">
              <span className="font-semibold">Total required:</span>
              <span className="font-bold text-primary">{totalRequiredHuman} USDC</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Your balance:</span>
              <span className={cn(
                "font-medium",
                hasEnoughBalance ? "text-green-500" : "text-destructive"
              )}>{balanceHuman} USDC</span>
            </div>
          </div>

          {/* Error Messages */}
          {!hasEnoughBalance && parseFloat(amount) > 0 && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              Insufficient USDC balance. You need at least {totalRequiredHuman} USDC.
            </div>
          )}

          {/* Action Buttons */}
          {!hasEnoughAllowance ? (
            <Button
              onClick={handleApprove}
              disabled={isApproving}
              variant="gradient"
              className="w-full"
            >
              {isApproving ? 'Approving USDC...' : 'Approve USDC'}
            </Button>
          ) : (
            <Button
              onClick={handleSendTip}
              disabled={isSending || !canSendTip}
              variant="gradient"
              className="w-full"
            >
              {isSending ? 'Sending Tip...' : 'Send Tip'}
            </Button>
          )}

          <p className="text-xs text-center text-muted-foreground">
            Tipping sends USDC directly to the post author on PulseChain
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
