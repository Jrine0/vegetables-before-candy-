import React from 'react';
import { motion } from 'framer-motion';
import { ArrowTrendingUpIcon as TrendingUpIcon, UserGroupIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface MarketInsightsProps {
  marketPosition: {
    percentile: number;
    competitiveAdvantage: string[];
    improvementAreas: string[];
  };
}

export const MarketInsights: React.FC<MarketInsightsProps> = ({ marketPosition }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Market Position Analysis
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          See how you rank against peers in your field and identify opportunities for growth.
        </p>

        {/* Percentile Score */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-bold">{marketPosition.percentile}th</h3>
              <p className="text-indigo-100">Percentile Ranking</p>
            </div>
            <TrendingUpIcon className="w-12 h-12 text-indigo-200" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-indigo-400 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-1000"
                style={{ width: `${marketPosition.percentile}%` }}
              />
            </div>
            <p className="text-indigo-100 text-sm mt-2">
              You rank higher than {marketPosition.percentile}% of your peers
            </p>
          </div>
        </div>

        {/* Competitive Advantages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              <h3 className="font-bold text-green-900 dark:text-green-100">
                Competitive Advantages
              </h3>
            </div>
            {marketPosition.competitiveAdvantage.length > 0 ? (
              <ul className="space-y-2">
                {marketPosition.competitiveAdvantage.map((advantage, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-green-800 dark:text-green-200">{advantage}</span>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-green-700 dark:text-green-300 text-sm">
                Keep building achievements to develop competitive advantages
              </p>
            )}
          </div>

          {/* Improvement Areas */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <UserGroupIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              <h3 className="font-bold text-yellow-900 dark:text-yellow-100">
                Growth Opportunities
              </h3>
            </div>
            {marketPosition.improvementAreas.length > 0 ? (
              <ul className="space-y-2">
                {marketPosition.improvementAreas.map((area, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span className="text-yellow-800 dark:text-yellow-200">{area}</span>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                Great job! You're performing well across all areas
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};