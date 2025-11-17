import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { defineChain } from 'viem';

// PulseChain mainnet configuration
export const pulsechainMainnet = defineChain({
  id: 369,
  name: 'PulseChain',
  nativeCurrency: {
    decimals: 18,
    name: 'Pulse',
    symbol: 'PLS',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.pulsechain.com'],
    },
  },
  blockExplorers: {
    default: { name: 'PulseScan', url: 'https://scan.pulsechain.com' },
  },
});

export const wagmiConfig = createConfig({
  chains: [pulsechainMainnet],
  connectors: [
    injected({ 
      shimDisconnect: true,
    }),
  ],
  transports: {
    [pulsechainMainnet.id]: http('https://rpc.pulsechain.com'),
  },
  ssr: false,
});
