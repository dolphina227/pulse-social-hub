import { defineChain } from 'viem';

// Monad Mainnet configuration
export const monadMainnet = defineChain({
  id: 143,
  name: 'Monad Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.monad.xyz'],
    },
    public: {
      http: [
        'https://rpc.monad.xyz',
        'https://rpc1.monad.xyz',
        'https://rpc3.monad.xyz',
        'https://rpc-mainnet.monadinfra.com',
      ],
    },
  },
  blockExplorers: {
    default: { 
      name: 'MonadVision', 
      url: 'https://monadvision.com' 
    },
    secondary: {
      name: 'MonadScan',
      url: 'https://monadscan.com'
    }
  },
});

export const MONAD_CHAIN_ID = 143;
