import { useAccount, useConnect, useDisconnect, useSwitchChain, useReadContract } from 'wagmi';
import { Button } from '@/components/ui/button';
import { formatAddress } from '@/lib/utils/format';
import { Wallet, LogOut, MoreHorizontal } from 'lucide-react';
import { pulsechainMainnet } from '@/lib/wagmi';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PULSECHAT_CONTRACT_ADDRESS, PULSECHAT_ABI } from '@/lib/contracts';

export function WalletConnect() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const { data: userProfile } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'profiles',
    args: [address || '0x0'],
  }) as { data: any };

  const isWrongNetwork = isConnected && chain?.id !== pulsechainMainnet.id;

  const handleConnect = () => {
    const connector = connectors[0];
    if (!connector) {
      toast.error('Wallet tidak terdeteksi');
      return;
    }
    connect({ connector });
  };

  const profileName = userProfile?.name || '';
  const profileAvatar = userProfile?.avatarUrl || '';

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 p-3 rounded-full hover:bg-muted/50 transition-colors w-full">
            {profileAvatar ? (
              <img src={profileAvatar} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-pulse flex items-center justify-center">
                <span className="text-sm font-bold text-white">{formatAddress(address).slice(0, 2)}</span>
              </div>
            )}
            <div className="hidden xl:flex flex-1 flex-col items-start">
              <p className="font-bold text-sm">{profileName || formatAddress(address)}</p>
              {isWrongNetwork ? (
                <p className="text-xs text-destructive">Wrong network</p>
              ) : (
                <p className="text-xs text-muted-foreground">Connected</p>
              )}
            </div>
            <MoreHorizontal className="hidden xl:block h-5 w-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {isWrongNetwork && (
            <DropdownMenuItem onClick={() => switchChain({ chainId: pulsechainMainnet.id })}>
              Switch to PulseChain
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => disconnect()} className="text-destructive">
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button variant="gradient" onClick={handleConnect} disabled={isPending} className="rounded-full w-full lg:w-auto" size="lg">
      <Wallet className="h-4 w-4 lg:mr-2" />
      <span className="hidden lg:inline">{isPending ? 'Connecting...' : 'Connect'}</span>
    </Button>
  );
}
