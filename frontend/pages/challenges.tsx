import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/contexts/AuthContext';
import Layout from '../src/components/Layout/Layout';
import TournamentSystem from '../src/components/Challenges/TournamentSystem';
import { motion } from 'framer-motion';

const ChallengesPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <Layout title="Achievement Challenges - future me">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading challenges...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout title="Achievement Challenges - future me">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              🏆 Achievement Challenges
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Compete with students worldwide, showcase your achievements, and earn exclusive NFT rewards in exciting tournaments
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-primary-600">150+</div>
                <div className="text-sm text-gray-600">Active Competitors</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-green-600">25</div>
                <div className="text-sm text-gray-600">Universities</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-purple-600">$50K+</div>
                <div className="text-sm text-gray-600">Prize Pool</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-yellow-600">12</div>
                <div className="text-sm text-gray-600">NFT Rewards</div>
              </div>
            </div>
          </motion.div>

          {/* Tournament System */}
          <TournamentSystem />
        </div>
      </div>
    </Layout>
  );
};

export default ChallengesPage;