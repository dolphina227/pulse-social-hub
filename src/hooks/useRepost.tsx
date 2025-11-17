import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface RepostedPosts {
  [postId: string]: boolean;
}

export function useRepost(postId: bigint) {
  const { address } = useAccount();
  const [isReposted, setIsReposted] = useState(false);
  const [localRepostCount, setLocalRepostCount] = useState(0);

  const storageKey = `reposted_posts_${address?.toLowerCase()}`;

  useEffect(() => {
    if (!address) return;

    // Load repost status from localStorage
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const repostedPosts: RepostedPosts = JSON.parse(stored);
        setIsReposted(!!repostedPosts[postId.toString()]);
      } catch (e) {
        console.error('Failed to parse reposted posts:', e);
      }
    }
  }, [address, postId, storageKey]);

  const toggleRepost = (currentCount: number) => {
    if (!address) return currentCount;

    const stored = localStorage.getItem(storageKey);
    let repostedPosts: RepostedPosts = {};
    
    if (stored) {
      try {
        repostedPosts = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse reposted posts:', e);
      }
    }

    const postIdStr = postId.toString();
    const wasReposted = !!repostedPosts[postIdStr];
    
    if (wasReposted) {
      // Undo repost
      delete repostedPosts[postIdStr];
      setIsReposted(false);
      setLocalRepostCount(Math.max(0, currentCount - 1));
    } else {
      // Repost
      repostedPosts[postIdStr] = true;
      setIsReposted(true);
      setLocalRepostCount(currentCount + 1);
    }

    localStorage.setItem(storageKey, JSON.stringify(repostedPosts));
    
    return wasReposted ? Math.max(0, currentCount - 1) : currentCount + 1;
  };

  const getRepostedPosts = (): string[] => {
    if (!address) return [];
    
    const stored = localStorage.getItem(storageKey);
    if (!stored) return [];
    
    try {
      const repostedPosts: RepostedPosts = JSON.parse(stored);
      return Object.keys(repostedPosts);
    } catch (e) {
      console.error('Failed to parse reposted posts:', e);
      return [];
    }
  };

  return {
    isReposted,
    localRepostCount,
    toggleRepost,
    getRepostedPosts,
  };
}
