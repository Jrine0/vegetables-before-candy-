import { prisma } from '../server';

export interface CareerPrediction {
  predictedRole: string;
  confidenceScore: number;
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  timeToAchieve: string;
  requiredSkills: string[];
  growthPotential: number;
  matchingOpportunities: number;
}

export interface SkillGapAnalysis {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  priority: 'high' | 'medium' | 'low';
  recommendations: string[];
}

export interface MarketTrends {
  skill: string;
  demandGrowth: number;
  averageSalary: number;
  jobOpenings: number;
  trendDirection: 'rising' | 'stable' | 'declining';
}

export interface UserAnalytics {
  userId: string;
  profileStrength: number;
  careerTrajectory: CareerPrediction[];
  skillGaps: SkillGapAnalysis[];
  marketPosition: {
    percentile: number;
    competitiveAdvantage: string[];
    improvementAreas: string[];
  };
  networkInsights: {
    connectionStrength: number;
    influenceScore: number;
    recommendedConnections: string[];
  };
  achievementTrends: {
    monthlyGrowth: number;
    consistencyScore: number;
    peakPerformancePeriods: string[];
  };
}

export class AnalyticsService {
  private static readonly CAREER_PATHS: Record<string, any> = {
    'software_engineer': {
      baseSkills: ['programming', 'algorithms', 'system_design'],
      salaryRange: { min: 80000, max: 200000 },
      growthRate: 0.25,
      demandScore: 0.95
    },
    'data_scientist': {
      baseSkills: ['statistics', 'machine_learning', 'python', 'data_analysis'],
      salaryRange: { min: 90000, max: 180000 },
      growthRate: 0.30,
      demandScore: 0.90
    },
    'product_manager': {
      baseSkills: ['leadership', 'strategy', 'communication', 'analytics'],
      salaryRange: { min: 100000, max: 220000 },
      growthRate: 0.20,
      demandScore: 0.85
    },
    'research_scientist': {
      baseSkills: ['research', 'publications', 'domain_expertise', 'methodology'],
      salaryRange: { min: 85000, max: 160000 },
      growthRate: 0.15,
      demandScore: 0.75
    },
    'consultant': {
      baseSkills: ['problem_solving', 'communication', 'business_analysis', 'leadership'],
      salaryRange: { min: 95000, max: 250000 },
      growthRate: 0.22,
      demandScore: 0.80
    }
  };

  // Generate comprehensive user analytics
  public static async generateUserAnalytics(userId: string): Promise<UserAnalytics> {
    const [user, nfts, achievements, socialProfile, endorsements] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.nFTToken.findMany({ 
        where: { userId },
        include: { achievement: true }
      }),
      prisma.achievement.findMany({ 
        where: { userId },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.socialProfile.findUnique({ 
        where: { userId }
      }),
      prisma.endorsement.findMany({
        where: { endorseeId: userId }
      })
    ]);

    if (!user) throw new Error('User not found');

    // Calculate profile strength
    const profileStrength = this.calculateProfileStrength(user, nfts, achievements, socialProfile);

    // Generate career predictions
    const careerTrajectory = await this.generateCareerPredictions(userId, nfts, achievements);

    // Analyze skill gaps
    const skillGaps = this.analyzeSkillGaps(nfts, achievements, careerTrajectory[0]);

    // Calculate market position
    const marketPosition = await this.calculateMarketPosition(userId, nfts, achievements);

    // Generate network insights
    const networkInsights = this.generateNetworkInsights(socialProfile, endorsements);

    // Analyze achievement trends
    const achievementTrends = this.analyzeAchievementTrends(achievements, nfts);

    return {
      userId,
      profileStrength,
      careerTrajectory,
      skillGaps,
      marketPosition,
      networkInsights,
      achievementTrends
    };
  }

  // AI-powered career prediction algorithm
  public static async generateCareerPredictions(
    userId: string, 
    nfts: any[], 
    achievements: any[]
  ): Promise<CareerPrediction[]> {
    const predictions: CareerPrediction[] = [];

    // Analyze user's achievement patterns
    const achievementTypes = achievements.reduce((acc, ach) => {
      acc[ach.type] = (acc[ach.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const nftTypes = nfts.reduce((acc, nft) => {
      acc[nft.achievement?.type || 'unknown'] = (acc[nft.achievement?.type || 'unknown'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate total experience points
    const totalXP = nfts.reduce((sum, nft) => sum + nft.evolutionPoints, 0);
    const averageLevel = nfts.length > 0 ? nfts.reduce((sum, nft) => sum + nft.level, 0) / nfts.length : 1;

    // Generate predictions for each career path
    for (const [careerPath, pathData] of Object.entries(this.CAREER_PATHS)) {
      const matchScore = this.calculateCareerMatch(achievementTypes, nftTypes, pathData.baseSkills);
      
      if (matchScore > 0.3) { // Only include viable career paths
        const prediction: CareerPrediction = {
          predictedRole: this.formatCareerTitle(careerPath),
          confidenceScore: Math.min(matchScore * 100, 95),
          salaryRange: {
            min: Math.round(pathData.salaryRange.min * (1 + (averageLevel - 1) * 0.1)),
            max: Math.round(pathData.salaryRange.max * (1 + (averageLevel - 1) * 0.1)),
            currency: 'USD'
          },
          timeToAchieve: this.calculateTimeToAchieve(matchScore, totalXP),
          requiredSkills: this.getRequiredSkills(careerPath, achievementTypes),
          growthPotential: Math.round(pathData.growthRate * 100),
          matchingOpportunities: await this.getMatchingOpportunities(careerPath)
        };

        predictions.push(prediction);
      }
    }

    // Sort by confidence score
    return predictions.sort((a, b) => b.confidenceScore - a.confidenceScore).slice(0, 5);
  }

  // Calculate how well user matches a career path
  private static calculateCareerMatch(
    achievementTypes: Record<string, number>,
    nftTypes: Record<string, number>,
    requiredSkills: string[]
  ): number {
    let matchScore = 0;
    let totalWeight = 0;

    // Weight different achievement types
    const skillWeights: Record<string, number> = {
      'gpa': 0.3,
      'research': 0.4,
      'leadership': 0.35,
      'internship': 0.25,
      'project': 0.3,
      'competition': 0.2
    };

    for (const skill of requiredSkills) {
      totalWeight += 1;
      
      // Check direct matches
      if (achievementTypes[skill] || nftTypes[skill]) {
        matchScore += 0.8;
      }
      
      // Check related skills
      const relatedScore = this.getRelatedSkillScore(skill, achievementTypes, nftTypes);
      matchScore += relatedScore;
    }

    // Add bonus for overall achievement diversity
    const diversityBonus = Math.min(Object.keys(achievementTypes).length * 0.05, 0.2);
    matchScore += diversityBonus;

    return totalWeight > 0 ? Math.min(matchScore / totalWeight, 1) : 0;
  }

  private static getRelatedSkillScore(
    skill: string,
    achievementTypes: Record<string, number>,
    nftTypes: Record<string, number>
  ): number {
    const skillMappings: Record<string, string[]> = {
      'programming': ['project', 'internship', 'competition'],
      'leadership': ['leadership', 'internship'],
      'research': ['research', 'gpa'],
      'analytics': ['gpa', 'research', 'project'],
      'communication': ['leadership', 'internship'],
      'problem_solving': ['competition', 'project', 'research']
    };

    const relatedSkills = skillMappings[skill] || [];
    let score = 0;

    for (const related of relatedSkills) {
      if (achievementTypes[related] || nftTypes[related]) {
        score += 0.3;
      }
    }

    return Math.min(score, 0.6);
  }

  // Analyze skill gaps for career development
  private static analyzeSkillGaps(
    nfts: any[], 
    achievements: any[], 
    topCareerPrediction: CareerPrediction
  ): SkillGapAnalysis[] {
    const skillGaps: SkillGapAnalysis[] = [];
    
    if (!topCareerPrediction) return skillGaps;

    const userSkills = this.extractUserSkills(nfts, achievements);
    
    for (const requiredSkill of topCareerPrediction.requiredSkills) {
      const currentLevel = userSkills[requiredSkill] || 0;
      const requiredLevel = 5; // Assume 5-point scale
      const gap = Math.max(0, requiredLevel - currentLevel);

      if (gap > 0) {
        skillGaps.push({
          skill: requiredSkill,
          currentLevel,
          requiredLevel,
          gap,
          priority: gap >= 3 ? 'high' : gap >= 2 ? 'medium' : 'low',
          recommendations: this.getSkillRecommendations(requiredSkill, gap)
        });
      }
    }

    return skillGaps.sort((a, b) => b.gap - a.gap);
  }

  private static extractUserSkills(nfts: any[], achievements: any[]): Record<string, number> {
    const skills: Record<string, number> = {};

    // Extract from NFTs (higher weight due to verification)
    nfts.forEach(nft => {
      const skillType = nft.achievement?.type || 'general';
      const level = nft.level;
      skills[skillType] = Math.max(skills[skillType] || 0, level);
    });

    // Extract from achievements
    achievements.forEach(ach => {
      const skillType = ach.type;
      const level = ach.verificationStatus === 'verified' ? 3 : 2;
      skills[skillType] = Math.max(skills[skillType] || 0, level);
    });

    return skills;
  }

  private static getSkillRecommendations(skill: string, gap: number): string[] {
    const recommendations: Record<string, string[]> = {
      'programming': [
        'Complete coding bootcamp or online course',
        'Build 3-5 personal projects',
        'Contribute to open source projects',
        'Practice on competitive programming platforms'
      ],
      'leadership': [
        'Join student organizations and take leadership roles',
        'Mentor junior students',
        'Lead group projects or initiatives',
        'Take leadership workshops or courses'
      ],
      'research': [
        'Join research lab as undergraduate researcher',
        'Attend academic conferences',
        'Publish research papers',
        'Apply for research internships'
      ],
      'communication': [
        'Join debate club or toastmasters',
        'Present at conferences or seminars',
        'Write technical blog posts',
        'Practice public speaking'
      ]
    };

    return recommendations[skill] || [
      'Take relevant online courses',
      'Seek mentorship in this area',
      'Join relevant professional communities',
      'Practice through real-world projects'
    ];
  }

  // Calculate user's market position
  private static async calculateMarketPosition(
    userId: string,
    nfts: any[],
    achievements: any[]
  ): Promise<UserAnalytics['marketPosition']> {
    // Get all users for comparison
    const allUsers = await prisma.user.findMany({
      include: {
        nftTokens: true,
        achievements: true
      }
    });

    const userScore = this.calculateUserScore(nfts, achievements);
    const allScores = allUsers.map(u => this.calculateUserScore(u.nftTokens, u.achievements));
    
    // Calculate percentile
    const percentile = this.calculatePercentile(userScore, allScores);

    // Identify competitive advantages
    const competitiveAdvantage = this.identifyCompetitiveAdvantages(nfts, achievements);
    
    // Identify improvement areas
    const improvementAreas = this.identifyImprovementAreas(nfts, achievements, allUsers);

    return {
      percentile,
      competitiveAdvantage,
      improvementAreas
    };
  }

  private static calculateUserScore(nfts: any[], achievements: any[]): number {
    const nftScore = nfts.reduce((sum, nft) => sum + nft.evolutionPoints * nft.level, 0);
    const achievementScore = achievements.length * 100;
    const verifiedBonus = achievements.filter(a => a.verificationStatus === 'verified').length * 50;
    
    return nftScore + achievementScore + verifiedBonus;
  }

  private static calculatePercentile(userScore: number, allScores: number[]): number {
    const sortedScores = allScores.sort((a, b) => a - b);
    const rank = sortedScores.findIndex(score => score >= userScore);
    return Math.round((rank / sortedScores.length) * 100);
  }

  private static identifyCompetitiveAdvantages(nfts: any[], achievements: any[]): string[] {
    const advantages: string[] = [];

    // High-level NFTs
    const legendaryNFTs = nfts.filter(nft => nft.rarity === 'legendary').length;
    if (legendaryNFTs > 0) {
      advantages.push(`${legendaryNFTs} Legendary NFT${legendaryNFTs > 1 ? 's' : ''}`);
    }

    // High evolution points
    const totalXP = nfts.reduce((sum, nft) => sum + nft.evolutionPoints, 0);
    if (totalXP > 5000) {
      advantages.push('High Evolution Points (5000+ XP)');
    }

    // Diverse achievements
    const achievementTypes = new Set(achievements.map(a => a.type));
    if (achievementTypes.size >= 4) {
      advantages.push('Diverse Achievement Portfolio');
    }

    // Recent activity
    const recentAchievements = achievements.filter(a => 
      new Date(a.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;
    if (recentAchievements >= 2) {
      advantages.push('High Recent Activity');
    }

    return advantages;
  }

  private static identifyImprovementAreas(
    nfts: any[], 
    achievements: any[], 
    allUsers: any[]
  ): string[] {
    const areas: string[] = [];

    // Low verification rate
    const verificationRate = achievements.length > 0 ? 
      achievements.filter(a => a.verificationStatus === 'verified').length / achievements.length : 0;
    if (verificationRate < 0.7) {
      areas.push('Increase Achievement Verification Rate');
    }

    // Missing key achievement types
    const userTypes = new Set(achievements.map(a => a.type));
    const commonTypes = ['gpa', 'research', 'leadership', 'internship'];
    const missingTypes = commonTypes.filter(type => !userTypes.has(type));
    if (missingTypes.length > 0) {
      areas.push(`Add ${missingTypes.join(', ')} achievements`);
    }

    // Low NFT evolution
    const averageLevel = nfts.length > 0 ? nfts.reduce((sum, nft) => sum + nft.level, 0) / nfts.length : 0;
    if (averageLevel < 3) {
      areas.push('Evolve NFTs to Higher Levels');
    }

    return areas;
  }

  // Generate network insights
  private static generateNetworkInsights(socialProfile: any, endorsements: any[] = []): UserAnalytics['networkInsights'] {
    const connectionStrength = this.calculateConnectionStrength(socialProfile, endorsements);
    const influenceScore = this.calculateInfluenceScore(socialProfile, endorsements);
    const recommendedConnections = this.generateRecommendedConnections(socialProfile);

    return {
      connectionStrength,
      influenceScore,
      recommendedConnections
    };
  }

  private static calculateConnectionStrength(socialProfile: any, endorsements: any[] = []): number {
    if (!socialProfile) return 0;

    const endorsementCount = endorsements.length;
    const posts = 0; // Would get from socialProfile.posts if implemented
    
    // Simple scoring algorithm
    return Math.min((endorsementCount * 10 + posts * 5) / 100, 1) * 100;
  }

  private static calculateInfluenceScore(socialProfile: any, endorsements: any[] = []): number {
    if (!socialProfile) return 0;

    const endorsementCount = endorsements.length;
    const posts = 0; // Would get from socialProfile.posts if implemented
    
    // Influence based on engagement
    return Math.min((endorsementCount * 15 + posts * 8) / 150, 1) * 100;
  }

  private static generateRecommendedConnections(socialProfile: any): string[] {
    // This would typically use ML to recommend connections
    // For now, return generic recommendations
    return [
      'Alumni from your university',
      'Professionals in your target industry',
      'Students with complementary skills',
      'Mentors in your field of interest'
    ];
  }

  // Analyze achievement trends
  private static analyzeAchievementTrends(
    achievements: any[], 
    nfts: any[]
  ): UserAnalytics['achievementTrends'] {
    const monthlyGrowth = this.calculateMonthlyGrowth(achievements);
    const consistencyScore = this.calculateConsistencyScore(achievements);
    const peakPerformancePeriods = this.identifyPeakPeriods(achievements);

    return {
      monthlyGrowth,
      consistencyScore,
      peakPerformancePeriods
    };
  }

  private static calculateMonthlyGrowth(achievements: any[]): number {
    if (achievements.length < 2) return 0;

    const sortedAchievements = achievements.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const firstMonth = new Date(sortedAchievements[0].createdAt);
    const lastMonth = new Date(sortedAchievements[sortedAchievements.length - 1].createdAt);
    const monthsDiff = (lastMonth.getTime() - firstMonth.getTime()) / (1000 * 60 * 60 * 24 * 30);

    return monthsDiff > 0 ? achievements.length / monthsDiff : 0;
  }

  private static calculateConsistencyScore(achievements: any[]): number {
    if (achievements.length < 3) return 0;

    // Calculate variance in achievement frequency
    // Lower variance = higher consistency
    const monthlyCount = this.getMonthlyAchievementCounts(achievements);
    const average = monthlyCount.reduce((sum, count) => sum + count, 0) / monthlyCount.length;
    const variance = monthlyCount.reduce((sum, count) => sum + Math.pow(count - average, 2), 0) / monthlyCount.length;
    
    return Math.max(0, 100 - variance * 10);
  }

  private static getMonthlyAchievementCounts(achievements: any[]): number[] {
    const monthlyCount: Record<string, number> = {};

    achievements.forEach(achievement => {
      const monthKey = new Date(achievement.createdAt).toISOString().slice(0, 7); // YYYY-MM
      monthlyCount[monthKey] = (monthlyCount[monthKey] || 0) + 1;
    });

    return Object.values(monthlyCount);
  }

  private static identifyPeakPeriods(achievements: any[]): string[] {
    const monthlyCount = this.getMonthlyAchievementCounts(achievements);
    const average = monthlyCount.reduce((sum, count) => sum + count, 0) / monthlyCount.length;
    
    const peakPeriods: string[] = [];
    const monthlyData: Record<string, number> = {};

    achievements.forEach(achievement => {
      const monthKey = new Date(achievement.createdAt).toISOString().slice(0, 7);
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    for (const [month, count] of Object.entries(monthlyData)) {
      if (count > average * 1.5) {
        peakPeriods.push(month);
      }
    }

    return peakPeriods;
  }

  // Helper methods
  private static calculateProfileStrength(
    user: any,
    nfts: any[],
    achievements: any[],
    socialProfile: any
  ): number {
    let strength = 0;

    // Base profile completeness (20 points)
    if (user.name) strength += 5;
    if (user.university) strength += 5;
    if (user.emailVerified) strength += 10;

    // NFT portfolio (40 points)
    strength += Math.min(nfts.length * 5, 20);
    strength += Math.min(nfts.reduce((sum, nft) => sum + nft.level, 0) * 2, 20);

    // Achievement diversity (25 points)
    const achievementTypes = new Set(achievements.map(a => a.type));
    strength += Math.min(achievementTypes.size * 5, 25);

    // Social presence (15 points)
    if (socialProfile) {
      strength += Math.min((socialProfile.endorsements?.length || 0) * 2, 10);
      strength += Math.min((socialProfile.posts?.length || 0), 5);
    }

    return Math.min(strength, 100);
  }

  private static formatCareerTitle(careerPath: string): string {
    return careerPath.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private static calculateTimeToAchieve(matchScore: number, totalXP: number): string {
    const baseTime = 24; // months
    const skillFactor = 1 - matchScore;
    const experienceFactor = Math.max(0.5, 1 - (totalXP / 10000));
    
    const estimatedMonths = Math.round(baseTime * skillFactor * experienceFactor);
    
    if (estimatedMonths <= 6) return '3-6 months';
    if (estimatedMonths <= 12) return '6-12 months';
    if (estimatedMonths <= 24) return '1-2 years';
    return '2+ years';
  }

  private static getRequiredSkills(careerPath: string, currentSkills: Record<string, number>): string[] {
    const pathData = this.CAREER_PATHS[careerPath];
    if (!pathData) return [];

    return pathData.baseSkills.filter((skill: string) => !currentSkills[skill] || currentSkills[skill] < 3);
  }

  private static async getMatchingOpportunities(careerPath: string): Promise<number> {
    // In a real implementation, this would query the opportunities database
    // For now, return simulated data
    const opportunityCounts: Record<string, number> = {
      'software_engineer': 150,
      'data_scientist': 89,
      'product_manager': 67,
      'research_scientist': 34,
      'consultant': 78
    };

    return opportunityCounts[careerPath] || 25;
  }

  // Get market trends and insights
  public static async getMarketTrends(): Promise<MarketTrends[]> {
    // Simulated market data - in production, this would come from job market APIs
    return [
      {
        skill: 'Machine Learning',
        demandGrowth: 45.2,
        averageSalary: 135000,
        jobOpenings: 2847,
        trendDirection: 'rising'
      },
      {
        skill: 'Cloud Computing',
        demandGrowth: 38.7,
        averageSalary: 128000,
        jobOpenings: 3254,
        trendDirection: 'rising'
      },
      {
        skill: 'Data Science',
        demandGrowth: 32.1,
        averageSalary: 122000,
        jobOpenings: 1923,
        trendDirection: 'rising'
      },
      {
        skill: 'Product Management',
        demandGrowth: 28.5,
        averageSalary: 145000,
        jobOpenings: 1456,
        trendDirection: 'stable'
      },
      {
        skill: 'Cybersecurity',
        demandGrowth: 41.3,
        averageSalary: 118000,
        jobOpenings: 2103,
        trendDirection: 'rising'
      }
    ];
  }
}

export const analyticsService = AnalyticsService;