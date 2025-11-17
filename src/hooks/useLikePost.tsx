import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface LikedPosts {
  [postId: string]: boolean;
}

export function useLikePost(postId: bigint) {
  const { address } = useAccount();
  const [isLiked, setIsLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(0);

  const storageKey = `liked_posts_${address?.toLowerCase()}`;

  useEffect(() => {
    if (!address) return;

    // Load liked status from localStorage
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const likedPosts: LikedPosts = JSON.parse(stored);
        setIsLiked(!!likedPosts[postId.toString()]);
      } catch (e) {
        console.error('Failed to parse liked posts:', e);
      }
    }
  }, [address, postId, storageKey]);

  const toggleLike = (currentCount: number) => {
    if (!address) return currentCount;

    const stored = localStorage.getItem(storageKey);
    let likedPosts: LikedPosts = {};
    
    if (stored) {
      try {
        likedPosts = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse liked posts:', e);
      }
    }

    const postIdStr = postId.toString();
    const wasLiked = !!likedPosts[postIdStr];
    
    if (wasLiked) {
      // Unlike
      delete likedPosts[postIdStr];
      setIsLiked(false);
      setLocalLikeCount(Math.max(0, currentCount - 1));
    } else {
      // Like
      likedPosts[postIdStr] = true;
      setIsLiked(true);
      setLocalLikeCount(currentCount + 1);
    }

    localStorage.setItem(storageKey, JSON.stringify(likedPosts));
    
    return wasLiked ? Math.max(0, currentCount - 1) : currentCount + 1;
  };

  return {
    isLiked,
    localLikeCount,
    toggleLike,
  };
}
