import React from 'react';
import { motion } from 'framer-motion';
import { ArrowTrendingUpIcon as TrendingUpIcon, CalendarIcon, FireIcon } from '@heroicons/react/24/outline';

interface AchievementTrendsProps {
  trends: {
    monthlyGrowth: number;
    consistencyScore: number;
    peakPerformancePeriods: string[];
  };
}

export const AchievementTrends: React.FC<AchievementTrendsProps> = ({ trends }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Achievement Trends
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Track your achievement momentum and identify patterns in your performance.
        </p>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUpIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="font-bold text-blue-900 dark:text-blue-100">Monthly Growth</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">Average achievements per month</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {trends.monthlyGrowth.toFixed(1)}
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CalendarIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="font-bold text-green-900 dark:text-green-100">Consistency</h3>
                <p className="text-sm text-green-700 dark:text-green-300">Regular achievement pattern</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">
              {trends.consistencyScore.toFixed(0)}%
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FireIcon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              <div>
                <h3 className="font-bold text-orange-900 dark:text-orange-100">Peak Periods</h3>
                <p className="text-sm text-orange-700 dark:text-orange-300">High-performance months</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
              {trends.peakPerformancePeriods.length}
            </div>
          </div>
        </div>

        {/* Peak Performance Periods */}
        {trends.peakPerformancePeriods.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
            <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-4">
              🔥 Peak Performance Periods
            </h3>
            <p className="text-purple-700 dark:text-purple-300 text-sm mb-4">
              These months show your highest achievement activity. What made them special?
            </p>
            <div className="flex flex-wrap gap-2">
              {trends.peakPerformancePeriods.map((period, index) => (
                <motion.span
                  key={period}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                >
                  {new Date(period + '-01').toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Insights and Recommendations */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6">
            <h4 className="font-bold text-indigo-900 dark:text-indigo-100 mb-3">
              💡 Insights
            </h4>
            <ul className="space-y-2 text-sm text-indigo-800 dark:text-indigo-200">
              {trends.monthlyGrowth > 2 && (
                <li>• You're highly productive with {trends.monthlyGrowth.toFixed(1)} achievements per month</li>
              )}
              {trends.consistencyScore > 70 && (
                <li>• Great consistency! You maintain steady progress over time</li>
              )}
              {trends.consistencyScore < 50 && (
                <li>• Consider setting regular achievement goals to improve consistency</li>
              )}
              {trends.peakPerformancePeriods.length > 2 && (
                <li>• You have multiple peak periods showing strong work patterns</li>
              )}
            </ul>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6">
            <h4 className="font-bold text-yellow-900 dark:text-yellow-100 mb-3">
              🎯 Recommendations
            </h4>
            <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
              {trends.monthlyGrowth < 1 && (
                <li>• Try setting monthly achievement goals to increase activity</li>
              )}
              {trends.consistencyScore < 60 && (
                <li>• Use calendar reminders to maintain regular achievement submissions</li>
              )}
              <li>• Analyze your peak periods to identify what drives your best performance</li>
              <li>• Share your achievements on social media to inspire others</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};