import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useAuth } from '../src/contexts/AuthContext';
import { useWallet } from '../src/contexts/WalletContext';
import Layout from '../src/components/Layout/Layout';
import { userAPI } from '../src/lib/api';
import LiveAchievementFeed from '../src/components/RealTime/LiveAchievementFeed';
import {
  ChartBarIcon,
  TrophyIcon,
  CubeIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon,
  BoltIcon,
  StarIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

// Dynamic imports for revolutionary components to prevent SSR issues
const HolographicAvatar = dynamic(
  () => import('../src/components/Dashboard/HolographicAvatar'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-3xl flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <span className="text-white">Loading Holographic Avatar...</span>
        </div>
      </div>
    )
  }
);

const GamificationHub = dynamic(
  () => import('../src/components/Dashboard/GamificationHub'),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-3xl p-6 h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <span className="text-white">Loading Gamification Hub...</span>
        </div>
      </div>
    )
  }
);

const AIInsightsEngine = dynamic(
  () => import('../src/components/Dashboard/AIInsightsEngine'),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-3xl p-6 h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <span className="text-white">Initializing AI Engine...</span>
        </div>
      </div>
    )
  }
);

const CollaborationHub = dynamic(
  () => import('../src/components/Dashboard/CollaborationHub'),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900 rounded-3xl p-6 h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <span className="text-white">Loading Collaboration Hub...</span>
        </div>
      </div>
    )
  }
);

interface DashboardStats {
  totalAchievements: number;
  verifiedAchievements: number;
  mintedNFTs: number;
  unlockedOpportunities: number;
  level?: number;
  xp?: number;
  totalXP?: number;
  streakDays?: number;
  rank?: string;
  battlePassLevel?: number;
  skillPoints?: number;
  rareAchievements?: number;
  legendaryAchievements?: number;
}

const DashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { account } = useWallet();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchDashboardStats();
    }
  }, [user, authLoading, router]);

  const fetchDashboardStats = async () => {
    try {
      const response = await userAPI.getDashboardStats();
      // Enhance stats with gamification data
      const enhancedStats = {
        ...response.data,
        level: response.data.level || Math.floor((response.data.totalAchievements || 0) / 3) + 1,
        xp: response.data.xp || (response.data.totalAchievements || 0) * 150 + (response.data.verifiedAchievements || 0) * 300,
        totalXP: response.data.totalXP || Math.floor(((response.data.totalAchievements || 0) / 3) + 1) * 1000,
        streakDays: response.data.streakDays || Math.floor(Math.random() * 30) + 1,
        rank: response.data.rank || (response.data.verifiedAchievements >= 10 ? 'Legendary' : response.data.verifiedAchievements >= 5 ? 'Epic' : 'Rising Star'),
        battlePassLevel: response.data.battlePassLevel || Math.floor((response.data.totalAchievements || 0) / 2) + 1,
        skillPoints: response.data.skillPoints || (response.data.totalAchievements || 0) * 10,
        rareAchievements: response.data.rareAchievements || Math.floor((response.data.verifiedAchievements || 0) * 0.3),
        legendaryAchievements: response.data.legendaryAchievements || Math.floor((response.data.verifiedAchievements || 0) * 0.1)
      };
      setStats(enhancedStats);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Provide fallback stats for demo
      setStats({
        totalAchievements: 12,
        verifiedAchievements: 8,
        mintedNFTs: 5,
        unlockedOpportunities: 23,
        level: 5,
        xp: 2400,
        totalXP: 5000,
        streakDays: 15,
        rank: 'Epic',
        battlePassLevel: 7,
        skillPoints: 120,
        rareAchievements: 3,
        legendaryAchievements: 1
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading || !mounted) {
    return (
      <Layout title="Dashboard - future me">
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"
            />
            <div className="text-white text-xl font-bold mb-2">🚀 Initializing Production Dashboard</div>
            <div className="text-purple-300">Loading revolutionary features...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) return null;


  return (
    <Layout title="🏆 Production Dashboard - future me">
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900">
        <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Revolutionary Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              🚀 Welcome to the Future, {user.firstName}!
            </h1>
            <p className="text-xl text-gray-300">
              Your next-generation academic command center • {user.university} • Level {stats?.level || 1} {stats?.rank || 'Rising Star'}
            </p>
            <div className="flex justify-center items-center space-x-8 mt-4">
              <div className="flex items-center text-purple-400">
                <BoltIcon className="w-6 h-6 mr-2" />
                <span className="text-lg font-bold">{stats?.xp || 0} XP</span>
              </div>
              <div className="flex items-center text-yellow-400">
                <StarIcon className="w-6 h-6 mr-2" />
                <span className="text-lg font-bold">{stats?.streakDays || 0} Day Streak</span>
              </div>
              <div className="flex items-center text-green-400">
                <SparklesIcon className="w-6 h-6 mr-2" />
                <span className="text-lg font-bold">{stats?.verifiedAchievements || 0} Verified</span>
              </div>
            </div>
          </motion.div>

          {/* Revolutionary Grid Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            {/* Holographic Avatar - Top Priority */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <HolographicAvatar 
                user={{
                  firstName: user.firstName,
                  lastName: user.lastName || '',
                  level: stats?.level || 1,
                  xp: stats?.xp || 0,
                  totalXP: stats?.totalXP || 1000,
                  rank: stats?.rank || 'Rising Star',
                  university: user.university
                }}
                achievements={{
                  total: stats?.totalAchievements || 0,
                  verified: stats?.verifiedAchievements || 0,
                  rare: stats?.rareAchievements || 0,
                  legendary: stats?.legendaryAchievements || 0
                }}
              />
            </motion.div>
            
            {/* Gamification Hub */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <GamificationHub 
                user={{
                  level: stats?.level || 1,
                  xp: stats?.xp || 0,
                  totalXP: stats?.totalXP || 1000,
                  streakDays: stats?.streakDays || 0,
                  rank: stats?.rank || 'Rising Star',
                  battlePassLevel: stats?.battlePassLevel || 1,
                  skillPoints: stats?.skillPoints || 0
                }}
              />
            </motion.div>
          </div>
          
          {/* Second Row - AI Insights & Collaboration */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            {/* AI Insights Engine */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <AIInsightsEngine 
                user={{
                  firstName: user.firstName,
                  level: stats?.level || 1,
                  achievements: [],
                  skills: ['Research', 'Leadership', 'Innovation'],
                  university: user.university,
                  major: 'Computer Science'
                }}
              />
            </motion.div>
            
            {/* Collaboration Hub */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <CollaborationHub 
                user={{
                  id: user.id || '',
                  firstName: user.firstName,
                  lastName: user.lastName || '',
                  university: user.university
                }}
              />
            </motion.div>
          </div>
          
          {/* Holographic Alerts */}
          {(!user.emailVerified || !account) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mb-8 space-y-4"
            >
              {!user.emailVerified && (
                <div className="bg-gradient-to-r from-yellow-900 to-orange-900 border border-yellow-400/30 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center mr-4">
                      <ExclamationTriangleIcon className="h-6 w-6 text-yellow-900" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-yellow-400 mb-1">
                        🔐 Holographic Authentication Required
                      </h3>
                      <p className="text-yellow-200">
                        Verify your university email to unlock the full power of your academic NFT journey.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!account && user.emailVerified && (
                <div className="bg-gradient-to-r from-blue-900 to-purple-900 border border-blue-400/30 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-400 rounded-xl flex items-center justify-center mr-4">
                      <CubeIcon className="h-6 w-6 text-blue-900" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-blue-400 mb-1">
                        🌐 Web3 Portal Awaits
                      </h3>
                      <p className="text-blue-200">
                        Connect your wallet to access the blockchain multiverse and mint legendary NFTs.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Quantum Stats Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          >
            {[
              {
                title: 'Total Achievements',
                value: stats?.totalAchievements || 0,
                icon: ChartBarIcon,
                gradient: 'from-blue-400 to-purple-600',
                glow: 'shadow-blue-500/50',
                href: '/achievements',
              },
              {
                title: 'Verified Power',
                value: stats?.verifiedAchievements || 0,
                icon: CheckCircleIcon,
                gradient: 'from-green-400 to-blue-600',
                glow: 'shadow-green-500/50',
                href: '/achievements',
              },
              {
                title: 'NFT Collection',
                value: stats?.mintedNFTs || 0,
                icon: CubeIcon,
                gradient: 'from-purple-400 to-pink-600',
                glow: 'shadow-purple-500/50',
                href: '/nfts',
              },
              {
                title: 'Opportunities',
                value: stats?.unlockedOpportunities || 0,
                icon: KeyIcon,
                gradient: 'from-yellow-400 to-red-600',
                glow: 'shadow-yellow-500/50',
                href: '/opportunities',
              },
            ].map((stat, index) => (
              <motion.div 
                key={stat.title} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + (index * 0.1) }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className={`bg-gradient-to-r ${stat.gradient} rounded-2xl p-6 border border-white/20 backdrop-blur-sm hover:shadow-2xl ${stat.glow} transition-all cursor-pointer group`}
                onClick={() => router.push(stat.href)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <RocketLaunchIcon className="h-5 w-5 text-white opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-white text-sm opacity-90">{stat.title}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Quantum Action Portal */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              ⚡ Quantum Action Portal
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: '🏆 Upload Achievement',
                  description: 'Add legendary accomplishments',
                  gradient: 'from-yellow-400 to-orange-600',
                  action: () => router.push('/achievements/new'),
                  disabled: !user.emailVerified,
                  icon: TrophyIcon
                },
                {
                  title: '🎨 3D NFT Gallery',
                  description: 'Experience holographic collection',
                  gradient: 'from-purple-400 to-pink-600',
                  action: () => router.push('/nfts/gallery-3d'),
                  disabled: false,
                  icon: CubeIcon
                },
                {
                  title: '⚔️ Battle Tournaments',
                  description: 'Compete for glory',
                  gradient: 'from-red-400 to-purple-600',
                  action: () => router.push('/challenges'),
                  disabled: false,
                  icon: TrophyIcon
                },
                {
                  title: '🧠 AI Career Oracle',
                  description: 'Unlock your destiny',
                  gradient: 'from-blue-400 to-cyan-600',
                  action: () => router.push('/careers'),
                  disabled: false,
                  icon: ChartBarIcon
                },
                {
                  title: '🌐 Social Nexus',
                  description: 'Connect professional realms',
                  gradient: 'from-green-400 to-blue-600',
                  action: () => router.push('/social'),
                  disabled: false,
                  icon: KeyIcon
                },
                {
                  title: '🏛️ University Cosmos',
                  description: 'Explore academic multiverse',
                  gradient: 'from-indigo-400 to-purple-600',
                  action: () => router.push('/universities'),
                  disabled: false,
                  icon: ChartBarIcon
                }
              ].map((action, index) => (
                <motion.button
                  key={action.title}
                  initial={{ opacity: 0, rotateX: -15 }}
                  animate={{ opacity: 1, rotateX: 0 }}
                  transition={{ delay: 1.4 + (index * 0.1) }}
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={action.action}
                  disabled={action.disabled}
                  className={`bg-gradient-to-r ${action.gradient} rounded-2xl p-6 text-left transition-all hover:shadow-2xl hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed group border border-white/10`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <action.icon className="h-8 w-8 text-white" />
                    <RocketLaunchIcon className="h-5 w-5 text-white opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">{action.title}</h3>
                  <p className="text-white text-sm opacity-90">{action.description}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Mission Control Center */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              🎯 Mission Control Center
            </h2>
            <div className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 rounded-3xl p-6 border border-cyan-400/30">
              <div className="grid gap-4">
                {[
                  {
                    step: 1,
                    title: 'Holographic Authentication',
                    description: user.emailVerified ? 'Identity verified in the metaverse ✅' : 'Verify your university email to unlock full power',
                    completed: user.emailVerified,
                    color: user.emailVerified ? 'from-green-400 to-green-600' : 'from-gray-400 to-gray-600'
                  },
                  {
                    step: 2,
                    title: 'Web3 Portal Connection',
                    description: account ? 'Blockchain bridge established ✅' : 'Connect your Web3 wallet to access the multiverse',
                    completed: !!account,
                    color: account ? 'from-green-400 to-green-600' : 'from-blue-400 to-blue-600'
                  },
                  {
                    step: 3,
                    title: 'Achievement Genesis',
                    description: stats?.totalAchievements ? `${stats.totalAchievements} achievements uploaded ✅` : 'Upload your legendary accomplishments',
                    completed: !!(stats?.totalAchievements),
                    color: stats?.totalAchievements ? 'from-green-400 to-green-600' : 'from-purple-400 to-purple-600'
                  },
                  {
                    step: 4,
                    title: 'NFT Manifestation',
                    description: stats?.mintedNFTs ? `${stats.mintedNFTs} NFTs materialized ✅` : 'Manifest your achievements as legendary NFTs',
                    completed: !!(stats?.mintedNFTs),
                    color: stats?.mintedNFTs ? 'from-green-400 to-green-600' : 'from-yellow-400 to-orange-600'
                  }
                ].map((mission, index) => (
                  <motion.div 
                    key={mission.step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.6 + (index * 0.1) }}
                    className="flex items-center space-x-4 p-4 bg-black bg-opacity-30 rounded-2xl border border-white/10"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${mission.color} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                      {mission.completed ? '✅' : mission.step}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg mb-1">{mission.title}</h3>
                      <p className={`text-sm ${mission.completed ? 'text-green-300' : 'text-gray-300'}`}>
                        {mission.description}
                      </p>
                    </div>
                    {mission.completed && (
                      <div className="text-green-400">
                        <SparklesIcon className="w-6 h-6" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
          {/* Real-time Achievement Feed with Futuristic Design */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <LiveAchievementFeed />
          </motion.div>
      </div>
    </Layout>
  );
};

export default DashboardPage;