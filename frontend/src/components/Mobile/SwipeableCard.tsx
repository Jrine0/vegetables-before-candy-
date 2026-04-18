import React, { useState } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { useGesture } from 'react-use-gesture';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
  swipeThreshold?: number;
  enabledDirections?: ('left' | 'right' | 'up' | 'down')[];
  leftAction?: {
    icon: React.ReactNode;
    color: string;
    label: string;
  };
  rightAction?: {
    icon: React.ReactNode;
    color: string;
    label: string;
  };
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className = '',
  swipeThreshold = 100,
  enabledDirections = ['left', 'right'],
  leftAction,
  rightAction
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Transform values for visual feedback
  const rotateZ = useTransform(x, [-200, 200], [-10, 10]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 0.8, 1, 0.8, 0.5]);
  
  // Action visibility
  const leftActionOpacity = useTransform(x, [0, -swipeThreshold], [0, 1]);
  const rightActionOpacity = useTransform(x, [0, swipeThreshold], [0, 1]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    
    const threshold = swipeThreshold;
    const velocity = info.velocity.x;
    const offset = info.offset.x;
    const offsetY = info.offset.y;

    // Check for swipe gestures based on offset and velocity
    if (enabledDirections.includes('left') && (offset < -threshold || velocity < -500)) {
      onSwipeLeft?.();
    } else if (enabledDirections.includes('right') && (offset > threshold || velocity > 500)) {
      onSwipeRight?.();
    } else if (enabledDirections.includes('up') && (offsetY < -threshold || info.velocity.y < -500)) {
      onSwipeUp?.();
    } else if (enabledDirections.includes('down') && (offsetY > threshold || info.velocity.y > 500)) {
      onSwipeDown?.();
    }

    // Spring back to center
    x.set(0);
    y.set(0);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Left Action Background */}
      {leftAction && (
        <motion.div
          className={`absolute inset-0 flex items-center justify-end pr-6 rounded-lg ${leftAction.color}`}
          style={{ opacity: leftActionOpacity }}
        >
          <div className="flex items-center space-x-2 text-white">
            {leftAction.icon}
            <span className="font-medium">{leftAction.label}</span>
          </div>
        </motion.div>
      )}

      {/* Right Action Background */}
      {rightAction && (
        <motion.div
          className={`absolute inset-0 flex items-center justify-start pl-6 rounded-lg ${rightAction.color}`}
          style={{ opacity: rightActionOpacity }}
        >
          <div className="flex items-center space-x-2 text-white">
            {rightAction.icon}
            <span className="font-medium">{rightAction.label}</span>
          </div>
        </motion.div>
      )}

      {/* Main Card */}
      <motion.div
        drag={enabledDirections.length > 0}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{
          x: enabledDirections.includes('left') || enabledDirections.includes('right') ? x : 0,
          y: enabledDirections.includes('up') || enabledDirections.includes('down') ? y : 0,
          rotateZ: enabledDirections.includes('left') || enabledDirections.includes('right') ? rotateZ : 0,
          opacity
        }}
        whileTap={{ scale: 0.98 }}
        className={`
          relative z-10 bg-white dark:bg-gray-800 cursor-grab active:cursor-grabbing
          ${isDragging ? 'shadow-2xl' : 'shadow-lg'}
          transition-shadow duration-200
        `}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Specialized swipeable NFT card
interface SwipeableNFTCardProps {
  nft: {
    id: string;
    title: string;
    level: number;
    rarity: string;
    imageUrl?: string;
    evolutionPoints: number;
  };
  onView: () => void;
  onShare: () => void;
  onEvolution?: () => void;
  className?: string;
}

export const SwipeableNFTCard: React.FC<SwipeableNFTCardProps> = ({
  nft,
  onView,
  onShare,
  onEvolution,
  className = ''
}) => {
  return (
    <SwipeableCard
      className={className}
      onSwipeLeft={onShare}
      onSwipeRight={onView}
      leftAction={{
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
        ),
        color: 'bg-blue-500',
        label: 'Share'
      }}
      rightAction={{
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        ),
        color: 'bg-green-500',
        label: 'View'
      }}
    >
      <div className="p-4 rounded-lg">
        {/* NFT Image */}
        <div className="aspect-square bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
          {nft.imageUrl ? (
            <img src={nft.imageUrl} alt={nft.title} className="w-full h-full object-cover" />
          ) : (
            <div className="text-white text-center">
              <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <p className="font-bold">Level {nft.level}</p>
            </div>
          )}
          
          {/* Rarity Badge */}
          <div className={`
            absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold
            ${nft.rarity === 'mythic' ? 'bg-purple-500 text-white' :
              nft.rarity === 'legendary' ? 'bg-yellow-500 text-black' :
              nft.rarity === 'epic' ? 'bg-purple-400 text-white' :
              nft.rarity === 'rare' ? 'bg-blue-500 text-white' :
              'bg-gray-400 text-white'
            }
          `}>
            {nft.rarity.toUpperCase()}
          </div>
        </div>

        {/* NFT Info */}
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 truncate">
            {nft.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
            Level {nft.level} • {nft.evolutionPoints} XP
          </p>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((nft.evolutionPoints % 1000) / 10, 100)}%` }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <motion.button
            className="text-blue-600 dark:text-blue-400 text-sm font-medium"
            whileTap={{ scale: 0.95 }}
            onClick={onShare}
          >
            Share
          </motion.button>
          
          {onEvolution && nft.evolutionPoints >= 1000 && (
            <motion.button
              className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium"
              whileTap={{ scale: 0.95 }}
              onClick={onEvolution}
            >
              Evolve!
            </motion.button>
          )}
          
          <motion.button
            className="text-green-600 dark:text-green-400 text-sm font-medium"
            whileTap={{ scale: 0.95 }}
            onClick={onView}
          >
            View Details
          </motion.button>
        </div>
      </div>
    </SwipeableCard>
  );
};