import React from 'react';
import { motion } from 'framer-motion';
import { ChartBarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ProfileStrengthMeterProps {
  strength: number;
  improvements: string[];
}

export const ProfileStrengthMeter: React.FC<ProfileStrengthMeterProps> = ({ 
  strength, 
  improvements 
}) => {
  const getStrengthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStrengthBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStrengthLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Strong';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center space-x-3 mb-6">
        <ChartBarIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Profile Strength
        </h3>
      </div>

      {/* Circular Progress */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Progress circle */}
            <motion.circle
              cx="60"
              cy="60"
              r="54"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeLinecap="round"
              className={getStrengthColor(strength)}
              initial={{ strokeDasharray: "0 339.292" }}
              animate={{ 
                strokeDasharray: `${(strength / 100) * 339.292} 339.292` 
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                className={`text-3xl font-bold ${getStrengthColor(strength)}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {strength}%
              </motion.div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {getStrengthLabel(strength)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strength Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Profile Completeness</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {Math.min(Math.round(strength * 0.4), 40)}/40
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${getStrengthBgColor(strength)} transition-all duration-1000`}
            style={{ width: `${Math.min(strength * 0.4, 40)}%` }}
          />
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Achievement Portfolio</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {Math.min(Math.round(strength * 0.35), 35)}/35
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${getStrengthBgColor(strength)} transition-all duration-1000`}
            style={{ width: `${Math.min(strength * 0.35 * 2.86, 100)}%` }}
          />
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Social Engagement</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {Math.min(Math.round(strength * 0.25), 25)}/25
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${getStrengthBgColor(strength)} transition-all duration-1000`}
            style={{ width: `${Math.min(strength * 0.25 * 4, 100)}%` }}
          />
        </div>
      </div>

      {/* Improvement Suggestions */}
      {improvements.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
              Quick Wins to Boost Your Score
            </h4>
          </div>
          <ul className="space-y-1">
            {improvements.slice(0, 3).map((improvement, index) => (
              <li key={index} className="text-sm text-yellow-800 dark:text-yellow-200">
                • {improvement}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};