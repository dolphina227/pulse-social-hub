import { useState } from 'react';
import { useWriteContract, useReadContract } from 'wagmi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { PULSECHAT_CONTRACT_ADDRESS, PULSECHAT_ABI } from '@/lib/contracts';
import { toast } from 'sonner';
import { EmojiPicker } from './EmojiPicker';
import { formatAddress, formatTimestamp } from '@/lib/utils/format';

interface RepostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: bigint;
  originalContent: string;
  originalAuthor: string;
  timestamp: number;
  onSuccess?: () => void;
}

export function RepostModal({
  open,
  onOpenChange,
  postId,
  originalContent,
  originalAuthor,
  timestamp,
  onSuccess,
}: RepostModalProps) {
  const [content, setContent] = useState('');

  const { data: feeAmount } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'feeAmount',
  });

  const { writeContract, isPending } = useWriteContract();

  const handleRepost = async () => {
    writeContract({
      address: PULSECHAT_CONTRACT_ADDRESS,
      abi: PULSECHAT_ABI,
      functionName: 'repostPost',
      args: [postId, content],
    } as any, {
      onSuccess: () => {
        toast.success('Reposted successfully!');
        setContent('');
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error) => {
        toast.error('Failed to repost: ' + error.message);
      },
    });
  };

  const feeHuman = feeAmount ? (Number(feeAmount) / 1e6).toFixed(2) : '0.01';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Repost</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="flex gap-2">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Add your thoughts (optional)..."
                className="flex-1 min-h-[100px]"
              />
              <EmojiPicker onEmojiSelect={(emoji) => setContent(content + emoji)} />
            </div>
          </div>

          <div className="border border-border/50 rounded-lg p-4 bg-muted/30">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-pulse" />
              <div className="flex-1">
                <p className="font-semibold text-sm">{formatAddress(originalAuthor)}</p>
                <p className="text-xs text-muted-foreground">{formatTimestamp(timestamp)}</p>
                <p className="mt-2 text-sm">{originalContent}</p>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg text-sm">
            <p className="text-muted-foreground">
              This action costs <span className="font-bold text-foreground">{feeHuman} USDC</span>
            </p>
          </div>

          <Button
            onClick={handleRepost}
            disabled={isPending}
            variant="gradient"
            className="w-full"
          >
            {isPending ? 'Reposting...' : `Repost (${feeHuman} USDC)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
