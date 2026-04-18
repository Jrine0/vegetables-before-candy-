interface AptosBrowserWallet {
  connect: () => Promise<any>;
  disconnect?: () => Promise<void>;
  account?: () => Promise<{ address?: string; publicKey?: string }>;
  network?: () => Promise<{ name?: string }>;
  isConnected?: () => Promise<boolean>;
  onAccountChange?: (handler: (account: { address?: string } | null) => void) => void;
}

interface Window {
  aptos?: AptosBrowserWallet;
  martian?: AptosBrowserWallet;
}
