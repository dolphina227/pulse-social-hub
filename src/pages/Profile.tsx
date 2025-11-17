import { useState, useEffect, useRef } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PULSECHAT_CONTRACT_ADDRESS, PULSECHAT_ABI } from '@/lib/contracts';
import { Calendar, MessageSquare, MessageCircle, Heart, Edit, AlertCircle, Upload, Repeat2 } from 'lucide-react';
import { formatAddress, formatTimestamp } from '@/lib/utils/format';
import { toast } from 'sonner';
import { uploadImage, validateImageFile } from '@/lib/storage';
import { PostCard } from '@/components/PostCard';
import { useRepost } from '@/hooks/useRepost';

export default function Profile() {
  const { address: connectedAddress, isConnected } = useAccount();
  const { address: paramAddress } = useParams();
  const profileAddress = (paramAddress || connectedAddress) as `0x${string}`;
  const isOwnProfile = connectedAddress?.toLowerCase() === profileAddress?.toLowerCase();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [uploading, setUploading] = useState(false);
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [plsModalOpen, setPlsModalOpen] = useState(false);
  const [repostedPosts, setRepostedPosts] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { getRepostedPosts } = useRepost(0n);

  const { writeContract, isPending } = useWriteContract();

  const { data: profile } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'profiles',
    args: profileAddress ? [profileAddress] : undefined,
  });

  const { data: userStats } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'userStats',
    args: profileAddress ? [profileAddress] : undefined,
  });

  const { data: userPosts } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'getUserPosts',
    args: profileAddress ? [profileAddress, 50n] : undefined,
  });

  useEffect(() => {
    if (profile) {
      setName(profile[0] || '');
      setBio(profile[1] || '');
      setAvatar(profile[2] || '');
    }
  }, [profile]);

  // Fetch reposted posts
  useEffect(() => {
    const fetchRepostedPosts = async () => {
      if (!isOwnProfile || !profileAddress) return;
      
      const reposted = getRepostedPosts();
      const fetchedPosts = [];
      
      for (const repost of reposted) {
        try {
          const postData = await fetch(`https://rpc.pulsechain.com`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [{
                to: PULSECHAT_CONTRACT_ADDRESS,
                data: `0x5312ea8e${repost.postId.padStart(64, '0')}` // posts(uint256)
              }, 'latest'],
              id: 1
            })
          });
          const result = await postData.json();
          if (result.result) {
            fetchedPosts.push({
              postId: repost.postId,
              timestamp: repost.timestamp,
              rawData: result.result
            });
          }
        } catch (e) {
          console.error('Error fetching reposted post:', e);
        }
      }
      
      setRepostedPosts(fetchedPosts);
    };
    
    fetchRepostedPosts();
  }, [isOwnProfile, profileAddress, getRepostedPosts]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateImageFile(file);
      setUploading(true);
      const url = await uploadImage(file);
      setAvatar(url);
      toast.success('Image uploaded!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = () => {
    if (!name.trim()) return toast.error('Name required');

    writeContract({
      address: PULSECHAT_CONTRACT_ADDRESS,
      abi: PULSECHAT_ABI,
      functionName: 'setProfile',
      args: [name, bio, avatar],
    } as any, {
      onSuccess: () => {
        toast.success('Profile updated!');
        setIsEditing(false);
      },
      onError: (error) => {
        toast.error('Failed to update: ' + error.message);
      },
    });
  };

  const refetchPosts = () => {
    // Trigger refetch if needed
  };

  const parsePostData = (rawData: string) => {
    // Basic parsing - adjust based on actual data structure
    try {
      return {
        id: BigInt('0x' + rawData.slice(2, 66)),
        author: ('0x' + rawData.slice(90, 130)) as `0x${string}`,
        content: '',
        timestamp: 0,
        likeCount: 0,
        commentCount: 0,
        repostCount: 0,
        isRepost: false,
        originalPostId: 0n,
      };
    } catch (e) {
      return {
        id: 0n,
        author: '0x0000000000000000000000000000000000000000' as `0x${string}`,
        content: '',
        timestamp: 0,
        likeCount: 0,
        commentCount: 0,
        repostCount: 0,
        isRepost: false,
        originalPostId: 0n,
      };
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Connect wallet to view profiles</AlertDescription>
        </Alert>
      </div>
    );
  }

  const displayName = profile?.[0] || formatAddress(profileAddress);
  const displayBio = profile?.[1] || '';
  const createdAt = profile?.[3] ? Number(profile[3]) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-6 px-4 md:px-0 pt-20 lg:pt-6">
      <Card className="glass-effect">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative group">
              {avatar ? (
                <img src={avatar} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-pulse flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{displayName.slice(0, 2).toUpperCase()}</span>
                </div>
              )}
              {isEditing && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            <div className="flex-1 space-y-4">
              {isEditing ? (
                <div className="space-y-3">
                  <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                  <Textarea placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
                  <div className="flex gap-2">
                    <Button variant="gradient" onClick={handleSaveProfile} disabled={isPending}>Save</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold">{displayName}</h1>
                      <p className="text-sm text-muted-foreground">{formatAddress(profileAddress)}</p>
                    </div>
                    {isOwnProfile && (
                      <Button variant="outline" onClick={() => setIsEditing(true)}>
                        <Edit className="h-4 w-4 mr-2" />Edit
                      </Button>
                    )}
                  </div>

                  {displayBio && <p>{displayBio}</p>}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {createdAt > 0 ? `Joined ${formatTimestamp(createdAt)}` : 'New user'}
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-effect">
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-pulse-cyan">{userStats?.[1]?.toString() || '0'}</p>
            <p className="text-sm text-muted-foreground">Posts</p>
          </CardContent>
        </Card>
        
        <Card className="glass-effect">
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-pulse-blue">{userStats?.[2]?.toString() || '0'}</p>
            <p className="text-sm text-muted-foreground">Comments</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-pulse-magenta">{userStats?.[3]?.toString() || '0'}</p>
            <p className="text-sm text-muted-foreground">Messages</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-pulse-purple">{userStats?.[6]?.toString() || '0'}</p>
            <p className="text-sm text-muted-foreground">Reposts</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-0">
        <h2 className="text-xl font-semibold mb-4 px-4 pt-4">Posts & Reposts</h2>
        
        {/* Display reposted posts */}
        {isOwnProfile && repostedPosts.length > 0 && repostedPosts.map((repost) => {
          const post = parsePostData(repost.rawData);
          return (
            <PostCard
              key={`repost-${repost.postId}-${repost.timestamp}`}
              post={post}
              authorName={post.author ? undefined : formatAddress(post.author)}
              authorAvatar={undefined}
              onUpdate={refetchPosts}
              isRepost={true}
              repostAuthor={displayName || formatAddress(profileAddress)}
            />
          );
        })}
        
        {/* Display original posts */}
        {userPosts && userPosts.length > 0 ? (
          userPosts.map((post: any) => (
            <PostCard
              key={post.id?.toString()}
              post={{
                id: post.id,
                author: post.author,
                content: post.content,
                timestamp: Number(post.timestamp),
                likeCount: Number(post.likeCount || 0),
                commentCount: Number(post.commentCount || 0),
                repostCount: Number(post.repostCount || 0),
                isRepost: post.isRepost || false,
                originalPostId: post.originalPostId || 0n,
              }}
              authorName={displayName}
              authorAvatar={avatar}
              onUpdate={refetchPosts}
            />
          ))
        ) : !isOwnProfile || repostedPosts.length === 0 ? (
          <Card className="glass-effect mx-4">
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>No posts yet.</p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
