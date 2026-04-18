import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import toast from 'react-hot-toast';

type AptosWalletName = 'petra' | 'martian';

type AptosWalletProvider = {
  connect: () => Promise<any>;
  disconnect?: () => Promise<void>;
  account?: () => Promise<{ address?: string; publicKey?: string }>;
  network?: () => Promise<{ name?: string }>;
  isConnected?: () => Promise<boolean>;
  onAccountChange?: (handler: (account: { address?: string } | null) => void) => void;
};

interface WalletContextType {
  account: string | null;
  walletName: AptosWalletName | null;
  networkName: string | null;
  isConnecting: boolean;
  connectWallet: (preferredWallet?: AptosWalletName) => Promise<void>;
  disconnectWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

const getWalletProvider = (walletName: AptosWalletName): AptosWalletProvider | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (walletName === 'petra') {
    return window.aptos || null;
  }

  if (walletName === 'martian') {
    return window.martian || null;
  }

  return null;
};

const formatNetwork = (network: string | undefined): string => {
  if (!network) {
    return 'Aptos';
  }

  const normalized = network.toLowerCase();
  if (normalized.includes('mainnet')) return 'Aptos Mainnet';
  if (normalized.includes('testnet')) return 'Aptos Testnet';
  if (normalized.includes('devnet')) return 'Aptos Devnet';
  return `Aptos ${network}`;
};

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<AptosWalletName | null>(null);
  const [networkName, setNetworkName] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const checkExistingConnection = async () => {
      const rememberedWallet = localStorage.getItem('aptos_wallet_name') as AptosWalletName | null;
      if (!rememberedWallet) return;

      const provider = getWalletProvider(rememberedWallet);
      if (!provider) return;

      try {
        const connected = provider.isConnected ? await provider.isConnected() : false;
        if (!connected) return;

        const accountInfo = provider.account ? await provider.account() : null;
        const networkInfo = provider.network ? await provider.network() : null;

        if (accountInfo?.address) {
          setAccount(accountInfo.address);
          setWalletName(rememberedWallet);
          setNetworkName(formatNetwork(networkInfo?.name));
        }
      } catch (error) {
        console.error('Failed to restore Aptos wallet connection:', error);
      }
    };

    checkExistingConnection();
  }, []);

  const connectWallet = async (preferredWallet?: AptosWalletName) => {
    const candidateWallets: AptosWalletName[] = preferredWallet
      ? [preferredWallet]
      : ['petra', 'martian'];

    setIsConnecting(true);

    try {
      let selectedWallet: AptosWalletName | null = null;
      let provider: AptosWalletProvider | null = null;

      for (const wallet of candidateWallets) {
        const maybeProvider = getWalletProvider(wallet);
        if (maybeProvider) {
          selectedWallet = wallet;
          provider = maybeProvider;
          break;
        }
      }

      if (!provider || !selectedWallet) {
        toast.error('Install Petra or Martian wallet to continue');
        return;
      }

      await provider.connect();
      const accountInfo = provider.account ? await provider.account() : null;
      const networkInfo = provider.network ? await provider.network() : null;

      if (!accountInfo?.address) {
        throw new Error('Wallet connected but no Aptos account was returned');
      }

      setAccount(accountInfo.address);
      setWalletName(selectedWallet);
      setNetworkName(formatNetwork(networkInfo?.name));
      localStorage.setItem('aptos_wallet_name', selectedWallet);

      toast.success(`Connected ${selectedWallet === 'petra' ? 'Petra' : 'Martian'} wallet`);

      if (provider.onAccountChange) {
        provider.onAccountChange((nextAccount) => {
          if (!nextAccount?.address) {
            setAccount(null);
            return;
          }
          setAccount(nextAccount.address);
        });
      }
    } catch (error: any) {
      console.error('Failed to connect Aptos wallet:', error);
      toast.error(error?.message || 'Failed to connect Aptos wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      if (walletName) {
        const provider = getWalletProvider(walletName);
        if (provider?.disconnect) {
          await provider.disconnect();
        }
      }
    } catch (error) {
      console.error('Failed to disconnect wallet gracefully:', error);
    } finally {
      localStorage.removeItem('aptos_wallet_name');
      setAccount(null);
      setWalletName(null);
      setNetworkName(null);
      toast.success('Aptos wallet disconnected');
    }
  };

  return (
    <WalletContext.Provider
      value={{
        account,
        walletName,
        networkName,
        isConnecting,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
