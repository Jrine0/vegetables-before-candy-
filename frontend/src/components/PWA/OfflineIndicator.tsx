import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  WifiIcon, 
  NoSymbolIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { usePWA } from '../../contexts/PWAContext';

export const OfflineIndicator: React.FC = () => {
  const { 
    isOnline, 
    isOfflineMode, 
    syncStatus, 
    syncData, 
    toggleOfflineMode,
    cacheStats 
  } = usePWA();

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: <NoSymbolIcon className="w-4 h-4" />,
        text: 'No Internet Connection',
        bgColor: 'bg-red-500',
        textColor: 'text-white'
      };
    }

    if (isOfflineMode) {
      return {
        icon: <NoSymbolIcon className="w-4 h-4" />,
        text: 'Offline Mode Active',
        bgColor: 'bg-amber-500',
        textColor: 'text-white'
      };
    }

    switch (syncStatus) {
      case 'syncing':
        return {
          icon: <ArrowPathIcon className="w-4 h-4 animate-spin" />,
          text: 'Syncing...',
          bgColor: 'bg-blue-500',
          textColor: 'text-white'
        };
      case 'success':
        return {
          icon: <CheckCircleIcon className="w-4 h-4" />,
          text: 'Synced',
          bgColor: 'bg-green-500',
          textColor: 'text-white'
        };
      case 'error':
        return {
          icon: <ExclamationTriangleIcon className="w-4 h-4" />,
          text: 'Sync Failed',
          bgColor: 'bg-red-500',
          textColor: 'text-white'
        };
      default:
        return {
          icon: <WifiIcon className="w-4 h-4" />,
          text: 'Online',
          bgColor: 'bg-green-500',
          textColor: 'text-white'
        };
    }
  };

  const config = getStatusConfig();
  const showIndicator = !isOnline || isOfflineMode || syncStatus !== 'idle';

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-16 left-4 right-4 z-30 md:left-auto md:right-4 md:w-80"
        >
          <div className={`${config.bgColor} ${config.textColor} rounded-lg p-3 shadow-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {config.icon}
                <span className="font-medium text-sm">{config.text}</span>
              </div>

              <div className="flex items-center space-x-2">
                {/* Sync button */}
                {isOnline && !isOfflineMode && syncStatus !== 'syncing' && (
                  <motion.button
                    onClick={syncData}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                    whileTap={{ scale: 0.95 }}
                    title="Sync now"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                  </motion.button>
                )}

                {/* Offline mode toggle */}
                {isOnline && (
                  <motion.button
                    onClick={toggleOfflineMode}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                    whileTap={{ scale: 0.95 }}
                    title={isOfflineMode ? 'Go online' : 'Go offline'}
                  >
                    {isOfflineMode ? (
                      <WifiIcon className="w-4 h-4" />
                    ) : (
                      <NoSymbolIcon className="w-4 h-4" />
                    )}
                  </motion.button>
                )}
              </div>
            </div>

            {/* Cache stats */}
            {cacheStats && (isOfflineMode || !isOnline) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 pt-2 border-t border-white/20"
              >
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="opacity-80">NFTs: </span>
                    <span className="font-medium">{cacheStats.nfts}</span>
                  </div>
                  <div>
                    <span className="opacity-80">Jobs: </span>
                    <span className="font-medium">{cacheStats.opportunities}</span>
                  </div>
                  <div>
                    <span className="opacity-80">Achievements: </span>
                    <span className="font-medium">{cacheStats.achievements}</span>
                  </div>
                  <div>
                    <span className="opacity-80">Pending: </span>
                    <span className="font-medium">{cacheStats.pendingSync}</span>
                  </div>
                </div>

                {cacheStats.lastSync && (
                  <div className="mt-1 text-xs opacity-80">
                    Last sync: {new Date(cacheStats.lastSync).toLocaleTimeString()}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Simple connection status dot
export const ConnectionStatus: React.FC = () => {
  const { isOnline, isOfflineMode } = usePWA();

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`w-2 h-2 rounded-full ${
          !isOnline ? 'bg-red-500' :
          isOfflineMode ? 'bg-amber-500' : 
          'bg-green-500'
        }`}
        title={
          !isOnline ? 'Offline' :
          isOfflineMode ? 'Offline Mode' : 
          'Online'
        }
      />
      <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
        {!isOnline ? 'Offline' : isOfflineMode ? 'Offline Mode' : 'Online'}
      </span>
    </div>
  );
};