import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, userAPI } from '../lib/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  universityEmail: string;
  firstName: string;
  lastName: string;
  university: string;
  emailVerified: boolean;
  walletAddress?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  verifyEmail: (token: string) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login for:', email);
      console.log('🌐 API Base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
      
      const response = await authAPI.login({ email, password });
      console.log('✅ Login response:', response);
      
      const { token, user: userData } = response.data;
      
      localStorage.setItem('auth_token', token);
      setUser(userData);
      toast.success('Login successful!');
      console.log('🎉 Login successful for:', userData.firstName, userData.lastName);
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Full error object:', error);
      
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      const response = await authAPI.register(data);
      const { token, user: userData } = response.data;
      
      localStorage.setItem('auth_token', token);
      setUser(userData);
      toast.success('Registration successful! Please verify your university email.');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const verifyEmail = async (token: string) => {
    try {
      await authAPI.verifyEmail(token);
      await fetchUserProfile(); // Refresh user data
      toast.success('Email verified successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Email verification failed');
      throw error;
    }
  };

  const updateProfile = async (data: any) => {
    try {
      const response = await userAPI.updateProfile(data);
      setUser(response.data);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Profile update failed');
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    verifyEmail,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};