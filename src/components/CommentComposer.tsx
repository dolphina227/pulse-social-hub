import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { PULSECHAT_CONTRACT_ADDRESS, PULSECHAT_ABI } from '@/lib/contracts';
import { toast } from 'sonner';
import { EmojiPicker } from './EmojiPicker';
import { useUsdcApprovalForFee } from '@/hooks/useUsdcApprovalForFee';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface CommentComposerProps {
  postId: bigint;
  onSuccess?: () => void;
}

export function CommentComposer({ postId, onSuccess }: CommentComposerProps) {
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

  const handleComment = () => {
    if (!content.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    if (!balance || !feeAmount || balance < feeAmount) {
      toast.error(`Insufficient USDC balance. You need at least ${feeHuman} USDC.`);
      return;
    }

    writeContract({
      address: PULSECHAT_CONTRACT_ADDRESS,
      abi: PULSECHAT_ABI,
      functionName: 'commentOnPost',
      args: [postId, content],
    } as any, {
      onSuccess: () => {
        toast.success('Comment posted successfully!');
        setContent('');
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      },
      onError: (error) => {
        console.error('Comment error:', error);
        toast.error('Failed to comment: ' + error.message);
      },
    });
  };

  const insufficientBalance = balance && feeAmount ? balance < feeAmount : false;

  return (
    <div className="border-b border-border/50 p-4">
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-pulse flex-shrink-0" />
        <div className="flex-1 space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Post your reply..."
            className="min-h-[100px] resize-none"
          />
          
          {insufficientBalance && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Insufficient USDC balance. You have {balanceHuman} USDC but need {feeHuman} USDC to comment.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <EmojiPicker onEmojiSelect={(emoji) => setContent(content + emoji)} />
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Fee: {feeHuman} USDC
              </span>
              
              {!hasAllowance ? (
                <Button
                  onClick={handleApprove}
                  disabled={isApproving}
                  variant="outline"
                  size="lg"
                  className="rounded-full px-6"
                >
                  {isApproving ? 'Approving...' : 'Approve USDC'}
                </Button>
              ) : (
                <Button
                  onClick={handleComment}
                  disabled={isPending || !content.trim() || insufficientBalance}
                  variant="gradient"
                  size="lg"
                  className="rounded-full px-6"
                >
                  {isPending ? 'Posting...' : `Comment (${feeHuman} USDC)`}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
