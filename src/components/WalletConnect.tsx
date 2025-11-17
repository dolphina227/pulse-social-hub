import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { Button } from '@/components/ui/button';
import { formatAddress } from '@/lib/utils/format';
import { Wallet, LogOut, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { pulsechainMainnet } from '@/lib/wagmi';
import { toast } from 'sonner';

export function WalletConnect() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const isWrongNetwork = isConnected && chain?.id !== pulsechainMainnet.id;

  const handleConnect = () => {
    const connector = connectors[0];
    
    if (!connector) {
      toast.error('Wallet tidak terdeteksi. Silakan install MetaMask atau Rabby.');
      return;
    }

    connect({ connector });
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        {isWrongNetwork && (
          <Alert variant="destructive" className="py-2 px-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Wrong network
              <Button
                variant="link"
                size="sm"
                className="ml-2 h-auto p-0 text-xs"
                onClick={() => switchChain({ chainId: pulsechainMainnet.id })}
              >
                Switch to PulseChain
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="glass-effect px-4 py-2 rounded-lg flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-pulse-cyan animate-pulse-glow" />
          <span className="text-sm font-medium">{formatAddress(address)}</span>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => disconnect()}
          title="Disconnect"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="gradient"
      onClick={handleConnect}
      disabled={isPending}
      className="gap-2"
    >
      <Wallet className="h-4 w-4" />
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
}
