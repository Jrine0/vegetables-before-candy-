import React from 'react';
import { motion } from 'framer-motion';

interface NFTViewer3DProps {
  nftType: string;
  level: number;
  rarity: string;
  title: string;
  size?: 'sm' | 'md' | 'lg';
  autoRotate?: boolean;
}

const NFTViewer3DSimple: React.FC<NFTViewer3DProps> = ({
  nftType,
  level,
  rarity,
  title,
  size = 'md',
  autoRotate = true
}) => {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-48 h-48'
  };

  const getRarityColor = () => {
    switch (rarity) {
      case 'mythic': return 'from-red-400 to-red-600';
      case 'legendary': return 'from-yellow-400 to-yellow-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      default: return 'from-green-400 to-green-600';
    }
  };

  const getNFTIcon = () => {
    switch (nftType.toLowerCase()) {
      case 'gpa':
      case 'academic':
        return '🎓';
      case 'research':
      case 'publication':
        return '🔬';
      case 'leadership':
      case 'extracurricular':
        return '👑';
      case 'competition':
      case 'award':
        return '🏆';
      default:
        return '⭐';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`${sizeClasses[size]} rounded-2xl overflow-hidden bg-gradient-to-br ${getRarityColor()} p-4 flex flex-col items-center justify-center relative`}
    >
      {/* Main NFT Icon */}
      <motion.div
        animate={autoRotate ? { rotate: 360 } : {}}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="text-4xl mb-2"
      >
        {getNFTIcon()}
      </motion.div>
      
      {/* Level Indicator */}
      <div className="text-white font-bold text-sm">
        Level {level}
      </div>
      
      {/* Rarity Badge */}
      <div className="absolute top-1 right-1 text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded-full capitalize">
        {rarity}
      </div>
      
      {/* Animated Border */}
      <div className="absolute inset-0 rounded-2xl border-2 border-white opacity-30 animate-pulse"></div>
    </motion.div>
  );
};

export default NFTViewer3DSimple;