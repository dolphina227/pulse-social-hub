import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PULSECHAT_CONTRACT_ADDRESS, PULSECHAT_ABI } from '@/lib/contracts';
import { AlertCircle, Plus } from 'lucide-react';
import { PostCard } from '@/components/PostCard';
import { CreatePostModal } from '@/components/CreatePostModal';
export default function Index() {
  const { isConnected } = useAccount();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const { data: latestPosts, refetch: refetchPosts } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'getLatestPosts',
    args: [50n],
  });

  const posts = latestPosts || [];

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-16 md:mt-6 px-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please connect your wallet to view the feed</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <CreatePostModal 
        open={isPostModalOpen} 
        onOpenChange={setIsPostModalOpen}
        onPostCreated={() => setTimeout(() => refetchPosts(), 2000)}
      />

      <div className="max-w-2xl mx-auto px-4 md:px-0 pt-20 lg:pt-6">
        {/* Floating Post Button for Mobile */}
        <button
          onClick={() => setIsPostModalOpen(true)}
          className="lg:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-gradient-pulse flex items-center justify-center shadow-glow hover:scale-110 transition-transform"
        >
          <Plus className="h-6 w-6 text-background" />
        </button>

        <div>
        {posts.length > 0 ? (
          posts.map((post: any, index: number) => (
            <PostCard
              key={post.id?.toString() || index}
              post={{
                id: post.id || BigInt(index),
                author: post.author,
                content: post.content,
                timestamp: Number(post.timestamp),
                likeCount: Number(post.likeCount),
                commentCount: Number(post.commentCount),
                repostCount: Number(post.repostCount),
                isRepost: post.isRepost,
                originalPostId: post.originalPostId,
              }}
              onUpdate={() => refetchPosts()}
            />
          ))
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <p>No posts yet. Be the first to post!</p>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
