import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { PULSECHAT_CONTRACT_ADDRESS, PULSECHAT_ABI } from '@/lib/contracts';
import { toast } from 'sonner';
import { EmojiPicker } from './EmojiPicker';
import { formatAddress, formatTimestamp } from '@/lib/utils/format';
import { useUsdcApprovalForFee } from '@/hooks/useUsdcApprovalForFee';
import { AlertCircle } from 'lucide-react';

interface QuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: bigint;
  originalContent: string;
  originalAuthor: string;
  timestamp: number;
  onSuccess?: () => void;
}

export function QuoteModal({
  open,
  onOpenChange,
  postId,
  originalContent,
  originalAuthor,
  timestamp,
  onSuccess,
}: QuoteModalProps) {
  const [content, setContent] = useState('');
  const { writeContract, isPending } = useWriteContract();
  
  const {
    hasAllowance,
    isApproving,
    handleApprove,
    feeHuman,
    balanceHuman,
    balance,
    feeAmount,
  } = useUsdcApprovalForFee();

  const handleQuote = async () => {
    if (!content.trim()) {
      toast.error('Please add your thoughts to quote this post');
      return;
    }

    if (!balance || !feeAmount || balance < feeAmount) {
      toast.error(`Insufficient USDC balance. You need at least ${feeHuman} USDC.`);
      return;
    }

    writeContract({
      address: PULSECHAT_CONTRACT_ADDRESS,
      abi: PULSECHAT_ABI,
      functionName: 'repostPost',
      args: [postId, content],
    } as any, {
      onSuccess: () => {
        toast.success('Quote posted successfully!');
        setContent('');
        onOpenChange(false);
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      },
      onError: (error) => {
        console.error('Quote error:', error);
        toast.error('Failed to quote: ' + error.message);
      },
    });
  };

  const insufficientBalance = balance && feeAmount ? balance < feeAmount : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Quote Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="bg-blue-500/10 border-blue-500/20">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-500">
              Quoting creates an on-chain post and costs {feeHuman} USDC
            </AlertDescription>
          </Alert>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Add your thoughts (required)
            </label>
            <div className="flex gap-2">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What do you think about this?"
                className="flex-1 min-h-[100px]"
              />
              <EmojiPicker onEmojiSelect={(emoji) => setContent(content + emoji)} />
            </div>
          </div>

          <div className="border border-border/50 rounded-lg p-4 bg-muted/30">
            <p className="text-xs text-muted-foreground mb-2">Quoting:</p>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-pulse flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-sm">{formatAddress(originalAuthor)}</p>
                <p className="text-xs text-muted-foreground mb-2">{formatTimestamp(timestamp)}</p>
                <p className="text-sm text-foreground whitespace-pre-wrap break-words">{originalContent}</p>
              </div>
            </div>
          </div>

          {insufficientBalance && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Insufficient USDC balance. You have {balanceHuman} USDC but need {feeHuman} USDC to quote.
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-muted/50 p-3 rounded-lg text-sm">
            <p className="text-muted-foreground">
              💡 Quote costs <span className="font-bold text-foreground">{feeHuman} USDC</span> (on-chain fee)
            </p>
          </div>

          <div className="flex gap-2">
            {!hasAllowance ? (
              <Button
                onClick={handleApprove}
                disabled={isApproving}
                variant="outline"
                className="flex-1"
              >
                {isApproving ? 'Approving USDC...' : 'Approve USDC First'}
              </Button>
            ) : (
              <Button
                onClick={handleQuote}
                disabled={isPending || !content.trim() || insufficientBalance}
                variant="gradient"
                className="flex-1"
              >
                {isPending ? 'Quoting...' : `Quote (${feeHuman} USDC)`}
              </Button>
            )}
            <Button
              onClick={() => onOpenChange(false)}
              variant="ghost"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
