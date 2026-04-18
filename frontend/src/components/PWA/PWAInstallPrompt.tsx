import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { usePWA } from '../../contexts/PWAContext';

export const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  if (isInstalled || isDismissed || !isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    try {
      setIsInstalling(true);
      await installApp();
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-20 left-4 right-4 z-50 md:bottom-4 md:left-auto md:right-4 md:w-96"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <DevicePhoneMobileIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Install Academic NFT</h3>
                  <p className="text-indigo-100 text-sm">Access your achievements anywhere</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Works offline with cached data</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Fast mobile-optimized experience</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Push notifications for opportunities</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Native app-like interface</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <motion.button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                whileTap={{ scale: 0.98 }}
              >
                {isInstalling ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Installing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Install App</span>
                  </>
                )}
              </motion.button>
              
              <motion.button
                onClick={handleDismiss}
                className="px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                Maybe Later
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Compact install banner for mobile
export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isInstalled || isDismissed || !isInstallable) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      exit={{ y: -100 }}
      className="fixed top-0 left-0 right-0 z-40 bg-indigo-600 text-white p-3 md:hidden"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <DevicePhoneMobileIcon className="w-5 h-5" />
          <div>
            <p className="font-medium text-sm">Install Academic NFT</p>
            <p className="text-indigo-200 text-xs">Get the full experience</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={installApp}
            className="bg-white text-indigo-600 px-3 py-1 rounded-full font-medium text-sm"
            whileTap={{ scale: 0.95 }}
          >
            Install
          </motion.button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 hover:bg-indigo-700 rounded"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};