'use client';

import React from 'react';
import { motion } from 'framer-motion';

const RealTimeAnalytics: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          📊 Real-Time Analytics Dashboard
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Live data visualization and insights powered by WebSocket technology
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="text-3xl font-bold mb-2">1,247</div>
            <div className="text-blue-100">Active Users</div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="text-3xl font-bold mb-2">89%</div>
            <div className="text-green-100">Success Rate</div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="text-3xl font-bold mb-2">2.3s</div>
            <div className="text-purple-100">Avg Response</div>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-600 dark:text-green-400 font-medium">
              Live data stream connected
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RealTimeAnalytics;