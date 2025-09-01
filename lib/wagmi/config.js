import { cookieStorage, createStorage, http, createConfig } from 'wagmi';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { duckChain } from '../chains/duckchain';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

export function getConfig() {
  if (!projectId) {
    // Non-fatal: RainbowKit WalletConnect will warn at runtime; we log for local clarity.
    // eslint-disable-next-line no-console
    console.warn('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. WalletConnect options will be limited.');
  }
  const connectors = [
    injected(),
    coinbaseWallet({ appName: 'DuckWire' }),
  ];
  if (projectId) connectors.push(walletConnect({ projectId, showQrModal: false }));

  return createConfig({
    chains: [duckChain],
    connectors,
    ssr: true,
    storage: createStorage({ storage: cookieStorage }),
    transports: {
      [duckChain.id]: http('https://rpc.duckchain.io'),
    },
  });
}
