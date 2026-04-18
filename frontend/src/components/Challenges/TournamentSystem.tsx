import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import {
  TrophyIcon,
  FireIcon,
  UsersIcon,
  ClockIcon,
  CalendarIcon,
  SparklesIcon,
  ChartBarIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import {
  TrophyIcon as TrophySolid,
  StarIcon as StarSolid
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'gpa' | 'research' | 'leadership' | 'mixed';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  currentParticipants: number;
  prize: {
    type: 'nft' | 'points' | 'badge';
    value: string;
    rarity?: string;
  };
  requirements: {
    minGPA?: number;
    minAchievements?: number;
    requiredTypes?: string[];
    university?: string[];
  };
  leaderboard: {
    userId: string;
    userName: string;
    university: string;
    score: number;
    rank: number;
    achievements: number;
  }[];
  status: 'upcoming' | 'active' | 'completed';
  isParticipating?: boolean;
}

const TournamentSystem: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useWebSocket();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
    
    // Real-time updates for tournament changes
    if (socket) {
      socket.on('tournament-update', handleTournamentUpdate);
      socket.on('challenge-leaderboard-update', handleLeaderboardUpdate);
      
      return () => {
        socket.off('tournament-update', handleTournamentUpdate);
        socket.off('challenge-leaderboard-update', handleLeaderboardUpdate);
      };
    }
  }, [socket]);

  const loadChallenges = async () => {
    try {
      // Mock data for demo - in real app, this would fetch from API
      const mockChallenges: Challenge[] = [
        {
          id: '1',
          title: '🏆 GPA Excellence Challenge',
          description: 'Compete to showcase the highest GPA achievements across universities',
          type: 'gpa',
          difficulty: 'intermediate',
          startDate: new Date('2024-08-01'),
          endDate: new Date('2024-08-31'),
          maxParticipants: 100,
          currentParticipants: 67,
          prize: {
            type: 'nft',
            value: 'Golden Academic Crown NFT',
            rarity: 'legendary'
          },
          requirements: {
            minGPA: 3.5,
            minAchievements: 3
          },
          leaderboard: [
            { userId: '1', userName: 'Sarah Chen', university: 'MIT', score: 3.95, rank: 1, achievements: 8 },
            { userId: '2', userName: 'Alex Johnson', university: 'Stanford', score: 3.92, rank: 2, achievements: 6 },
            { userId: '3', userName: 'Maya Patel', university: 'Harvard', score: 3.89, rank: 3, achievements: 7 },
          ],
          status: 'active'
        },
        {
          id: '2',
          title: '🔬 Research Innovation Tournament',
          description: 'Battle of the brightest minds - showcase your research achievements',
          type: 'research',
          difficulty: 'advanced',
          startDate: new Date('2024-08-15'),
          endDate: new Date('2024-09-15'),
          maxParticipants: 50,
          currentParticipants: 23,
          prize: {
            type: 'nft',
            value: 'Mythic Research Crystal NFT',
            rarity: 'mythic'
          },
          requirements: {
            minAchievements: 1,
            requiredTypes: ['research']
          },
          leaderboard: [
            { userId: '1', userName: 'Dr. Emily Wong', university: 'Caltech', score: 95, rank: 1, achievements: 12 },
            { userId: '2', userName: 'James Liu', university: 'MIT', score: 91, rank: 2, achievements: 8 },
          ],
          status: 'active'
        },
        {
          id: '3',
          title: '👥 Leadership Champions Cup',
          description: 'Prove your leadership excellence and inspire others',
          type: 'leadership',
          difficulty: 'expert',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-09-30'),
          maxParticipants: 75,
          currentParticipants: 12,
          prize: {
            type: 'nft',
            value: 'Epic Leadership Medallion NFT',
            rarity: 'epic'
          },
          requirements: {
            minAchievements: 2,
            requiredTypes: ['leadership']
          },
          leaderboard: [],
          status: 'upcoming'
        },
        {
          id: '4',
          title: '🌟 Ultimate Scholar Challenge',
          description: 'The ultimate test - excel across all achievement categories',
          type: 'mixed',
          difficulty: 'expert',
          startDate: new Date('2024-07-01'),
          endDate: new Date('2024-07-31'),
          maxParticipants: 200,
          currentParticipants: 156,
          prize: {
            type: 'nft',
            value: 'Diamond Scholar Crown NFT',
            rarity: 'mythic'
          },
          requirements: {
            minGPA: 3.7,
            minAchievements: 5,
            requiredTypes: ['gpa', 'research', 'leadership']
          },
          leaderboard: [
            { userId: '1', userName: 'Victoria Chang', university: 'Yale', score: 98, rank: 1, achievements: 15 },
            { userId: '2', userName: 'Marcus Thompson', university: 'Princeton', score: 96, rank: 2, achievements: 13 },
            { userId: '3', userName: 'Lisa Rodriguez', university: 'Columbia', score: 94, rank: 3, achievements: 11 },
          ],
          status: 'completed'
        }
      ];

      setChallenges(mockChallenges);
    } catch (error) {
      console.error('Failed to load challenges:', error);
      toast.error('Failed to load tournament challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleTournamentUpdate = (data: any) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === data.challengeId 
        ? { ...challenge, currentParticipants: data.participants }
        : challenge
    ));
  };

  const handleLeaderboardUpdate = (data: any) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === data.challengeId 
        ? { ...challenge, leaderboard: data.leaderboard }
        : challenge
    ));
  };

  const joinChallenge = async (challenge: Challenge) => {
    try {
      // Mock API call - in real app, this would register the user
      toast.success(`Successfully joined ${challenge.title}!`);
      setChallenges(prev => prev.map(c => 
        c.id === challenge.id 
          ? { ...c, currentParticipants: c.currentParticipants + 1, isParticipating: true }
          : c
      ));
    } catch (error) {
      toast.error('Failed to join challenge');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-blue-600 bg-blue-100';
      case 'advanced': return 'text-purple-600 bg-purple-100';
      case 'expert': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'mythic': return 'text-red-600';
      case 'legendary': return 'text-yellow-600';
      case 'epic': return 'text-purple-600';
      case 'rare': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'upcoming': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (filter === 'all') return true;
    return challenge.status === filter;
  });

  const canJoinChallenge = (challenge: Challenge): boolean => {
    if (challenge.status !== 'active' && challenge.status !== 'upcoming') return false;
    if (challenge.currentParticipants >= challenge.maxParticipants) return false;
    if (challenge.isParticipating) return false;
    
    // Check requirements (mock user data check)
    if (challenge.requirements.minGPA && 3.75 < challenge.requirements.minGPA) return false;
    if (challenge.requirements.minAchievements && 5 < challenge.requirements.minAchievements) return false;
    
    return true;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          🏆 Achievement Tournaments
        </h2>
        <p className="text-lg text-gray-600">
          Compete with students worldwide and earn exclusive rewards
        </p>
      </div>

      {/* Filters */}
      <div className="flex justify-center">
        <div className="bg-white rounded-lg shadow p-1 flex space-x-1">
          {[
            { key: 'all', label: 'All Challenges' },
            { key: 'active', label: 'Active' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Challenge Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {filteredChallenges.map((challenge, index) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
          >
            {/* Challenge Header */}
            <div className="p-6 bg-gradient-to-r from-primary-600 to-purple-600 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{challenge.title}</h3>
                  <p className="text-primary-100 text-sm mb-3">
                    {challenge.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(challenge.difficulty)} bg-white bg-opacity-20 text-white`}>
                      {challenge.difficulty}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(challenge.status)} bg-white bg-opacity-20 text-white`}>
                      {challenge.status}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  {challenge.status === 'active' && <FireIcon className="h-8 w-8 text-yellow-300 animate-pulse" />}
                  {challenge.status === 'upcoming' && <ClockIcon className="h-8 w-8 text-blue-300" />}
                  {challenge.status === 'completed' && <TrophySolid className="h-8 w-8 text-yellow-300" />}
                </div>
              </div>
            </div>

            {/* Challenge Details */}
            <div className="p-6">
              {/* Timeline */}
              <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <span>{challenge.startDate.toLocaleDateString()}</span>
                </div>
                <span>-</span>
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <span>{challenge.endDate.toLocaleDateString()}</span>
                </div>
              </div>

              {/* Participants */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <UsersIcon className="h-4 w-4 mr-1" />
                  <span>{challenge.currentParticipants}/{challenge.maxParticipants} participants</span>
                </div>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full" 
                    style={{width: `${(challenge.currentParticipants / challenge.maxParticipants) * 100}%`}}
                  ></div>
                </div>
              </div>

              {/* Prize */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrophyIcon className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-gray-900">Prize</span>
                </div>
                <div className={`font-bold ${getRarityColor(challenge.prize.rarity)}`}>
                  {challenge.prize.value}
                </div>
              </div>

              {/* Requirements */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {challenge.requirements.minGPA && (
                    <div>• Minimum GPA: {challenge.requirements.minGPA}</div>
                  )}
                  {challenge.requirements.minAchievements && (
                    <div>• Minimum achievements: {challenge.requirements.minAchievements}</div>
                  )}
                  {challenge.requirements.requiredTypes && (
                    <div>• Required types: {challenge.requirements.requiredTypes.join(', ')}</div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex space-x-3">
                {challenge.leaderboard.length > 0 && (
                  <button
                    onClick={() => setSelectedChallenge(challenge)}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
                  >
                    <ChartBarIcon className="h-4 w-4 inline mr-2" />
                    View Leaderboard
                  </button>
                )}
                
                {canJoinChallenge(challenge) ? (
                  <button
                    onClick={() => joinChallenge(challenge)}
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors text-center"
                  >
                    <SparklesIcon className="h-4 w-4 inline mr-2" />
                    Join Challenge
                  </button>
                ) : challenge.isParticipating ? (
                  <button
                    disabled
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium text-center"
                  >
                    ✅ Participating
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 bg-gray-300 text-gray-500 px-4 py-2 rounded-lg font-medium text-center"
                  >
                    Not Eligible
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Leaderboard Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    🏆 {selectedChallenge.title} Leaderboard
                  </h3>
                  <button
                    onClick={() => setSelectedChallenge(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedChallenge.leaderboard.map((entry, index) => (
                    <div
                      key={entry.userId}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        index === 0 ? 'bg-yellow-50 border-yellow-200' :
                        index === 1 ? 'bg-gray-50 border-gray-200' :
                        index === 2 ? 'bg-orange-50 border-orange-200' :
                        'bg-gray-50'
                      } border`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          {index === 0 && <TrophySolid className="h-5 w-5 text-yellow-500" />}
                          {index === 1 && <StarSolid className="h-5 w-5 text-gray-500" />}
                          {index === 2 && <StarSolid className="h-5 w-5 text-orange-500" />}
                          {index > 2 && <span className="text-gray-500 font-bold">#{entry.rank}</span>}
                        </div>
                        <div>
                          <div className="font-medium">{entry.userName}</div>
                          <div className="text-sm text-gray-500">{entry.university}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{entry.score}</div>
                        <div className="text-sm text-gray-500">{entry.achievements} achievements</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentSystem;