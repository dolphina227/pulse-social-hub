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
    if (!newPostContent.trim()) return toast.error('Please enter content');
    writeContract({
      address: PULSECHAT_CONTRACT_ADDRESS,
      abi: PULSECHAT_ABI,
      functionName: 'createPost',
      args: [newPostContent],
    });
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <h1 className="text-6xl font-bold gradient-pulse-text">Welcome to PULSECHAT</h1>
        <p className="text-xl text-muted-foreground">The first fully on-chain social network on PulseChain</p>
        <Alert className="max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Connect your wallet to get started</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="glass-effect">
          <CardHeader><h2 className="text-xl font-semibold">Create Post</h2></CardHeader>
          <CardContent className="space-y-4">
            <Textarea value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} className="min-h-[120px]" maxLength={500} />
            <Button variant="gradient" onClick={handleCreatePost} disabled={isPending}>
              <Send className="h-4 w-4 mr-2" /> Post
            </Button>
          </CardContent>
        </Card>
        <div className="space-y-4">
          {posts?.map((post) => (
            <Card key={post.id.toString()} className="glass-effect">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-pulse" />
                  <div className="flex-1">
                    <div className="flex gap-2 mb-2">
                      <span className="font-semibold">{formatAddress(post.author)}</span>
                      <span className="text-xs text-muted-foreground">{formatTimestamp(Number(post.timestamp))}</span>
                    </div>
                    <p>{post.content}</p>
                    <div className="flex gap-6 mt-3">
                      <button className="flex items-center gap-2 text-muted-foreground hover:text-pulse-magenta">
                        <Heart className="h-4 w-4" /> {post.likeCount.toString()}
                      </button>
                      <button className="flex items-center gap-2 text-muted-foreground">
                        <MessageCircle className="h-4 w-4" /> {post.commentCount.toString()}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div>
        <Card className="glass-effect">
          <CardHeader><h3>Stats</h3></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between"><span>Posts</span><span className="text-pulse-cyan">{totalPosts?.toString()}</span></div>
              <div className="flex justify-between"><span>Users</span><span className="text-pulse-blue">{totalUsers?.toString()}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
