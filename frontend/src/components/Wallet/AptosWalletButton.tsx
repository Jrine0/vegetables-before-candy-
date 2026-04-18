import React from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { WalletIcon } from '@heroicons/react/24/outline';

const AptosWalletButton: React.FC = () => {
  const { account, isConnecting, connectWallet, disconnectWallet, walletName, networkName } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getWalletLabel = () => {
    if (walletName === 'petra') return 'Petra';
    if (walletName === 'martian') return 'Martian';
    return 'Aptos';
  };

  if (account) {
    return (
      <div className="flex items-center space-x-2">
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{networkName || 'Aptos'}</span>
          </div>
        </div>
        <button
          onClick={() => void disconnectWallet()}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
        >
          <WalletIcon className="w-4 h-4" />
          <span>{getWalletLabel()} {formatAddress(account)}</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => void connectWallet()}
      disabled={isConnecting}
      className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
    >
      <WalletIcon className="w-4 h-4" />
      <span>{isConnecting ? 'Connecting...' : 'Connect Aptos Wallet'}</span>
    </button>
  );
};

export default AptosWalletButton;
