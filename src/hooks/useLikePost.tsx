import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useNotifications } from './useNotifications';

interface LikedPost {
  postId: string;
  timestamp: number;
}

interface LikedPosts {
  [address: string]: LikedPost[];
}

export function useLikePost(postId: bigint, postAuthor?: string) {
  const { address } = useAccount();
  const { addNotification } = useNotifications();
  const [isLiked, setIsLiked] = useState(false);

  // Check if current user has liked this post
  useEffect(() => {
    if (!address) {
      setIsLiked(false);
      return;
    }

    const key = 'liked_posts';
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const allLikes: LikedPosts = JSON.parse(stored);
        const userLikes = allLikes[address.toLowerCase()] || [];
        const postIdStr = postId.toString();
        setIsLiked(userLikes.some(l => l.postId === postIdStr));
      } catch (e) {
        console.error('Error loading like state:', e);
      }
    }
  }, [address, postId]);

  // Get total UI-only like count for a specific post (across all users)
  const getPostLikeCount = (): number => {
    const key = 'liked_posts';
    const stored = localStorage.getItem(key);
    if (!stored) return 0;

    try {
      const allLikes: LikedPosts = JSON.parse(stored);
      let count = 0;
      const postIdStr = postId.toString();
      
      // Count how many users have liked this post
      Object.values(allLikes).forEach(userLikes => {
        if (userLikes.some(l => l.postId === postIdStr)) {
          count++;
        }
      });
      
      return count;
    } catch (e) {
      console.error('Error counting likes:', e);
      return 0;
    }
  };

  const toggleLike = (): boolean => {
    if (!address) return false;

    const key = 'liked_posts';
    const stored = localStorage.getItem(key);
    let allLikes: LikedPosts = {};
    
    if (stored) {
      try {
        allLikes = JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing like state:', e);
      }
    }

    const addressKey = address.toLowerCase();
    const userLikes = allLikes[addressKey] || [];
    const postIdStr = postId.toString();
    const wasLiked = userLikes.some(l => l.postId === postIdStr);
    
    if (wasLiked) {
      allLikes[addressKey] = userLikes.filter(l => l.postId !== postIdStr);
      setIsLiked(false);
      localStorage.setItem(key, JSON.stringify(allLikes));
      return false;
    } else {
      allLikes[addressKey] = [...userLikes, { postId: postIdStr, timestamp: Date.now() }];
      setIsLiked(true);
      localStorage.setItem(key, JSON.stringify(allLikes));
      
      // Trigger notification for post author
      if (postAuthor) {
        addNotification('like', address, { postId: postIdStr });
      }
      
      return true;
    }
  };

  return {
    isLiked,
    toggleLike,
    getPostLikeCount,
  };
}
