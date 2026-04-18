'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinUserRoom: (userId: string) => void;
  joinUniversityRoom: (university: string) => void;
  emitAchievementSubmitted: (data: any) => void;
  emitNFTMinted: (data: any) => void;
  requestLeaderboard: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('🔌 Connected to WebSocket server');
      setIsConnected(true);
      
      // Auto-join user room if authenticated
      if (user?.id) {
        newSocket.emit('join-user', user.id);
        if (user.university) {
          newSocket.emit('join-university', user.university);
        }
      }
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from WebSocket server');
      setIsConnected(false);
    });

    // Real-time event listeners
    newSocket.on('new-achievement', (data) => {
      toast.success(`🎉 New achievement from ${data.userFirstName}: ${data.title}`);
    });

    newSocket.on('achievement-feed-update', (data) => {
      // This will trigger a refresh of the achievement feed
      console.log('Achievement feed updated:', data);
    });

    newSocket.on('nft-minted-success', (data) => {
      toast.success('🎨 NFT Successfully Minted!', {
        duration: 5000,
        icon: '🎨',
      });
    });

    newSocket.on('nft-gallery-update', (data) => {
      console.log('NFT gallery updated:', data);
    });

    newSocket.on('leaderboard-update', (data) => {
      console.log('Leaderboard updated:', data);
    });

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, [user]);

  const joinUserRoom = (userId: string) => {
    if (socket) {
      socket.emit('join-user', userId);
    }
  };

  const joinUniversityRoom = (university: string) => {
    if (socket) {
      socket.emit('join-university', university);
    }
  };

  const emitAchievementSubmitted = (data: any) => {
    if (socket) {
      socket.emit('achievement-submitted', {
        ...data,
        userFirstName: user?.firstName,
        university: user?.university,
        timestamp: new Date().toISOString()
      });
    }
  };

  const emitNFTMinted = (data: any) => {
    if (socket) {
      socket.emit('nft-minted', {
        ...data,
        userId: user?.id,
        timestamp: new Date().toISOString()
      });
    }
  };

  const requestLeaderboard = () => {
    if (socket) {
      socket.emit('request-leaderboard');
    }
  };

  const value: WebSocketContextType = {
    socket,
    isConnected,
    joinUserRoom,
    joinUniversityRoom,
    emitAchievementSubmitted,
    emitNFTMinted,
    requestLeaderboard
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;