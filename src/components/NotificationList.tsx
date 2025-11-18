import { useNotifications, NotificationType } from '@/hooks/useNotifications';
import { formatTimestamp, formatAddress } from '@/lib/utils/format';
import { useReadContract } from 'wagmi';
import { PULSECHAT_CONTRACT_ADDRESS, PULSECHAT_ABI } from '@/lib/contracts';
import { parseProfile } from '@/lib/utils/profile';
import { Heart, MessageCircle, Repeat2, DollarSign, Users, Mail, Quote, Bell } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: any;
  onRead: (id: string) => void;
}

function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const { data: senderProfile } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'profiles',
    args: [notification.from as `0x${string}`],
  });

  const { username, displayName, avatar } = parseProfile(senderProfile);
  const senderName = displayName || username || formatAddress(notification.from);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'follow':
        return <Users className="h-4 w-4 text-pulse-blue" />;
      case 'like':
        return <Heart className="h-4 w-4 text-pulse-magenta" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-pulse-cyan" />;
      case 'repost':
        return <Repeat2 className="h-4 w-4 text-pulse-blue" />;
      case 'quote':
        return <Quote className="h-4 w-4 text-pulse-purple" />;
      case 'tip':
        return <DollarSign className="h-4 w-4 text-pulse-cyan" />;
      case 'message':
        return <Mail className="h-4 w-4 text-pulse-magenta" />;
    }
  };

  const getMessage = () => {
    switch (notification.type) {
      case 'follow':
        return `${senderName} started following you`;
      case 'like':
        return `${senderName} liked your post`;
      case 'comment':
        return `${senderName} commented on your post`;
      case 'repost':
        return `${senderName} reposted your post`;
      case 'quote':
        return `${senderName} quoted your post`;
      case 'tip':
        return `${senderName} sent you ${notification.amount} USDC tip`;
      case 'message':
        return `${senderName} sent you a message`;
    }
  };

  const getLink = () => {
    if (notification.type === 'follow') {
      return `/profile/${notification.from}`;
    }
    if (notification.type === 'message') {
      return '/messages';
    }
    if (notification.postId) {
      return `/post/${notification.postId}`;
    }
    return '/';
  };

  return (
    <Link
      to={getLink()}
      className={cn(
        'block p-4 hover:bg-muted/30 transition-colors border-b border-border/50',
        !notification.read && 'bg-pulse-blue/5'
      )}
      onClick={() => onRead(notification.id)}
    >
      <div className="flex gap-3">
        {avatar ? (
          <img src={avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-pulse flex-shrink-0 flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {senderName.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            {getIcon(notification.type)}
            <p className="text-sm flex-1">
              {getMessage()}
            </p>
          </div>
          
          {notification.message && (
            <p className="text-xs text-muted-foreground truncate">
              {notification.message}
            </p>
          )}
          
          <p className="text-xs text-muted-foreground mt-1">
            {formatTimestamp(Math.floor(notification.timestamp / 1000))}
          </p>
        </div>

        {!notification.read && (
          <div className="w-2 h-2 rounded-full bg-pulse-blue flex-shrink-0 mt-2" />
        )}
      </div>
    </Link>
  );
}

export function NotificationList() {
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotifications();

  return (
    <div className="w-full">
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <h3 className="font-semibold text-lg">Notifications</h3>
        <div className="flex gap-2">
          {notifications.length > 0 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Clear all
              </Button>
            </>
          )}
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={markAsRead}
            />
          ))
        )}
      </ScrollArea>
    </div>
  );
}
