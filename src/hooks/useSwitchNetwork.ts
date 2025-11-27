import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export function useSwitchNetwork() {
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const switchToMonad = async () => {
    if (!window.ethereum) {
      const err = new Error('No Web3 wallet detected');
      setError(err);
      toast({
        title: 'Wallet Error',
        description: 'Please install MetaMask or another Web3 wallet',
        variant: 'destructive',
      });
      return false;
    }

    setIsSwitching(true);
    setError(null);

    try {
      // Try to switch to Monad
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x8f' }], // 143 in hex
      });
      
      toast({
        title: 'Network Switched',
        description: 'Successfully switched to Monad Mainnet',
      });
      
      setIsSwitching(false);
      return true;
    } catch (switchError: any) {
      // Chain not added to wallet
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x8f',
                chainName: 'Monad Mainnet',
                nativeCurrency: {
                  name: 'MON',
                  symbol: 'MON',
                  decimals: 18,
                },
                rpcUrls: [
                  'https://rpc.monad.xyz',
                  'https://rpc1.monad.xyz',
                  'https://rpc3.monad.xyz',
                  'https://rpc-mainnet.monadinfra.com',
                ],
                blockExplorerUrls: [
                  'https://monadvision.com',
                  'https://monadscan.com',
                ],
              },
            ],
          });
          
          toast({
            title: 'Network Added',
            description: 'Monad Mainnet added to your wallet',
          });
          
          setIsSwitching(false);
          return true;
        } catch (addError: any) {
          const err = new Error(addError.message || 'Failed to add Monad network');
          setError(err);
          toast({
            title: 'Error Adding Network',
            description: err.message,
            variant: 'destructive',
          });
          setIsSwitching(false);
          return false;
        }
      } else {
        const err = new Error(switchError.message || 'Failed to switch network');
        setError(err);
        toast({
          title: 'Network Switch Failed',
          description: err.message,
          variant: 'destructive',
        });
        setIsSwitching(false);
        return false;
      }
    }
  };

  return {
    switchToMonad,
    isSwitching,
    error,
  };
}
