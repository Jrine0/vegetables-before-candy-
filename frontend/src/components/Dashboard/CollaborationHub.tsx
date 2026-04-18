'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UsersIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  SparklesIcon,
  ClockIcon,
  GlobeAltIcon,
  HeartIcon,
  StarIcon,
  PlusIcon,
  MicrophoneIcon,
  ComputerDesktopIcon,
  BookOpenIcon,
  LightBulbIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/solid';

interface CollaborationHubProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    university: string;
    avatar?: string;
  };
}

interface StudyRoom {
  id: string;
  title: string;
  description: string;
  participants: number;
  maxParticipants: number;
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  host: {
    name: string;
    university: string;
    rating: number;
  };
  tags: string[];
  isLive: boolean;
  startTime: string;
}

interface MentorMatch {
  id: string;
  name: string;
  title: string;
  company: string;
  university: string;
  expertise: string[];
  rating: number;
  sessions: number;
  availability: string;
  matchScore: number;
  avatar: string;
}

interface CollaborationEvent {
  id: string;
  type: 'innovation-sprint' | 'study-group' | 'workshop' | 'competition';
  title: string;
  description: string;
  participants: number;
  maxParticipants: number;
  date: string;
  duration: string;
  prizes?: string;
  organizer: string;
  tags: string[];
}

const CollaborationHub: React.FC<CollaborationHubProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'rooms' | 'mentors' | 'events' | 'create'>('rooms');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mock data
  const studyRooms: StudyRoom[] = [
    {
      id: '1',
      title: 'Advanced Machine Learning Study Group',
      description: 'Deep dive into neural networks and reinforcement learning. Bring your questions!',
      participants: 8,
      maxParticipants: 12,
      subject: 'Machine Learning',
      difficulty: 'advanced',
      duration: '2 hours',
      host: {
        name: 'Sarah Chen',
        university: 'MIT',
        rating: 4.9
      },
      tags: ['ML', 'Python', 'Research'],
      isLive: true,
      startTime: '10 minutes ago'
    },
    {
      id: '2',
      title: 'Calculus Problem Solving Session',
      description: 'Working through challenging integral and derivative problems together.',
      participants: 15,
      maxParticipants: 20,
      subject: 'Mathematics',
      difficulty: 'intermediate',
      duration: '1.5 hours',
      host: {
        name: 'Alex Rodriguez',
        university: 'Stanford',
        rating: 4.7
      },
      tags: ['Calculus', 'Math', 'Problem Solving'],
      isLive: true,
      startTime: '25 minutes ago'
    },
    {
      id: '3',
      title: 'React & Web3 Development Workshop',
      description: 'Building decentralized applications with modern React and blockchain integration.',
      participants: 6,
      maxParticipants: 10,
      subject: 'Computer Science',
      difficulty: 'intermediate',
      duration: '3 hours',
      host: {
        name: 'Jordan Kim',
        university: 'UC Berkeley',
        rating: 4.8
      },
      tags: ['React', 'Web3', 'JavaScript'],
      isLive: false,
      startTime: 'Starting in 15 minutes'
    }
  ];

  const mentorMatches: MentorMatch[] = [
    {
      id: '1',
      name: 'Dr. Emily Watson',
      title: 'Senior ML Engineer',
      company: 'Google DeepMind',
      university: 'Harvard PhD',
      expertise: ['Machine Learning', 'Research', 'Career Development'],
      rating: 4.9,
      sessions: 127,
      availability: 'Available now',
      matchScore: 94,
      avatar: '👩‍🔬'
    },
    {
      id: '2',
      name: 'Marcus Thompson',
      title: 'Startup Founder',
      company: 'TechFlow (YC S22)',
      university: 'Stanford MBA',
      expertise: ['Entrepreneurship', 'Product', 'Leadership'],
      rating: 4.8,
      sessions: 89,
      availability: 'Tomorrow 3 PM',
      matchScore: 87,
      avatar: '👨‍💼'
    },
    {
      id: '3',
      name: 'Dr. Raj Patel',
      title: 'Principal Researcher',
      company: 'Microsoft Research',
      university: 'MIT PhD',
      expertise: ['Computer Vision', 'Publications', 'Academia'],
      rating: 4.9,
      sessions: 156,
      availability: 'Next week',
      matchScore: 91,
      avatar: '👨‍🎓'
    }
  ];

  const collaborationEvents: CollaborationEvent[] = [
    {
      id: '1',
      type: 'innovation-sprint',
      title: 'AI for Education Innovation Sprint',
      description: '48-hour sprint building AI solutions for educational challenges.',
      participants: 127,
      maxParticipants: 200,
      date: 'This Weekend',
      duration: '48 hours',
      prizes: '$10,000 in prizes',
      organizer: 'Microsoft',
      tags: ['AI', 'Education', 'Innovation']
    },
    {
      id: '2',
      type: 'competition',
      title: 'International Math Olympiad Prep',
      description: 'Competitive math training with previous IMO medalists.',
      participants: 45,
      maxParticipants: 50,
      date: 'Next Monday',
      duration: '4 weeks',
      organizer: 'Math Society',
      tags: ['Mathematics', 'Competition', 'Olympiad']
    },
    {
      id: '3',
      type: 'workshop',
      title: 'Research Paper Writing Workshop',
      description: 'Learn to write compelling academic papers that get published.',
      participants: 23,
      maxParticipants: 30,
      date: 'Next Friday',
      duration: '6 hours',
      organizer: 'Academic Writing Institute',
      tags: ['Research', 'Writing', 'Publications']
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'from-green-400 to-green-600',
      intermediate: 'from-yellow-400 to-orange-500',
      advanced: 'from-red-400 to-purple-600'
    };
    return colors[difficulty as keyof typeof colors] || colors.intermediate;
  };

  const getEventTypeIcon = (type: CollaborationEvent['type']) => {
    const icons = {
      'innovation-sprint': ComputerDesktopIcon,
      'study-group': BookOpenIcon,
      workshop: LightBulbIcon,
      competition: RocketLaunchIcon
    };
    return icons[type];
  };

  const getEventTypeColor = (type: CollaborationEvent['type']) => {
    const colors = {
      'innovation-sprint': 'from-purple-500 to-pink-600',
      'study-group': 'from-blue-500 to-cyan-600',
      workshop: 'from-green-500 to-blue-600',
      competition: 'from-red-500 to-orange-600'
    };
    return colors[type];
  };

  if (!mounted) {
    return (
      <div className="bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900 rounded-3xl p-6 h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <span className="text-white">Loading Collaboration Hub...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900 rounded-3xl p-6 border border-cyan-400/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
            <UsersIcon className="w-7 h-7 mr-2 text-cyan-400" />
            Collaboration Hub
          </h2>
          <p className="text-gray-300">Connect, learn, and grow together</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-green-400 text-xl font-bold">42</div>
            <div className="text-xs text-gray-300">Active Rooms</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 text-xl font-bold">1,247</div>
            <div className="text-xs text-gray-300">Online Users</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-black bg-opacity-30 rounded-xl p-1 mb-6">
        {[
          { id: 'rooms', label: '🏠 Study Rooms', icon: VideoCameraIcon },
          { id: 'mentors', label: '🎯 Mentors', icon: AcademicCapIcon },
          { id: 'events', label: '🎪 Events', icon: SparklesIcon },
          { id: 'create', label: '➕ Create', icon: PlusIcon }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-600 text-white'
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
          {activeTab === 'rooms' && (
            <motion.div
              key="rooms"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {studyRooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-black bg-opacity-30 rounded-xl p-4 border border-white border-opacity-10 hover:border-opacity-30 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-white font-bold">{room.title}</h3>
                        {room.isLive && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                            LIVE
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{room.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-sm font-bold">
                        {room.participants}/{room.maxParticipants}
                      </div>
                      <div className="text-gray-400 text-xs">participants</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-3 text-sm text-gray-300">
                    <span className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {room.duration}
                    </span>
                    <span className="flex items-center">
                      <AcademicCapIcon className="w-4 h-4 mr-1" />
                      {room.subject}
                    </span>
                    <span className={`px-2 py-1 rounded-full bg-gradient-to-r ${getDifficultyColor(room.difficulty)} text-white text-xs capitalize`}>
                      {room.difficulty}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {room.host.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{room.host.name}</div>
                        <div className="text-gray-400 text-xs flex items-center">
                          <StarIcon className="w-3 h-3 text-yellow-400 mr-1" />
                          {room.host.rating} • {room.host.university}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {room.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-white bg-opacity-10 text-gray-300 px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-600 flex items-center justify-between">
                    <span className="text-gray-400 text-xs">{room.startTime}</span>
                    <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                      Join Room
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'mentors' && (
            <motion.div
              key="mentors"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {mentorMatches.map((mentor, index) => (
                <motion.div
                  key={mentor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-black bg-opacity-30 rounded-xl p-4 border border-white border-opacity-10 hover:border-opacity-30 transition-all cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-4xl">{mentor.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-white font-bold">{mentor.name}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-green-400 font-bold text-sm">{mentor.matchScore}% match</span>
                        </div>
                      </div>
                      
                      <div className="text-gray-300 text-sm mb-1">
                        {mentor.title} at {mentor.company}
                      </div>
                      
                      <div className="text-gray-400 text-xs mb-2">
                        {mentor.university}
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {mentor.expertise.map((skill) => (
                          <span key={skill} className="text-xs bg-blue-900 bg-opacity-50 text-blue-300 px-2 py-1 rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4 text-gray-300">
                          <span className="flex items-center">
                            <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                            {mentor.rating}
                          </span>
                          <span>{mentor.sessions} sessions</span>
                        </div>
                        <div className="text-green-400 text-xs">{mentor.availability}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-600 flex space-x-2">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                      Book Session
                    </button>
                    <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                      View Profile
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'events' && (
            <motion.div
              key="events"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {collaborationEvents.map((event, index) => {
                const IconComponent = getEventTypeIcon(event.type);
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-black bg-opacity-30 rounded-xl p-4 border border-white border-opacity-10 hover:border-opacity-30 transition-all cursor-pointer"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getEventTypeColor(event.type)} flex items-center justify-center`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-white font-bold">{event.title}</h3>
                          <span className="text-xs bg-white bg-opacity-20 text-white px-2 py-1 rounded-full capitalize">
                            {event.type}
                          </span>
                        </div>
                        
                        <p className="text-gray-300 text-sm mb-2">{event.description}</p>
                        
                        <div className="flex items-center space-x-4 mb-2 text-sm text-gray-300">
                          <span className="flex items-center">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {event.date} • {event.duration}
                          </span>
                          <span className="flex items-center">
                            <UsersIcon className="w-4 h-4 mr-1" />
                            {event.participants}/{event.maxParticipants}
                          </span>
                          {event.prizes && (
                            <span className="text-yellow-400 font-bold">🏆 {event.prizes}</span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {event.tags.map((tag) => (
                            <span key={tag} className="text-xs bg-white bg-opacity-10 text-gray-300 px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">by {event.organizer}</span>
                          <button className={`bg-gradient-to-r ${getEventTypeColor(event.type)} text-white px-4 py-2 rounded-lg text-sm transition-colors`}>
                            Join Event
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {activeTab === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-6 text-center"
                >
                  <VideoCameraIcon className="w-8 h-8 text-white mx-auto mb-2" />
                  <div className="text-white font-bold">Create Study Room</div>
                  <div className="text-blue-100 text-xs">Start a collaborative session</div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-center"
                >
                  <SparklesIcon className="w-8 h-8 text-white mx-auto mb-2" />
                  <div className="text-white font-bold">Host Event</div>
                  <div className="text-purple-100 text-xs">Organize competitions & workshops</div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 text-center"
                >
                  <AcademicCapIcon className="w-8 h-8 text-white mx-auto mb-2" />
                  <div className="text-white font-bold">Become Mentor</div>
                  <div className="text-green-100 text-xs">Share your expertise</div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-yellow-500 to-red-600 rounded-xl p-6 text-center"
                >
                  <UsersIcon className="w-8 h-8 text-white mx-auto mb-2" />
                  <div className="text-white font-bold">Form Study Group</div>
                  <div className="text-yellow-100 text-xs">Find study partners</div>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CollaborationHub;