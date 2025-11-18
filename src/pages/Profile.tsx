import { useState, useEffect, useRef } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PULSECHAT_CONTRACT_ADDRESS, PULSECHAT_ABI } from '@/lib/contracts';
import { Calendar, MessageSquare, MessageCircle, Heart, Edit, AlertCircle, Upload, Repeat2, Info, Users } from 'lucide-react';
import { formatAddress, formatTimestamp } from '@/lib/utils/format';
import { toast } from 'sonner';
import { uploadImage, validateImageFile } from '@/lib/storage';
import { PostCard } from '@/components/PostCard';
import { useRepost } from '@/hooks/useRepost';
import { useFollow } from '@/hooks/useFollow';
import { FollowButton } from '@/components/FollowButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { parseProfile } from '@/lib/utils/profile';
import { UserListItem } from '@/components/UserListItem';

export default function Profile() {
  const { address: connectedAddress, isConnected } = useAccount();
  const { address: paramAddress } = useParams();
  const profileAddress = (paramAddress || connectedAddress) as `0x${string}`;
  const isOwnProfile = connectedAddress?.toLowerCase() === profileAddress?.toLowerCase();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [uploading, setUploading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { getRepostedPosts } = useRepost(0n);
  const { getFollowersCount, getFollowingCount, getFollowers, getFollowing } = useFollow();

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
      const usernameValue = profile[0] || '';
      const bioField = profile[1] || '';
      const avatarValue = profile[2] || '';
      
      setUsername(usernameValue);
      setAvatar(avatarValue);
      
      // Try to parse bio as JSON for displayName + bio
      try {
        const parsed = JSON.parse(bioField);
        if (parsed.displayName !== undefined && parsed.bio !== undefined) {
          setDisplayName(parsed.displayName);
          setBio(parsed.bio);
        } else {
          setDisplayName('');
          setBio(bioField);
        }
      } catch {
        // If not JSON, treat as plain bio
        setDisplayName('');
        setBio(bioField);
      }
    }
  }, [profile]);

  // Get UI-only reposted post IDs
  const uiRepostedPostIds = isOwnProfile ? getRepostedPosts().map(r => r.postId) : [];

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

  const handleSaveProfile = async () => {
    if (!username.trim()) {
      toast.error('Username is required');
      return;
    }

    // Check if username is already taken (simple client-side check)
    setCheckingUsername(true);
    try {
      // Store username check in localStorage to track used usernames
      const usedUsernames = JSON.parse(localStorage.getItem('used_usernames') || '{}');
      const originalUsername = profile?.[0] || '';
      
      // Check if username is taken by someone else
      if (usedUsernames[username.toLowerCase()] && 
          usedUsernames[username.toLowerCase()] !== profileAddress?.toLowerCase() &&
          username.toLowerCase() !== originalUsername.toLowerCase()) {
        toast.error('This username appears to be taken. Please choose another one.');
        setCheckingUsername(false);
        return;
      }

      // Combine displayName and bio into JSON for storage
      const bioData = JSON.stringify({
        displayName: displayName,
        bio: bio
      });

      writeContract({
        address: PULSECHAT_CONTRACT_ADDRESS,
        abi: PULSECHAT_ABI,
        functionName: 'setProfile',
        args: [username.trim(), bioData, avatar],
      } as any, {
        onSuccess: () => {
          // Update used usernames cache
          const updatedUsernames = { ...usedUsernames };
          if (originalUsername) {
            delete updatedUsernames[originalUsername.toLowerCase()];
          }
          updatedUsernames[username.toLowerCase()] = profileAddress?.toLowerCase();
          localStorage.setItem('used_usernames', JSON.stringify(updatedUsernames));
          
          toast.success('Profile updated successfully!');
          setIsEditing(false);
          setCheckingUsername(false);
        },
        onError: (error) => {
          toast.error('Failed to update: ' + error.message);
          setCheckingUsername(false);
        },
      });
    } catch (error) {
      setCheckingUsername(false);
    }
  };

  // Track usernames when profile loads
  useEffect(() => {
    if (profile && profile[0]) {
      const usedUsernames = JSON.parse(localStorage.getItem('used_usernames') || '{}');
      usedUsernames[profile[0].toLowerCase()] = profileAddress?.toLowerCase();
      localStorage.setItem('used_usernames', JSON.stringify(usedUsernames));
    }
  }, [profile, profileAddress]);

  const refetchPosts = () => {
    // Trigger refetch if needed
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto pt-12 md:pt-6 px-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Connect wallet to view profiles</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Parse profile data
  let profileDisplayName = '';
  let profileBio = '';
  
  try {
    const bioField = profile?.[1] || '';
    const parsed = JSON.parse(bioField);
    if (parsed.displayName !== undefined && parsed.bio !== undefined) {
      profileDisplayName = parsed.displayName;
      profileBio = parsed.bio;
    } else {
      profileBio = bioField;
    }
  } catch {
    profileBio = profile?.[1] || '';
  }
  
  const profileUsername = profile?.[0] || '';
  const displayText = profileDisplayName || profileUsername || formatAddress(profileAddress);
  const createdAt = profile?.[3] ? Number(profile[3]) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 pt-12 md:pt-6">
      <Card className="glass-effect">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative group">
              {avatar ? (
                <img src={avatar} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-pulse flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{displayText.slice(0, 2).toUpperCase()}</span>
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
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Choose a unique username. Usernames that are already taken cannot be used.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Display Name</label>
                    <Input 
                      placeholder="Your display name (e.g. John Doe)" 
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value.slice(0, 50))}
                    />
                    <p className="text-xs text-muted-foreground">Your public name (max 50 characters)</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Username *</label>
                    <Input 
                      placeholder="yourusername" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value.slice(0, 30).replace(/\s/g, ''))}
                    />
                    <p className="text-xs text-muted-foreground">Your unique @handle (max 30 characters, no spaces)</p>
                    {username && username !== profile?.[0] && (
                      <p className="text-xs text-amber-500">
                        ⚠️ Username must be unique - once claimed, it cannot be reused.
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bio</label>
                    <Textarea 
                      placeholder="Tell us about yourself..." 
                      value={bio} 
                      onChange={(e) => setBio(e.target.value)}
                      maxLength={160}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">{bio.length}/160 characters</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="gradient" 
                      onClick={handleSaveProfile} 
                      disabled={isPending || checkingUsername || !username.trim()}
                    >
                      {isPending || checkingUsername ? 'Saving...' : 'Save Profile'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        // Reset to original values
                        if (profile) {
                          setUsername(profile[0] || '');
                          setAvatar(profile[2] || '');
                          try {
                            const parsed = JSON.parse(profile[1] || '');
                            setDisplayName(parsed.displayName || '');
                            setBio(parsed.bio || '');
                          } catch {
                            setDisplayName('');
                            setBio(profile[1] || '');
                          }
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold">{displayText}</h1>
                      <p className="text-sm text-muted-foreground">@{profileUsername || formatAddress(profileAddress)}</p>
                    </div>
                    <div className="flex gap-2">
                      {isOwnProfile ? (
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                          <Edit className="h-4 w-4 mr-2" />Edit
                        </Button>
                      ) : (
                        <FollowButton targetAddress={profileAddress} size="default" />
                      )}
                    </div>
                  </div>

                  {profileBio && <p>{profileBio}</p>}

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

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
            <p className="text-2xl font-bold text-pulse-purple">{getFollowersCount(profileAddress)}</p>
            <p className="text-sm text-muted-foreground">Followers</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-pulse-cyan">{getFollowingCount(profileAddress)}</p>
            <p className="text-sm text-muted-foreground">Following</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full grid grid-cols-3 glass-effect">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="followers">Followers ({getFollowersCount(profileAddress)})</TabsTrigger>
          <TabsTrigger value="following">Following ({getFollowingCount(profileAddress)})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="mt-4 space-y-0">
          {userPosts && userPosts.length > 0 ? (
            userPosts.map((post: any) => {
              const isUiRepost = isOwnProfile && uiRepostedPostIds.includes(post.id?.toString());
              const isOnChainQuote = post.isRepost === true;
              
              return (
                <PostCard
                  key={`${post.id?.toString()}-${isUiRepost ? 'repost' : 'post'}`}
                  post={{
                    id: post.id,
                    author: post.author,
                    content: post.content,
                    timestamp: Number(post.timestamp),
                    likeCount: Number(post.likeCount || 0),
                    commentCount: Number(post.commentCount || 0),
                    repostCount: Number(post.repostCount || 0),
                    isRepost: isOnChainQuote,
                    originalPostId: post.originalPostId || 0n,
                  }}
                  onUpdate={refetchPosts}
                  showAsUiRepost={isUiRepost && !isOnChainQuote}
                  repostAuthor={isUiRepost && !isOnChainQuote ? (displayText || formatAddress(profileAddress)) : undefined}
                />
              );
            })
          ) : (
            <Card className="glass-effect">
              <CardContent className="pt-6 text-center text-muted-foreground">
                No posts yet
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="followers" className="mt-4">
          <Card className="glass-effect">
            <CardContent className="pt-6">
              {getFollowers(profileAddress).length > 0 ? (
                <div className="space-y-3">
                  {getFollowers(profileAddress).map((followerAddress) => (
                    <UserListItem key={followerAddress} userAddress={followerAddress} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No followers yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="following" className="mt-4">
          <Card className="glass-effect">
            <CardContent className="pt-6">
              {getFollowing(profileAddress).length > 0 ? (
                <div className="space-y-3">
                  {getFollowing(profileAddress).map((followingAddress) => (
                    <UserListItem key={followingAddress} userAddress={followingAddress} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Not following anyone yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
