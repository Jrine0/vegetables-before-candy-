interface StellarBrowserWallet {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  getPublicKey: () => Promise<string>;
  getNetwork: () => Promise<string>;
  isConnected: () => Promise<boolean>;
  signTransaction: (tx: string) => Promise<string>;
}

interface Window {
  freighter?: StellarBrowserWallet;
}
