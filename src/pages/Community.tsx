import { useState, useEffect, useRef } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Send, Users } from 'lucide-react';
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

export default function Community() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchMessages();
    
    const channel = supabase
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        {messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} currentUser={address} />
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

function MessageItem({ message, currentUser }: { message: CommunityMessage; currentUser?: string }) {
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
        </div>
        
        <div className={`rounded-2xl px-4 py-2 ${
          isOwnMessage 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted'
        }`}>
          <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
        </div>
      </div>
    </div>
  );
}
