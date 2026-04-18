import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/contexts/AuthContext';
import Layout from '../src/components/Layout/Layout';
import UniversityComparison from '../src/components/Analytics/UniversityComparison';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  TrophyIcon,
  AcademicCapIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

const UniversitiesPage: React.FC = () => {
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
      <Layout title="University Comparison - future me">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading university analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout title="University Comparison - future me">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              🏛️ University Analytics
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Compare academic performance, research output, and achievement metrics across top universities worldwide
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="bg-white rounded-lg shadow p-4">
                <AcademicCapIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                <div className="text-sm font-medium">Academic Excellence</div>
                <div className="text-xs text-gray-600">GPA & Performance</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <ChartBarIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-sm font-medium">Research Impact</div>
                <div className="text-xs text-gray-600">Papers & Citations</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <TrophyIcon className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-sm font-medium">Achievement Rate</div>
                <div className="text-xs text-gray-600">NFTs & Certifications</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <UsersIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-sm font-medium">Student Engagement</div>
                <div className="text-xs text-gray-600">Platform Activity</div>
              </div>
            </div>
          </motion.div>

          {/* University Comparison Component */}
          <UniversityComparison />
        </div>
      </div>
    </Layout>
  );
};

export default UniversitiesPage;