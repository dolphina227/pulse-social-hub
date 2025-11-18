import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useNotifications } from './useNotifications';

interface RepostedPost {
  postId: string;
  timestamp: number;
}

interface RepostedPosts {
  [address: string]: RepostedPost[];
}

export function useRepost(postId: bigint, postAuthor?: string) {
  const { address } = useAccount();
  const { addNotification } = useNotifications();
  const [isReposted, setIsReposted] = useState(false);

  // Check if current user has reposted this post
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

  // Get total UI-only repost count for a specific post (across all users)
  const getPostRepostCount = (): number => {
    const key = 'reposted_posts';
    const stored = localStorage.getItem(key);
    if (!stored) return 0;

    try {
      const allReposts: RepostedPosts = JSON.parse(stored);
      let count = 0;
      const postIdStr = postId.toString();
      
      // Count how many users have reposted this post
      Object.values(allReposts).forEach(userReposts => {
        if (userReposts.some(r => r.postId === postIdStr)) {
          count++;
        }
      });
      
      return count;
    } catch (e) {
      console.error('Error counting reposts:', e);
      return 0;
    }
  };

  const toggleRepost = (): boolean => {
    if (!address) return false;

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
      localStorage.setItem(key, JSON.stringify(allReposts));
      return false;
    } else {
      allReposts[addressKey] = [...userReposts, { postId: postIdStr, timestamp: Date.now() }];
      setIsReposted(true);
      localStorage.setItem(key, JSON.stringify(allReposts));
      
      // Trigger notification for post author
      if (postAuthor) {
        addNotification('repost', address, { postId: postIdStr });
      }
      
      return true;
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
    toggleRepost,
    getRepostedPosts,
    getPostRepostCount,
  };
}
