import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../src/contexts/AuthContext';
import { motion } from 'framer-motion';
import Layout from '../../src/components/Layout/Layout';
import RealTimeAnalytics from '../../src/components/Analytics/RealTimeAnalytics';
import {
  ChartBarIcon,
  EyeIcon,
  BoltIcon,
  GlobeAltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const RealTimeAnalyticsPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <Layout title="Real-Time Analytics - future me">
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-xl">Loading real-time analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout title="Real-Time Analytics - future me">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-10"></div>
          
          {/* Animated Background Elements */}
          <div className="absolute top-10 left-10 text-6xl opacity-20 animate-bounce">
            📊
          </div>
          <div className="absolute top-20 right-20 text-4xl opacity-20 animate-pulse">
            ⚡
          </div>
          <div className="absolute bottom-20 left-20 text-5xl opacity-20 animate-ping">
            💹
          </div>
          <div className="absolute bottom-10 right-10 text-3xl opacity-20 animate-spin">
            🔍
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="flex justify-center items-center space-x-4 mb-6">
                <ChartBarIcon className="w-16 h-16 text-blue-500 animate-pulse" />
                <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Analytics
                </h1>
                <BoltIcon className="w-16 h-16 text-yellow-500 animate-bounce" />
              </div>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto"
              >
                Live insights and data visualization updating in real-time.
                <br />
                <span className="text-lg text-blue-600 dark:text-blue-400 font-medium">
                  WebSocket-powered • Interactive charts • Global metrics
                </span>
              </motion.p>
              
              {/* Feature Highlights */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                  <BoltIcon className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                  <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Real-Time
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                    Live Updates
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                  <EyeIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Interactive
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                    Dynamic Charts
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                  <GlobeAltIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Global
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                    Worldwide Data
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                  <SparklesIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    AI-Powered
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                    Smart Insights
                  </div>
                </div>
              </motion.div>
              
              {/* Live Status Indicator */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="inline-flex items-center space-x-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-6 py-3 rounded-full font-medium shadow-lg"
              >
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Data Stream Active</span>
                <div className="text-green-600 animate-bounce">📡</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
        
        {/* Main Analytics Dashboard */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <RealTimeAnalytics />
        </div>
        
        {/* Technical Features Showcase */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              🔧 Technical Innovation
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Cutting-edge technologies powering the next generation of academic analytics
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🔌',
                title: 'WebSocket Integration',
                description: 'Real-time bidirectional communication for instant data updates across all connected clients.',
                tech: ['Socket.IO', 'Real-time Events', 'Live Synchronization']
              },
              {
                icon: '📊',
                title: 'Advanced Visualizations',
                description: 'Interactive charts and graphs powered by professional charting libraries with smooth animations.',
                tech: ['Recharts', 'D3.js Integration', 'Custom Animations']
              },
              {
                icon: '🧠',
                title: 'AI-Powered Insights',
                description: 'Machine learning algorithms analyze patterns and provide predictive analytics for career guidance.',
                tech: ['TensorFlow.js', 'Predictive Models', 'Pattern Recognition']
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-700"
              >
                <div className="text-6xl mb-6 text-center">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {feature.description}
                </p>
                <div className="space-y-2">
                  {feature.tech.map((item, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Performance Stats */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center text-white"
          >
            <h2 className="text-4xl font-bold mb-6">
              ⚡ Lightning-Fast Performance
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Our real-time analytics system processes millions of data points every second,
              delivering insights faster than you can blink.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-bold mb-2">&lt; 100ms</div>
                <div className="text-blue-100 opacity-80">Update Latency</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">99.9%</div>
                <div className="text-blue-100 opacity-80">Uptime</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">10M+</div>
                <div className="text-blue-100 opacity-80">Data Points</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">Real-time</div>
                <div className="text-blue-100 opacity-80">Updates</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default RealTimeAnalyticsPage;