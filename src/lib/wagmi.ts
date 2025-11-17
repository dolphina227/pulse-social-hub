import { createConfig, http } from 'wagmi';
import { pulsechain } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// PulseChain mainnet configuration
export const pulsechainMainnet = {
  ...pulsechain,
  id: 369,
  name: 'PulseChain',
  nativeCurrency: {
    decimals: 18,
    name: 'Pulse',
    symbol: 'PLS',
  },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_PULSECHAIN_RPC_URL || 'https://rpc.pulsechain.com'],
    },
    public: {
      http: ['https://rpc.pulsechain.com'],
    },
  },
  blockExplorers: {
    default: { name: 'PulseScan', url: 'https://scan.pulsechain.com' },
  },
};

export const wagmiConfig = createConfig({
  chains: [pulsechainMainnet],
  connectors: [
    injected({ target: 'metaMask' }),
    injected({ target: 'rabby' }),
  ],
  transports: {
    [pulsechainMainnet.id]: http(),
  },
});
