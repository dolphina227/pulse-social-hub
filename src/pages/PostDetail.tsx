import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PULSECHAT_CONTRACT_ADDRESS, PULSECHAT_ABI } from '@/lib/contracts';
import { AlertCircle, ArrowLeft, Heart, MessageCircle, Repeat2 } from 'lucide-react';
import { formatAddress, formatTimestamp } from '@/lib/utils/format';
import { toast } from 'sonner';
import { RepostOptionsModal } from '@/components/RepostOptionsModal';
import { QuoteModal } from '@/components/QuoteModal';
import { CommentComposer } from '@/components/CommentComposer';
import { cn } from '@/lib/utils';
import { useLikePost } from '@/hooks/useLikePost';
import { useRepost } from '@/hooks/useRepost';

export default function PostDetail() {
  const { id } = useParams();
  const { isConnected } = useAccount();
  const [repostOptionsOpen, setRepostOptionsOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  const postId = id ? BigInt(id) : 0n;

  const { data: post, refetch: refetchPost } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'posts',
    args: [postId],
  });

  const { data: comments, refetch: refetchComments } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'getCommentsForPost',
    args: [postId, 100n],
  });

  const [displayLikeCount, setDisplayLikeCount] = useState(0);
  const { isLiked, toggleLike } = useLikePost(postId);
  const { isReposted, toggleRepost, getPostRepostCount } = useRepost(postId);

  // Update display counts when post data loads
  useEffect(() => {
    if (post) {
      setDisplayLikeCount(Number(post[4] || 0));
    }
  }, [post]);
  
  // Calculate total repost count (on-chain + UI-only)
  const totalRepostCount = (post ? Number(post[6] || 0) : 0) + getPostRepostCount();

  const handleLike = () => {
    const currentCount = Number(post?.[4] || 0);
    const newCount = toggleLike(currentCount);
    setDisplayLikeCount(newCount);
    
    if (isLiked) {
      toast.success('Removed like');
    } else {
      toast.success('Post liked!');
    }
  };

  const handleRepost = () => {
    toggleRepost();
    
    if (isReposted) {
      toast.success('Removed from your profile');
    } else {
      toast.success('Reposted to your profile!');
    }
  };

  const handleCommentSuccess = () => {
    refetchComments();
    refetchPost();
  };

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
              <Link to={`/profile/${post[1]}`} className="font-semibold hover:underline">
                {formatAddress(post[1])}
              </Link>
              <p className="text-muted-foreground text-sm">@{formatAddress(post[1])}</p>
            </div>
          </div>

          {post[7] && (
            <p className="text-sm text-pulse-cyan mb-2">
              ↻ Repost of #{post[8]?.toString()}
            </p>
          )}

          <p className="text-foreground text-lg whitespace-pre-wrap break-words mb-4">
            {post[2]}
          </p>

          <p className="text-muted-foreground text-sm mb-4">
            {formatTimestamp(Number(post[3]))}
          </p>

          <div className="flex items-center gap-6 py-3 border-t border-b border-border/50">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-2 hover:text-pulse-magenta transition-colors",
                isLiked && "text-pulse-magenta"
              )}
              onClick={handleLike}
              title={isLiked ? "Unlike this post" : "Like this post"}
            >
              <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
              <span>{displayLikeCount}</span>
            </Button>

            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageCircle className="h-5 w-5" />
              <span>{post[5]?.toString() || '0'}</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-2 hover:text-pulse-blue transition-colors",
                isReposted && "text-pulse-blue"
              )}
              onClick={() => setRepostOptionsOpen(true)}
              title={isReposted ? "Reposted" : "Repost or Quote"}
            >
              <Repeat2 className="h-5 w-5" />
              <span>{totalRepostCount}</span>
            </Button>
          </div>
        </div>


        <CommentComposer postId={postId} onSuccess={handleCommentSuccess} />


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

      <RepostOptionsModal
        open={repostOptionsOpen}
        onOpenChange={setRepostOptionsOpen}
        onRepost={handleRepost}
        onQuote={() => setQuoteModalOpen(true)}
        isReposted={isReposted}
      />

      <QuoteModal
        open={quoteModalOpen}
        onOpenChange={setQuoteModalOpen}
        postId={postId}
        originalContent={post[2]}
        originalAuthor={post[1]}
        timestamp={Number(post[3])}
        onSuccess={() => refetchPost()}
      />
    </>
  );
}
