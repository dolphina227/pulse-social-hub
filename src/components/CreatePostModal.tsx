import { useState } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PULSECHAT_CONTRACT_ADDRESS, PULSECHAT_ABI } from '@/lib/contracts';
import { toast } from 'sonner';
import { EmojiPicker } from '@/components/EmojiPicker';
import { MediaUpload } from '@/components/MediaUpload';
import { USDCApproval } from '@/components/USDCApproval';
import { useUsdcApprovalForFee } from '@/hooks/useUsdcApprovalForFee';
import { X } from 'lucide-react';

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated?: () => void;
}

export function CreatePostModal({ open, onOpenChange, onPostCreated }: CreatePostModalProps) {
  const { isConnected, address } = useAccount();
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const { hasAllowance, feeHuman } = useUsdcApprovalForFee();

  const { data: currentUserProfile } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'profiles',
    args: address ? [address] : undefined,
  }) as { data: any };

  const currentUserAvatar = currentUserProfile?.[2] || '';

  const { writeContract, isPending } = useWriteContract();

  const handlePost = async () => {
    if (!content.trim() && !mediaUrl) {
      toast.error('Please enter content or upload media');
      return;
    }

    if (!hasAllowance) {
      toast.error('USDC approval or balance is not sufficient. Please approve USDC first.');
      return;
    }

    const postContent = mediaUrl ? `${content}\n\n[media:${mediaUrl}]` : content;

    writeContract({
      address: PULSECHAT_CONTRACT_ADDRESS,
      abi: PULSECHAT_ABI,
      functionName: 'createPost',
      args: [postContent],
    } as any, {
      onSuccess: () => {
        toast.success('Post created on-chain!');
        setContent('');
        setMediaUrl('');
        onOpenChange(false);
        onPostCreated?.();
      },
      onError: (error) => {
        toast.error('Failed to create post: ' + error.message);
      },
    });
  };

  const handleClose = () => {
    if (!isPending) {
      onOpenChange(false);
      setContent('');
      setMediaUrl('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 bg-background border-border">
        <DialogHeader className="px-4 py-3 border-b border-border/50 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-4 flex-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleClose}
              disabled={isPending}
            >
              <X className="h-5 w-5" />
            </Button>
            <DialogTitle className="text-base font-semibold">Create Post</DialogTitle>
          </div>
          <span className="text-sm text-primary">Drafts</span>
        </DialogHeader>

        <div className="p-4">
          <div className="flex gap-3">
            {currentUserAvatar ? (
              <img src={currentUserAvatar} alt="Your profile" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-pulse flex-shrink-0" />
            )}

            <div className="flex-1 space-y-4">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening?"
                className="min-h-[120px] resize-none border-0 focus-visible:ring-0 text-lg p-0 placeholder:text-muted-foreground/60"
              />

              {mediaUrl && (
                <div className="rounded-xl overflow-hidden border border-border/50">
                  <img src={mediaUrl} alt="Upload preview" className="w-full h-auto" />
                </div>
              )}

              <div className="flex items-center text-sm text-primary gap-2">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" />
                </svg>
                Everyone can reply
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <MediaUpload
              onMediaSelect={setMediaUrl}
              onMediaRemove={() => setMediaUrl('')}
              mediaUrl={mediaUrl}
            />
            <EmojiPicker onEmojiSelect={(emoji) => setContent(content + emoji)} />
          </div>

          <div className="flex items-center gap-3">
            {!isConnected ? (
              <div className="text-xs text-muted-foreground">Connect wallet to post</div>
            ) : !hasAllowance ? (
              <USDCApproval />
            ) : (
              <>
                <span className="text-xs text-muted-foreground">Fee: {feeHuman} USDC</span>
                <Button
                  onClick={handlePost}
                  disabled={isPending || (!content.trim() && !mediaUrl)}
                  variant="gradient"
                  size="lg"
                  className="rounded-full px-6"
                >
                  {isPending ? 'Posting...' : 'Post'}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
