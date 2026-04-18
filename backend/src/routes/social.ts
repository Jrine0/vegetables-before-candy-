import express from 'express';
import { prisma } from '../server';
import { authenticateToken, requireEmailVerification } from '../middleware/auth';
import { socialGamificationService } from '../services/socialGamification';

const router = express.Router();

// Initialize or get social profile
router.get('/profile', authenticateToken, async (req: any, res) => {
  try {
    let socialProfile = await prisma.socialProfile.findUnique({
      where: { userId: req.userId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            university: true,
            email: true
          }
        }
      }
    });

    if (!socialProfile) {
      socialProfile = await socialGamificationService.initializeSocialProfile(req.userId);
    }

    const stats = await socialGamificationService.getUserSocialStats(req.userId);

    res.json({
      profile: socialProfile,
      stats
    });
  } catch (error) {
    console.error('Get social profile error:', error);
    res.status(500).json({ error: 'Failed to get social profile' });
  }
});

// Update social profile
router.put('/profile', authenticateToken, async (req: any, res) => {
  try {
    const {
      displayName,
      bio,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      isPublic,
      showNFTs,
      showAchievements
    } = req.body;

    const updatedProfile = await prisma.socialProfile.upsert({
      where: { userId: req.userId },
      update: {
        displayName,
        bio,
        linkedinUrl,
        githubUrl,
        portfolioUrl,
        isPublic,
        showNFTs,
        showAchievements
      },
      create: {
        userId: req.userId,
        displayName,
        bio,
        linkedinUrl,
        githubUrl,
        portfolioUrl,
        isPublic,
        showNFTs,
        showAchievements
      }
    });

    res.json(updatedProfile);
  } catch (error) {
    console.error('Update social profile error:', error);
    res.status(500).json({ error: 'Failed to update social profile' });
  }
});

// Get activity feed
router.get('/feed', authenticateToken, async (req: any, res) => {
  try {
    const { page = 1, limit = 20, type = 'global' } = req.query;

    const feed = await socialGamificationService.getActivityFeed(
      req.userId,
      parseInt(page as string),
      parseInt(limit as string),
      type as 'global' | 'university' | 'following'
    );

    res.json({
      posts: feed,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      hasMore: feed.length === parseInt(limit as string)
    });
  } catch (error) {
    console.error('Get activity feed error:', error);
    res.status(500).json({ error: 'Failed to get activity feed' });
  }
});

// Create social post
router.post('/posts', authenticateToken, requireEmailVerification, async (req: any, res) => {
  try {
    const { type, title, content, imageUrl, achievementId, nftId, isPublic } = req.body;

    const post = await socialGamificationService.createSocialPost(req.userId, {
      type,
      title,
      content,
      imageUrl,
      achievementId,
      nftId,
      isPublic
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Create social post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Like/Unlike post
router.post('/posts/:id/like', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;

    const result = await socialGamificationService.togglePostLike(req.userId, id);

    res.json(result);
  } catch (error) {
    console.error('Toggle post like error:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// Create peer endorsement
router.post('/endorse', authenticateToken, requireEmailVerification, async (req: any, res) => {
  try {
    const { endorseeId, achievementId, type, message, isPublic } = req.body;

    const endorsement = await socialGamificationService.createEndorsement(
      req.userId,
      endorseeId,
      achievementId,
      { type, message, isPublic }
    );

    res.status(201).json(endorsement);
  } catch (error: any) {
    console.error('Create endorsement error:', error);
    res.status(400).json({ error: error.message || 'Failed to create endorsement' });
  }
});

// Get user's endorsements
router.get('/endorsements', authenticateToken, async (req: any, res) => {
  try {
    const { received = 'true' } = req.query;

    const endorsements = await prisma.endorsement.findMany({
      where: received === 'true' ?
        { endorseeId: req.userId } :
        { endorserId: req.userId },
      include: {
        endorser: {
          select: {
            firstName: true,
            lastName: true,
            university: true,
            socialProfile: {
              select: { displayName: true, avatarUrl: true }
            }
          }
        },
        endorsee: {
          select: {
            firstName: true,
            lastName: true,
            university: true,
            socialProfile: {
              select: { displayName: true, avatarUrl: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(endorsements);
  } catch (error) {
    console.error('Get endorsements error:', error);
    res.status(500).json({ error: 'Failed to get endorsements' });
  }
});

// Get leaderboards
router.get('/leaderboards', authenticateToken, async (req: any, res) => {
  try {
    const { type = 'global', category = 'overall', limit = 50 } = req.query;

    const leaderboard = await socialGamificationService.getLeaderboard(
      type as string,
      category as string,
      parseInt(limit as string)
    );

    // Get current user's position
    const userPosition = leaderboard.findIndex(entry => entry.userId === req.userId);

    res.json({
      leaderboard,
      userPosition: userPosition >= 0 ? userPosition + 1 : null,
      totalEntries: leaderboard.length
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// Trigger leaderboard generation (admin only)
router.post('/leaderboards/generate', authenticateToken, async (req: any, res) => {
  try {
    // In production, this would be admin-only
    await socialGamificationService.generateLeaderboards();
    res.json({ message: 'Leaderboards generated successfully' });
  } catch (error) {
    console.error('Generate leaderboards error:', error);
    res.status(500).json({ error: 'Failed to generate leaderboards' });
  }
});

// Get user badges
router.get('/badges', authenticateToken, async (req: any, res) => {
  try {
    const userBadges = await prisma.userBadge.findMany({
      where: { userId: req.userId },
      orderBy: { earnedAt: 'desc' }
    });

    const badges = await prisma.badge.findMany({
      where: { id: { in: userBadges.map(ub => ub.badgeId) } }
    });

    const badgesWithEarnedDate = badges.map(badge => {
      const userBadge = userBadges.find(ub => ub.badgeId === badge.id);
      return {
        ...badge,
        earnedAt: userBadge?.earnedAt
      };
    });

    res.json(badgesWithEarnedDate);
  } catch (error) {
    console.error('Get user badges error:', error);
    res.status(500).json({ error: 'Failed to get badges' });
  }
});

// Check and award badges (can be called after achievements)
router.post('/badges/check', authenticateToken, async (req: any, res) => {
  try {
    const newBadges = await socialGamificationService.checkAndAwardBadges(req.userId);
    res.json({
      newBadges,
      message: newBadges.length > 0 ?
        `Congratulations! You earned ${newBadges.length} new badge(s)!` :
        'No new badges earned yet. Keep achieving!'
    });
  } catch (error) {
    console.error('Check badges error:', error);
    res.status(500).json({ error: 'Failed to check badges' });
  }
});

// Get public profile of any user
router.get('/users/:userId/profile', authenticateToken, async (req: any, res) => {
  try {
    const { userId } = req.params;

    const socialProfile = await prisma.socialProfile.findUnique({
      where: { userId, isPublic: true },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            university: true,
            nftTokens: {
              where: { minted: true },
              orderBy: { level: 'desc' },
              take: 10
            },
            achievements: {
              where: { verified: true },
              orderBy: { createdAt: 'desc' },
              take: 5
            }
          }
        }
      }
    });

    if (!socialProfile) {
      return res.status(404).json({ error: 'Profile not found or private' });
    }

    const stats = await socialGamificationService.getUserSocialStats(userId);

    res.json({
      profile: socialProfile,
      stats,
      isOwnProfile: userId === req.userId
    });
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Award points manually (for testing/admin)
router.post('/points/award', authenticateToken, async (req: any, res) => {
  try {
    const { points = 100, reason = 'manual_award' } = req.body;

    const result = await socialGamificationService.awardPoints(req.userId, points, reason);

    res.json(result);
  } catch (error) {
    console.error('Award points error:', error);
    res.status(500).json({ error: 'Failed to award points' });
  }
});

// Get social insights/analytics
router.get('/insights', authenticateToken, async (req: any, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const insights = {
      totalUsers: await prisma.socialProfile.count(),
      activeUsers: await prisma.socialProfile.count({
        where: {
          updatedAt: { gte: thirtyDaysAgo }
        }
      }),
      totalPosts: await prisma.socialPost.count(),
      recentPosts: await prisma.socialPost.count({
        where: {
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      totalEndorsements: await prisma.endorsement.count(),
      recentEndorsements: await prisma.endorsement.count({
        where: {
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      topPerformers: await prisma.socialProfile.findMany({
        orderBy: { totalPoints: 'desc' },
        take: 10,
        include: {
          user: {
            select: { firstName: true, lastName: true, university: true }
          }
        }
      })
    };

    res.json(insights);
  } catch (error) {
    console.error('Get social insights error:', error);
    res.status(500).json({ error: 'Failed to get insights' });
  }
});

export default router;