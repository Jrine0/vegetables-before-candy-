'use client';

import React from 'react';
import { motion } from 'framer-motion';

const UniversityLeaderboard: React.FC = () => {
  const universities = [
    { name: 'Stanford University', achievements: 2847, nfts: 1923, students: 856, rank: 1 },
    { name: 'MIT', achievements: 2734, nfts: 1867, students: 743, rank: 2 },
    { name: 'UC Berkeley', achievements: 2456, nfts: 1678, students: 1234, rank: 3 },
    { name: 'Harvard University', achievements: 2234, nfts: 1543, students: 567, rank: 4 },
    { name: 'Carnegie Mellon', achievements: 1876, nfts: 1234, students: 432, rank: 5 }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          🏆 University Rankings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Top universities by academic achievements and NFT minting
        </p>
      </motion.div>
      
      <div className="space-y-4">
        {universities.map((uni, index) => (
          <motion.div
            key={uni.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                uni.rank === 1 ? 'bg-yellow-500' :
                uni.rank === 2 ? 'bg-gray-400' :
                uni.rank === 3 ? 'bg-orange-500' :
                'bg-blue-500'
              }`}>
                {uni.rank}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{uni.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {uni.students} students • {uni.achievements} achievements
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {uni.nfts}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                NFTs Minted
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default UniversityLeaderboard;