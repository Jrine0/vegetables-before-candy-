import React from 'react';
import { motion } from 'framer-motion';
import { UserGroupIcon, TrophyIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface PeerComparisonProps {
  comparison?: {
    nfts: {
      user: number;
      peerAverage: number;
      performance: 'above' | 'average' | 'below';
    };
    achievements: {
      user: number;
      peerAverage: number;
      performance: 'above' | 'average' | 'below';
    };
    profileStrength: {
      user: number;
      peerAverage: number;
      performance: 'above' | 'average' | 'below';
    };
  };
}

export const PeerComparison: React.FC<PeerComparisonProps> = ({ comparison }) => {
  if (!comparison) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center">
        <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Peer Comparison Coming Soon
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          We're building peer comparison features to help you see how you stack up against your classmates.
        </p>
      </div>
    );
  }

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'above': return 'text-green-600 dark:text-green-400';
      case 'below': return 'text-red-600 dark:text-red-400';
      default: return 'text-yellow-600 dark:text-yellow-400';
    }
  };

  const getPerformanceBg = (performance: string) => {
    switch (performance) {
      case 'above': return 'bg-green-50 dark:bg-green-900/20';
      case 'below': return 'bg-red-50 dark:bg-red-900/20';
      default: return 'bg-yellow-50 dark:bg-yellow-900/20';
    }
  };

  const getPerformanceLabel = (performance: string) => {
    switch (performance) {
      case 'above': return 'Above Average';
      case 'below': return 'Below Average';
      default: return 'Average';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Peer Comparison
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          See how you compare to students at your university and graduation year.
        </p>

        {/* Comparison Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* NFTs Comparison */}
          <motion.div
            className={`rounded-xl p-6 ${getPerformanceBg(comparison.nfts.performance)}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <TrophyIcon className={`w-6 h-6 ${getPerformanceColor(comparison.nfts.performance)}`} />
              <h3 className={`font-bold ${getPerformanceColor(comparison.nfts.performance)}`}>
                NFT Collection
              </h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">You</span>
                <span className="font-bold text-gray-900 dark:text-white">{comparison.nfts.user}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Peer Average</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{comparison.nfts.peerAverage}</span>
              </div>
              <div className={`text-sm font-medium ${getPerformanceColor(comparison.nfts.performance)}`}>
                {getPerformanceLabel(comparison.nfts.performance)}
              </div>
            </div>
          </motion.div>

          {/* Achievements Comparison */}
          <motion.div
            className={`rounded-xl p-6 ${getPerformanceBg(comparison.achievements.performance)}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <ChartBarIcon className={`w-6 h-6 ${getPerformanceColor(comparison.achievements.performance)}`} />
              <h3 className={`font-bold ${getPerformanceColor(comparison.achievements.performance)}`}>
                Achievements
              </h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">You</span>
                <span className="font-bold text-gray-900 dark:text-white">{comparison.achievements.user}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Peer Average</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{comparison.achievements.peerAverage}</span>
              </div>
              <div className={`text-sm font-medium ${getPerformanceColor(comparison.achievements.performance)}`}>
                {getPerformanceLabel(comparison.achievements.performance)}
              </div>
            </div>
          </motion.div>

          {/* Profile Strength Comparison */}
          <motion.div
            className={`rounded-xl p-6 ${getPerformanceBg(comparison.profileStrength.performance)}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <UserGroupIcon className={`w-6 h-6 ${getPerformanceColor(comparison.profileStrength.performance)}`} />
              <h3 className={`font-bold ${getPerformanceColor(comparison.profileStrength.performance)}`}>
                Profile Strength
              </h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">You</span>
                <span className="font-bold text-gray-900 dark:text-white">{comparison.profileStrength.user}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Peer Average</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{comparison.profileStrength.peerAverage}%</span>
              </div>
              <div className={`text-sm font-medium ${getPerformanceColor(comparison.profileStrength.performance)}`}>
                {getPerformanceLabel(comparison.profileStrength.performance)}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Insights */}
        <div className="mt-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6">
          <h4 className="font-bold text-indigo-900 dark:text-indigo-100 mb-3">
            💡 Comparison Insights
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-indigo-800 dark:text-indigo-200">
            <div>
              <h5 className="font-medium mb-2">Strengths:</h5>
              <ul className="space-y-1">
                {comparison.nfts.performance === 'above' && <li>• Strong NFT collection</li>}
                {comparison.achievements.performance === 'above' && <li>• High achievement activity</li>}
                {comparison.profileStrength.performance === 'above' && <li>• Well-developed profile</li>}
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">Growth Areas:</h5>
              <ul className="space-y-1">
                {comparison.nfts.performance === 'below' && <li>• Focus on earning more NFTs</li>}
                {comparison.achievements.performance === 'below' && <li>• Submit more achievements</li>}
                {comparison.profileStrength.performance === 'below' && <li>• Complete your profile</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};