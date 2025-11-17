import { useState, useMemo } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PULSECHAT_CONTRACT_ADDRESS, PULSECHAT_ABI } from '@/lib/contracts';
import { Send, AlertCircle } from 'lucide-react';
import { formatAddress, formatTimestamp } from '@/lib/utils/format';
import { parseProfile } from '@/lib/utils/profile';
import { toast } from 'sonner';

export default function Messages() {
  const { address, isConnected } = useAccount();
  const [searchParams] = useSearchParams();
  const [recipient, setRecipient] = useState(searchParams.get('to') || '');
  const [message, setMessage] = useState('');
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const { writeContract, isPending } = useWriteContract();

  const { data: messages, refetch } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'getMessagesByUser',
    args: address ? [address, 100n] : undefined,
  });

  const conversations = useMemo(() => {
    if (!messages || !address) return [];
    const convos = new Map<string, any>();
    
    messages.forEach((msg) => {
      const otherParty = msg.from.toLowerCase() === address.toLowerCase() ? msg.to : msg.from;
      const key = otherParty.toLowerCase();
      
      if (!convos.has(key) || Number(msg.timestamp) > Number(convos.get(key).timestamp)) {
        convos.set(key, { address: otherParty, lastMessage: msg });
      }
    });
    
    return Array.from(convos.values());
  }, [messages, address]);

  const selectedMessages = useMemo(() => {
    if (!messages || !address || !selectedConvo) return [];
    
    return messages
      .filter((msg) => {
        const isFrom = msg.from.toLowerCase() === selectedConvo.toLowerCase();
        const isTo = msg.to.toLowerCase() === selectedConvo.toLowerCase();
        return (isFrom || isTo) && Number(msg.kind) === 0;
      })
      .sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
  }, [messages, address, selectedConvo]);

  const handleSendDM = () => {
    if (!message.trim() || !recipient) {
      toast.error('Enter recipient and message');
      return;
    }

    writeContract({
      address: PULSECHAT_CONTRACT_ADDRESS,
      abi: PULSECHAT_ABI,
      functionName: 'sendDirectMessage',
      args: [recipient as `0x${string}`, message],
    } as any);

    setMessage('');
    setTimeout(() => refetch(), 2000);
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Connect wallet to access messages</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 md:pb-6 px-4 md:px-0 pt-20 lg:pt-6">
      <div className="mb-6">
        <Alert className="border-pulse-cyan/20">
          <AlertCircle className="h-4 w-4 text-pulse-cyan" />
          <AlertDescription className="text-sm">
            ⚠️ Messages are on-chain and publicly readable
          </AlertDescription>
        </Alert>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-effect md:col-span-1">
          <CardHeader><h3 className="font-semibold">Conversations</h3></CardHeader>
          <CardContent className="space-y-2">
            {conversations.length > 0 ? (
              conversations.map((convo) => {
                // Component to fetch conversation partner profile
                const ConversationItem = () => {
                  const { data: partnerProfile } = useReadContract({
                    address: PULSECHAT_CONTRACT_ADDRESS,
                    abi: PULSECHAT_ABI,
                    functionName: 'profiles',
                    args: [convo.address as `0x${string}`],
                  }) as { data: any };

                  const { username, displayName, avatar: profileAvatar } = parseProfile(partnerProfile);
                  const profileDisplayText = displayName || username || formatAddress(convo.address);

                  return (
                    <button
                      onClick={() => setSelectedConvo(convo.address)}
                      className={`w-full text-left p-3 rounded-lg transition ${
                        selectedConvo === convo.address ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {profileAvatar ? (
                          <img src={profileAvatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-pulse flex items-center justify-center">
                            <span className="text-sm font-bold text-white">
                              {formatAddress(convo.address).slice(0, 2)}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {profileDisplayText}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            @{username || formatAddress(convo.address)}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {convo.lastMessage.content.slice(0, 30)}...
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                };

                return <ConversationItem key={convo.address} />;
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No conversations</p>
            )}
          </CardContent>
        </Card>

        <Card className="glass-effect md:col-span-2">
          <CardHeader>
            {selectedConvo ? (
              (() => {
                const SelectedConvoHeader = () => {
                  const { data: partnerProfile } = useReadContract({
                    address: PULSECHAT_CONTRACT_ADDRESS,
                    abi: PULSECHAT_ABI,
                    functionName: 'profiles',
                    args: [selectedConvo as `0x${string}`],
                  }) as { data: any };

                  const profileName = partnerProfile?.[0] || '';
                  const profileAvatar = partnerProfile?.[2] || '';

                  return (
                    <div className="flex items-center gap-3">
                      {profileAvatar ? (
                        <img src={profileAvatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-pulse flex items-center justify-center">
                          <span className="text-sm font-bold text-white">
                            {formatAddress(selectedConvo).slice(0, 2)}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">
                          {profileName || formatAddress(selectedConvo)}
                        </h3>
                        <p className="text-xs text-muted-foreground">@{formatAddress(selectedConvo)}</p>
                      </div>
                    </div>
                  );
                };
                return <SelectedConvoHeader />;
              })()
            ) : (
              <h3 className="font-semibold">New Message</h3>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedConvo && (
              <Input placeholder="Recipient (0x...)" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
            )}

            {selectedConvo && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedMessages.map((msg) => {
                  const isOwn = msg.from.toLowerCase() === address?.toLowerCase();
                  return (
                    <div key={msg.id.toString()} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${isOwn ? 'bg-primary/20' : 'bg-muted'}`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatTimestamp(Number(msg.timestamp))}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-3">
              <Textarea placeholder="Type message (0.01 USDC fee)" value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[100px]" />
              <Button variant="gradient" onClick={handleSendDM} disabled={isPending || !message.trim()} className="w-full">
                <Send className="h-4 w-4 mr-2" /> Send (0.01 USDC)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
