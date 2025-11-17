import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface RepostedPost {
  postId: string;
  timestamp: number;
}

interface RepostedPosts {
  [address: string]: RepostedPost[];
}

export function useRepost(postId: bigint) {
  const { address } = useAccount();
  const [isReposted, setIsReposted] = useState(false);
  const [localRepostCount, setLocalRepostCount] = useState(0);

  useEffect(() => {
    if (!address) {
      setIsReposted(false);
      return;
    }

    const key = 'reposted_posts';
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const allReposts: RepostedPosts = JSON.parse(stored);
        const userReposts = allReposts[address.toLowerCase()] || [];
        const postIdStr = postId.toString();
        setIsReposted(userReposts.some(r => r.postId === postIdStr));
      } catch (e) {
        console.error('Error loading repost state:', e);
      }
    }
  }, [address, postId]);

  const toggleRepost = (currentCount: number): number => {
    if (!address) return currentCount;

    const key = 'reposted_posts';
    const stored = localStorage.getItem(key);
    let allReposts: RepostedPosts = {};
    
    if (stored) {
      try {
        allReposts = JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing repost state:', e);
      }
    }

    const addressKey = address.toLowerCase();
    const userReposts = allReposts[addressKey] || [];
    const postIdStr = postId.toString();
    const wasReposted = userReposts.some(r => r.postId === postIdStr);
    
    if (wasReposted) {
      allReposts[addressKey] = userReposts.filter(r => r.postId !== postIdStr);
      setIsReposted(false);
      setLocalRepostCount(currentCount - 1);
      localStorage.setItem(key, JSON.stringify(allReposts));
      return currentCount - 1;
    } else {
      allReposts[addressKey] = [...userReposts, { postId: postIdStr, timestamp: Date.now() }];
      setIsReposted(true);
      setLocalRepostCount(currentCount + 1);
      localStorage.setItem(key, JSON.stringify(allReposts));
      return currentCount + 1;
    }
  };

  const getRepostedPosts = (): RepostedPost[] => {
    if (!address) return [];

    const key = 'reposted_posts';
    const stored = localStorage.getItem(key);
    
    if (stored) {
      try {
        const allReposts: RepostedPosts = JSON.parse(stored);
        return allReposts[address.toLowerCase()] || [];
      } catch (e) {
        console.error('Error loading reposted posts:', e);
        return [];
      }
    }
    
    return [];
  };

  return {
    isReposted,
    localRepostCount,
    toggleRepost,
    getRepostedPosts,
  };
}
