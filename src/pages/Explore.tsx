import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PULSECHAT_CONTRACT_ADDRESS, PULSECHAT_ABI } from '@/lib/contracts';
import { Heart, MessageCircle, Repeat2, Search } from 'lucide-react';
import { formatAddress, formatTimestamp } from '@/lib/utils/format';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Explore() {
  const { isConnected } = useAccount();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: posts } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'getLatestPosts',
    args: [100n],
  });

  const filteredPosts = posts?.filter(post => 
    searchQuery === '' || 
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert>
          <AlertDescription>Connect your wallet to explore posts</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-6 px-4 md:px-0 pt-20 lg:pt-6">
      <Card className="glass-effect">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts or addresses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredPosts && filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            // Component to fetch author profile
            const PostWithAuthor = () => {
              const { data: authorProfile } = useReadContract({
                address: PULSECHAT_CONTRACT_ADDRESS,
                abi: PULSECHAT_ABI,
                functionName: 'profiles',
                args: [post.author],
              }) as { data: any };

              // Parse media from content
              const mediaRegex = /\[media:(https?:\/\/[^\]]+)\]/g;
              const matches = [...post.content.matchAll(mediaRegex)];
              const mediaUrls = matches.map(match => match[1]);
              const textContent = post.content.replace(mediaRegex, '').trim();

              // Extract profile data
              const profileName = authorProfile?.[0] || '';
              const profileAvatar = authorProfile?.[2] || '';

              return (
                <Card key={post.id.toString()} className="glass-effect border-border/50 hover:border-primary/20 transition-all">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      {profileAvatar ? (
                        <img src={profileAvatar} alt="Avatar" className="w-10 h-10 rounded-full flex-shrink-0 object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-pulse flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-white">
                            {formatAddress(post.author).slice(0, 2)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">
                            {profileName || formatAddress(post.author)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            @{formatAddress(post.author)}
                          </span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(Number(post.timestamp))}
                          </span>
                          {post.isRepost && (
                            <span className="text-xs text-pulse-cyan">
                              Reposted from #{post.originalPostId.toString()}
                            </span>
                          )}
                        </div>
                        
                        {textContent && (
                          <p className="text-foreground whitespace-pre-wrap break-words">{textContent}</p>
                        )}
                        
                        {mediaUrls.length > 0 && (
                          <div className="rounded-xl overflow-hidden border border-border/50">
                            {mediaUrls.map((url, index) => (
                              <img
                                key={index}
                                src={url}
                                alt="Post media"
                                className="w-full h-auto object-cover"
                              />
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-6 pt-2">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Heart className="h-4 w-4" />
                            <span className="text-sm">{post.likeCount.toString()}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-sm">{post.commentCount.toString()}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Repeat2 className="h-4 w-4" />
                            <span className="text-sm">{post.repostCount.toString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            };

            return <PostWithAuthor key={post.id.toString()} />;
          })
        ) : (
          <Card className="glass-effect">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {searchQuery ? 'No posts found' : 'No posts yet'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
