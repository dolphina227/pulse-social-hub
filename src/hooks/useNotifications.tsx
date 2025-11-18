import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export type NotificationType = 
  | 'follow'
  | 'like'
  | 'comment'
  | 'repost'
  | 'quote'
  | 'tip'
  | 'message';

export interface Notification {
  id: string;
  type: NotificationType;
  from: string; // address of the user who triggered the notification
  postId?: string; // for post-related notifications
  amount?: string; // for tip notifications
  message?: string; // additional message
  timestamp: number;
  read: boolean;
}

interface NotificationData {
  [userAddress: string]: Notification[];
}

const STORAGE_KEY = 'pulsechat_notifications';

export function useNotifications() {
  const { address } = useAccount();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from localStorage
  useEffect(() => {
    if (!address) {
      setNotifications([]);
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data: NotificationData = JSON.parse(stored);
        const userNotifications = data[address.toLowerCase()] || [];
        // Sort by timestamp, newest first
        setNotifications(userNotifications.sort((a, b) => b.timestamp - a.timestamp));
      } catch (error) {
        console.error('Error loading notifications:', error);
        setNotifications([]);
      }
    }
  }, [address]);

  // Add a new notification
  const addNotification = (
    type: NotificationType,
    from: string,
    options?: {
      postId?: string;
      amount?: string;
      message?: string;
    }
  ) => {
    if (!address || from.toLowerCase() === address.toLowerCase()) {
      // Don't notify yourself
      return;
    }

    const notification: Notification = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      from: from.toLowerCase(),
      postId: options?.postId,
      amount: options?.amount,
      message: options?.message,
      timestamp: Date.now(),
      read: false,
    };

    const stored = localStorage.getItem(STORAGE_KEY);
    const data: NotificationData = stored ? JSON.parse(stored) : {};
    const userAddress = address.toLowerCase();
    
    if (!data[userAddress]) {
      data[userAddress] = [];
    }

    data[userAddress].unshift(notification);
    
    // Keep only last 100 notifications per user
    if (data[userAddress].length > 100) {
      data[userAddress] = data[userAddress].slice(0, 100);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setNotifications([notification, ...notifications]);
  };

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    if (!address) return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const data: NotificationData = JSON.parse(stored);
    const userAddress = address.toLowerCase();
    
    if (data[userAddress]) {
      data[userAddress] = data[userAddress].map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setNotifications(data[userAddress].sort((a, b) => b.timestamp - a.timestamp));
    }
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    if (!address) return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const data: NotificationData = JSON.parse(stored);
    const userAddress = address.toLowerCase();
    
    if (data[userAddress]) {
      data[userAddress] = data[userAddress].map(n => ({ ...n, read: true }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setNotifications(data[userAddress].sort((a, b) => b.timestamp - a.timestamp));
    }
  };

  // Clear all notifications
  const clearAll = () => {
    if (!address) return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const data: NotificationData = JSON.parse(stored);
    const userAddress = address.toLowerCase();
    
    delete data[userAddress];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setNotifications([]);
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
}
