'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { 
  AcademicCapIcon,
  BeakerIcon,
  UserGroupIcon,
  SparklesIcon,
  ClockIcon,
  MapPinIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

interface LiveAchievement {
  id: string;
  title: string;
  type: string;
  userFirstName: string;
  university: string;
  timestamp: string;
  verified?: boolean;
}

const achievementIcons = {
  gpa: AcademicCapIcon,
  research: BeakerIcon,
  leadership: UserGroupIcon,
  internship: SparklesIcon,
  project: ClockIcon,
  competition: TrophyIcon
};

const achievementColors = {
  gpa: 'from-blue-500 to-blue-600',
  research: 'from-green-500 to-green-600', 
  leadership: 'from-purple-500 to-purple-600',
  internship: 'from-orange-500 to-orange-600',
  project: 'from-pink-500 to-pink-600',
  competition: 'from-yellow-500 to-yellow-600'
};

export const LiveAchievementFeed: React.FC = () => {
  const [achievements, setAchievements] = useState<LiveAchievement[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const { socket, isConnected } = useWebSocket();

  useEffect(() => {
    if (!socket) return;

    // Listen for new achievements
    socket.on('new-achievement', (data: LiveAchievement) => {
      setAchievements(prev => [data, ...prev.slice(0, 9)]); // Keep only last 10
    });

    socket.on('achievement-feed-update', (data: LiveAchievement) => {
      setAchievements(prev => [data, ...prev.slice(0, 9)]);
    });

    // Simulate some initial achievements for demo
    const demoAchievements: LiveAchievement[] = [
      {
        id: '1',
        title: '4.0 GPA Achievement',
        type: 'gpa',
        userFirstName: 'Sarah',
        university: 'Stanford University',
        timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 min ago
        verified: true
      },
      {
        id: '2', 
        title: 'AI Research Publication',
        type: 'research',
        userFirstName: 'Michael',
        university: 'MIT',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min ago
        verified: true
      },
      {
        id: '3',
        title: 'Global Innovation Finalist',
        type: 'competition',
        userFirstName: 'Emma',
        university: 'UC Berkeley',
        timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(), // 8 min ago
        verified: false
      }
    ];

    setAchievements(demoAchievements);

    return () => {
      socket.off('new-achievement');
      socket.off('achievement-feed-update');
    };
  }, [socket]);

  const getIcon = (type: string) => {
    const IconComponent = achievementIcons[type as keyof typeof achievementIcons] || SparklesIcon;
    return IconComponent;
  };

  const getColor = (type: string) => {
    return achievementColors[type as keyof typeof achievementColors] || 'from-gray-500 to-gray-600';
  };

  const formatTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'just now';
    }
  };

  if (!isVisible) {
    return (
      <motion.button
        onClick={() => setIsVisible(true)}
        className="fixed top-20 right-4 z-50 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <SparklesIcon className="w-6 h-6" />
      </motion.button>
    );
  }

  return (
    <div className="fixed top-20 right-4 z-40 w-80 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-t-xl p-4 border-b border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <h3 className="font-bold text-gray-900 dark:text-white">
              Live Achievement Feed
            </h3>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Real-time updates across universities
        </p>
      </div>

      {/* Achievement List */}
      <div className="bg-white dark:bg-gray-800 rounded-b-xl shadow-lg max-h-80 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {achievements.map((achievement) => {
            const IconComponent = getIcon(achievement.type);
            const colorClass = getColor(achievement.type);
            
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: 300, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -300, scale: 0.8 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 25,
                  duration: 0.3
                }}
                className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r ${colorClass} flex items-center justify-center shadow-md`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {achievement.title}
                      </p>
                      {achievement.verified && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex-shrink-0"
                        >
                          <SparklesIcon className="w-4 h-4 text-green-500" />
                        </motion.div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                          {achievement.userFirstName}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <MapPinIcon className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {achievement.university}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 mt-1">
                      <ClockIcon className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">
                        {formatTimeAgo(achievement.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {achievements.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <SparklesIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Waiting for live achievements...</p>
          </div>
        )}
      </div>

      {/* Floating Connection Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
      >
        <div className={`px-3 py-1 rounded-full text-xs font-medium shadow-md ${
          isConnected 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </motion.div>
    </div>
  );
};

export default LiveAchievementFeed;