// Mock API for temporary deployment
export const mockAPI = {
  // Mock users
  users: [
    {
      id: '1',
      email: 'demo@harvard.edu',
      password: 'demo123',
      firstName: 'Demo',
      lastName: 'Student',
      university: 'Harvard University',
      emailVerified: true,
      role: 'student'
    }
  ],
  
  // Mock achievements
  achievements: [
    {
      id: '1',
      userId: '1',
      title: 'Dean\'s List - Fall 2023',
      type: 'academic',
      description: 'Achieved Dean\'s List status with 3.8+ GPA',
      verified: true,
      createdAt: new Date('2023-12-15')
    },
    {
      id: '2', 
      userId: '1',
      title: 'Research Publication',
      type: 'research',
      description: 'Published paper on Machine Learning in Healthcare',
      verified: true,
      createdAt: new Date('2023-11-20')
    }
  ],
  
  // Mock NFTs
  nfts: [
    {
      id: '1',
      userId: '1',
      achievementId: '1',
      nftType: 'academic',
      level: 3,
      rarity: 'epic',
      minted: true,
      evolutionPoints: 850
    },
    {
      id: '2',
      userId: '1', 
      achievementId: '2',
      nftType: 'research',
      level: 2,
      rarity: 'rare',
      minted: true,
      evolutionPoints: 640
    }
  ]
};

// Mock authentication
export const mockAuth = {
  login: async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
    
    const user = mockAPI.users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const token = btoa(`${user.id}:${Date.now()}`); // Simple mock token
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      university: user.university,
      emailVerified: user.emailVerified
    }));
    
    return { 
      success: true, 
      token,
      user: {
        id: user.id,
        email: user.email,
        universityEmail: user.email, // Add missing field
        firstName: user.firstName,
        lastName: user.lastName,
        university: user.university,
        emailVerified: user.emailVerified
      }
    };
  },
  
  register: async (userData: any) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    throw new Error('Registration temporarily disabled - use demo@harvard.edu / demo123');
  },
  
  getProfile: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('Not authenticated');
    
    const userData = localStorage.getItem('user_data');
    if (!userData) throw new Error('No user data');
    
    const user = JSON.parse(userData);
    return {
      ...user,
      universityEmail: user.universityEmail || user.email // Ensure universityEmail exists
    };
  },
  
  getDashboardStats: async () => {
    return {
      totalAchievements: mockAPI.achievements.length,
      totalNFTs: mockAPI.nfts.length,
      totalEarnedPoints: 1490,
      verificationRate: 100
    };
  }
};

// Mock APIs
export const mockAchievementAPI = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: mockAPI.achievements };
  },
  
  getById: async (id: string) => {
    const achievement = mockAPI.achievements.find(a => a.id === id);
    if (!achievement) throw new Error('Achievement not found');
    return { data: achievement };
  }
};

export const mockNFTAPI = {
  getUserNFTs: async () => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return { 
      data: mockAPI.nfts.map(nft => ({
        ...nft,
        achievement: mockAPI.achievements.find(a => a.id === nft.achievementId)
      }))
    };
  }
};