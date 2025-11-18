import { useState, useEffect, useRef } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Send, Users, Pin, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { getDisplayText } from '@/lib/utils/profile';
import { PULSECHAT_CONTRACT_ADDRESS } from '@/lib/contracts';
import { formatAddress } from '@/lib/utils/format';

interface CommunityMessage {
  id: string;
  user_address: string;
  message: string;
  created_at: string;
}

interface PinnedMessage {
  id: string;
  message_id: string;
  pinned_by: string;
  pinned_at: string;
}

export default function Community() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (address) {
      checkAdminStatus();
    }
  }, [address]);

  useEffect(() => {
    fetchMessages();
    fetchPinnedMessages();
    
    const messageChannel = supabase
      .channel('community-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages'
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as CommunityMessage]);
        }
      )
      .subscribe();

    const pinnedChannel = supabase
      .channel('pinned-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pinned_messages'
        },
        () => {
          fetchPinnedMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(pinnedChannel);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkAdminStatus = async () => {
    if (!address) return;

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_address', address)
      .eq('role', 'admin')
      .single();

    if (!error && data) {
      setIsAdmin(true);
    }
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('community_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data || []);
  };

  const fetchPinnedMessages = async () => {
    const { data, error } = await supabase
      .from('pinned_messages')
      .select('*')
      .order('pinned_at', { ascending: false });

    if (error) {
      console.error('Error fetching pinned messages:', error);
      return;
    }

    setPinnedMessages(data || []);
  };

  const handlePinMessage = async (messageId: string) => {
    if (!isAdmin || !address) return;

    const { error } = await supabase
      .from('pinned_messages')
      .insert({
        message_id: messageId,
        pinned_by: address,
      });

    if (error) {
      console.error('Error pinning message:', error);
      toast({
        title: "Error",
        description: "Failed to pin message",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Message pinned",
      });
    }
  };

  const handleUnpinMessage = async (messageId: string) => {
    if (!isAdmin || !address) return;

    const { error } = await supabase
      .from('pinned_messages')
      .delete()
      .eq('message_id', messageId)
      .eq('pinned_by', address);

    if (error) {
      console.error('Error unpinning message:', error);
      toast({
        title: "Error",
        description: "Failed to unpin message",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Message unpinned",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to send messages",
        variant: "destructive",
      });
      return;
    }

    if (!newMessage.trim()) {
      return;
    }

    setIsLoading(true);

    const { error } = await supabase
      .from('community_messages')
      .insert({
        user_address: address,
        message: newMessage.trim(),
      });

    if (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } else {
      setNewMessage('');
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isPinned = (messageId: string) => {
    return pinnedMessages.some(pm => pm.message_id === messageId);
  };

  const getPinnedMessageData = (messageId: string) => {
    return pinnedMessages.find(pm => pm.message_id === messageId);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b border-border/50 p-4 md:p-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Community Chat</h1>
            <p className="text-sm text-muted-foreground">
              Discuss ProveChat with other users and developers
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {pinnedMessages.length > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Pin className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Pinned Messages</span>
            </div>
            {pinnedMessages.map((pinnedMsg) => {
              const msg = messages.find(m => m.id === pinnedMsg.message_id);
              if (!msg) return null;
              return (
                <MessageItem 
                  key={msg.id} 
                  message={msg} 
                  currentUser={address}
                  isAdmin={isAdmin}
                  isPinned={true}
                  pinnedData={pinnedMsg}
                  onPin={handlePinMessage}
                  onUnpin={handleUnpinMessage}
                />
              );
            })}
          </div>
        )}
        
        {messages.map((msg) => (
          <MessageItem 
            key={msg.id} 
            message={msg} 
            currentUser={address}
            isAdmin={isAdmin}
            isPinned={isPinned(msg.id)}
            pinnedData={getPinnedMessageData(msg.id)}
            onPin={handlePinMessage}
            onUnpin={handleUnpinMessage}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border/50 p-4 bg-background">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "Type your message..." : "Connect wallet to send messages"}
            disabled={!isConnected || isLoading}
            className="min-h-[60px] max-h-[120px] resize-none"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!isConnected || !newMessage.trim() || isLoading}
            size="icon"
            className="h-[60px] w-[60px]"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageItem({ 
  message, 
  currentUser, 
  isAdmin, 
  isPinned, 
  pinnedData,
  onPin,
  onUnpin 
}: { 
  message: CommunityMessage; 
  currentUser?: string;
  isAdmin?: boolean;
  isPinned?: boolean;
  pinnedData?: PinnedMessage;
  onPin?: (messageId: string) => void;
  onUnpin?: (messageId: string) => void;
}) {
  const isOwnMessage = message.user_address.toLowerCase() === currentUser?.toLowerCase();

  const { data: profileData } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: [{
      inputs: [{ name: 'user', type: 'address' }],
      name: 'profiles',
      outputs: [
        { name: 'name', type: 'string' },
        { name: 'bio', type: 'string' },
        { name: 'avatar', type: 'string' }
      ],
      stateMutability: 'view',
      type: 'function',
    }],
    functionName: 'profiles',
    args: [message.user_address as `0x${string}`],
  });

  const displayName = getDisplayText(profileData, message.user_address);
  const avatarUrl = profileData?.[2] as string;

  const getAvatarImage = () => {
    if (avatarUrl) {
      return <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />;
    }
    return (
      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40 text-primary-foreground font-semibold">
        {formatAddress(message.user_address).slice(0, 2).toUpperCase()}
      </div>
    );
  };

  return (
    <div className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-10 w-10 flex-shrink-0">
        {getAvatarImage()}
      </Avatar>

      <div className={`flex flex-col gap-1 max-w-[70%] ${isOwnMessage ? 'items-end' : ''}`}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{displayName}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
          {isPinned && (
            <Pin className="h-3 w-3 text-primary" />
          )}
        </div>
        
        <div className={`rounded-2xl px-4 py-2 ${
          isOwnMessage 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted'
        }`}>
          <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
        </div>

        {pinnedData && (
          <span className="text-xs text-muted-foreground">
            Pinned by {formatAddress(pinnedData.pinned_by)} • {formatDistanceToNow(new Date(pinnedData.pinned_at), { addSuffix: true })}
          </span>
        )}

        {isAdmin && (
          <div className="flex gap-2 mt-1">
            {isPinned ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUnpin?.(message.id)}
                className="h-6 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Unpin
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPin?.(message.id)}
                className="h-6 text-xs"
              >
                <Pin className="h-3 w-3 mr-1" />
                Pin
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
