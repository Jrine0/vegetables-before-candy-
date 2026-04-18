import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../src/contexts/AuthContext';
import Layout from '../../src/components/Layout/Layout';
import MintingCeremony from '../../src/components/NFT/MintingCeremony';
import { achievementAPI, nftAPI } from '../../src/lib/api';
import { motion } from 'framer-motion';
import {
  AcademicCapIcon,
  BeakerIcon,
  UserGroupIcon,
  TrophyIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  DocumentTextIcon,
  SparklesIcon,
  CubeIcon,
  ArrowLeftIcon
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
  nftTokens?: any[];
}

const AchievementDetailPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMintingCeremony, setShowMintingCeremony] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (id && typeof id === 'string') {
      fetchAchievement(id);
    }
  }, [user, authLoading, router, id]);

  const fetchAchievement = async (achievementId: string) => {
    try {
      const response = await achievementAPI.getById(achievementId);
      setAchievement(response.data);
    } catch (error) {
      console.error('Failed to fetch achievement:', error);
      toast.error('Failed to load achievement');
      router.push('/achievements');
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

  const handleMintNFT = async () => {
    if (!achievement) return;

    try {
      // Generate NFT metadata based on achievement
      const nftData = {
        level: achievement.type === 'gpa' && achievement.gpaValue 
          ? Math.ceil(achievement.gpaValue) 
          : Math.floor(Math.random() * 5) + 1,
        rarity: generateRarity(achievement),
        evolutionPoints: Math.floor(Math.random() * 100) + 50,
      };

      setShowMintingCeremony(true);
      
      // Simulate minting process (in real app, this would call the smart contract)
      setTimeout(() => {
        toast.success('NFT minted successfully!');
        fetchAchievement(achievement.id); // Refresh to show minted NFT
      }, 10000); // Match ceremony duration
    } catch (error) {
      console.error('Failed to mint NFT:', error);
      toast.error('Failed to mint NFT');
    }
  };

  const generateRarity = (achievement: Achievement): string => {
    if (achievement.type === 'gpa' && achievement.gpaValue) {
      if (achievement.gpaValue >= 3.9) return 'legendary';
      if (achievement.gpaValue >= 3.7) return 'epic';
      if (achievement.gpaValue >= 3.5) return 'rare';
      return 'common';
    }
    
    // For non-GPA achievements, assign random rarity weighted towards lower rarities
    const rand = Math.random();
    if (rand < 0.05) return 'mythic';
    if (rand < 0.15) return 'legendary';
    if (rand < 0.35) return 'epic';
    if (rand < 0.60) return 'rare';
    return 'common';
  };

  if (authLoading || loading) {
    return (
      <Layout title="Achievement Details - future me">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading achievement details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user || !achievement) return null;

  const Icon = getAchievementIcon(achievement.type);
  const StatusIcon = getStatusIcon(achievement.verified);
  const hasNFT = achievement.nftTokens && achievement.nftTokens.length > 0;

  return (
    <Layout title={`${achievement.title} - future me`}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Achievements
            </button>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="h-16 w-16 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Icon className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-gray-900">
                  {achievement.title}
                </h1>
                <div className="mt-2 flex items-center space-x-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                    {achievement.type} Achievement
                  </span>
                  <div className="flex items-center">
                    <StatusIcon className={`h-5 w-5 ${getStatusColor(achievement.verified)} mr-1`} />
                    <span className={`text-sm font-medium ${getStatusColor(achievement.verified)}`}>
                      {achievement.verified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Description
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {achievement.description}
                </p>
              </div>

              {/* Achievement Details */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Achievement Details
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Type:</span>
                    <span className="text-sm text-gray-900 capitalize">{achievement.type}</span>
                  </div>
                  
                  {achievement.gpaValue && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">GPA Value:</span>
                      <span className="text-sm text-gray-900">{achievement.gpaValue}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Submitted:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(achievement.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  {achievement.verified && achievement.verifiedAt && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Verified:</span>
                      <span className="text-sm text-gray-900">
                        {new Date(achievement.verifiedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Proof Documentation */}
              {achievement.proofUrl && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Proof Documentation
                  </h2>
                  <div className="flex items-center space-x-3">
                    <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                    <a
                      href={achievement.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 underline"
                    >
                      View uploaded proof
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* NFT Status */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  NFT Status
                </h2>
                
                {!achievement.verified ? (
                  <div className="text-center py-6">
                    <ClockIcon className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Awaiting Verification
                    </h3>
                    <p className="text-sm text-gray-500">
                      Your achievement is being reviewed. You'll be able to mint an NFT once it's verified.
                    </p>
                  </div>
                ) : hasNFT ? (
                  <div className="text-center py-6">
                    <CubeIcon className="h-12 w-12 text-green-400 mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      NFT Minted
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Your achievement has been minted as an NFT!
                    </p>
                    <button
                      onClick={() => router.push('/nfts')}
                      className="text-primary-600 hover:text-primary-700 underline text-sm"
                    >
                      View in Collection
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <SparklesIcon className="h-12 w-12 text-primary-600 mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Ready to Mint
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Your achievement has been verified! You can now mint it as an NFT.
                    </p>
                    <button
                      onClick={handleMintNFT}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                    >
                      <SparklesIcon className="h-4 w-4 mr-2" />
                      Mint NFT
                    </button>
                  </div>
                )}
              </div>

              {/* Achievement Stats */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Achievement Value
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Rarity Potential:</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {generateRarity(achievement)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">NFT Level:</span>
                    <span className="text-sm font-medium text-gray-900">
                      Level {achievement.type === 'gpa' && achievement.gpaValue 
                        ? Math.ceil(achievement.gpaValue) 
                        : Math.floor(Math.random() * 5) + 1}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Evolution Points:</span>
                    <span className="text-sm font-medium text-gray-900">
                      +{Math.floor(Math.random() * 100) + 50}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Minting Ceremony Modal */}
      {showMintingCeremony && achievement && (
        <MintingCeremony
          achievement={{
            id: achievement.id,
            title: achievement.title,
            type: achievement.type,
            description: achievement.description
          }}
          nft={{
            level: achievement.type === 'gpa' && achievement.gpaValue 
              ? Math.ceil(achievement.gpaValue) 
              : Math.floor(Math.random() * 5) + 1,
            rarity: generateRarity(achievement),
            evolutionPoints: Math.floor(Math.random() * 100) + 50
          }}
          onComplete={() => setShowMintingCeremony(false)}
          isVisible={showMintingCeremony}
        />
      )}
    </Layout>
  );
};

export default AchievementDetailPage;