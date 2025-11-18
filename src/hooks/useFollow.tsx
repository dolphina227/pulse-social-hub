import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useNotifications } from './useNotifications';

interface FollowData {
  [userAddress: string]: string[]; // userAddress -> array of addresses they follow
}

export function useFollow() {
  const { address } = useAccount();
  const { addNotification } = useNotifications();
  const [followData, setFollowData] = useState<FollowData>({});

  useEffect(() => {
    // Load follow data from localStorage
    const stored = localStorage.getItem('follow_data');
    if (stored) {
      try {
        setFollowData(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing follow data:', error);
      }
    }
  }, []);

  const saveFollowData = (data: FollowData) => {
    localStorage.setItem('follow_data', JSON.stringify(data));
    setFollowData(data);
  };

  const followUser = (targetAddress: string) => {
    if (!address) return;
    
    const normalizedUser = address.toLowerCase();
    const normalizedTarget = targetAddress.toLowerCase();
    
    if (normalizedUser === normalizedTarget) return; // Can't follow yourself
    
    const newData = { ...followData };
    if (!newData[normalizedUser]) {
      newData[normalizedUser] = [];
    }
    
    if (!newData[normalizedUser].includes(normalizedTarget)) {
      newData[normalizedUser].push(normalizedTarget);
      saveFollowData(newData);
      
      // Trigger notification for the followed user
      addNotification('follow', address);
    }
  };

  const unfollowUser = (targetAddress: string) => {
    if (!address) return;
    
    const normalizedUser = address.toLowerCase();
    const normalizedTarget = targetAddress.toLowerCase();
    
    const newData = { ...followData };
    if (newData[normalizedUser]) {
      newData[normalizedUser] = newData[normalizedUser].filter(
        addr => addr !== normalizedTarget
      );
      saveFollowData(newData);
    }
  };

  const isFollowing = (targetAddress: string): boolean => {
    if (!address) return false;
    
    const normalizedUser = address.toLowerCase();
    const normalizedTarget = targetAddress.toLowerCase();
    
    return followData[normalizedUser]?.includes(normalizedTarget) || false;
  };

  const getFollowing = (userAddress?: string): string[] => {
    const addr = (userAddress || address)?.toLowerCase();
    if (!addr) return [];
    return followData[addr] || [];
  };

  const getFollowers = (userAddress?: string): string[] => {
    const addr = (userAddress || address)?.toLowerCase();
    if (!addr) return [];
    
    // Find all users who follow this address
    return Object.entries(followData)
      .filter(([_, following]) => following.includes(addr))
      .map(([follower, _]) => follower);
  };

  const getFollowingCount = (userAddress?: string): number => {
    return getFollowing(userAddress).length;
  };

  const getFollowersCount = (userAddress?: string): number => {
    return getFollowers(userAddress).length;
  };

  return {
    followUser,
    unfollowUser,
    isFollowing,
    getFollowing,
    getFollowers,
    getFollowingCount,
    getFollowersCount,
  };
}
