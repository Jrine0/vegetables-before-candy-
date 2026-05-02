import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Keypair } from '@stellar/stellar-sdk';
import toast from 'react-hot-toast';

type StellarWalletName = 'freighter';

interface WalletContextType {
  account: string | null;
  walletName: StellarWalletName | null;
  networkName: string | null;
  isConnecting: boolean;
  connectWallet: (preferredWallet?: StellarWalletName) => Promise<void>;
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

const isFreighterAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!(window as any).freighter;
};

const formatNetwork = (network: string | undefined): string => {
  if (!network) {
    return 'Stellar';
  }

  const normalized = network.toLowerCase();
  if (normalized.includes('mainnet')) return 'Stellar Mainnet';
  if (normalized.includes('testnet')) return 'Stellar Testnet';
  return `Stellar ${network}`;
};

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<StellarWalletName | null>(null);
  const [networkName, setNetworkName] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const checkExistingConnection = async () => {
      const rememberedWallet = localStorage.getItem('stellar_wallet_name') as StellarWalletName | null;
      if (!rememberedWallet || rememberedWallet !== 'freighter') return;

      if (!isFreighterAvailable()) return;

      try {
        const freighter = (window as any).freighter;
        const connected = await freighter.isConnected();
        if (!connected) return;

        const publicKey = await freighter.getPublicKey();
        const network = await freighter.getNetwork();

        if (publicKey) {
          setAccount(publicKey);
          setWalletName('freighter');
          setNetworkName(formatNetwork(network));
        }
      } catch (error) {
        console.error('Failed to restore Stellar wallet connection:', error);
      }
    };

    checkExistingConnection();
  }, []);

  const connectWallet = async (preferredWallet?: StellarWalletName) => {
    setIsConnecting(true);

    try {
      if (!isFreighterAvailable()) {
        toast.error('Install Freighter wallet to continue');
        return;
      }

      const freighter = (window as any).freighter;

      // Connect to wallet
      await freighter.connect();

      const publicKey = await freighter.getPublicKey();
      const network = await freighter.getNetwork();

      if (!publicKey) {
        throw new Error('Wallet connected but no Stellar account was returned');
      }

      setAccount(publicKey);
      setWalletName('freighter');
      setNetworkName(formatNetwork(network));
      localStorage.setItem('stellar_wallet_name', 'freighter');

      toast.success('Connected Freighter wallet');

    } catch (error: any) {
      console.error('Failed to connect Stellar wallet:', error);
      toast.error(error?.message || 'Failed to connect Stellar wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      if (walletName === 'freighter' && isFreighterAvailable()) {
        const freighter = (window as any).freighter;
        await freighter.disconnect();
      }
    } catch (error) {
      console.error('Failed to disconnect wallet gracefully:', error);
    } finally {
      localStorage.removeItem('stellar_wallet_name');
      setAccount(null);
      setWalletName(null);
      setNetworkName(null);
      toast.success('Stellar wallet disconnected');
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