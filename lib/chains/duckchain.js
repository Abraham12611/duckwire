// DuckChain custom chain definition based on official docs:
// https://diary.duckchain.io/2.-users-and-developers/2.3-developer-hub/2.3.1-network-information/mainnet
// Chain ID: 5545
// RPC URLs: https://rpc.duckchain.io, https://rpc-hk.duckchain.io
// Currency Symbol: TON
// Explorers: https://scan.duckchain.io, https://www.oklink.com/duckchain

export const duckChain = {
  id: 5545,
  name: 'DuckChain Mainnet',
  // Note: Decimals set to 18 as is standard for EVM native currency.
  nativeCurrency: { name: 'TON', symbol: 'TON', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.duckchain.io', 'https://rpc-hk.duckchain.io'],
    },
    public: {
      http: ['https://rpc.duckchain.io', 'https://rpc-hk.duckchain.io'],
    },
  },
  blockExplorers: {
    default: { name: 'DuckChain Scan', url: 'https://scan.duckchain.io' },
    oklink: { name: 'OKLink', url: 'https://www.oklink.com/duckchain' },
  },
};
