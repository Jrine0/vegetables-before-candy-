'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIInsightsEngineProps {
  user: {
    firstName: string;
    level: number;
    achievements: any[];
    skills: string[];
    university: string;
    major?: string;
  };
}

const AIInsightsEngineSimple: React.FC<AIInsightsEngineProps> = ({ user }) => {
  const [activeView, setActiveView] = useState<'insights' | 'career' | 'analytics'>('insights');
  const [mounted, setMounted] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 2000);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-3xl p-6 h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <span className="text-white">Initializing AI Engine...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-3xl p-6 border border-purple-400/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
            🧠 AI Insights Engine
          </h2>
          <p className="text-gray-300">Personalized career intelligence powered by AI</p>
        </div>
        
        {isAnalyzing && (
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-purple-400"
          >
            🔍
          </motion.div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-black bg-opacity-30 rounded-xl p-1 mb-6">
        {[
          { id: 'insights', label: '🧠 AI Insights' },
          { id: 'career', label: '🚀 Career Paths' },
          { id: 'analytics', label: '📊 Analytics' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeView === tab.id
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="h-80 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeView === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Mock Insights */}
              {[
                {
                  title: 'Research Excellence Detected',
                  description: 'Your research achievements show 87% higher quality than peers.',
                  confidence: 94,
                  type: 'strength'
                },
                {
                  title: 'Leadership Skill Gap',
                  description: 'Strong technical skills but limited leadership experience.',
                  confidence: 78,
                  type: 'opportunity'
                },
                {
                  title: 'AI/ML Skills High Demand',
                  description: 'Market analysis shows 340% growth in AI roles.',
                  confidence: 91,
                  type: 'trend'
                }
              ].map((insight, index) => (
                <motion.div
                  key={insight.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-black bg-opacity-30 rounded-xl p-4 border border-white border-opacity-10"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-lg ${
                      insight.type === 'strength' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                      insight.type === 'opportunity' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                      'bg-gradient-to-r from-blue-400 to-purple-600'
                    } flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white text-lg">
                        {insight.type === 'strength' ? '💪' : insight.type === 'opportunity' ? '🎯' : '📈'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-white font-bold text-sm">{insight.title}</h3>
                        <span className="text-xs text-purple-400">{insight.confidence}% confidence</span>
                      </div>
                      <p className="text-gray-300 text-sm">{insight.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-xl p-4 border border-purple-400/30"
              >
                <h3 className="text-white font-bold mb-2 flex items-center">
                  ✨ AI Summary for {user.firstName}
                </h3>
                <p className="text-gray-300 text-sm">
                  Based on your profile analysis, you're in the top 15% of students in research capabilities. 
                  Focus on developing leadership skills and practical projects to maximize your career potential 
                  in AI/ML roles.
                </p>
              </motion.div>
            </motion.div>
          )}

          {activeView === 'career' && (
            <motion.div
              key="career"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {[
                { title: 'ML Engineer', company: 'Google', match: 92, salary: '$180k - $250k' },
                { title: 'Research Scientist', company: 'OpenAI', match: 88, salary: '$200k - $300k' },
                { title: 'Data Science Lead', company: 'Meta', match: 85, salary: '$220k - $280k' }
              ].map((path, index) => (
                <motion.div
                  key={path.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-black bg-opacity-30 rounded-xl p-4 border border-white border-opacity-10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-bold">{path.title}</h3>
                    <span className="text-lg font-bold text-green-400">{path.match}% match</span>
                  </div>
                  <div className="text-gray-300 text-sm mb-2">
                    {path.company} • {path.salary}
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${path.match}%` }}
                      transition={{ duration: 1.5, delay: index * 0.2 }}
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeView === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="bg-black bg-opacity-30 rounded-xl p-4">
                <h3 className="text-white font-bold mb-4">📈 Skills Progress</h3>
                <div className="space-y-3">
                  {[
                    { skill: 'Technical', level: 85 },
                    { skill: 'Research', level: 92 },
                    { skill: 'Communication', level: 68 },
                    { skill: 'Leadership', level: 45 }
                  ].map((item) => (
                    <div key={item.skill} className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm font-medium w-24">{item.skill}</span>
                      <div className="flex-1 mx-3 bg-gray-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.level}%` }}
                          transition={{ duration: 1.5, delay: 0.2 }}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                        />
                      </div>
                      <span className="text-white text-sm font-bold w-8 text-right">{item.level}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black bg-opacity-30 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">847</div>
                  <div className="text-xs text-gray-300">Market Rank</div>
                  <div className="text-xs text-green-400">↑ Top 15%</div>
                </div>
                <div className="bg-black bg-opacity-30 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">94%</div>
                  <div className="text-xs text-gray-300">Profile Score</div>
                  <div className="text-xs text-green-400">↑ +12%</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIInsightsEngineSimple;