import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PULSECHAT_CONTRACT_ADDRESS, PULSECHAT_ABI } from '@/lib/contracts';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { EmojiPicker } from '@/components/EmojiPicker';
import { PostCard } from '@/components/PostCard';
import { MediaUpload } from '@/components/MediaUpload';
import { USDCApproval } from '@/components/USDCApproval';
import { useUsdcApprovalForFee } from '@/hooks/useUsdcApprovalForFee';

export default function Index() {
  const { isConnected } = useAccount();
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const { hasAllowance, feeHuman, feeAmount } = useUsdcApprovalForFee();

  const { data: latestPosts, refetch: refetchPosts } = useReadContract({
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

  const { data: totalComments } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'totalComments',
  });

  const { data: totalMessages } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'totalMessages',
  });

  const { writeContract, isPending } = useWriteContract();

  const handlePost = async () => {
    if (!content.trim() && !mediaUrl) {
      toast.error('Please enter content or upload media');
      return;
    }

    // Double-check allowance before posting
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
        setTimeout(() => refetchPosts(), 2000);
      },
      onError: (error) => {
        toast.error('Failed to create post: ' + error.message);
      },
    });
  };

  const posts = latestPosts || [];

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-16 md:mt-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please connect your wallet to view the feed</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 md:pb-6 pt-16 lg:pt-0 px-4 md:px-0">
      <div className="border-b border-border/50 p-4 sticky top-16 lg:top-0 bg-background/95 backdrop-blur z-10">
        <h2 className="text-xl font-bold">Home</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 p-4 border-b border-border/50">
        <Card className="glass-effect">
          <CardContent className="pt-4 sm:pt-6 text-center">
            <p className="text-lg sm:text-2xl font-bold text-pulse-cyan">{totalPosts?.toString() || '0'}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Posts</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardContent className="pt-4 sm:pt-6 text-center">
            <p className="text-lg sm:text-2xl font-bold text-pulse-blue">{totalUsers?.toString() || '0'}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Users</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardContent className="pt-4 sm:pt-6 text-center">
            <p className="text-lg sm:text-2xl font-bold text-pulse-magenta">{totalComments?.toString() || '0'}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Comments</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardContent className="pt-4 sm:pt-6 text-center">
            <p className="text-lg sm:text-2xl font-bold text-pulse-purple">{totalMessages?.toString() || '0'}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Messages</p>
          </CardContent>
        </Card>
      </div>

      <div className="border-b border-border/50 p-4">
        <div className="flex gap-2 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-pulse flex-shrink-0" />
          <div className="flex-1">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening on PulseChain?"
              className="min-h-[100px] sm:min-h-[120px] resize-none border-0 focus-visible:ring-0 text-base sm:text-lg p-0"
            />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <MediaUpload
                  onMediaSelect={setMediaUrl}
                  onMediaRemove={() => setMediaUrl('')}
                  mediaUrl={mediaUrl}
                />
                <EmojiPicker onEmojiSelect={(emoji) => setContent(content + emoji)} />
              </div>
              
              {!isConnected ? (
                <div className="text-xs sm:text-sm text-muted-foreground w-full sm:w-auto">Connect wallet to post</div>
              ) : !hasAllowance ? (
                <USDCApproval />
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <span className="text-xs sm:text-sm text-muted-foreground">Posting costs {feeHuman} USDC</span>
                  <Button
                    onClick={handlePost}
                    disabled={isPending || (!content.trim() && !mediaUrl)}
                    variant="gradient"
                    size="lg"
                    className="rounded-full px-6 w-full sm:w-auto"
                  >
                    {isPending ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        {posts.length > 0 ? (
          posts.map((post: any, index: number) => {
            // Fetch author profile for each post
            const AuthorPostCard = () => {
              const { data: authorProfile } = useReadContract({
                address: PULSECHAT_CONTRACT_ADDRESS,
                abi: PULSECHAT_ABI,
                functionName: 'profiles',
                args: [post.author],
              }) as { data: any };

              // Debug log to check profile data structure
              useEffect(() => {
                if (authorProfile) {
                  console.log('Author profile data:', {
                    raw: authorProfile,
                    name: authorProfile?.name || authorProfile?.[0],
                    bio: authorProfile?.bio || authorProfile?.[1],
                    avatarUrl: authorProfile?.avatarUrl || authorProfile?.[2],
                  });
                }
              }, [authorProfile]);

              // Contract returns array: [name, bio, avatarUrl, timestamp]
              const profileName = authorProfile?.[0] || '';
              const profileAvatar = authorProfile?.[2] || '';

              return (
                <PostCard
                  key={index}
                  post={{
                    id: BigInt(index),
                    author: post.author,
                    content: post.content,
                    timestamp: Number(post.timestamp),
                    likeCount: Number(post.likeCount),
                    commentCount: Number(post.commentCount),
                    repostCount: Number(post.repostCount),
                    isRepost: post.isRepost,
                    originalPostId: post.originalPostId,
                  }}
                  authorName={profileName}
                  authorAvatar={profileAvatar}
                  onUpdate={() => refetchPosts()}
                />
              );
            };

            return <AuthorPostCard key={index} />;
          })
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <p>No posts yet. Be the first to post!</p>
          </div>
        )}
      </div>
    </div>
  );
}
