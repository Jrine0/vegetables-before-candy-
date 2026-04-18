'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface HolographicAvatarProps {
  user: {
    firstName: string;
    lastName: string;
    level: number;
    xp: number;
    totalXP: number;
    rank: string;
    university: string;
  };
  achievements: {
    total: number;
    verified: number;
    rare: number;
    legendary: number;
  };
}


// Main Holographic Avatar Component
const HolographicAvatar: React.FC<HolographicAvatarProps> = ({ user, achievements }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-3xl flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <span className="text-white text-lg">Loading Holographic Avatar...</span>
        </div>
      </div>
    );
  }

  const xpProgress = (user.xp / user.totalXP) * 100;
  const nextLevelXP = user.totalXP - user.xp;

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-3xl overflow-hidden">
      {/* Static Holographic Design */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Main Avatar Circle */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 p-1"
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
              <span className="text-4xl font-bold text-white">{user.firstName.charAt(0)}</span>
            </div>
          </motion.div>
          
          {/* Floating Achievement Points */}
          {Array.from({ length: achievements.total || 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
              style={{
                left: `${50 + 40 * Math.cos((i / (achievements.total || 8)) * Math.PI * 2)}%`,
                top: `${50 + 40 * Math.sin((i / (achievements.total || 8)) * Math.PI * 2)}%`,
              }}
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Holographic Overlay UI */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Status Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 right-4 flex justify-between items-start"
        >
          <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-xl p-3 border border-cyan-400/30">
            <div className="text-cyan-400 text-sm font-mono">Level {user.level}</div>
            <div className="text-white text-xl font-bold">{user.firstName} {user.lastName}</div>
            <div className="text-gray-300 text-xs">{user.rank} • {user.university}</div>
          </div>
          
          <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-xl p-3 border border-purple-400/30">
            <div className="text-purple-400 text-sm font-mono">XP Progress</div>
            <div className="w-32 bg-gray-700 rounded-full h-2 mt-1">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 2, delay: 0.5 }}
                className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full"
              />
            </div>
            <div className="text-white text-xs mt-1">{nextLevelXP} XP to next level</div>
          </div>
        </motion.div>

        {/* Bottom Stats Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="absolute bottom-4 left-4 right-4"
        >
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-xl p-2 border border-green-400/30 text-center">
              <div className="text-green-400 text-lg font-bold">{achievements.total}</div>
              <div className="text-white text-xs">Total</div>
            </div>
            <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-xl p-2 border border-blue-400/30 text-center">
              <div className="text-blue-400 text-lg font-bold">{achievements.verified}</div>
              <div className="text-white text-xs">Verified</div>
            </div>
            <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-xl p-2 border border-purple-400/30 text-center">
              <div className="text-purple-400 text-lg font-bold">{achievements.rare}</div>
              <div className="text-white text-xs">Rare</div>
            </div>
            <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-xl p-2 border border-yellow-400/30 text-center">
              <div className="text-yellow-400 text-lg font-bold">{achievements.legendary}</div>
              <div className="text-white text-xs">Legendary</div>
            </div>
          </div>
        </motion.div>

        {/* Holographic Grid Lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full">
            <svg className="w-full h-full opacity-20">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="cyan" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        {/* Pulsing Border */}
        <div className="absolute inset-0 rounded-3xl border-2 border-cyan-400/50 animate-pulse"></div>
      </div>
    </div>
  );
};

export default HolographicAvatar;