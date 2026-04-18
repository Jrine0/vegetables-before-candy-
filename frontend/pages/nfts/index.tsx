import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useAuth } from '../../src/contexts/AuthContext';
import Layout from '../../src/components/Layout/Layout';
import { nftAPI } from '../../src/lib/api';

// Dynamic import for 3D component to prevent SSR issues
const NFTViewer3D = dynamic(
  () => import('../../src/components/3D/NFTViewer3DSimple'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 rounded-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <span className="text-white text-xs">Loading 3D...</span>
        </div>
      </div>
    )
  }
);
import { motion } from 'framer-motion';
import {
  CubeIcon,
  EyeIcon,
  ShareIcon,
  SparklesIcon,
  TrophyIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface NFT {
  id: string;
  nftType: string;
  level: number;
  rarity: string;
  evolutionPoints: number;
  minted: boolean;
  mintedAt?: string;
  achievement: {
    title: string;
    type: string;
    description: string;
    verified: boolean;
  };
}

const NFTCollectionPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'minted' | 'ready'>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchNFTs();
    }
  }, [user, authLoading, router]);

  const fetchNFTs = async () => {
    try {
      const response = await nftAPI.getUserNFTs();
      setNfts(response.data);
    } catch (error) {
      console.error('Failed to fetch NFTs:', error);
      toast.error('Failed to load NFT collection');
    } finally {
      setLoading(false);
    }
  };

  const shareNFT = (nft: NFT) => {
    if (navigator.share) {
      navigator.share({
        title: `Check out my ${nft.achievement.title} NFT!`,
        text: `I just earned a ${nft.rarity} level ${nft.level} NFT for my ${nft.achievement.title} achievement!`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'mythic': return 'text-red-600 bg-red-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredNFTs = nfts.filter(nft => {
    if (filter === 'minted') return nft.minted;
    if (filter === 'ready') return !nft.minted && nft.achievement.verified;
    return true;
  });

  const mintedCount = nfts.filter(nft => nft.minted).length;
  const readyToMintCount = nfts.filter(nft => !nft.minted && nft.achievement.verified).length;

  if (authLoading || loading) {
    return (
      <Layout title="My NFT Collection - future me">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your NFT collection...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout title="My NFT Collection - future me">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              🎨 My NFT Collection
            </h1>
            <p className="mt-3 text-lg text-gray-500">
              Your academic achievements as unique digital assets
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 sm:grid-cols-3 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CubeIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total NFTs
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {nfts.length}
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
                    <SparklesIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Minted NFTs
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {mintedCount}
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
                    <TrophyIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Ready to Mint
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {readyToMintCount}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={() => router.push('/achievements/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <TrophyIcon className="h-4 w-4 mr-2" />
              Add Achievement
            </button>
            
            <button
              onClick={() => router.push('/nfts/gallery-3d')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              3D Gallery View
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <div className="sm:hidden">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="all">All NFTs</option>
                <option value="minted">Minted</option>
                <option value="ready">Ready to Mint</option>
              </select>
            </div>
            <div className="hidden sm:block">
              <nav className="flex space-x-8">
                {[
                  { key: 'all', name: 'All NFTs', count: nfts.length },
                  { key: 'minted', name: 'Minted', count: mintedCount },
                  { key: 'ready', name: 'Ready to Mint', count: readyToMintCount },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key as any)}
                    className={`${
                      filter === tab.key
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                  >
                    <span>{tab.name}</span>
                    <span className="bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* NFT Collection */}
          <div>
            {filteredNFTs.length === 0 ? (
              <div className="text-center py-12">
                <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {filter === 'minted' ? 'No minted NFTs' : 
                   filter === 'ready' ? 'No NFTs ready to mint' : 'No NFTs yet'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filter === 'ready' 
                    ? 'Upload achievements and wait for verification to mint NFTs.'
                    : 'Get started by uploading your first achievement.'}
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => router.push('/achievements/new')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <TrophyIcon className="-ml-1 mr-2 h-5 w-5" />
                    Add Achievement
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredNFTs.map((nft, index) => (
                  <motion.div
                    key={nft.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    {/* 3D Preview */}
                    <div className="aspect-square bg-gradient-to-br from-primary-50 to-primary-100 p-4">
                      {mounted ? (
                        <NFTViewer3D
                          nftType={nft.nftType || nft.achievement.type}
                          level={nft.level}
                          rarity={nft.rarity}
                          title={nft.achievement.title}
                          size="md"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 rounded-2xl">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                            <span className="text-white text-xs">Loading 3D...</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* NFT Details */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate flex-1">
                          {nft.achievement.title}
                        </h3>
                        {nft.minted && (
                          <SparklesIcon className="h-4 w-4 text-green-500 ml-2" />
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                        {nft.achievement.description}
                      </p>

                      {/* NFT Stats */}
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                        <span>Level {nft.level}</span>
                        <span className={`px-2 py-1 rounded-full ${getRarityColor(nft.rarity)} capitalize font-medium`}>
                          {nft.rarity}
                        </span>
                      </div>

                      <div className="text-xs text-gray-500 mb-3">
                        Evolution: {nft.evolutionPoints} pts
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        {nft.minted ? (
                          <>
                            <button
                              onClick={() => shareNFT(nft)}
                              className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                            >
                              <ShareIcon className="h-3 w-3 mr-1" />
                              Share
                            </button>
                            <button
                              onClick={() => router.push(`/nfts/${nft.id}`)}
                              className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                            >
                              <EyeIcon className="h-3 w-3 mr-1" />
                              View
                            </button>
                          </>
                        ) : nft.achievement.verified ? (
                          <button
                            onClick={() => router.push(`/nfts/${nft.id}`)}
                            className="w-full inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                          >
                            <SparklesIcon className="h-3 w-3 mr-1" />
                            Mint NFT
                          </button>
                        ) : (
                          <div className="w-full text-center py-2 text-xs text-gray-500">
                            Awaiting verification
                          </div>
                        )}
                      </div>

                      {nft.mintedAt && (
                        <div className="mt-2 text-xs text-gray-400">
                          Minted: {new Date(nft.mintedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NFTCollectionPage;