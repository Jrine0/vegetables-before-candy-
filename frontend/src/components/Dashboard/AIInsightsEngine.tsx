'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CpuChipIcon as BrainIcon, // Using CpuChipIcon as BrainIcon replacement
  ChartBarIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon as TrendingUpIcon, // Correct trending up icon name
  SparklesIcon,
  BeakerIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  BuildingOffice2Icon,
  UsersIcon,
  ArrowRightIcon,
  EyeIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/solid';
import dynamic from 'next/dynamic';

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

interface CareerPath {
  id: string;
  title: string;
  company: string;
  match: number;
  salary: string;
  growth: string;
  skills: string[];
  icon: React.ComponentType<any>;
  color: string;
}

interface Insight {
  id: string;
  type: 'strength' | 'opportunity' | 'trend' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  icon: React.ComponentType<any>;
}

const AIInsightsEngine: React.FC<AIInsightsEngineProps> = ({ user }) => {
  const [activeView, setActiveView] = useState<'insights' | 'career' | 'analytics'>('insights');
  const [mounted, setMounted] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Simulate AI analysis
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 2000);
  }, []);

  // Mock AI-generated insights
  const insights: Insight[] = [
    {
      id: '1',
      type: 'strength',
      title: 'Research Excellence Detected',
      description: 'Your research achievements show 87% higher quality than peers. Consider pursuing advanced research opportunities.',
      confidence: 94,
      actionable: true,
      icon: BeakerIcon
    },
    {
      id: '2',
      type: 'opportunity',
      title: 'Leadership Skill Gap',
      description: 'Your profile shows strong technical skills but limited leadership experience. Join student organizations.',
      confidence: 78,
      actionable: true,
      icon: UsersIcon
    },
    {
      id: '3',
      type: 'trend',
      title: 'AI/ML Skills High Demand',
      description: 'Market analysis shows 340% growth in AI roles. Your math background positions you well for transition.',
      confidence: 91,
      actionable: true,
      icon: BrainIcon
    },
    {
      id: '4',
      type: 'recommendation',
      title: 'Portfolio Enhancement',
      description: 'Add 2-3 practical projects to strengthen your profile for top-tier tech companies.',
      confidence: 85,
      actionable: true,
      icon: LightBulbIcon
    }
  ];

  // Mock career paths
  const careerPaths: CareerPath[] = [
    {
      id: '1',
      title: 'Machine Learning Engineer',
      company: 'Google',
      match: 92,
      salary: '$180k - $250k',
      growth: '+23%',
      skills: ['Python', 'TensorFlow', 'Statistics', 'Research'],
      icon: BrainIcon,
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: '2',
      title: 'Research Scientist',
      company: 'OpenAI',
      match: 88,
      salary: '$200k - $300k',
      growth: '+31%',
      skills: ['Deep Learning', 'Publications', 'Math', 'Innovation'],
      icon: BeakerIcon,
      color: 'from-green-500 to-blue-600'
    },
    {
      id: '3',
      title: 'Data Science Lead',
      company: 'Meta',
      match: 85,
      salary: '$220k - $280k',
      growth: '+19%',
      skills: ['Analytics', 'Leadership', 'SQL', 'Visualization'],
      icon: ChartBarIcon,
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: '4',
      title: 'Product Manager (AI)',
      company: 'Microsoft',
      match: 74,
      salary: '$190k - $240k',
      growth: '+27%',
      skills: ['Strategy', 'Communication', 'AI', 'Business'],
      icon: BriefcaseIcon,
      color: 'from-orange-500 to-red-600'
    }
  ];

  // Mock analytics data
  const progressData = [
    { month: 'Jan', skills: 65, achievements: 45, networking: 30 },
    { month: 'Feb', skills: 68, achievements: 52, networking: 35 },
    { month: 'Mar', skills: 75, achievements: 61, networking: 42 },
    { month: 'Apr', skills: 82, achievements: 70, networking: 48 },
    { month: 'May', skills: 87, achievements: 75, networking: 55 },
    { month: 'Jun', skills: 92, achievements: 82, networking: 62 }
  ];

  const skillRadarData = [
    { skill: 'Technical', A: 85, fullMark: 100 },
    { skill: 'Research', A: 92, fullMark: 100 },
    { skill: 'Communication', A: 68, fullMark: 100 },
    { skill: 'Leadership', A: 45, fullMark: 100 },
    { skill: 'Innovation', A: 78, fullMark: 100 },
    { skill: 'Collaboration', A: 72, fullMark: 100 }
  ];

  const getInsightColor = (type: Insight['type']) => {
    const colors = {
      strength: 'from-green-400 to-green-600',
      opportunity: 'from-yellow-400 to-orange-500',
      trend: 'from-blue-400 to-purple-600',
      recommendation: 'from-pink-400 to-red-500'
    };
    return colors[type];
  };

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
            <BrainIcon className="w-7 h-7 mr-2 text-purple-400" />
            AI Insights Engine
          </h2>
          <p className="text-gray-300">Personalized career intelligence powered by AI</p>
        </div>
        
        {isAnalyzing && (
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-purple-400"
          >
            <MagnifyingGlassIcon className="w-8 h-8" />
          </motion.div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-black bg-opacity-30 rounded-xl p-1 mb-6">
        {[
          { id: 'insights', label: '🧠 AI Insights', icon: SparklesIcon },
          { id: 'career', label: '🚀 Career Paths', icon: RocketLaunchIcon },
          { id: 'analytics', label: '📊 Analytics', icon: ChartBarIcon }
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
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-black bg-opacity-30 rounded-xl p-4 border border-white border-opacity-10"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getInsightColor(insight.type)} flex items-center justify-center flex-shrink-0`}>
                      <insight.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-white font-bold text-sm">{insight.title}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-purple-400">{insight.confidence}% confidence</span>
                          {insight.actionable && (
                            <span className="text-xs bg-green-900 bg-opacity-50 text-green-300 px-2 py-1 rounded-full">
                              Actionable
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{insight.description}</p>
                      
                      {insight.actionable && (
                        <button className="text-purple-400 hover:text-purple-300 text-xs flex items-center transition-colors">
                          Take Action <ArrowRightIcon className="w-3 h-3 ml-1" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* AI Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-xl p-4 border border-purple-400/30"
              >
                <h3 className="text-white font-bold mb-2 flex items-center">
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  AI Summary for {user.firstName}
                </h3>
                <p className="text-gray-300 text-sm">
                  Based on your profile analysis, you're in the top 15% of students in research capabilities. 
                  Focus on developing leadership skills and practical projects to maximize your career potential 
                  in AI/ML roles. Your trajectory suggests readiness for senior positions within 3-5 years.
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
              {careerPaths.map((path, index) => (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-black bg-opacity-30 rounded-xl p-4 border border-white border-opacity-10 hover:border-opacity-30 transition-all cursor-pointer group"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${path.color} flex items-center justify-center flex-shrink-0`}>
                      <path.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-white font-bold">{path.title}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-green-400">{path.match}% match</span>
                          <EyeIcon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 mb-2 text-sm text-gray-300">
                        <span className="flex items-center">
                          <BuildingOffice2Icon className="w-4 h-4 mr-1" />
                          {path.company}
                        </span>
                        <span className="flex items-center">
                          <BriefcaseIcon className="w-4 h-4 mr-1" />
                          {path.salary}
                        </span>
                        <span className="flex items-center text-green-400">
                          <TrendingUpIcon className="w-4 h-4 mr-1" />
                          {path.growth}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {path.skills.map((skill) => (
                          <span key={skill} className="text-xs bg-white bg-opacity-10 text-gray-300 px-2 py-1 rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                      
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${path.match}%` }}
                          transition={{ duration: 1.5, delay: index * 0.2 }}
                          className={`bg-gradient-to-r ${path.color} h-2 rounded-full`}
                        />
                      </div>
                    </div>
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
              {/* Progress Chart */}
              <div className="bg-black bg-opacity-30 rounded-xl p-4">
                <h3 className="text-white font-bold mb-4">📈 Growth Trajectory</h3>
                <div className="h-40 relative">
                  {/* Simple visual chart replacement */}
                  <div className="grid grid-cols-6 h-full gap-2">
                    {progressData.map((data, index) => (
                      <div key={data.month} className="flex flex-col justify-end items-center h-full">
                        <div className="w-full flex flex-col space-y-1">
                          <div className="bg-purple-500 rounded-t" style={{height: `${(data.skills/100)*80}px`}}></div>
                          <div className="bg-green-500" style={{height: `${(data.achievements/100)*80}px`}}></div>
                          <div className="bg-yellow-500 rounded-b" style={{height: `${(data.networking/100)*80}px`}}></div>
                        </div>
                        <span className="text-gray-400 text-xs mt-2">{data.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center space-x-6 mt-2">
                  <div className="flex items-center text-xs">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                    <span className="text-gray-300">Skills</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-gray-300">Achievements</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-gray-300">Networking</span>
                  </div>
                </div>
              </div>

              {/* Skill Profile */}
              <div className="bg-black bg-opacity-30 rounded-xl p-4">
                <h3 className="text-white font-bold mb-4">🎯 Skill Profile</h3>
                <div className="space-y-3">
                  {skillRadarData.map((skill) => (
                    <div key={skill.skill} className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm font-medium w-24">{skill.skill}</span>
                      <div className="flex-1 mx-3 bg-gray-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.A}%` }}
                          transition={{ duration: 1.5, delay: 0.2 }}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                        />
                      </div>
                      <span className="text-white text-sm font-bold w-8 text-right">{skill.A}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Metrics */}
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

export default AIInsightsEngine;