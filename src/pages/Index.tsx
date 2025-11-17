import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PULSECHAT_CONTRACT_ADDRESS, PULSECHAT_ABI } from '@/lib/contracts';
import { Heart, MessageCircle, Repeat2, Send, AlertCircle, ImageIcon, Smile } from 'lucide-react';
import { formatAddress, formatTimestamp } from '@/lib/utils/format';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

export default function Index() {
  const { isConnected } = useAccount();
  const [newPostContent, setNewPostContent] = useState('');
  const { writeContract, isPending } = useWriteContract();

  const { data: posts, refetch } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'getLatestPosts',
    args: [50n],
  });

  const { data: totalPosts } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'totalPosts',
  });

  const { data: totalUsers } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'totalUsers',
  });

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return toast.error('Please enter content');
    writeContract({
      address: PULSECHAT_CONTRACT_ADDRESS,
      abi: PULSECHAT_ABI,
      functionName: 'createPost',
      args: [newPostContent],
    } as any);
  };

  const handleLikePost = (postId: bigint) => {
    writeContract({
      address: PULSECHAT_CONTRACT_ADDRESS,
      abi: PULSECHAT_ABI,
      functionName: 'likePost',
      args: [postId],
    } as any);
  };

  if (!isConnected) {
    return (
      <div className="pt-16 lg:pt-0">
        <div className="border-b border-border/50 px-4 py-4 backdrop-blur-sm sticky top-0 z-10 bg-background/80">
          <h2 className="text-xl font-bold">Home</h2>
        </div>
        
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold gradient-pulse-text">
              Welcome to PULSECHAT
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              The decentralized social network on PulseChain
            </p>
          </div>
          
          <Alert className="max-w-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Connect your wallet to start posting and interacting
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 lg:pb-0 pt-16 lg:pt-0">
      {/* Header */}
      <div className="border-b border-border/50 px-4 py-4 backdrop-blur-sm sticky top-0 z-10 bg-background/80">
        <h2 className="text-xl font-bold">Home</h2>
      </div>

      {/* New Post Composer */}
      <div className="border-b border-border/50 px-4 py-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-pulse flex-shrink-0" />
          
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="What's happening on PulseChain?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="min-h-[80px] resize-none border-0 p-0 focus-visible:ring-0 text-lg placeholder:text-muted-foreground/50"
              maxLength={500}
            />
            
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-primary">
                  <ImageIcon className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-primary">
                  <Smile className="h-5 w-5" />
                </Button>
                <span className="text-xs text-muted-foreground ml-2">
                  {newPostContent.length}/500
                </span>
              </div>
              
              <Button
                variant="gradient"
                onClick={handleCreatePost}
                disabled={isPending || !newPostContent.trim()}
                className="rounded-full px-6"
              >
                {isPending ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div>
        {posts && posts.length > 0 ? (
          posts.map((post, index) => (
            <div key={post.id.toString()}>
              <div className="px-4 py-4 hover:bg-muted/30 transition-colors cursor-pointer border-b border-border/50">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-pulse flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold hover:underline">{formatAddress(post.author)}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-sm text-muted-foreground">
                        {formatTimestamp(Number(post.timestamp))}
                      </span>
                      {post.isRepost && (
                        <>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-xs text-pulse-cyan">Repost</span>
                        </>
                      )}
                    </div>
                    
                    <p className="text-foreground whitespace-pre-wrap break-words">
                      {post.content}
                    </p>
                    
                    <div className="flex items-center justify-between max-w-md pt-2">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        disabled={isPending}
                        className="flex items-center gap-2 text-muted-foreground hover:text-pulse-magenta transition-colors group"
                      >
                        <div className="p-2 rounded-full group-hover:bg-pulse-magenta/10 transition-colors">
                          <MessageCircle className="h-4 w-4" />
                        </div>
                        <span className="text-sm">{post.commentCount.toString()}</span>
                      </button>
                      
                      <button className="flex items-center gap-2 text-muted-foreground hover:text-pulse-cyan transition-colors group">
                        <div className="p-2 rounded-full group-hover:bg-pulse-cyan/10 transition-colors">
                          <Repeat2 className="h-4 w-4" />
                        </div>
                        <span className="text-sm">{post.repostCount.toString()}</span>
                      </button>
                      
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className="flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-colors group"
                      >
                        <div className="p-2 rounded-full group-hover:bg-red-500/10 transition-colors">
                          <Heart className="h-4 w-4 group-hover:fill-red-500" />
                        </div>
                        <span className="text-sm">{post.likeCount.toString()}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">No posts yet. Be the first to post!</p>
          </div>
        )}
      </div>
    </div>
  );
}
