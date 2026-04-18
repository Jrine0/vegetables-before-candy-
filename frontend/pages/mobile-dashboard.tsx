import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  TrophyIcon, 
  BriefcaseIcon, 
  ChartBarIcon,
  SparklesIcon,
  PlusIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { MobileNavigation } from '../src/components/Mobile/MobileNavigation';
import { SwipeableNFTCard } from '../src/components/Mobile/SwipeableCard';
import { usePWA } from '../src/contexts/PWAContext';
import { offlineStorage } from '../src/lib/offlineStorage';

interface NFTData {
  id: string;
  title: string;
  level: number;
  rarity: string;
  evolutionPoints: number;
  imageUrl?: string;
}

interface OpportunityData {
  id: string;
  title: string;
  company: string;
  type: string;
  matchScore: number;
}

const MobileDashboard: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'nfts' | 'opportunities' | 'achievements'>('overview');
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { isOnline, isOfflineMode, cacheStats } = usePWA();
  const { ref: headerRef, inView: headerInView } = useInView({ threshold: 0.5 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    
    try {
      if (!isOnline || isOfflineMode) {
        // Load from cache
        const cachedNFTs = await offlineStorage.getCachedNFTs('user-id'); // Would use real user ID
        const cachedOpps = await offlineStorage.getCachedOpportunities();
        
        setNfts(cachedNFTs.map(nft => ({
          id: nft.id,
          title: nft.achievementTitle,
          level: nft.level,
          rarity: nft.rarity,
          evolutionPoints: nft.evolutionPoints,
          imageUrl: nft.imageUrl
        })));
        
        setOpportunities(cachedOpps.slice(0, 5).map(opp => ({
          id: opp.id,
          title: opp.title,
          company: opp.company,
          type: opp.type,
          matchScore: Math.floor(Math.random() * 30) + 70 // Simulated match score
        })));
      } else {
        // Simulated data for demo
        setNfts([
          {
            id: '1',
            title: 'GPA Guardian',
            level: 3,
            rarity: 'rare',
            evolutionPoints: 750
          },
          {
            id: '2',
            title: 'Research Rockstar',
            level: 2,
            rarity: 'epic',
            evolutionPoints: 1200
          },
          {
            id: '3',
            title: 'Leadership Legend',
            level: 4,
            rarity: 'legendary',
            evolutionPoints: 2500
          }
        ]);
        
        setOpportunities([
          { id: '1', title: 'Software Engineer Intern', company: 'Google', type: 'Internship', matchScore: 95 },
          { id: '2', title: 'Data Science Role', company: 'Meta', type: 'Full-time', matchScore: 88 },
          { id: '3', title: 'Product Manager', company: 'Tesla', type: 'Full-time', matchScore: 82 }
        ]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    totalNFTs: nfts.length,
    totalPoints: nfts.reduce((sum, nft) => sum + nft.evolutionPoints, 0),
    averageLevel: nfts.length > 0 ? Math.round(nfts.reduce((sum, nft) => sum + nft.level, 0) / nfts.length) : 0,
    matchedJobs: opportunities.length
  };

  const handleNFTView = (nft: NFTData) => {
    console.log('View NFT:', nft);
    // Navigate to NFT detail
  };

  const handleNFTShare = (nft: NFTData) => {
    if (navigator.share) {
      navigator.share({
        title: `Check out my ${nft.title} NFT!`,
        text: `I just earned a Level ${nft.level} ${nft.rarity} NFT for my academic achievement!`,
        url: window.location.origin + `/nft/${nft.id}`
      });
    }
  };

  const handleNFTEvolution = (nft: NFTData) => {
    console.log('Evolve NFT:', nft);
    // Handle NFT evolution
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <MobileNavigation isOpen={isMenuOpen} onToggle={() => setIsMenuOpen(!isMenuOpen)} />
      
      {/* Header with parallax effect */}
      <motion.div
        ref={headerRef}
        className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-6 pt-12 pb-8"
        style={{
          transform: headerInView ? 'translateY(0)' : 'translateY(-20px)',
          opacity: headerInView ? 1 : 0.8
        }}
      >
        <div className="relative z-10">
          <motion.h1
            className="text-2xl font-bold text-white mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Welcome back! 👋
          </motion.h1>
          
          <motion.p
            className="text-indigo-100 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {isOfflineMode ? 'Working offline' : 'You\'re making great progress'}
          </motion.p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              className="bg-white/20 backdrop-blur-sm rounded-lg p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center space-x-2">
                <TrophyIcon className="w-5 h-5 text-yellow-300" />
                <div>
                  <p className="text-white font-bold text-lg">{stats.totalNFTs}</p>
                  <p className="text-indigo-100 text-sm">NFTs Earned</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white/20 backdrop-blur-sm rounded-lg p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center space-x-2">
                <SparklesIcon className="w-5 h-5 text-purple-300" />
                <div>
                  <p className="text-white font-bold text-lg">{stats.totalPoints.toLocaleString()}</p>
                  <p className="text-indigo-100 text-sm">XP Points</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-20">
        <div className="flex overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'nfts', label: 'My NFTs', icon: TrophyIcon },
            { id: 'opportunities', label: 'Jobs', icon: BriefcaseIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap
                  ${isActive 
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' 
                    : 'text-gray-500 dark:text-gray-400'
                  }
                `}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.id === 'opportunities' && opportunities.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {opportunities.length}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Recent Activity</h3>
                <div className="space-y-3">
                  {[
                    { action: 'Earned', item: 'GPA Guardian NFT', time: '2 hours ago', color: 'text-green-600' },
                    { action: 'Applied to', item: 'Google Internship', time: '1 day ago', color: 'text-blue-600' },
                    { action: 'Evolved', item: 'Research Rockstar to Level 2', time: '3 days ago', color: 'text-purple-600' }
                  ].map((activity, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start space-x-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white text-sm">
                          <span className={activity.color}>{activity.action}</span> {activity.item}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">{activity.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl shadow-lg flex flex-col items-center space-y-2"
                  whileTap={{ scale: 0.95 }}
                >
                  <PlusIcon className="w-8 h-8" />
                  <span className="font-medium">Submit Achievement</span>
                </motion.button>
                
                <motion.button
                  className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 rounded-xl shadow-lg flex flex-col items-center space-y-2"
                  whileTap={{ scale: 0.95 }}
                >
                  <ShareIcon className="w-8 h-8" />
                  <span className="font-medium">Share Progress</span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {activeTab === 'nfts' && (
            <motion.div
              key="nfts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">My NFT Collection</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{nfts.length} NFTs</p>
              </div>

              {nfts.map((nft, index) => (
                <motion.div
                  key={nft.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <SwipeableNFTCard
                    nft={nft}
                    onView={() => handleNFTView(nft)}
                    onShare={() => handleNFTShare(nft)}
                    onEvolution={nft.evolutionPoints >= 1000 ? () => handleNFTEvolution(nft) : undefined}
                    className="mb-4"
                  />
                </motion.div>
              ))}

              {nfts.length === 0 && (
                <div className="text-center py-12">
                  <TrophyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No NFTs yet</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">Start by submitting your achievements!</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'opportunities' && (
            <motion.div
              key="opportunities"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Matched Opportunities</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{opportunities.length} matches</p>
              </div>

              {opportunities.map((opp, index) => (
                <motion.div
                  key={opp.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{opp.title}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{opp.company}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${opp.matchScore >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          opp.matchScore >= 80 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }
                      `}>
                        {opp.matchScore}% match
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">{opp.type}</span>
                    <button className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                      Apply →
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Offline indicator */}
      {(!isOnline || isOfflineMode) && cacheStats && (
        <motion.div
          className="fixed bottom-20 left-4 right-4 bg-amber-500 text-white p-3 rounded-lg shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm font-medium">
            {!isOnline ? '📱 Offline Mode' : '🔄 Sync Pending'}
          </p>
          <p className="text-xs opacity-90">
            {cacheStats.nfts} NFTs • {cacheStats.opportunities} jobs cached
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default MobileDashboard;