import Dexie, { Table } from 'dexie';

// Database schemas
export interface CachedUser {
  id: string;
  email: string;
  name: string;
  university: string;
  profilePicture?: string;
  createdAt: Date;
  lastSynced: Date;
}

export interface CachedNFT {
  id: string;
  userId: string;
  achievementType: string;
  achievementTitle: string;
  level: number;
  rarity: string;
  evolutionPoints: number;
  imageUrl?: string;
  metadata: any;
  minted: boolean;
  blockchain?: string;
  tokenId?: string;
  createdAt: Date;
  lastSynced: Date;
}

export interface CachedOpportunity {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  salaryRange: string;
  type: string;
  location: string;
  remote: boolean;
  applicationDeadline: Date;
  createdAt: Date;
  lastSynced: Date;
}

export interface CachedAchievement {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  documentUrl?: string;
  verificationStatus: string;
  aiScore?: number;
  createdAt: Date;
  lastSynced: Date;
}

export interface SyncQueue {
  id?: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  table: string;
  data: any;
  timestamp: Date;
  retryCount: number;
}

export interface AppSettings {
  id: number;
  lastFullSync?: Date;
  offlineMode: boolean;
  notifications: boolean;
  darkMode: boolean;
  language: string;
}

// Database class
export class FutureMeDB extends Dexie {
  users!: Table<CachedUser>;
  nfts!: Table<CachedNFT>;
  opportunities!: Table<CachedOpportunity>;
  achievements!: Table<CachedAchievement>;
  syncQueue!: Table<SyncQueue>;
  settings!: Table<AppSettings>;

  constructor() {
    super('future_me_db');
    this.version(1).stores({
      users: 'id, email, university, lastSynced',
      nfts: 'id, userId, achievementType, level, rarity, minted, blockchain, lastSynced',
      opportunities: 'id, company, type, applicationDeadline, lastSynced',
      achievements: 'id, userId, type, verificationStatus, lastSynced',
      syncQueue: '++id, action, table, timestamp, retryCount',
      settings: 'id'
    });
  }
}

export const db = new FutureMeDB();

// Offline Storage Service
export class OfflineStorageService {
  private static instance: OfflineStorageService;
  private syncInProgress = false;

  public static getInstance(): OfflineStorageService {
    if (!OfflineStorageService.instance) {
      OfflineStorageService.instance = new OfflineStorageService();
    }
    return OfflineStorageService.instance;
  }

  // Initialize app settings
  async initializeSettings(): Promise<AppSettings> {
    let settings = await db.settings.get(1);
    if (!settings) {
      settings = {
        id: 1,
        offlineMode: false,
        notifications: true,
        darkMode: false,
        language: 'en'
      };
      await db.settings.add(settings);
    }
    return settings;
  }

  // Cache user data
  async cacheUser(user: Omit<CachedUser, 'lastSynced'>): Promise<void> {
    const cachedUser: CachedUser = {
      ...user,
      lastSynced: new Date()
    };
    await db.users.put(cachedUser);
  }

  // Cache NFTs
  async cacheNFTs(nfts: Omit<CachedNFT, 'lastSynced'>[]): Promise<void> {
    const cachedNFTs = nfts.map(nft => ({
      ...nft,
      lastSynced: new Date()
    }));
    await db.nfts.bulkPut(cachedNFTs);
  }

  // Cache opportunities
  async cacheOpportunities(opportunities: Omit<CachedOpportunity, 'lastSynced'>[]): Promise<void> {
    const cachedOpportunities = opportunities.map(opp => ({
      ...opp,
      lastSynced: new Date()
    }));
    await db.opportunities.bulkPut(cachedOpportunities);
  }

  // Cache achievements
  async cacheAchievements(achievements: Omit<CachedAchievement, 'lastSynced'>[]): Promise<void> {
    const cachedAchievements = achievements.map(ach => ({
      ...ach,
      lastSynced: new Date()
    }));
    await db.achievements.bulkPut(cachedAchievements);
  }

  // Get cached data
  async getCachedUser(userId: string): Promise<CachedUser | undefined> {
    return await db.users.get(userId);
  }

  async getCachedNFTs(userId: string): Promise<CachedNFT[]> {
    return await db.nfts.where('userId').equals(userId).toArray();
  }

  async getCachedOpportunities(): Promise<CachedOpportunity[]> {
    return await db.opportunities.orderBy('createdAt').reverse().toArray();
  }

  async getCachedAchievements(userId: string): Promise<CachedAchievement[]> {
    return await db.achievements.where('userId').equals(userId).toArray();
  }

  // Add to sync queue
  async addToSyncQueue(action: SyncQueue['action'], table: string, data: any): Promise<void> {
    await db.syncQueue.add({
      action,
      table,
      data,
      timestamp: new Date(),
      retryCount: 0
    });
  }

  // Sync with server
  async syncWithServer(): Promise<{ success: boolean; synced: number; errors: number }> {
    if (this.syncInProgress) {
      return { success: false, synced: 0, errors: 0 };
    }

    this.syncInProgress = true;
    let synced = 0;
    let errors = 0;

    try {
      const queueItems = await db.syncQueue.orderBy('timestamp').toArray();

      for (const item of queueItems) {
        try {
          await this.processSyncItem(item);
          await db.syncQueue.delete(item.id!);
          synced++;
        } catch (error) {
          console.error('Sync error for item:', item, error);

          // Increment retry count
          await db.syncQueue.update(item.id!, { retryCount: item.retryCount + 1 });

          // Remove item if too many retries
          if (item.retryCount >= 3) {
            await db.syncQueue.delete(item.id!);
          }
          errors++;
        }
      }

      // Update last sync time
      await db.settings.update(1, { lastFullSync: new Date() });

    } finally {
      this.syncInProgress = false;
    }

    return { success: errors === 0, synced, errors };
  }

  private async processSyncItem(item: SyncQueue): Promise<void> {
    // This would integrate with your API service
    // For now, we'll simulate the sync operation
    console.log(`Processing sync item: ${item.action} on ${item.table}`, item.data);

    // In a real implementation, you would:
    // - Send API requests based on action and table
    // - Handle authentication
    // - Update local cache with server response
    // - Handle conflicts

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Check if app is in offline mode
  async isOfflineMode(): Promise<boolean> {
    const settings = await db.settings.get(1);
    return settings?.offlineMode || !navigator.onLine;
  }

  // Clear all cached data
  async clearAllCache(): Promise<void> {
    await Promise.all([
      db.users.clear(),
      db.nfts.clear(),
      db.opportunities.clear(),
      db.achievements.clear(),
      db.syncQueue.clear()
    ]);
  }

  // Get cache statistics
  async getCacheStats(): Promise<{
    users: number;
    nfts: number;
    opportunities: number;
    achievements: number;
    pendingSync: number;
    lastSync?: Date;
  }> {
    const [users, nfts, opportunities, achievements, pendingSync, settings] = await Promise.all([
      db.users.count(),
      db.nfts.count(),
      db.opportunities.count(),
      db.achievements.count(),
      db.syncQueue.count(),
      db.settings.get(1)
    ]);

    return {
      users,
      nfts,
      opportunities,
      achievements,
      pendingSync,
      lastSync: settings?.lastFullSync
    };
  }

  // Search cached data
  async searchCachedOpportunities(query: string): Promise<CachedOpportunity[]> {
    const lowerQuery = query.toLowerCase();
    return await db.opportunities
      .filter(opp =>
        opp.title.toLowerCase().includes(lowerQuery) ||
        opp.company.toLowerCase().includes(lowerQuery) ||
        opp.description.toLowerCase().includes(lowerQuery)
      )
      .toArray();
  }

  async searchCachedNFTs(userId: string, query: string): Promise<CachedNFT[]> {
    const lowerQuery = query.toLowerCase();
    return await db.nfts
      .where('userId').equals(userId)
      .filter(nft =>
        nft.achievementTitle.toLowerCase().includes(lowerQuery) ||
        nft.achievementType.toLowerCase().includes(lowerQuery) ||
        nft.rarity.toLowerCase().includes(lowerQuery)
      )
      .toArray();
  }
}

export const offlineStorage = OfflineStorageService.getInstance();