import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  ArrowTrendingDownIcon as TrendingDownIcon,
  UserGroupIcon,
  LightBulbIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { CareerPredictions } from './CareerPredictions';
import { SkillGapAnalysis } from './SkillGapAnalysis';
import { MarketInsights } from './MarketInsights';
import { ProfileStrengthMeter } from './ProfileStrengthMeter';
import { AchievementTrends } from './AchievementTrends';
import { PeerComparison } from './PeerComparison';

interface UserAnalytics {
  userId: string;
  profileStrength: number;
  careerTrajectory: any[];
  skillGaps: any[];
  marketPosition: {
    percentile: number;
    competitiveAdvantage: string[];
    improvementAreas: string[];
  };
  networkInsights: {
    connectionStrength: number;
    influenceScore: number;
    recommendedConnections: string[];
  };
  achievementTrends: {
    monthlyGrowth: number;
    consistencyScore: number;
    peakPerformancePeriods: string[];
  };
}

interface AnalyticsDashboardProps {
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className = '' }) => {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'career' | 'skills' | 'market' | 'trends'>('overview');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analytics/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load analytics');
      }

      const data = await response.json();
      setAnalytics(data.analytics);
      setLastUpdated(new Date(data.generatedAt));
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    await loadAnalytics();
  };

  if (isLoading) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="mt-6 h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="font-medium text-red-900 dark:text-red-100">Failed to Load Analytics</h3>
              <p className="text-sm text-red-700 dark:text-red-200 mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={refreshAnalytics}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'career', name: 'Career Predictions', icon: TrendingUpIcon },
    { id: 'skills', name: 'Skill Analysis', icon: LightBulbIcon },
    { id: 'market', name: 'Market Insights', icon: UserGroupIcon },
    { id: 'trends', name: 'Trends', icon: TrendingUpIcon }
  ];

  return (
    <div className={className}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Career Analytics Dashboard</h1>
            <p className="text-indigo-100">
              AI-powered insights to accelerate your career growth
            </p>
          </div>
          <div className="text-right">
            <motion.button
              onClick={refreshAnalytics}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              whileTap={{ scale: 0.95 }}
              title="Refresh Analytics"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </motion.button>
            {lastUpdated && (
              <p className="text-xs text-indigo-200 mt-2">
                Updated {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">{analytics.profileStrength}%</div>
            <div className="text-sm text-indigo-100">Profile Strength</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">{analytics.marketPosition.percentile}th</div>
            <div className="text-sm text-indigo-100">Percentile</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">{analytics.careerTrajectory.length}</div>
            <div className="text-sm text-indigo-100">Career Paths</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">{analytics.skillGaps.length}</div>
            <div className="text-sm text-indigo-100">Skill Gaps</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-6 overflow-hidden">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap relative
                  ${isActive 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }
                `}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
                
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
                    layoutId="activeTab"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Profile Strength */}
            <ProfileStrengthMeter 
              strength={analytics.profileStrength}
              improvements={analytics.marketPosition.improvementAreas}
            />

            {/* Key Insights Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Career Trajectory Preview */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
                  Top Career Prediction
                </h3>
                {analytics.careerTrajectory[0] ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {analytics.careerTrajectory[0].predictedRole}
                      </span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {analytics.careerTrajectory[0].confidenceScore}% match
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Expected salary: ${analytics.careerTrajectory[0].salaryRange.min.toLocaleString()} - ${analytics.careerTrajectory[0].salaryRange.max.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Time to achieve: {analytics.careerTrajectory[0].timeToAchieve}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    Submit more achievements to get career predictions
                  </p>
                )}
              </div>

              {/* Network Insights */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
                  Network Insights
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Connection Strength</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {analytics.networkInsights.connectionStrength.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Influence Score</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {analytics.networkInsights.influenceScore.toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Recommended connections:
                    </p>
                    <ul className="text-sm space-y-1">
                      {analytics.networkInsights.recommendedConnections.slice(0, 3).map((connection, index) => (
                        <li key={index} className="text-gray-700 dark:text-gray-300">
                          • {connection}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Competitive Advantages */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
                  Your Competitive Advantages
                </h3>
                {analytics.marketPosition.competitiveAdvantage.length > 0 ? (
                  <ul className="space-y-2">
                    {analytics.marketPosition.competitiveAdvantage.map((advantage, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300">{advantage}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    Keep building achievements to develop competitive advantages
                  </p>
                )}
              </div>

              {/* Achievement Trends Preview */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
                  Achievement Momentum
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Monthly Growth</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {analytics.achievementTrends.monthlyGrowth.toFixed(1)} / month
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Consistency Score</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {analytics.achievementTrends.consistencyScore.toFixed(0)}%
                    </span>
                  </div>
                  {analytics.achievementTrends.peakPerformancePeriods.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Peak performance periods:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {analytics.achievementTrends.peakPerformancePeriods.slice(0, 3).map((period, index) => (
                          <span key={index} className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded text-xs">
                            {period}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'career' && (
          <motion.div
            key="career"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <CareerPredictions predictions={analytics.careerTrajectory} />
          </motion.div>
        )}

        {activeTab === 'skills' && (
          <motion.div
            key="skills"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <SkillGapAnalysis skillGaps={analytics.skillGaps} />
          </motion.div>
        )}

        {activeTab === 'market' && (
          <motion.div
            key="market"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <MarketInsights marketPosition={analytics.marketPosition} />
          </motion.div>
        )}

        {activeTab === 'trends' && (
          <motion.div
            key="trends"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AchievementTrends trends={analytics.achievementTrends} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};