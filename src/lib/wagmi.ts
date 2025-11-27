import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { monadMainnet } from '@/config/monad';

export const wagmiConfig = createConfig({
  chains: [monadMainnet],
  connectors: [
    injected({ 
      shimDisconnect: true,
    }),
  ],
  transports: {
    [monadMainnet.id]: http('https://rpc.monad.xyz'),
  },
  ssr: false,
});
