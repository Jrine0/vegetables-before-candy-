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
  EyeIcon,
  CubeIcon,
  SparklesIcon,
  ArrowLeftIcon,
  ShareIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface NFT {
  id: string;
  nftType: string;
  level: number;
  rarity: string;
  evolutionPoints: number;
  minted: boolean;
  achievement: {
    title: string;
    type: string;
    description: string;
    verified: boolean;
  };
}

const NFT3DGalleryPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'showcase'>('grid');

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
      if (response.data.length > 0) {
        setSelectedNFT(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch NFTs:', error);
      toast.error('Failed to load NFTs');
    } finally {
      setLoading(false);
    }
  };

  const shareNFT = (nft: NFT) => {
    if (navigator.share) {
      navigator.share({
        title: `Check out my ${nft.achievement.title} NFT!`,
        text: `I just minted a ${nft.rarity} level ${nft.level} NFT for my ${nft.achievement.title} achievement!`,
        url: typeof window !== 'undefined' ? window.location.href : ''
      });
    } else {
      if (typeof window !== 'undefined') {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    }
  };

  if (authLoading || loading) {
    return (
      <Layout title="3D NFT Gallery - future me">
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-xl">Loading your 3D NFT collection...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  if (nfts.length === 0) {
    return (
      <Layout title="3D NFT Gallery - future me">
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
          <div className="text-center">
            <CubeIcon className="w-24 h-24 text-white opacity-50 mx-auto mb-8" />
            <h2 className="text-4xl font-bold text-white mb-4">No NFTs Yet</h2>
            <p className="text-gray-300 text-lg mb-8">
              Start by uploading achievements to mint your first 3D NFT!
            </p>
            <button
              onClick={() => router.push('/achievements/new')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-colors text-lg"
            >
              Upload Achievement
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="3D NFT Gallery - future me">
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => router.back()}
                className="flex items-center text-white hover:text-gray-300 transition-colors"
              >
                <ArrowLeftIcon className="w-6 h-6 mr-2" />
                Back
              </button>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'showcase' : 'grid')}
                  className="bg-white bg-opacity-20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors flex items-center space-x-2"
                >
                  <EyeIcon className="w-5 h-5" />
                  <span>{viewMode === 'grid' ? 'Showcase' : 'Grid'} View</span>
                </button>
              </div>
            </div>
            
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-bold text-white mb-4"
              >
                🎨 3D NFT Gallery
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-300 mb-8"
              >
                Experience your achievements in spectacular 3D
              </motion.p>
              
              <div className="flex justify-center items-center space-x-8 text-white">
                <div className="text-center">
                  <div className="text-2xl font-bold">{nfts.length}</div>
                  <div className="text-sm opacity-75">Total NFTs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {nfts.filter(nft => nft.rarity !== 'common').length}
                  </div>
                  <div className="text-sm opacity-75">Rare+</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {Math.round(nfts.reduce((sum, nft) => sum + nft.level, 0) / nfts.length)}
                  </div>
                  <div className="text-sm opacity-75">Avg Level</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {viewMode === 'showcase' && selectedNFT ? (
            /* Showcase View */
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* 3D Viewer */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-center"
              >
                <NFTViewer3D
                  nftType={selectedNFT.nftType || selectedNFT.achievement.type}
                  level={selectedNFT.level}
                  rarity={selectedNFT.rarity}
                  title={selectedNFT.achievement.title}
                  size="lg"
                />
              </motion.div>
              
              {/* Details */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-4xl font-bold text-white mb-2">
                    {selectedNFT.achievement.title}
                  </h2>
                  <p className="text-gray-300 text-lg">
                    {selectedNFT.achievement.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-2xl font-bold text-white">{selectedNFT.level}</div>
                    <div className="text-gray-300 text-sm">Level</div>
                  </div>
                  
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-2xl font-bold text-white capitalize">{selectedNFT.rarity}</div>
                    <div className="text-gray-300 text-sm">Rarity</div>
                  </div>
                  
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-2xl font-bold text-white">{selectedNFT.evolutionPoints}</div>
                    <div className="text-gray-300 text-sm">Evolution Points</div>
                  </div>
                  
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-2xl font-bold text-white">
                      {selectedNFT.achievement.verified ? '✅' : '⏳'}
                    </div>
                    <div className="text-gray-300 text-sm">
                      {selectedNFT.achievement.verified ? 'Verified' : 'Pending'}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => shareNFT(selectedNFT)}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl transition-colors"
                  >
                    <ShareIcon className="w-5 h-5" />
                    <span>Share</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-xl transition-colors">
                    <HeartIcon className="w-5 h-5" />
                    <span>Favorite</span>
                  </button>
                </div>
              </motion.div>
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {nfts.map((nft, index) => (
                <motion.div
                  key={nft.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer"
                  onClick={() => {
                    setSelectedNFT(nft);
                    setViewMode('showcase');
                  }}
                >
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 hover:bg-opacity-20 transition-all duration-300 transform group-hover:scale-105">
                    {/* 3D Viewer */}
                    <div className="mb-4">
                      <NFTViewer3D
                        nftType={nft.nftType || nft.achievement.type}
                        level={nft.level}
                        rarity={nft.rarity}
                        title={nft.achievement.title}
                        size="md"
                      />
                    </div>
                    
                    {/* Info */}
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-white mb-2 truncate">
                        {nft.achievement.title}
                      </h3>
                      
                      <div className="flex justify-center items-center space-x-4 text-sm text-gray-300">
                        <span>Level {nft.level}</span>
                        <span>•</span>
                        <span className="capitalize">{nft.rarity}</span>
                        {nft.achievement.verified && (
                          <>
                            <span>•</span>
                            <SparklesIcon className="w-4 h-4 text-green-400" />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {/* NFT Selection Grid for Showcase Mode */}
          {viewMode === 'showcase' && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Select NFT</h3>
              <div className="flex justify-center">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-4xl">
                  {nfts.map((nft) => (
                    <button
                      key={nft.id}
                      onClick={() => setSelectedNFT(nft)}
                      className={`group relative p-2 rounded-xl transition-all transform hover:scale-105 ${
                        selectedNFT?.id === nft.id
                          ? 'bg-indigo-600 bg-opacity-50 ring-2 ring-indigo-400'
                          : 'bg-white bg-opacity-10 hover:bg-opacity-20'
                      }`}
                    >
                      <NFTViewer3D
                        nftType={nft.nftType || nft.achievement.type}
                        level={nft.level}
                        rarity={nft.rarity}
                        title={nft.achievement.title}
                        size="sm"
                        autoRotate={false}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NFT3DGalleryPage;