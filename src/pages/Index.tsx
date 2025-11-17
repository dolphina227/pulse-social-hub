import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PULSECHAT_CONTRACT_ADDRESS, PULSECHAT_ABI } from '@/lib/contracts';
import { Heart, MessageCircle, Repeat2, Send, AlertCircle } from 'lucide-react';
import { formatAddress, formatTimestamp } from '@/lib/utils/format';
import { toast } from 'sonner';

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
    if (!newPostContent.trim()) {
      toast.error('Please enter some content');
      return;
    }

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold gradient-pulse-text animate-slide-up">
            Welcome to PULSECHAT
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            The first fully on-chain social network on PulseChain. Share, connect, and earn - all on the blockchain.
          </p>
        </div>
        
        <Alert className="max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Connect your wallet to start posting, messaging, and tipping on the PulseChain blockchain.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20 md:pb-6">
      {/* Main Feed */}
      <div className="lg:col-span-2 space-y-6">
        {/* New Post Composer */}
        <Card className="glass-effect border-border/50">
          <CardHeader>
            <h2 className="text-xl font-semibold">Create Post</h2>
            <p className="text-sm text-muted-foreground">
              Costs 0.01 USDC platform fee
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="What's happening on PulseChain?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="min-h-[120px] resize-none bg-background/50"
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {newPostContent.length}/500
              </span>
              <Button
                variant="gradient"
                onClick={handleCreatePost}
                disabled={isPending || !newPostContent.trim()}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {isPending ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <Card key={post.id.toString()} className="glass-effect border-border/50 hover:border-primary/20 transition-all">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-pulse flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-white">
                        {formatAddress(post.author).slice(0, 2)}
                      </span>
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{formatAddress(post.author)}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(Number(post.timestamp))}
                        </span>
                        {post.isRepost && (
                          <span className="text-xs text-pulse-cyan">
                            Reposted from #{post.originalPostId.toString()}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-foreground whitespace-pre-wrap break-words">{post.content}</p>
                      
                      <div className="flex items-center gap-6 pt-2">
                        <button
                          onClick={() => handleLikePost(post.id)}
                          disabled={isPending}
                          className="flex items-center gap-2 text-muted-foreground hover:text-pulse-magenta transition-colors group disabled:opacity-50"
                        >
                          <Heart className="h-4 w-4 group-hover:fill-pulse-magenta" />
                          <span className="text-sm">{post.likeCount.toString()}</span>
                        </button>
                        
                        <button className="flex items-center gap-2 text-muted-foreground hover:text-pulse-blue transition-colors">
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-sm">{post.commentCount.toString()}</span>
                        </button>
                        
                        <button className="flex items-center gap-2 text-muted-foreground hover:text-pulse-purple transition-colors">
                          <Repeat2 className="h-4 w-4" />
                          <span className="text-sm">{post.repostCount.toString()}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="glass-effect border-border/50">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No posts yet. Be the first to post!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Right Sidebar - Stats */}
      <div className="space-y-4">
        <Card className="glass-effect border-border/50">
          <CardHeader>
            <h3 className="font-semibold">Global Stats</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Posts</span>
              <span className="font-bold text-pulse-cyan">{totalPosts?.toString() || '0'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Users</span>
              <span className="font-bold text-pulse-blue">{totalUsers?.toString() || '0'}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-border/50">
          <CardContent className="py-6">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pulse-cyan" />
                All data stored on-chain
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pulse-blue" />
                Powered by PulseChain
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pulse-magenta" />
                Decentralized & unstoppable
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
