'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrophyIcon,
  StarIcon,
  FireIcon,
  BoltIcon,
  SparklesIcon,
  RocketLaunchIcon,
  GiftIcon,
  ShieldCheckIcon,
  BeakerIcon,
  LightBulbIcon,
  AcademicCapIcon,
  ChartBarIcon
} from '@heroicons/react/24/solid';

interface GamificationHubProps {
  user: {
    level: number;
    xp: number;
    totalXP: number;
    streakDays: number;
    rank: string;
    battlePassLevel: number;
    skillPoints: number;
  };
}

interface Skill {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  xp: number;
  maxXP: number;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  unlocked: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  xpReward: number;
}

interface BattlePassTier {
  level: number;
  xpRequired: number;
  rewards: string[];
  premium: boolean;
  unlocked: boolean;
}

const GamificationHub: React.FC<GamificationHubProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'achievements' | 'battlepass'>('overview');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mock data - in real app, this would come from API
  const skills: Skill[] = [
    {
      id: 'academic',
      name: 'Academic Excellence',
      level: 5,
      maxLevel: 10,
      xp: 750,
      maxXP: 1000,
      icon: AcademicCapIcon,
      color: 'from-blue-400 to-blue-600',
      description: 'Master academic achievements and scholarly pursuits',
      unlocked: true
    },
    {
      id: 'research',
      name: 'Research Mastery',
      level: 3,
      maxLevel: 10,
      xp: 450,
      maxXP: 600,
      icon: BeakerIcon,
      color: 'from-purple-400 to-purple-600',
      description: 'Excel in research projects and publications',
      unlocked: true
    },
    {
      id: 'leadership',
      name: 'Leadership',
      level: 4,
      maxLevel: 10,
      xp: 320,
      maxXP: 800,
      icon: TrophyIcon,
      color: 'from-yellow-400 to-yellow-600',
      description: 'Lead teams and inspire others',
      unlocked: true
    },
    {
      id: 'innovation',
      name: 'Innovation',
      level: 2,
      maxLevel: 10,
      xp: 150,
      maxXP: 400,
      icon: LightBulbIcon,
      color: 'from-green-400 to-green-600',
      description: 'Create breakthrough solutions and ideas',
      unlocked: user.level >= 10
    },
    {
      id: 'networking',
      name: 'Professional Network',
      level: 1,
      maxLevel: 10,
      xp: 50,
      maxXP: 200,
      icon: SparklesIcon,
      color: 'from-pink-400 to-pink-600',
      description: 'Build valuable professional connections',
      unlocked: user.level >= 15
    },
    {
      id: 'entrepreneur',
      name: 'Entrepreneurship',
      level: 0,
      maxLevel: 10,
      xp: 0,
      maxXP: 100,
      icon: RocketLaunchIcon,
      color: 'from-red-400 to-red-600',
      description: 'Launch ventures and create value',
      unlocked: user.level >= 20
    }
  ];

  const achievements: Achievement[] = [
    {
      id: 'first-achievement',
      title: 'First Steps',
      description: 'Upload your first achievement',
      icon: StarIcon,
      rarity: 'common',
      progress: 1,
      maxProgress: 1,
      unlocked: true,
      xpReward: 100
    },
    {
      id: 'verified-scholar',
      title: 'Verified Scholar',
      description: 'Get 5 achievements verified',
      icon: ShieldCheckIcon,
      rarity: 'rare',
      progress: 3,
      maxProgress: 5,
      unlocked: false,
      xpReward: 500
    },
    {
      id: 'streak-master',
      title: 'Streak Master',
      description: 'Maintain a 30-day login streak',
      icon: FireIcon,
      rarity: 'epic',
      progress: user.streakDays,
      maxProgress: 30,
      unlocked: user.streakDays >= 30,
      xpReward: 1000
    },
    {
      id: 'nft-collector',
      title: 'NFT Collector',
      description: 'Mint 10 NFTs',
      icon: GiftIcon,
      rarity: 'legendary',
      progress: 4,
      maxProgress: 10,
      unlocked: false,
      xpReward: 2000
    }
  ];

  const battlePassTiers: BattlePassTier[] = Array.from({ length: 20 }, (_, i) => ({
    level: i + 1,
    xpRequired: (i + 1) * 1000,
    rewards: i % 5 === 4 ? ['Legendary NFT Frame', '500 Bonus XP'] : ['Achievement Badge', '100 XP'],
    premium: i % 2 === 1,
    unlocked: user.battlePassLevel >= i + 1
  }));

  const getRarityColor = (rarity: Achievement['rarity']) => {
    const colors = {
      common: 'from-gray-400 to-gray-600',
      rare: 'from-blue-400 to-blue-600',
      epic: 'from-purple-400 to-purple-600',
      legendary: 'from-yellow-400 to-yellow-600',
      mythic: 'from-red-400 to-red-600'
    };
    return colors[rarity];
  };

  if (!mounted) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-3xl p-6 h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <span className="text-white">Loading Gamification Hub...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-3xl p-6 border border-blue-400/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">🎮 Gamification Hub</h2>
          <p className="text-gray-300">Level up your academic journey</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-yellow-400 text-xl font-bold">{user.level}</div>
            <div className="text-xs text-gray-300">Level</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 text-xl font-bold">{user.xp}</div>
            <div className="text-xs text-gray-300">XP</div>
          </div>
          <div className="text-center">
            <div className="text-orange-400 text-xl font-bold">{user.streakDays}</div>
            <div className="text-xs text-gray-300">Streak</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-black bg-opacity-30 rounded-xl p-1 mb-6">
        {[
          { id: 'overview', label: '📊 Overview', icon: ChartBarIcon },
          { id: 'skills', label: '⚡ Skills', icon: BoltIcon },
          { id: 'achievements', label: '🏆 Achievements', icon: TrophyIcon },
          { id: 'battlepass', label: '🎯 Battle Pass', icon: GiftIcon }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="h-80 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* XP Progress */}
              <div className="bg-black bg-opacity-30 rounded-xl p-4">
                <h3 className="text-white font-bold mb-2">📈 Progress to Next Level</h3>
                <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(user.xp / user.totalXP) * 100}%` }}
                    transition={{ duration: 2 }}
                    className="bg-gradient-to-r from-blue-400 to-purple-400 h-3 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-300">
                  <span>{user.xp} XP</span>
                  <span>{user.totalXP - user.xp} XP to level {user.level + 1}</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black bg-opacity-30 rounded-xl p-4 text-center">
                  <FireIcon className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{user.streakDays}</div>
                  <div className="text-xs text-gray-300">Day Streak</div>
                </div>
                <div className="bg-black bg-opacity-30 rounded-xl p-4 text-center">
                  <StarIcon className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{user.skillPoints}</div>
                  <div className="text-xs text-gray-300">Skill Points</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-black bg-opacity-30 rounded-xl p-4">
                <h3 className="text-white font-bold mb-3">🎯 Daily Challenges</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-green-900 bg-opacity-50 rounded-lg">
                    <span className="text-green-300 text-sm">✅ Login daily</span>
                    <span className="text-green-400 text-xs">+50 XP</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-900 bg-opacity-50 rounded-lg">
                    <span className="text-blue-300 text-sm">📚 Review 3 achievements</span>
                    <span className="text-blue-400 text-xs">+100 XP</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-purple-900 bg-opacity-50 rounded-lg opacity-60">
                    <span className="text-purple-300 text-sm">🏆 Mint 1 NFT</span>
                    <span className="text-purple-400 text-xs">+200 XP</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'skills' && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {skills.map((skill) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-black bg-opacity-30 rounded-xl p-4 ${
                    !skill.unlocked ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${skill.color} flex items-center justify-center`}>
                        <skill.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold">{skill.name}</h3>
                        <p className="text-gray-400 text-xs">{skill.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">Level {skill.level}</div>
                      <div className="text-gray-400 text-xs">{skill.level}/{skill.maxLevel}</div>
                    </div>
                  </div>
                  
                  {skill.unlocked && (
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(skill.xp / skill.maxXP) * 100}%` }}
                        transition={{ duration: 1.5, delay: 0.2 }}
                        className={`bg-gradient-to-r ${skill.color} h-2 rounded-full`}
                      />
                    </div>
                  )}
                  
                  {!skill.unlocked && (
                    <div className="text-yellow-400 text-xs mt-2">
                      🔒 Unlocks at Level {skill.id === 'innovation' ? 10 : skill.id === 'networking' ? 15 : 20}
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-black bg-opacity-30 rounded-xl p-4 border-2 ${
                    achievement.unlocked 
                      ? 'border-green-400 bg-green-900 bg-opacity-20' 
                      : 'border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getRarityColor(achievement.rarity)} flex items-center justify-center`}>
                        <achievement.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold">{achievement.title}</h3>
                        <p className="text-gray-400 text-xs">{achievement.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-400 font-bold">+{achievement.xpReward} XP</div>
                      <div className="text-gray-400 text-xs capitalize">{achievement.rarity}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1 bg-gray-700 rounded-full h-2 mr-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        transition={{ duration: 1.5 }}
                        className={`bg-gradient-to-r ${getRarityColor(achievement.rarity)} h-2 rounded-full`}
                      />
                    </div>
                    <span className="text-white text-sm">
                      {achievement.progress}/{achievement.maxProgress}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'battlepass' && (
            <motion.div
              key="battlepass"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="bg-black bg-opacity-30 rounded-xl p-4 mb-4">
                <h3 className="text-white font-bold mb-2">🎯 Season Battle Pass</h3>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Current Level: {user.battlePassLevel}</span>
                  <span className="text-blue-400 font-bold">Season ends in 45 days</span>
                </div>
              </div>

              {battlePassTiers.slice(0, 10).map((tier) => (
                <motion.div
                  key={tier.level}
                  initial={{ opacity: 0, x: tier.level * 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: tier.level * 0.1 }}
                  className={`bg-black bg-opacity-30 rounded-xl p-4 border-l-4 ${
                    tier.unlocked ? 'border-green-400' : 'border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        tier.unlocked ? 'bg-green-600' : 'bg-gray-600'
                      }`}>
                        <span className="text-white font-bold text-sm">{tier.level}</span>
                      </div>
                      <div>
                        <h4 className="text-white font-bold">Tier {tier.level}</h4>
                        <p className="text-gray-400 text-xs">{tier.xpRequired} XP required</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {tier.rewards.map((reward, index) => (
                        <div key={index} className={`text-xs ${
                          tier.premium ? 'text-yellow-400' : 'text-blue-400'
                        }`}>
                          {tier.premium ? '👑 ' : '🎁 '}{reward}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GamificationHub;