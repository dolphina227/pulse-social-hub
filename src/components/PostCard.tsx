import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Repeat2, DollarSign } from 'lucide-react';
import { formatAddress, formatTimestamp } from '@/lib/utils/format';
import { Button } from './ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import { RepostModal } from './RepostModal';
import { TipModal } from './TipModal';
import { cn } from '@/lib/utils';
import { useLikePost } from '@/hooks/useLikePost';

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
  const [repostModalOpen, setRepostModalOpen] = useState(false);
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [displayLikeCount, setDisplayLikeCount] = useState(post.likeCount);

  const { isLiked, toggleLike } = useLikePost(post.id);

  // Parse media from content
  const parseContent = (content: string) => {
    const mediaRegex = /\[media:(https?:\/\/[^\]]+)\]/g;
    const matches = [...content.matchAll(mediaRegex)];
    const mediaUrls = matches.map(match => match[1]);
    const textContent = content.replace(mediaRegex, '').trim();
    return { textContent, mediaUrls };
  };

  const { textContent, mediaUrls } = parseContent(post.content);

  const handleLike = () => {
    const newCount = toggleLike(displayLikeCount);
    setDisplayLikeCount(newCount);
    
    if (isLiked) {
      toast.success('Removed like');
    } else {
      toast.success('Post liked!');
    }
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
              {textContent && (
                <p className="text-foreground whitespace-pre-wrap break-words mb-3">
                  {textContent}
                </p>
              )}
              {mediaUrls.length > 0 && (
                <div className="mb-3 rounded-xl overflow-hidden border border-border/50">
                  {mediaUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt="Post media"
                      className="w-full h-auto object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ))}
                </div>
              )}
            </Link>

            <div className="flex items-center gap-6 text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 hover:text-pulse-cyan"
                asChild
              >
                <Link to={`/post/${post.id}`} title="View comments">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">{post.commentCount.toString()}</span>
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="gap-2 hover:text-pulse-blue"
                onClick={() => setRepostModalOpen(true)}
                title="Repost this post"
              >
                <Repeat2 className="h-4 w-4" />
                <span className="text-sm">{post.repostCount.toString()}</span>
              </Button>

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
                <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                <span className="text-sm">{displayLikeCount.toString()}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="gap-2 hover:text-pulse-purple"
                onClick={() => setTipModalOpen(true)}
              >
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Tip</span>
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

      <TipModal
        open={tipModalOpen}
        onOpenChange={setTipModalOpen}
        postId={post.id}
        postAuthor={post.author as `0x${string}`}
        authorName={authorName}
        authorAvatar={authorAvatar}
      />
    </>
  );
}
