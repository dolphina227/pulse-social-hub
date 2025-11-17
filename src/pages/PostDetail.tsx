import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PULSECHAT_CONTRACT_ADDRESS, PULSECHAT_ABI } from '@/lib/contracts';
import { AlertCircle, ArrowLeft, Heart, MessageCircle, Repeat2 } from 'lucide-react';
import { formatAddress, formatTimestamp } from '@/lib/utils/format';
import { toast } from 'sonner';
import { EmojiPicker } from '@/components/EmojiPicker';
import { RepostModal } from '@/components/RepostModal';
import { cn } from '@/lib/utils';

export default function PostDetail() {
  const { id } = useParams();
  const { address, isConnected } = useAccount();
  const [commentContent, setCommentContent] = useState('');
  const [repostModalOpen, setRepostModalOpen] = useState(false);

  const postId = id ? BigInt(id) : 0n;

  const { data: latestPosts, refetch: refetchPosts } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'getLatestPosts',
    args: [1000n],
  });

  const { data: comments, refetch: refetchComments } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'getCommentsForPost',
    args: [postId, 100n],
  });

  const { data: feeAmount } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'feeAmount',
  });

  const { writeContract, isPending } = useWriteContract();

  const post = latestPosts?.[Number(postId)];

  const { data: hasLiked, refetch: refetchLiked } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI as any,
    functionName: 'hasLikedPost',
    args: [postId, address || '0x0'],
    query: { enabled: !!address },
  }) as { data: boolean; refetch: () => void };

  const handleComment = () => {
    if (!commentContent.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    writeContract({
      address: PULSECHAT_CONTRACT_ADDRESS,
      abi: PULSECHAT_ABI,
      functionName: 'commentOnPost',
      args: [postId, commentContent],
    } as any, {
      onSuccess: () => {
        toast.success('Comment posted!');
        setCommentContent('');
        setTimeout(() => {
          refetchComments();
          refetchPosts();
        }, 2000);
      },
      onError: (error) => {
        toast.error('Failed to comment: ' + error.message);
      },
    });
  };

  const handleLike = () => {
    writeContract({
      address: PULSECHAT_CONTRACT_ADDRESS,
      abi: PULSECHAT_ABI,
      functionName: 'likePost',
      args: [postId],
    } as any, {
      onSuccess: () => {
        toast.success('Post liked!');
        refetchLiked();
        refetchPosts();
      },
      onError: (error) => {
        toast.error('Failed to like: ' + error.message);
      },
    });
  };

  const feeHuman = feeAmount ? (Number(feeAmount) / 1e6).toFixed(2) : '0.01';

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-16 md:mt-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Connect wallet to view post</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-16 md:mt-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Post not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-2xl mx-auto pb-20 md:pb-6 pt-16 lg:pt-0">
        <div className="border-b border-border/50 p-4 sticky top-16 lg:top-0 bg-background/95 backdrop-blur z-10 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h2 className="text-xl font-bold">Post</h2>
        </div>

        <div className="border-b border-border/50 p-4">
          <div className="flex gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-pulse flex-shrink-0" />
            <div className="flex-1">
              <Link to={`/profile/${post.author}`} className="font-semibold hover:underline">
                {formatAddress(post.author)}
              </Link>
              <p className="text-muted-foreground text-sm">@{formatAddress(post.author)}</p>
            </div>
          </div>

          {post.isRepost && (
            <p className="text-sm text-pulse-cyan mb-2">
              ↻ Repost of #{post.originalPostId?.toString()}
            </p>
          )}

          <p className="text-foreground text-lg whitespace-pre-wrap break-words mb-4">
            {post.content}
          </p>

          <p className="text-muted-foreground text-sm mb-4">
            {formatTimestamp(Number(post.timestamp))}
          </p>

          <div className="flex items-center gap-6 py-3 border-t border-b border-border/50">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-2 hover:text-pulse-magenta",
                hasLiked && "text-pulse-magenta"
              )}
              onClick={handleLike}
              disabled={hasLiked}
            >
              <Heart className={cn("h-5 w-5", hasLiked && "fill-current")} />
              <span>{post.likeCount?.toString() || '0'}</span>
            </Button>

            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
              <span>{post.commentCount?.toString() || '0'}</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2 hover:text-pulse-blue"
              onClick={() => setRepostModalOpen(true)}
            >
              <Repeat2 className="h-5 w-5" />
              <span>{post.repostCount?.toString() || '0'}</span>
            </Button>
          </div>
        </div>

        <div className="border-b border-border/50 p-4">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-pulse flex-shrink-0" />
            <div className="flex-1">
              <Textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Post your reply..."
                className="min-h-[100px] resize-none border-0 focus-visible:ring-0 p-0"
              />
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                <EmojiPicker onEmojiSelect={(emoji) => setCommentContent(commentContent + emoji)} />
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Fee: {feeHuman} USDC</span>
                  <Button
                    onClick={handleComment}
                    disabled={isPending || !commentContent.trim()}
                    variant="gradient"
                    size="lg"
                    className="rounded-full px-6"
                  >
                    {isPending ? 'Replying...' : 'Reply'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          {comments && comments.length > 0 ? (
            comments.map((comment: any, index: number) => (
              <div key={index} className="border-b border-border/50 p-4 hover:bg-muted/30 transition-colors">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-pulse flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Link to={`/profile/${comment.author}`} className="font-semibold hover:underline text-sm">
                        {formatAddress(comment.author)}
                      </Link>
                      <span className="text-muted-foreground text-xs">
                        @{formatAddress(comment.author)}
                      </span>
                      <span className="text-muted-foreground text-xs">·</span>
                      <span className="text-muted-foreground text-xs">
                        {formatTimestamp(Number(comment.timestamp))}
                      </span>
                    </div>
                    <p className="text-foreground text-sm whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <p>No comments yet. Be the first to reply!</p>
            </div>
          )}
        </div>
      </div>

      <RepostModal
        open={repostModalOpen}
        onOpenChange={setRepostModalOpen}
        postId={postId}
        originalContent={post.content}
        originalAuthor={post.author}
        timestamp={Number(post.timestamp)}
        onSuccess={() => refetchPosts()}
      />
    </>
  );
}
