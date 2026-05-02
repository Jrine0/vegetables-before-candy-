'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useWebSocket } from '../../contexts/WebSocketContext';
import {
  SparklesIcon,
  TrophyIcon,
  StarIcon,
  FireIcon,
  GiftIcon,
  ShareIcon,
  HeartIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import {
  SparklesIcon as SparklesSolid,
  StarIcon as StarSolid,
  TrophyIcon as TrophySolid
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

// Dynamic import for 3D component to prevent SSR issues
const NFTViewer3D = dynamic(
  () => import('../3D/NFTViewer3DSimple'),
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

interface MintingCeremonyProps {
  achievement: {
    id: string;
    title: string;
    type: string;
    description: string;
  };
  nft: {
    level: number;
    rarity: string;
    evolutionPoints: number;
  };
  onComplete: () => void;
  isVisible: boolean;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  emoji: string;
  life: number;
  maxLife: number;
}

const MintingCeremony: React.FC<MintingCeremonyProps> = ({
  achievement,
  nft,
  onComplete,
  isVisible
}) => {
  const [stage, setStage] = useState<'preparing' | 'minting' | 'revealing' | 'celebrating' | 'sharing'>('preparing');
  const [particles, setParticles] = useState<Particle[]>([]);
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { emitNFTMinted } = useWebSocket();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  
  const rarityColors = {
    common: { bg: 'from-gray-400 to-gray-600', text: 'text-gray-100', glow: 'shadow-gray-500/50' },
    rare: { bg: 'from-blue-400 to-blue-600', text: 'text-blue-100', glow: 'shadow-blue-500/50' },
    epic: { bg: 'from-purple-400 to-purple-600', text: 'text-purple-100', glow: 'shadow-purple-500/50' },
    legendary: { bg: 'from-yellow-400 to-yellow-600', text: 'text-yellow-100', glow: 'shadow-yellow-500/50' },
    mythic: { bg: 'from-red-400 to-red-600', text: 'text-red-100', glow: 'shadow-red-500/50' }
  };

  const rarityEmojis = {
    common: ['⭐', '✨', '💫'],
    rare: ['🌟', '💎', '🔵', '❄️'],
    epic: ['🟣', '🔮', '👑', '💜'],
    legendary: ['🏆', '🥇', '⚡', '🌅', '💰'],
    mythic: ['🔥', '💥', '🌈', '🎆', '👑']
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isVisible || !mounted) return;

    // Start the ceremony sequence
    const sequence = async () => {
      // Stage 1: Preparing (2 seconds)
      setStage('preparing');
      await delay(2000);
      
      // Stage 2: Minting (3 seconds with progress)
      setStage('minting');
      for (let i = 0; i <= 100; i += 2) {
        setProgress(i);
        await delay(30);
      }
      
      // Stage 3: Revealing (2 seconds)
      setStage('revealing');
      createConfetti();
      await delay(2000);
      
      // Stage 4: Celebrating (4 seconds)
      setStage('celebrating');
      createFireworks();
      emitNFTMinted({ achievementId: achievement.id, nft });
      await delay(4000);
      
      // Stage 5: Sharing (permanent until user closes)
      setStage('sharing');
    };

    sequence();
    
    // Start particle animation
    startParticleAnimation();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisible, mounted]);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const createConfetti = () => {
    if (typeof window === 'undefined') return;
    
    const newParticles: Particle[] = [];
    const emojis = rarityEmojis[nft.rarity as keyof typeof rarityEmojis] || ['⭐'];
    
    for (let i = 0; i < 100; i++) {
      newParticles.push({
        id: `confetti-${i}`,
        x: Math.random() * window.innerWidth,
        y: -20,
        vx: (Math.random() - 0.5) * 10,
        vy: Math.random() * 5 + 2,
        size: Math.random() * 20 + 10,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        life: 0,
        maxLife: 3000 + Math.random() * 2000
      });
    }
    
    setParticles(prev => [...prev, ...newParticles]);
  };

  const createFireworks = () => {
    if (typeof window === 'undefined') return;
    
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'];
    const emojis = ['🎆', '🎇', '✨', '🌟', '💫', '⭐'];
    
    for (let burst = 0; burst < 5; burst++) {
      setTimeout(() => {
        const centerX = Math.random() * window.innerWidth;
        const centerY = Math.random() * (window.innerHeight / 2) + 100;
        const newParticles: Particle[] = [];
        
        for (let i = 0; i < 20; i++) {
          const angle = (i / 20) * Math.PI * 2;
          const velocity = Math.random() * 8 + 4;
          
          newParticles.push({
            id: `firework-${burst}-${i}`,
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            size: Math.random() * 25 + 15,
            color: colors[Math.floor(Math.random() * colors.length)],
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            life: 0,
            maxLife: 2000 + Math.random() * 1000
          });
        }
        
        setParticles(prev => [...prev, ...newParticles]);
      }, burst * 800);
    }
  };

  const startParticleAnimation = () => {
    const animate = () => {
      setParticles(prev => {
        return prev.map(particle => {
          const newParticle = {
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vy: particle.vy + 0.3, // gravity
            life: particle.life + 16 // assuming 60fps
          };
          
          return newParticle;
        }).filter(particle => {
          if (typeof window === 'undefined') return false;
          return particle.life < particle.maxLife &&
            particle.y < window.innerHeight + 100 &&
            particle.x > -100 &&
            particle.x < window.innerWidth + 100;
        });
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
  };

  const shareAchievement = () => {
    const shareText = `🎉 I just completed a reward-verified task for "${achievement.title}" on vegetables-before-candy! 🚀`;
    
    if (typeof window !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'New NFT Minted!',
        text: shareText,
        url: window.location.origin
      });
    } else if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(shareText);
      toast.success('Achievement copied to clipboard!');
    }
  };

  const rarityStyle = rarityColors[nft.rarity as keyof typeof rarityColors] || rarityColors.common;

  if (!mounted) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center"
        >
          {/* Particle Canvas */}
          <div className="absolute inset-0 pointer-events-none">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute text-4xl font-bold pointer-events-none select-none"
                style={{
                  left: particle.x,
                  top: particle.y,
                  fontSize: particle.size,
                  color: particle.color,
                  filter: 'drop-shadow(0 0 10px currentColor)'
                }}
                initial={{ scale: 0, rotate: 0 }}
                animate={{ 
                  scale: [0, 1.2, 1], 
                  rotate: 360,
                  opacity: [1, 1, 0]
                }}
                transition={{ 
                  duration: particle.maxLife / 1000,
                  ease: "easeOut"
                }}
              >
                {particle.emoji}
              </motion.div>
            ))}
          </div>

          {/* Main Content */}
          <div className="relative z-10 max-w-4xl mx-auto px-6">
            <AnimatePresence mode="wait">
              {/* Stage 1: Preparing */}
              {stage === 'preparing' && (
                <motion.div
                  key="preparing"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 mx-auto mb-8"
                  >
                    <div className={`w-full h-full rounded-full bg-gradient-to-r ${rarityStyle.bg} flex items-center justify-center shadow-2xl ${rarityStyle.glow}`}>
                      <SparklesSolid className="w-16 h-16 text-white" />
                    </div>
                  </motion.div>
                  
                  <h1 className="text-6xl font-bold text-white mb-4">
                    🎭 Preparing Your NFT
                  </h1>
                  <p className="text-2xl text-gray-300">
                    Channeling cosmic energy...
                  </p>
                </motion.div>
              )}

              {/* Stage 2: Minting */}
              {stage === 'minting' && (
                <motion.div
                  key="minting"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="w-40 h-40 mx-auto mb-8"
                  >
                    <div className={`w-full h-full rounded-full bg-gradient-to-r ${rarityStyle.bg} flex items-center justify-center shadow-2xl ${rarityStyle.glow}`}>
                      <TrophySolid className="w-20 h-20 text-white" />
                    </div>
                  </motion.div>
                  
                  <h1 className="text-6xl font-bold text-white mb-4">
                    ⚡ Minting NFT
                  </h1>
                  
                  <div className="w-full max-w-md mx-auto mb-6">
                    <div className="bg-gray-700 rounded-full h-4 overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${rarityStyle.bg} rounded-full`}
                        initial={{ width: '0%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                    <p className="text-white text-xl mt-4 font-bold">{progress}%</p>
                  </div>
                  
                  <p className="text-2xl text-gray-300">
                    Inscribing your achievement onto the blockchain...
                  </p>
                </motion.div>
              )}

              {/* Stage 3: Revealing */}
              {stage === 'revealing' && (
                <motion.div
                  key="revealing"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.3, 1] }}
                    transition={{ duration: 1, ease: "backOut" }}
                    className="mb-8"
                  >
                    <NFTViewer3D
                      nftType={achievement.type}
                      level={nft.level}
                      rarity={nft.rarity}
                      title={achievement.title}
                      size="lg"
                    />
                  </motion.div>
                  
                  <motion.h1
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-6xl font-bold text-white mb-4"
                  >
                    🎉 NFT Revealed!
                  </motion.h1>
                  
                  <motion.p
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl text-gray-300"
                  >
                    Behold your magnificent {nft.rarity} NFT!
                  </motion.p>
                </motion.div>
              )}

              {/* Stage 4: Celebrating */}
              {stage === 'celebrating' && (
                <motion.div
                  key="celebrating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{ 
                      y: [0, -20, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="mb-8"
                  >
                    <NFTViewer3D
                      nftType={achievement.type}
                      level={nft.level}
                      rarity={nft.rarity}
                      title={achievement.title}
                      size="lg"
                    />
                  </motion.div>
                  
                  <motion.h1
                    animate={{ 
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-7xl font-bold text-white mb-6"
                  >
                    🏆 LEGENDARY ACHIEVEMENT!
                  </motion.h1>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
                    <motion.div
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6"
                    >
                      <div className="text-4xl mb-2">{nft.level}</div>
                      <div className="text-white text-sm">Level</div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ y: 100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6"
                    >
                      <div className="text-4xl mb-2 capitalize">{nft.rarity}</div>
                      <div className="text-white text-sm">Rarity</div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ x: 100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.9 }}
                      className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6"
                    >
                      <div className="text-4xl mb-2">{nft.evolutionPoints}</div>
                      <div className="text-white text-sm">Evolution Points</div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Stage 5: Sharing */}
              {stage === 'sharing' && (
                <motion.div
                  key="sharing"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="mb-8">
                    <NFTViewer3D
                      nftType={achievement.type}
                      level={nft.level}
                      rarity={nft.rarity}
                      title={achievement.title}
                      size="lg"
                    />
                  </div>
                  
                  <h1 className="text-5xl font-bold text-white mb-4">
                    🎊 Congratulations!
                  </h1>
                  
                  <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                    Your <span className="font-bold capitalize">{nft.rarity}</span> NFT for 
                    "{achievement.title}" has been successfully minted!
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-4 mb-8">
                    <button
                      onClick={shareAchievement}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold transition-colors shadow-lg"
                    >
                      <ShareIcon className="w-6 h-6" />
                      <span>Share Achievement</span>
                    </button>
                    
                    <button
                      onClick={onComplete}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-bold transition-colors shadow-lg"
                    >
                      <CheckCircleIcon className="w-6 h-6" />
                      <span>Continue</span>
                    </button>
                  </div>
                  
                  <p className="text-gray-400 text-sm">
                    Your NFT has been added to your collection and is now visible on the blockchain!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MintingCeremony;