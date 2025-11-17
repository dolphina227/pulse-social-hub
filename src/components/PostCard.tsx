import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Repeat2, MoreHorizontal } from 'lucide-react';
import { formatAddress, formatTimestamp } from '@/lib/utils/format';
import { Button } from './ui/button';
import { useState } from 'react';
import { useWriteContract, useReadContract, useAccount } from 'wagmi';
import { PULSECHAT_CONTRACT_ADDRESS, PULSECHAT_ABI } from '@/lib/contracts';
import { toast } from 'sonner';
import { RepostModal } from './RepostModal';
import { cn } from '@/lib/utils';

interface Post {
  id: bigint;
  author: string;
  content: string;
  timestamp: number;
  likeCount: number;
  commentCount: number;
  repostCount: number;
  isRepost: boolean;
  originalPostId: bigint;
}

interface PostCardProps {
  post: Post;
  authorName?: string;
  authorAvatar?: string;
  onUpdate?: () => void;
}

export function PostCard({ post, authorName, authorAvatar, onUpdate }: PostCardProps) {
  const { address } = useAccount();
  const [repostModalOpen, setRepostModalOpen] = useState(false);

  const { data: hasLiked, refetch: refetchLiked } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI as any,
    functionName: 'hasLikedPost',
    args: [post.id, address || '0x0'],
  }) as { data: boolean; refetch: () => void };

  const { writeContract, isPending: isLiking } = useWriteContract();

  const handleLike = () => {
    writeContract({
      address: PULSECHAT_CONTRACT_ADDRESS,
      abi: PULSECHAT_ABI,
      functionName: 'likePost',
      args: [post.id],
    } as any, {
      onSuccess: () => {
        toast.success('Post liked!');
        refetchLiked();
        onUpdate?.();
      },
      onError: (error) => {
        toast.error('Failed to like: ' + error.message);
      },
    });
  };

  return (
    <>
      <div className="border-b border-border/50 p-4 hover:bg-muted/30 transition-colors">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            {authorAvatar ? (
              <img src={authorAvatar} alt="Avatar" className="w-12 h-12 rounded-full" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-pulse" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link to={`/profile/${post.author}`} className="font-semibold hover:underline">
                {authorName || formatAddress(post.author)}
              </Link>
              <span className="text-muted-foreground text-sm">
                @{formatAddress(post.author)}
              </span>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm">
                {formatTimestamp(post.timestamp)}
              </span>
            </div>

            {post.isRepost && (
              <p className="text-sm text-pulse-cyan mb-2">
                ↻ Repost of #{post.originalPostId.toString()}
              </p>
            )}

            <Link to={`/post/${post.id}`}>
              <p className="text-foreground whitespace-pre-wrap break-words mb-3">
                {post.content}
              </p>
            </Link>

            <div className="flex items-center gap-6 text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 hover:text-pulse-cyan"
                asChild
              >
                <Link to={`/post/${post.id}`}>
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">{post.commentCount.toString()}</span>
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="gap-2 hover:text-pulse-blue"
                onClick={() => setRepostModalOpen(true)}
              >
                <Repeat2 className="h-4 w-4" />
                <span className="text-sm">{post.repostCount.toString()}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2 hover:text-pulse-magenta",
                  hasLiked && "text-pulse-magenta"
                )}
                onClick={handleLike}
                disabled={isLiking || hasLiked}
              >
                <Heart className={cn("h-4 w-4", hasLiked && "fill-current")} />
                <span className="text-sm">{post.likeCount.toString()}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <RepostModal
        open={repostModalOpen}
        onOpenChange={setRepostModalOpen}
        postId={post.id}
        originalContent={post.content}
        originalAuthor={post.author}
        timestamp={post.timestamp}
        onSuccess={onUpdate}
      />
    </>
  );
}
