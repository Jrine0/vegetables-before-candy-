import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { offlineStorage, AppSettings } from '../lib/offlineStorage';

interface PWAContextType {
  isOnline: boolean;
  isOfflineMode: boolean;
  installPrompt: any;
  isInstallable: boolean;
  isInstalled: boolean;
  settings: AppSettings | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  cacheStats: {
    users: number;
    nfts: number;
    opportunities: number;
    achievements: number;
    pendingSync: number;
    lastSync?: Date;
  } | null;
  
  // Actions
  toggleOfflineMode: () => Promise<void>;
  installApp: () => Promise<void>;
  syncData: () => Promise<void>;
  clearCache: () => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  refreshCacheStats: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

interface PWAProviderProps {
  children: ReactNode;
}

export const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [cacheStats, setCacheStats] = useState<PWAContextType['cacheStats']>(null);

  // Initialize PWA context
  useEffect(() => {
    const initialize = async () => {
      // Initialize offline storage
      const initialSettings = await offlineStorage.initializeSettings();
      setSettings(initialSettings);
      setIsOfflineMode(initialSettings.offlineMode);

      // Get initial cache stats
      const stats = await offlineStorage.getCacheStats();
      setCacheStats(stats);

      // Check if app is installed
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone) {
        setIsInstalled(true);
      }
    };

    initialize();
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Auto-sync when coming back online
    const handleOnline = async () => {
      if (navigator.onLine && !isOfflineMode) {
        await syncData();
      }
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      window.removeEventListener('online', handleOnline);
    };
  }, [isOfflineMode]);

  // Handle install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstallable(false);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Auto-sync periodically
  useEffect(() => {
    if (isOfflineMode || !isOnline) return;

    const intervalId = setInterval(async () => {
      await syncData();
    }, 5 * 60 * 1000); // Sync every 5 minutes

    return () => clearInterval(intervalId);
  }, [isOfflineMode, isOnline]);

  const toggleOfflineMode = async () => {
    const newOfflineMode = !isOfflineMode;
    setIsOfflineMode(newOfflineMode);
    
    if (settings) {
      const updatedSettings = { ...settings, offlineMode: newOfflineMode };
      await offlineStorage.initializeSettings();
      setSettings(updatedSettings);
    }

    // If going online, sync immediately
    if (!newOfflineMode && isOnline) {
      await syncData();
    }
  };

  const installApp = async () => {
    if (!installPrompt) return;

    try {
      const result = await installPrompt.prompt();
      console.log('Install prompt result:', result);
      
      if (result.outcome === 'accepted') {
        setInstallPrompt(null);
        setIsInstallable(false);
      }
    } catch (error) {
      console.error('Error installing app:', error);
    }
  };

  const syncData = async () => {
    if (syncStatus === 'syncing') return;

    setSyncStatus('syncing');
    
    try {
      const result = await offlineStorage.syncWithServer();
      
      if (result.success) {
        setSyncStatus('success');
        await refreshCacheStats();
      } else {
        setSyncStatus('error');
      }

      // Reset status after 3 seconds
      setTimeout(() => setSyncStatus('idle'), 3000);
      
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const clearCache = async () => {
    try {
      await offlineStorage.clearAllCache();
      await refreshCacheStats();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    if (!settings) return;

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // Update offline mode if changed
    if (newSettings.offlineMode !== undefined) {
      setIsOfflineMode(newSettings.offlineMode);
    }
  };

  const refreshCacheStats = async () => {
    try {
      const stats = await offlineStorage.getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Error refreshing cache stats:', error);
    }
  };

  const value: PWAContextType = {
    isOnline,
    isOfflineMode,
    installPrompt,
    isInstallable,
    isInstalled,
    settings,
    syncStatus,
    cacheStats,
    toggleOfflineMode,
    installApp,
    syncData,
    clearCache,
    updateSettings,
    refreshCacheStats
  };

  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  );
};

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};