// @ts-nocheck
import { prisma } from '../server';

export interface TalentProfile {
  userId: string;
  name: string;
  university: string;
  graduationYear?: number;
  email: string;
  profileStrength: number;
  nftCount: number;
  achievementCount: number;
  topSkills: string[];
  careerInterests: string[];
  availabilityStatus: 'available' | 'open_to_opportunities' | 'not_available';
  salaryExpectation?: {
    min: number;
    max: number;
    currency: string;
  };
  location: string;
  willingToRelocate: boolean;
  workAuthorization: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  matchScore?: number;
}

export interface TalentSearch {
  skills?: string[];
  universities?: string[];
  graduationYears?: number[];
  minGPA?: number;
  experienceLevel?: 'entry' | 'mid' | 'senior';
  availability?: string[];
  location?: string;
  salaryRange?: {
    min: number;
    max: number;
  };
  nftRarities?: string[];
  achievementTypes?: string[];
  sortBy?: 'relevance' | 'profile_strength' | 'recent_activity' | 'nft_count';
  limit?: number;
  offset?: number;
}

export interface CompanyProfile {
  id: string;
  name: string;
  industry: string;
  size: string;
  description: string;
  website: string;
  logo?: string;
  headquarters: string;
  benefits: string[];
  culture: string[];
  techStack: string[];
  isVerified: boolean;
  recruiterId: string;
}

export interface RecruitmentCampaign {
  id: string;
  companyId: string;
  title: string;
  description: string;
  requirements: {
    skills: string[];
    experience: string;
    education: string;
    certifications?: string[];
  };
  preferences: {
    universities?: string[];
    gpaMin?: number;
    achievementTypes?: string[];
    nftRarities?: string[];
  };
  compensation: {
    salaryMin: number;
    salaryMax: number;
    currency: string;
    benefits: string[];
  };
  location: string;
  remote: boolean;
  type: 'internship' | 'full_time' | 'part_time' | 'contract';
  status: 'draft' | 'active' | 'paused' | 'closed';
  targetCount: number;
  applicationsReceived: number;
  shortlistedCount: number;
  hiredCount: number;
  budget: number;
  costPerHire?: number;
  createdAt: Date;
  deadline?: Date;
}

export interface TalentInsights {
  totalCandidates: number;
  universityDistribution: Record<string, number>;
  skillDistribution: Record<string, number>;
  graduationYearDistribution: Record<number, number>;
  nftRarityDistribution: Record<string, number>;
  averageProfileStrength: number;
  topUniversities: string[];
  emergingSkills: string[];
  competitiveCompanies: string[];
  marketSalaryRanges: Record<string, { min: number; max: number }>;
}

export class HRPortalService {
  // Search and filter talent
  public static async searchTalent(
    companyId: string,
    searchCriteria: TalentSearch,
    recruiterId: string
  ): Promise<{ talents: TalentProfile[]; total: number; insights: any }> {
    // Verify recruiter has access to company
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        recruiters: { some: { id: recruiterId } }
      }
    });

    if (!company) {
      throw new Error('Unauthorized access to company');
    }

    // Build search query
    const whereClause: any = {
      emailVerified: true,
      privacySettings: { path: ['profileVisibility'], equals: 'public' }
    };

    if (searchCriteria.universities?.length) {
      whereClause.university = { in: searchCriteria.universities };
    }

    if (searchCriteria.graduationYears?.length) {
      whereClause.graduationYear = { in: searchCriteria.graduationYears };
    }

    if (searchCriteria.location) {
      whereClause.location = { contains: searchCriteria.location, mode: 'insensitive' };
    }

    // Get users matching basic criteria
    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        nfts: {
          include: { achievement: true }
        },
        achievements: true,
        socialProfile: true
      },
      take: searchCriteria.limit || 50,
      skip: searchCriteria.offset || 0
    });

    // Process and score candidates
    const talentProfiles: TalentProfile[] = [];

    for (const user of users) {
      // Calculate skills from achievements and NFTs
      const skills = this.extractUserSkills(user.nfts, user.achievements);

      // Filter by skills if specified
      if (searchCriteria.skills?.length) {
        const hasRequiredSkills = searchCriteria.skills.some(skill =>
          skills.includes(skill.toLowerCase())
        );
        if (!hasRequiredSkills) continue;
      }

      // Filter by NFT rarities
      if (searchCriteria.nftRarities?.length) {
        const userRarities = user.nfts.map(nft => nft.rarity);
        const hasRequiredRarity = searchCriteria.nftRarities.some(rarity =>
          userRarities.includes(rarity)
        );
        if (!hasRequiredRarity) continue;
      }

      // Filter by achievement types
      if (searchCriteria.achievementTypes?.length) {
        const userAchievementTypes = user.achievements.map(ach => ach.type);
        const hasRequiredAchievement = searchCriteria.achievementTypes.some(type =>
          userAchievementTypes.includes(type)
        );
        if (!hasRequiredAchievement) continue;
      }

      // Calculate profile strength
      const profileStrength = this.calculateProfileStrength(user);

      // Calculate match score based on search criteria
      const matchScore = this.calculateMatchScore(user, searchCriteria);

      const talentProfile: TalentProfile = {
        userId: user.id,
        name: user.name,
        university: user.university,
        graduationYear: user.graduationYear,
        email: user.email,
        profileStrength,
        nftCount: user.nfts.length,
        achievementCount: user.achievements.length,
        topSkills: skills.slice(0, 6),
        careerInterests: this.extractCareerInterests(user),
        availabilityStatus: (user.privacySettings as any)?.availability || 'open_to_opportunities',
        location: user.location || 'Not specified',
        willingToRelocate: (user.preferences as any)?.willingToRelocate || false,
        workAuthorization: (user.preferences as any)?.workAuthorization || 'Unknown',
        portfolioUrl: (user.links as any)?.portfolio,
        resumeUrl: (user.links as any)?.resume,
        matchScore
      };

      talentProfiles.push(talentProfile);
    }

    // Sort results
    const sortBy = searchCriteria.sortBy || 'relevance';
    talentProfiles.sort((a, b) => {
      switch (sortBy) {
        case 'profile_strength':
          return b.profileStrength - a.profileStrength;
        case 'nft_count':
          return b.nftCount - a.nftCount;
        case 'relevance':
        default:
          return (b.matchScore || 0) - (a.matchScore || 0);
      }
    });

    // Generate search insights
    const insights = this.generateSearchInsights(talentProfiles, searchCriteria);

    const total = await prisma.user.count({ where: whereClause });

    return {
      talents: talentProfiles,
      total,
      insights
    };
  }

  // Get detailed talent profile for HR
  public static async getTalentProfile(
    userId: string,
    companyId: string,
    recruiterId: string
  ): Promise<TalentProfile & { detailedAchievements: any[]; nftPortfolio: any[]; analytics: any }> {
    // Verify access
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        recruiters: { some: { id: recruiterId } }
      }
    });

    if (!company) {
      throw new Error('Unauthorized access');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        nfts: {
          include: { achievement: true },
          orderBy: { evolutionPoints: 'desc' }
        },
        achievements: {
          include: { nft: true },
          orderBy: { createdAt: 'desc' }
        },
        socialProfile: {
          include: { endorsements: true, posts: true }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check privacy settings
    const profileVisibility = (user.privacySettings as any)?.profileVisibility;
    if (profileVisibility === 'private') {
      throw new Error('Profile is private');
    }

    const skills = this.extractUserSkills(user.nfts, user.achievements);
    const profileStrength = this.calculateProfileStrength(user);

    // Generate analytics for this candidate
    const analytics = await this.generateCandidateAnalytics(user);

    const profile: TalentProfile & { detailedAchievements: any[]; nftPortfolio: any[]; analytics: any } = {
      userId: user.id,
      name: user.name,
      university: user.university,
      graduationYear: user.graduationYear,
      email: user.email,
      profileStrength,
      nftCount: user.nfts.length,
      achievementCount: user.achievements.length,
      topSkills: skills,
      careerInterests: this.extractCareerInterests(user),
      availabilityStatus: (user.privacySettings as any)?.availability || 'open_to_opportunities',
      location: user.location || 'Not specified',
      willingToRelocate: (user.preferences as any)?.willingToRelocate || false,
      workAuthorization: (user.preferences as any)?.workAuthorization || 'Unknown',
      portfolioUrl: (user.links as any)?.portfolio,
      resumeUrl: (user.links as any)?.resume,
      detailedAchievements: user.achievements,
      nftPortfolio: user.nfts,
      analytics
    };

    return profile;
  }

  // Create recruitment campaign
  public static async createRecruitmentCampaign(
    companyId: string,
    campaignData: Partial<RecruitmentCampaign>,
    recruiterId: string
  ): Promise<RecruitmentCampaign> {
    // Verify access
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        recruiters: { some: { id: recruiterId } }
      }
    });

    if (!company) {
      throw new Error('Unauthorized access to company');
    }

    const campaign = await prisma.recruitmentCampaign.create({
      data: {
        companyId,
        title: campaignData.title!,
        description: campaignData.description!,
        requirements: campaignData.requirements as any,
        preferences: campaignData.preferences as any,
        compensation: campaignData.compensation as any,
        location: campaignData.location!,
        remote: campaignData.remote || false,
        type: campaignData.type!,
        status: campaignData.status || 'draft',
        targetCount: campaignData.targetCount || 10,
        budget: campaignData.budget || 0,
        deadline: campaignData.deadline,
        createdBy: recruiterId
      }
    });

    return campaign as any;
  }

  // Get talent market insights
  public static async getTalentInsights(
    companyId: string,
    recruiterId: string,
    filters?: {
      skills?: string[];
      universities?: string[];
      timeframe?: 'monthly' | 'quarterly' | 'yearly';
    }
  ): Promise<TalentInsights> {
    // Verify access
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        recruiters: { some: { id: recruiterId } }
      }
    });

    if (!company) {
      throw new Error('Unauthorized access to company');
    }

    // Get base user data
    const users = await prisma.user.findMany({
      where: {
        emailVerified: true,
        privacySettings: { path: ['profileVisibility'], equals: 'public' }
      },
      include: {
        nfts: { include: { achievement: true } },
        achievements: true
      }
    });

    // Calculate distributions
    const universityDistribution: Record<string, number> = {};
    const skillDistribution: Record<string, number> = {};
    const graduationYearDistribution: Record<number, number> = {};
    const nftRarityDistribution: Record<string, number> = {};

    let totalProfileStrength = 0;

    users.forEach(user => {
      // University distribution
      if (user.university) {
        universityDistribution[user.university] = (universityDistribution[user.university] || 0) + 1;
      }

      // Graduation year distribution
      if (user.graduationYear) {
        graduationYearDistribution[user.graduationYear] = (graduationYearDistribution[user.graduationYear] || 0) + 1;
      }

      // Skills distribution
      const skills = this.extractUserSkills(user.nfts, user.achievements);
      skills.forEach(skill => {
        skillDistribution[skill] = (skillDistribution[skill] || 0) + 1;
      });

      // NFT rarity distribution
      user.nfts.forEach(nft => {
        nftRarityDistribution[nft.rarity] = (nftRarityDistribution[nft.rarity] || 0) + 1;
      });

      // Profile strength
      totalProfileStrength += this.calculateProfileStrength(user);
    });

    // Get top universities
    const topUniversities = Object.entries(universityDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([university]) => university);

    // Get emerging skills (skills with recent growth)
    const emergingSkills = Object.entries(skillDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([skill]) => skill);

    // Market salary ranges (simulated - would come from job market data)
    const marketSalaryRanges: Record<string, { min: number; max: number }> = {
      'software_engineer': { min: 80000, max: 150000 },
      'data_scientist': { min: 90000, max: 160000 },
      'product_manager': { min: 100000, max: 180000 },
      'designer': { min: 70000, max: 130000 },
      'marketing': { min: 60000, max: 120000 }
    };

    return {
      totalCandidates: users.length,
      universityDistribution,
      skillDistribution,
      graduationYearDistribution,
      nftRarityDistribution,
      averageProfileStrength: users.length > 0 ? totalProfileStrength / users.length : 0,
      topUniversities,
      emergingSkills,
      competitiveCompanies: ['Google', 'Meta', 'Microsoft', 'Amazon', 'Apple'], // Simulated
      marketSalaryRanges
    };
  }

  // Track application and hiring metrics
  public static async trackHiringMetrics(
    companyId: string,
    recruiterId: string
  ): Promise<{
    campaignMetrics: any[];
    hiringFunnel: any;
    sourcingEffectiveness: any;
    timeToHire: number;
    costPerHire: number;
  }> {
    // Get company campaigns
    const campaigns = await prisma.recruitmentCampaign.findMany({
      where: { companyId },
      include: {
        applications: {
          include: { user: true }
        }
      }
    });

    // Calculate metrics for each campaign
    const campaignMetrics = campaigns.map(campaign => ({
      id: campaign.id,
      title: campaign.title,
      applicationsReceived: campaign.applications.length,
      shortlistedCount: campaign.applications.filter((app: any) => app.status === 'shortlisted').length,
      interviewCount: campaign.applications.filter((app: any) => app.status === 'interview').length,
      offerCount: campaign.applications.filter((app: any) => app.status === 'offer').length,
      hiredCount: campaign.applications.filter((app: any) => app.status === 'hired').length,
      rejectedCount: campaign.applications.filter((app: any) => app.status === 'rejected').length,
      conversionRate: campaign.applications.length > 0 ?
        (campaign.applications.filter((app: any) => app.status === 'hired').length / campaign.applications.length) * 100 : 0,
      costPerHire: campaign.budget > 0 && campaign.applications.filter((app: any) => app.status === 'hired').length > 0 ?
        campaign.budget / campaign.applications.filter((app: any) => app.status === 'hired').length : 0
    }));

    // Overall hiring funnel
    const totalApplications = campaigns.reduce((sum, c) => sum + c.applications.length, 0);
    const totalShortlisted = campaigns.reduce((sum, c) =>
      sum + c.applications.filter((app: any) => app.status === 'shortlisted').length, 0);
    const totalHired = campaigns.reduce((sum, c) =>
      sum + c.applications.filter((app: any) => app.status === 'hired').length, 0);

    const hiringFunnel = {
      applications: totalApplications,
      shortlisted: totalShortlisted,
      hired: totalHired,
      applicationToShortlistRate: totalApplications > 0 ? (totalShortlisted / totalApplications) * 100 : 0,
      shortlistToHireRate: totalShortlisted > 0 ? (totalHired / totalShortlisted) * 100 : 0,
      overallConversionRate: totalApplications > 0 ? (totalHired / totalApplications) * 100 : 0
    };

    // Sourcing effectiveness (by university, skill, etc.)
    const sourcingEffectiveness = {
      byUniversity: this.calculateSourceEffectiveness(campaigns, 'university'),
      bySkill: this.calculateSourceEffectiveness(campaigns, 'skill'),
      byNFTRarity: this.calculateSourceEffectiveness(campaigns, 'nftRarity')
    };

    // Average time to hire (simulated)
    const timeToHire = 21; // days

    // Average cost per hire
    const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
    const costPerHire = totalHired > 0 ? totalBudget / totalHired : 0;

    return {
      campaignMetrics,
      hiringFunnel,
      sourcingEffectiveness,
      timeToHire,
      costPerHire
    };
  }

  // Helper methods
  private static extractUserSkills(nfts: any[], achievements: any[]): string[] {
    const skills = new Set<string>();

    // Extract from NFTs
    nfts.forEach(nft => {
      if (nft.achievement?.type) {
        skills.add(nft.achievement.type);
      }
    });

    // Extract from achievements
    achievements.forEach(achievement => {
      if (achievement.type) {
        skills.add(achievement.type);
      }
    });

    return Array.from(skills);
  }

  private static calculateProfileStrength(user: any): number {
    let strength = 0;

    // Basic profile (20 points)
    if (user.name) strength += 5;
    if (user.university) strength += 5;
    if (user.emailVerified) strength += 10;

    // Achievements (40 points)
    strength += Math.min(user.achievements?.length * 5 || 0, 20);
    const verifiedAchievements = user.achievements?.filter((a: any) => a.verificationStatus === 'verified').length || 0;
    strength += Math.min(verifiedAchievements * 2, 20);

    // NFTs (30 points)
    strength += Math.min(user.nfts?.length * 3 || 0, 15);
    const totalXP = user.nfts?.reduce((sum: number, nft: any) => sum + nft.evolutionPoints, 0) || 0;
    strength += Math.min(totalXP / 100, 15);

    // Social presence (10 points)
    if (user.socialProfile) {
      strength += Math.min((user.socialProfile.endorsements?.length || 0) * 2, 5);
      strength += Math.min((user.socialProfile.posts?.length || 0), 5);
    }

    return Math.min(strength, 100);
  }

  private static calculateMatchScore(user: any, criteria: TalentSearch): number {
    let score = 0;
    let factors = 0;

    // Skill matching
    if (criteria.skills?.length) {
      const userSkills = this.extractUserSkills(user.nfts, user.achievements);
      const matchingSkills = criteria.skills.filter(skill =>
        userSkills.some(userSkill => userSkill.toLowerCase().includes(skill.toLowerCase()))
      );
      score += (matchingSkills.length / criteria.skills.length) * 30;
      factors += 30;
    }

    // University preference
    if (criteria.universities?.length) {
      const universityMatch = criteria.universities.includes(user.university) ? 20 : 0;
      score += universityMatch;
      factors += 20;
    }

    // NFT rarity preference
    if (criteria.nftRarities?.length) {
      const userRarities = user.nfts.map((nft: any) => nft.rarity);
      const hasPreferredRarity = criteria.nftRarities.some(rarity => userRarities.includes(rarity));
      score += hasPreferredRarity ? 15 : 0;
      factors += 15;
    }

    // Achievement types
    if (criteria.achievementTypes?.length) {
      const userAchievementTypes = user.achievements.map((ach: any) => ach.type);
      const matchingTypes = criteria.achievementTypes.filter(type => userAchievementTypes.includes(type));
      score += (matchingTypes.length / criteria.achievementTypes.length) * 15;
      factors += 15;
    }

    // Profile strength factor
    const profileStrength = this.calculateProfileStrength(user);
    score += (profileStrength / 100) * 20;
    factors += 20;

    return factors > 0 ? (score / factors) * 100 : profileStrength;
  }

  private static extractCareerInterests(user: any): string[] {
    // Extract from user preferences or achievement patterns
    const interests = new Set<string>();

    const achievementTypes = user.achievements?.map((a: any) => a.type) || [];
    if (achievementTypes.includes('research')) interests.add('Research & Development');
    if (achievementTypes.includes('leadership')) interests.add('Management');
    if (achievementTypes.includes('internship')) interests.add('Industry Experience');
    if (achievementTypes.includes('project')) interests.add('Product Development');

    return Array.from(interests).slice(0, 4);
  }

  private static generateSearchInsights(profiles: TalentProfile[], criteria: TalentSearch): any {
    return {
      averageProfileStrength: profiles.reduce((sum, p) => sum + p.profileStrength, 0) / profiles.length,
      topUniversities: [...new Set(profiles.map(p => p.university))].slice(0, 5),
      skillDistribution: this.calculateSkillDistribution(profiles),
      availabilityBreakdown: this.calculateAvailabilityBreakdown(profiles)
    };
  }

  private static calculateSkillDistribution(profiles: TalentProfile[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    profiles.forEach(profile => {
      profile.topSkills.forEach(skill => {
        distribution[skill] = (distribution[skill] || 0) + 1;
      });
    });
    return distribution;
  }

  private static calculateAvailabilityBreakdown(profiles: TalentProfile[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    profiles.forEach(profile => {
      breakdown[profile.availabilityStatus] = (breakdown[profile.availabilityStatus] || 0) + 1;
    });
    return breakdown;
  }

  private static async generateCandidateAnalytics(user: any): Promise<any> {
    return {
      activityScore: this.calculateActivityScore(user),
      growthTrend: this.calculateGrowthTrend(user),
      skillProgression: this.analyzeSkillProgression(user),
      competitiveRanking: await this.calculateCompetitiveRanking(user)
    };
  }

  private static calculateActivityScore(user: any): number {
    const recentAchievements = user.achievements?.filter((a: any) =>
      new Date(a.createdAt) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    ).length || 0;

    const recentNFTs = user.nfts?.filter((n: any) =>
      new Date(n.createdAt) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    ).length || 0;

    return Math.min((recentAchievements * 10 + recentNFTs * 15), 100);
  }

  private static calculateGrowthTrend(user: any): string {
    // Simplified growth trend calculation
    const achievements = user.achievements || [];
    if (achievements.length < 2) return 'stable';

    const recent = achievements.filter((a: any) =>
      new Date(a.createdAt) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    ).length;

    const older = achievements.filter((a: any) => {
      const date = new Date(a.createdAt);
      const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
      return date <= threeMonthsAgo && date > sixMonthsAgo;
    }).length;

    if (recent > older) return 'rising';
    if (recent < older) return 'declining';
    return 'stable';
  }

  private static analyzeSkillProgression(user: any): any {
    const skillLevels: Record<string, number[]> = {};

    user.nfts?.forEach((nft: any) => {
      const skill = nft.achievement?.type;
      if (skill) {
        if (!skillLevels[skill]) skillLevels[skill] = [];
        skillLevels[skill].push(nft.level);
      }
    });

    const progression: Record<string, string> = {};
    Object.entries(skillLevels).forEach(([skill, levels]) => {
      const maxLevel = Math.max(...levels);
      const avgLevel = levels.reduce((sum, l) => sum + l, 0) / levels.length;

      if (maxLevel >= 4) progression[skill] = 'advanced';
      else if (avgLevel >= 2.5) progression[skill] = 'intermediate';
      else progression[skill] = 'beginner';
    });

    return progression;
  }

  private static async calculateCompetitiveRanking(user: any): Promise<number> {
    // Simplified ranking - would be more sophisticated in production
    const totalUsers = await prisma.user.count();
    const profileStrength = this.calculateProfileStrength(user);

    // Estimate percentile based on profile strength
    return Math.round((profileStrength / 100) * 95); // 95th percentile max
  }

  private static calculateSourceEffectiveness(campaigns: any[], source: string): any {
    // Simplified calculation - would be more detailed in production
    const effectiveness: Record<string, { applications: number; hired: number; rate: number }> = {};

    campaigns.forEach(campaign => {
      campaign.applications?.forEach((app: any) => {
        let sourceKey = 'Unknown';

        if (source === 'university') {
          sourceKey = app.user?.university || 'Unknown';
        } else if (source === 'skill') {
          sourceKey = 'General'; // Would extract from user profile
        }

        if (!effectiveness[sourceKey]) {
          effectiveness[sourceKey] = { applications: 0, hired: 0, rate: 0 };
        }

        effectiveness[sourceKey].applications++;
        if (app.status === 'hired') {
          effectiveness[sourceKey].hired++;
        }
      });
    });

    // Calculate rates
    Object.keys(effectiveness).forEach(key => {
      const data = effectiveness[key];
      data.rate = data.applications > 0 ? (data.hired / data.applications) * 100 : 0;
    });

    return effectiveness;
  }
}

export const hrPortalService = HRPortalService;