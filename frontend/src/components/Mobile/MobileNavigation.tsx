import React from 'react';
import { 
  HomeIcon, 
  UserIcon, 
  TrophyIcon, 
  BriefcaseIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeSolid, 
  UserIcon as UserSolid, 
  TrophyIcon as TrophySolid, 
  BriefcaseIcon as BriefcaseSolid
} from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  activeIcon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Home',
    href: '/',
    icon: HomeIcon,
    activeIcon: HomeSolid
  },
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: UserIcon,
    activeIcon: UserSolid
  },
  {
    name: 'NFTs',
    href: '/dashboard?tab=nfts',
    icon: TrophyIcon,
    activeIcon: TrophySolid
  },
  {
    name: 'Jobs',
    href: '/opportunities',
    icon: BriefcaseIcon,
    activeIcon: BriefcaseSolid,
    badge: 3
  }
];

interface MobileNavigationProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onToggle }) => {
  const router = useRouter();

  const isActivePath = (href: string) => {
    if (href === '/') return router.pathname === '/';
    return router.pathname.startsWith(href) || router.asPath.startsWith(href);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-40 md:hidden"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="grid grid-cols-4 h-16">
          {navigationItems.map((item) => {
            const isActive = isActivePath(item.href);
            const Icon = isActive ? item.activeIcon : item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  className={`
                    flex flex-col items-center justify-center h-full relative
                    ${isActive 
                      ? 'text-indigo-600 dark:text-indigo-400' 
                      : 'text-gray-500 dark:text-gray-400'
                    }
                  `}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <div className="relative">
                    <Icon className="w-6 h-6" />
                    {item.badge && (
                      <motion.div
                        className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                      >
                        {item.badge}
                      </motion.div>
                    )}
                  </div>
                  <span className="text-xs mt-1 font-medium">{item.name}</span>
                  
                  {isActive && (
                    <motion.div
                      className="absolute top-0 left-1/2 w-8 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full"
                      layoutId="activeTab"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      style={{ x: '-50%' }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Hamburger Menu Button (for tablets) */}
      <motion.button
        className="fixed top-4 right-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg md:hidden"
        onClick={onToggle}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Bars3Icon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Slide-out Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggle}
            />

            {/* Menu Panel */}
            <motion.div
              className="fixed top-0 right-0 w-80 h-full bg-white dark:bg-gray-900 shadow-xl z-50 md:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="p-6 pt-16">
                <div className="space-y-4">
                  {navigationItems.map((item, index) => {
                    const isActive = isActivePath(item.href);
                    const Icon = item.icon;
                    
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link href={item.href}>
                          <div
                            className={`
                              flex items-center space-x-3 p-3 rounded-lg transition-colors
                              ${isActive 
                                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' 
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                              }
                            `}
                            onClick={onToggle}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                            {item.badge && (
                              <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Additional Menu Items */}
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Link href="/settings">
                      <div className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">Settings</span>
                      </div>
                    </Link>
                    
                    <Link href="/help">
                      <div className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Help & Support</span>
                      </div>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Safe area for bottom navigation */}
      <div className="h-16 md:hidden" />
    </>
  );
};