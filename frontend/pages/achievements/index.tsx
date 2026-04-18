import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../src/contexts/AuthContext';
import Layout from '../../src/components/Layout/Layout';
import { achievementAPI } from '../../src/lib/api';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  TrophyIcon,
  AcademicCapIcon,
  BeakerIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: string;
  gpaValue?: number;
  proofUrl?: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const AchievementsPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchAchievements();
    }
  }, [user, authLoading, router]);

  const fetchAchievements = async () => {
    try {
      const response = await achievementAPI.getUserAchievements();
      setAchievements(response.data);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'gpa':
        return AcademicCapIcon;
      case 'research':
        return BeakerIcon;
      case 'leadership':
        return UserGroupIcon;
      default:
        return TrophyIcon;
    }
  };

  const getStatusColor = (verified: boolean) => {
    return verified ? 'text-green-600' : 'text-yellow-600';
  };

  const getStatusIcon = (verified: boolean) => {
    return verified ? CheckCircleIcon : ClockIcon;
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'verified') return achievement.verified;
    if (filter === 'pending') return !achievement.verified;
    return true;
  });

  if (authLoading || loading) {
    return (
      <Layout title="My Achievements - future me">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your achievements...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout title="My Achievements - future me">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl">
                🏆 My Achievements
              </h1>
              <p className="mt-1 text-lg text-gray-500">
                Track your academic accomplishments and mint them as NFTs
              </p>
            </div>
            <div className="mt-4 md:mt-0 md:ml-4">
              <button
                onClick={() => router.push('/achievements/new')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Add Achievement
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrophyIcon className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Achievements
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {achievements.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Verified
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {achievements.filter(a => a.verified).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pending Verification
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {achievements.filter(a => !a.verified).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-8">
            <div className="sm:hidden">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="all">All Achievements</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="hidden sm:block">
              <nav className="flex space-x-8">
                {[
                  { key: 'all', name: 'All Achievements' },
                  { key: 'verified', name: 'Verified' },
                  { key: 'pending', name: 'Pending' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key as any)}
                    className={`${
                      filter === tab.key
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Achievements List */}
          <div className="mt-8">
            {filteredAchievements.length === 0 ? (
              <div className="text-center py-12">
                <TrophyIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No achievements</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by uploading your first achievement.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => router.push('/achievements/new')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Add Achievement
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAchievements.map((achievement, index) => {
                  const Icon = getAchievementIcon(achievement.type);
                  const StatusIcon = getStatusIcon(achievement.verified);
                  
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(`/achievements/${achievement.id}`)}
                    >
                      <div className="p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <Icon className="h-8 w-8 text-primary-600" />
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-medium text-gray-900 truncate">
                                {achievement.title}
                              </h3>
                              <StatusIcon className={`h-5 w-5 ${getStatusColor(achievement.verified)}`} />
                            </div>
                            <p className="text-sm text-gray-500 capitalize">
                              {achievement.type} Achievement
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {achievement.description}
                          </p>
                        </div>

                        {achievement.gpaValue && (
                          <div className="mt-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              GPA: {achievement.gpaValue}
                            </span>
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <span>
                              {new Date(achievement.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {achievement.verified ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AchievementsPage;