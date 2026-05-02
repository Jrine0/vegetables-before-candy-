// @ts-nocheck
import { prisma } from '../server';

export interface LeaderboardEntry {
  userId: string;
  rank: number;
  score: number;
  user: {
    firstName: string;
    lastName: string;
    university: string;
    socialProfile?: {
      displayName: string;
      avatarUrl?: string;
      level: number;
      totalPoints: number;
    };
  };
  nftStats: {
    totalNFTs: number;
    highestLevel: number;
    rareCount: number;
  };
}

export interface BadgeCondition {
  type: 'achievement_count' | 'nft_level' | 'gpa_threshold' | 'consecutive_months' | 'endorsement_count';
  threshold: number;
  category?: string;
}

export class SocialGamificationService {

  // Initialize user's social profile
  public static async initializeSocialProfile(userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { socialProfile: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.socialProfile) {
      return user.socialProfile;
    }

    const socialProfile = await prisma.socialProfile.create({
      data: {
        userId,
        displayName: `${user.firstName} ${user.lastName}`,
            bio: `${user.university} student focused on completing goals and earning rewards`,
            totalPoints: 0,
            level: 1,
            streak: 0
          }
        });

        // Create welcome post
        await this.createSocialPost(userId, {
          type: 'welcome',
          title: '🎉 Welcome to vegetables-before-candy!',
          content: `Just joined the platform to complete tasks, verify progress, and claim rewards!`,
  }

  // Create social post for achievements
  public static async createSocialPost(userId: string, postData: {
    type: string;
    title: string;
    content: string;
    imageUrl?: string;
    achievementId?: string;
    nftId?: string;
    isPublic?: boolean;
  }): Promise<any> {
    const post = await prisma.socialPost.create({
      data: {
        userId,
        ...postData,
        isPublic: postData.isPublic ?? true
      }
    });

    // Award points for social engagement
    await this.awardPoints(userId, 10, 'social_post_created');

    return post;
  }

  // Get activity feed
  public static async getActivityFeed(
    userId: string,
    page: number = 1,
    limit: number = 20,
    feedType: 'global' | 'university' | 'following' = 'global'
  ): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { university: true }
    });

    let whereClause: any = { isPublic: true };

    if (feedType === 'university') {
      // Get posts from same university
      whereClause.user = { university: user?.university };
    }

    const posts = await prisma.socialPost.findMany({
      where: whereClause,
      include: {
        user: {
          include: {
            socialProfile: true,
            nftTokens: {
              where: { minted: true },
              take: 3,
              orderBy: { level: 'desc' }
            }
          }
        },
        socialLikes: {
          where: { userId },
          select: { id: true }
        },
        _count: {
          select: { socialLikes: true }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    });

    // Increment view counts
    const postIds = posts.map(p => p.id);
    await prisma.socialPost.updateMany({
      where: { id: { in: postIds } },
      data: { views: { increment: 1 } }
    });

    return posts.map(post => ({
      ...post,
      isLiked: post.socialLikes.length > 0,
      likesCount: post._count.socialLikes,
      userNFTPreview: post.user.nftTokens
    }));
  }

  // Like/Unlike post
  public static async togglePostLike(userId: string, postId: string): Promise<{ liked: boolean; totalLikes: number }> {
    const existingLike = await prisma.socialLike.findUnique({
      where: { userId_postId: { userId, postId } }
    });

    if (existingLike) {
      // Unlike
      await prisma.socialLike.delete({
        where: { id: existingLike.id }
      });

      await prisma.socialPost.update({
        where: { id: postId },
        data: { likes: { decrement: 1 } }
      });

      const post = await prisma.socialPost.findUnique({
        where: { id: postId },
        select: { likes: true }
      });

      return { liked: false, totalLikes: post?.likes || 0 };
    } else {
      // Like
      await prisma.socialLike.create({
        data: { userId, postId }
      });

      await prisma.socialPost.update({
        where: { id: postId },
        data: { likes: { increment: 1 } }
      });

      const post = await prisma.socialPost.findUnique({
        where: { id: postId },
        select: { likes: true, userId: true }
      });

      // Award points to post author
      if (post && post.userId !== userId) {
        await this.awardPoints(post.userId, 5, 'post_liked');
      }

      return { liked: true, totalLikes: post?.likes || 0 };
    }
  }

  // Create peer endorsement
  public static async createEndorsement(
    endorserId: string,
    endorseeId: string,
    achievementId: string | null,
    endorsementData: {
      type: string;
      message: string;
      isPublic?: boolean;
    }
  ): Promise<any> {
    if (endorserId === endorseeId) {
      throw new Error('Cannot endorse yourself');
    }

    const endorsement = await prisma.endorsement.create({
      data: {
        endorserId,
        endorseeId,
        achievementId,
        ...endorsementData,
        isPublic: endorsementData.isPublic ?? true
      }
    });

    // Award points
    await this.awardPoints(endorserId, 15, 'endorsement_given');
    await this.awardPoints(endorseeId, 25, 'endorsement_received');

    // Create notification post for endorsee
    const endorser = await prisma.user.findUnique({
      where: { id: endorserId },
      select: { firstName: true, lastName: true }
    });

    await this.createSocialPost(endorseeId, {
      type: 'endorsement_received',
      title: '⭐ Received New Endorsement!',
      content: `${endorser?.firstName} ${endorser?.lastName} endorsed me for ${endorsementData.type}: "${endorsementData.message}"`,
      isPublic: true
    });

    return endorsement;
  }

  // Generate leaderboards
  public static async generateLeaderboards(): Promise<void> {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const currentWeek = this.getWeekString(new Date());

    // Overall leaderboard (based on total points)
    await this.generateLeaderboard('global', 'overall', currentMonth);
    await this.generateLeaderboard('weekly', 'overall', currentWeek);

    // GPA leaderboard
    await this.generateLeaderboard('global', 'gpa', currentMonth);

    // Research leaderboard (research NFT count + level)
    await this.generateLeaderboard('global', 'research', currentMonth);

    // Leadership leaderboard
    await this.generateLeaderboard('global', 'leadership', currentMonth);

    // University-specific leaderboards
    const universities = await prisma.user.groupBy({
      by: ['university'],
      _count: { id: true }
    });

    for (const uni of universities) {
      await this.generateLeaderboard('university', 'overall', currentMonth, uni.university);
    }
  }

  private static async generateLeaderboard(
    type: string,
    category: string,
    period: string,
    university?: string
  ): Promise<void> {
    let users: any[] = [];

    const baseWhere = university ? { university } : {};

    switch (category) {
      case 'overall':
        users = await prisma.user.findMany({
          where: baseWhere,
          include: {
            socialProfile: true,
            nftTokens: { where: { minted: true } },
            achievements: { where: { verified: true } }
          }
        });

        users = users.map(user => ({
          ...user,
          score: (user.socialProfile?.totalPoints || 0) +
            (user.nftTokens.reduce((sum: number, nft: any) => sum + nft.level * nft.evolutionPoints, 0)) +
            (user.achievements.length * 50)
        }));
        break;

      case 'gpa':
        users = await prisma.user.findMany({
          where: baseWhere,
          include: {
            achievements: {
              where: { type: 'gpa', verified: true },
              orderBy: { gpaValue: 'desc' },
              take: 1
            }
          }
        });

        users = users
          .filter(user => user.achievements.length > 0)
          .map(user => ({
            ...user,
            score: user.achievements[0]?.gpaValue || 0
          }));
        break;

      case 'research':
        users = await prisma.user.findMany({
          where: baseWhere,
          include: {
            nftTokens: {
              where: { nftType: 'research_rockstar', minted: true }
            }
          }
        });

        users = users.map(user => ({
          ...user,
          score: user.nftTokens.reduce((sum: number, nft: any) => sum + nft.level + nft.evolutionPoints / 10, 0)
        }));
        break;

      case 'leadership':
        users = await prisma.user.findMany({
          where: baseWhere,
          include: {
            nftTokens: {
              where: { nftType: 'leadership_legend', minted: true }
            },
            endorsementsReceived: {
              where: { type: 'leadership' }
            }
          }
        });

        users = users.map(user => ({
          ...user,
          score: user.nftTokens.reduce((sum: number, nft: any) => sum + nft.level + nft.evolutionPoints / 10, 0) +
            user.endorsementsReceived.length * 20
        }));
        break;
    }

    // Sort by score and assign ranks
    users.sort((a, b) => b.score - a.score);

    // Clear existing leaderboard entries for this period
    await prisma.leaderboard.deleteMany({
      where: { type, category, period }
    });

    // Insert new leaderboard entries
    const leaderboardEntries = users.slice(0, 100).map((user, index) => ({
      type,
      category,
      period,
      userId: user.id,
      rank: index + 1,
      score: user.score
    }));

    if (leaderboardEntries.length > 0) {
      await prisma.leaderboard.createMany({
        data: leaderboardEntries
      });
    }
  }

  // Get leaderboard
  public static async getLeaderboard(
    type: string,
    category: string,
    limit: number = 50
  ): Promise<LeaderboardEntry[]> {
    const currentPeriod = type === 'weekly' ?
      this.getWeekString(new Date()) :
      new Date().toISOString().slice(0, 7);

    const leaderboard = await prisma.leaderboard.findMany({
      where: { type, category, period: currentPeriod },
      include: {
        userId: true
      },
      orderBy: { rank: 'asc' },
      take: limit
    });

    const userIds = leaderboard.map(entry => entry.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      include: {
        socialProfile: true,
        nftTokens: { where: { minted: true } }
      }
    });

    const userMap = users.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {} as any);

    return leaderboard.map(entry => {
      const user = userMap[entry.userId];
      const nftStats = {
        totalNFTs: user.nftTokens.length,
        highestLevel: Math.max(...user.nftTokens.map((nft: any) => nft.level), 0),
        rareCount: user.nftTokens.filter((nft: any) => ['rare', 'epic', 'legendary', 'mythic'].includes(nft.rarity)).length
      };

      return {
        userId: entry.userId,
        rank: entry.rank,
        score: entry.score,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          university: user.university,
          socialProfile: user.socialProfile
        },
        nftStats
      } as LeaderboardEntry;
    });
  }

  // Award points and handle level progression
  public static async awardPoints(userId: string, points: number, reason: string): Promise<any> {
    let socialProfile = await prisma.socialProfile.findUnique({
      where: { userId }
    });

    if (!socialProfile) {
      socialProfile = await this.initializeSocialProfile(userId);
    }

    const newTotalPoints = socialProfile.totalPoints + points;
    const newLevel = Math.floor(newTotalPoints / 1000) + 1; // Level up every 1000 points
    const leveledUp = newLevel > socialProfile.level;

    const updatedProfile = await prisma.socialProfile.update({
      where: { userId },
      data: {
        totalPoints: newTotalPoints,
        level: newLevel
      }
    });

    // Create level up post
    if (leveledUp) {
      await this.createSocialPost(userId, {
        type: 'level_up',
        title: `🎉 Level Up! Reached Level ${newLevel}`,
        content: `Just reached level ${newLevel} with ${newTotalPoints} total points! Keep climbing! 🚀`,
        isPublic: true
      });

      // Check for level-based badge awards
      await this.checkAndAwardBadges(userId);
    }

    return {
      pointsAwarded: points,
      reason,
      newTotalPoints,
      newLevel,
      leveledUp,
      profile: updatedProfile
    };
  }

  // Badge system
  public static async checkAndAwardBadges(userId: string): Promise<any[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        socialProfile: true,
        achievements: { where: { verified: true } },
        nftTokens: { where: { minted: true } },
        endorsementsReceived: true
      }
    });

    if (!user) return [];

    const availableBadges = await this.getAvailableBadges();
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      select: { badgeId: true }
    });

    const earnedBadgeIds = userBadges.map(ub => ub.badgeId);
    const newBadges = [];

    for (const badge of availableBadges) {
      if (earnedBadgeIds.includes(badge.id)) continue;

      if (this.checkBadgeCondition(badge.condition as BadgeCondition[], user)) {
        await prisma.userBadge.create({
          data: { userId, badgeId: badge.id }
        });

        newBadges.push(badge);

        // Create badge earned post
        await this.createSocialPost(userId, {
          type: 'badge_earned',
          title: `🏆 Badge Earned: ${badge.name}`,
          content: `Just earned the "${badge.name}" badge! ${badge.description}`,
          imageUrl: badge.iconUrl,
          isPublic: true
        });

        // Award bonus points for badge
        await this.awardPoints(userId, 100, `badge_earned_${badge.name}`);
      }
    }

    return newBadges;
  }

  private static checkBadgeCondition(conditions: BadgeCondition[], user: any): boolean {
    return conditions.every(condition => {
      switch (condition.type) {
        case 'achievement_count':
          return user.achievements.length >= condition.threshold;
        case 'nft_level':
          return user.nftTokens.some((nft: any) => nft.level >= condition.threshold);
        case 'gpa_threshold':
          const gpaAch = user.achievements.find((a: any) => a.type === 'gpa');
          return gpaAch && gpaAch.gpaValue >= condition.threshold;
        case 'endorsement_count':
          return user.endorsementsReceived.length >= condition.threshold;
        default:
          return false;
      }
    });
  }

  private static async getAvailableBadges(): Promise<any[]> {
    return await prisma.badge.findMany({
      where: { isActive: true }
    });
  }

  private static getWeekString(date: Date): string {
    const year = date.getFullYear();
    const week = Math.ceil((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }

  // Get user's social stats
  public static async getUserSocialStats(userId: string): Promise<any> {
    const socialProfile = await prisma.socialProfile.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            posts: {
              select: {
                _count: { select: { socialLikes: true } },
                views: true
              }
            },
            endorsementsReceived: {
              select: { type: true }
            }
          }
        }
      }
    });

    if (!socialProfile) {
      return null;
    }

    const totalLikes = socialProfile.user.posts.reduce((sum, post) => sum + post._count.socialLikes, 0);
    const totalViews = socialProfile.user.posts.reduce((sum, post) => sum + post.views, 0);
    const endorsementsByType = socialProfile.user.endorsementsReceived.reduce((acc, endorsement) => {
      acc[endorsement.type] = (acc[endorsement.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      ...socialProfile,
      engagement: {
        totalLikes,
        totalViews,
        totalPosts: socialProfile.user.posts.length,
        avgLikesPerPost: socialProfile.user.posts.length > 0 ? totalLikes / socialProfile.user.posts.length : 0
      },
      endorsements: {
        total: socialProfile.user.endorsementsReceived.length,
        byType: endorsementsByType
      }
    };
  }
}

export const socialGamificationService = SocialGamificationService;