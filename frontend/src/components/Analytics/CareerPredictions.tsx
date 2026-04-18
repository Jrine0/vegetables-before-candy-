import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowTrendingUpIcon as TrendingUpIcon,
  CurrencyDollarIcon,
  ClockIcon,
  LightBulbIcon,
  BriefcaseIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface CareerPrediction {
  predictedRole: string;
  confidenceScore: number;
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  timeToAchieve: string;
  requiredSkills: string[];
  growthPotential: number;
  matchingOpportunities: number;
}

interface CareerPredictionsProps {
  predictions: CareerPrediction[];
}

export const CareerPredictions: React.FC<CareerPredictionsProps> = ({ predictions }) => {
  const [selectedPrediction, setSelectedPrediction] = useState<CareerPrediction | null>(
    predictions[0] || null
  );

  if (predictions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center">
        <BriefcaseIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          No Career Predictions Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Upload more achievements and earn NFTs to unlock AI-powered career predictions.
        </p>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Submit Achievement
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            AI Career Predictions
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <ChartBarIcon className="w-4 h-4" />
            <span>{predictions.length} career paths analyzed</span>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Based on your achievements, skills, and market trends, here are your most likely career trajectories.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Career List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Career Paths</h3>
            </div>
            <div className="space-y-0">
              {predictions.map((prediction, index) => (
                <motion.button
                  key={index}
                  onClick={() => setSelectedPrediction(prediction)}
                  className={`
                    w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                    ${selectedPrediction?.predictedRole === prediction.predictedRole 
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border-r-4 border-indigo-600' 
                      : 'border-r-4 border-transparent'
                    }
                  `}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      {prediction.predictedRole}
                    </h4>
                    <span className={`
                      text-xs px-2 py-1 rounded-full font-medium
                      ${prediction.confidenceScore >= 80 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : prediction.confidenceScore >= 60
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }
                    `}>
                      {prediction.confidenceScore}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    ${prediction.salaryRange.min.toLocaleString()} - ${prediction.salaryRange.max.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {prediction.timeToAchieve}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Career Detail */}
        <div className="lg:col-span-2">
          {selectedPrediction && (
            <motion.div
              key={selectedPrediction.predictedRole}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">{selectedPrediction.predictedRole}</h3>
                <div className="flex items-center space-x-4 text-indigo-100">
                  <div className="flex items-center space-x-1">
                    <TrendingUpIcon className="w-4 h-4" />
                    <span className="text-sm">{selectedPrediction.confidenceScore}% Match</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ChartBarIcon className="w-4 h-4" />
                    <span className="text-sm">{selectedPrediction.growthPotential}% Growth</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BriefcaseIcon className="w-4 h-4" />
                    <span className="text-sm">{selectedPrediction.matchingOpportunities} Jobs</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CurrencyDollarIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="font-medium text-green-900 dark:text-green-100">Salary Range</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                      ${selectedPrediction.salaryRange.min.toLocaleString()} - ${selectedPrediction.salaryRange.max.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">
                      {selectedPrediction.salaryRange.currency} annually
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <ClockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-blue-900 dark:text-blue-100">Time to Achieve</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {selectedPrediction.timeToAchieve}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      With focused effort
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUpIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span className="font-medium text-purple-900 dark:text-purple-100">Growth Potential</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {selectedPrediction.growthPotential}%
                    </div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">
                      Industry growth rate
                    </div>
                  </div>
                </div>

                {/* Required Skills */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <LightBulbIcon className="w-5 h-5 text-yellow-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">Skills to Develop</h4>
                  </div>
                  
                  {selectedPrediction.requiredSkills.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedPrediction.requiredSkills.map((skill, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <span className="font-medium text-gray-900 dark:text-white capitalize">
                            {skill.replace('_', ' ')}
                          </span>
                          <button className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline">
                            Learn →
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <p className="text-green-800 dark:text-green-200 font-medium">
                        🎉 You already have all the required skills for this role!
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <motion.button
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View {selectedPrediction.matchingOpportunities} Matching Jobs
                  </motion.button>
                  <motion.button
                    className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Create Learning Plan
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Confidence Score Explanation */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <LightBulbIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
              How Predictions Work
            </h4>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Our AI analyzes your achievements, NFT evolution, skill development, and current market trends 
              to predict career paths. Higher confidence scores indicate better alignment with your profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};