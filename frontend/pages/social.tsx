import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/contexts/AuthContext';
import Layout from '../src/components/Layout/Layout';
import SocialIntegrations from '../src/components/Social/SocialIntegrations';
import { motion } from 'framer-motion';
import {
  UserIcon,
  CodeBracketIcon,
  DevicePhoneMobileIcon,
  LinkIcon,
  SparklesIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';

const SocialPage: React.FC = () => {
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
      <Layout title="Social Integrations - future me">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading social integrations...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout title="Social Integrations - future me">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              🔗 Professional Integrations
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect your LinkedIn and GitHub profiles to automatically import achievements and showcase your portfolio in AR
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow p-4">
                <UserIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-sm font-medium">LinkedIn Import</div>
                <div className="text-xs text-gray-600">Professional Profile</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <CodeBracketIcon className="h-8 w-8 text-gray-900 mx-auto mb-2" />
                <div className="text-sm font-medium">GitHub Analysis</div>
                <div className="text-xs text-gray-600">Code Contributions</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <DevicePhoneMobileIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-sm font-medium">AR Portfolio</div>
                <div className="text-xs text-gray-600">3D NFT Viewer</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <DocumentCheckIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-sm font-medium">Auto-Generated</div>
                <div className="text-xs text-gray-600">Smart Achievements</div>
              </div>
            </div>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl p-8 mb-12"
          >
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <LinkIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">One-Click Import</h3>
                <p className="text-sm text-gray-600">
                  Instantly import your professional experience, education, and certifications from LinkedIn
                </p>
              </div>
              <div className="text-center">
                <SparklesIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
                <p className="text-sm text-gray-600">
                  Advanced algorithms analyze your GitHub contributions and generate achievement recommendations
                </p>
              </div>
              <div className="text-center">
                <DevicePhoneMobileIcon className="h-12 w-12 text-pink-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AR Experience</h3>
                <p className="text-sm text-gray-600">
                  View and share your NFT achievements in immersive augmented reality on mobile devices
                </p>
              </div>
            </div>
          </motion.div>

          {/* Social Integrations Component */}
          <SocialIntegrations />
          
          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Why Connect Your Profiles?
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-semibold mb-2">Save Time</h3>
                <p className="text-sm text-gray-600">
                  Automatically import achievements instead of manually entering them
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-semibold mb-2">Better Matches</h3>
                <p className="text-sm text-gray-600">
                  More comprehensive profile data leads to better career recommendations
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-3xl mb-3">🏆</div>
                <h3 className="font-semibold mb-2">Discover Hidden Achievements</h3>
                <p className="text-sm text-gray-600">
                  AI analysis may find achievements you didn't realize were worth highlighting
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default SocialPage;