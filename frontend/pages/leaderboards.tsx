import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../src/components/Layout/Layout';
import UniversityLeaderboard from '../src/components/Leaderboards/UniversityLeaderboard';
import {
  TrophyIcon,
  FireIcon,
  AcademicCapIcon,
  ChartBarIcon,
  GlobeAltIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const LeaderboardsPage: React.FC = () => {
  return (
    <Layout title="Global Leaderboards - future me">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-900">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-10"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-10 left-10 text-6xl opacity-20 animate-bounce">
            🏆
          </div>
          <div className="absolute top-20 right-20 text-4xl opacity-20 animate-pulse">
            ⚡
          </div>
          <div className="absolute bottom-20 left-20 text-5xl opacity-20 animate-spin">
            🌟
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="flex justify-center items-center space-x-4 mb-6">
                <TrophyIcon className="w-16 h-16 text-yellow-500" />
                <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Leaderboards
                </h1>
                <FireIcon className="w-16 h-16 text-red-500 animate-pulse" />
              </div>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto"
              >
                Compete with the brightest minds across universities worldwide.
                <br />
                <span className="text-lg text-indigo-600 dark:text-indigo-400 font-medium">
                  Real-time rankings • Live updates • Global competition
                </span>
              </motion.p>
              
              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                  <GlobeAltIcon className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    500+
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Universities
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                  <AcademicCapIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    50K+
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Students
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                  <ChartBarIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    250K+
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Achievements
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                  <BoltIcon className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Live
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Updates
                  </div>
                </div>
              </motion.div>
              
              {/* Call to Action */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-12"
              >
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-4">
                    🚀 Ready to climb the ranks?
                  </h3>
                  <p className="text-indigo-100 mb-6">
                    Upload achievements, mint NFTs, and compete for the top spot!
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <button className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors">
                      Upload Achievement
                    </button>
                    <button className="bg-indigo-700 bg-opacity-50 text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-70 transition-colors">
                      View My Rank
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
        
        {/* Leaderboards */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <UniversityLeaderboard />
        </div>
        
        {/* Competition Features */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              🏅 Competition Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Advanced gamification features that make academic excellence exciting and rewarding
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '⚡',
                title: 'Real-time Rankings',
                description: 'Live updates as achievements are verified and NFTs are minted across universities worldwide.',
                features: ['Live WebSocket updates', 'Instant rank changes', 'Global synchronization']
              },
              {
                icon: '🏆',
                title: 'Achievement Competitions',
                description: 'Monthly challenges and tournaments that bring out the best in academic performance.',
                features: ['Monthly challenges', 'Seasonal tournaments', 'Special prizes']
              },
              {
                icon: '🔥',
                title: 'Streak System',
                description: 'Maintain consistency and build momentum with our advanced streak tracking system.',
                features: ['Achievement streaks', 'Bonus multipliers', 'Fire badges']
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-700"
              >
                <div className="text-6xl mb-6 text-center">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Bottom CTA */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-3xl p-12 text-center text-white"
          >
            <h2 className="text-4xl font-bold mb-6">
              🌟 Join the Global Competition
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Every achievement matters. Every NFT counts. Every student has the potential to be #1.
              Start your journey to academic excellence today.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <button className="bg-white text-purple-600 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                🚀 Start Competing
              </button>
              <button className="bg-purple-700 bg-opacity-50 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-opacity-70 transition-colors shadow-lg">
                📊 View Global Stats
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default LeaderboardsPage;