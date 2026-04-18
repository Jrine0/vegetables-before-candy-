import express from 'express';
import { prisma } from '../server';
import { authenticateToken, requireEmailVerification } from '../middleware/auth';
import { analyticsService, UserAnalytics, MarketTrends } from '../services/analyticsService';

const router = express.Router();

// Get comprehensive user analytics
router.get('/user/:userId', authenticateToken, async (req: any, res) => {
  try {
    const { userId } = req.params;

    // Ensure user can only access their own analytics or is admin
    if (req.userId !== userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const analytics = await analyticsService.generateUserAnalytics(userId);

    res.json({
      success: true,
      analytics,
      generatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Get user analytics error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate analytics' });
  }
});

// Get current user's analytics (convenience endpoint)
router.get('/me', authenticateToken, async (req: any, res) => {
  try {
    const analytics = await analyticsService.generateUserAnalytics(req.userId);

    res.json({
      success: true,
      analytics,
      generatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Get my analytics error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate analytics' });
  }
});

// Get career predictions for user
router.get('/career-predictions', authenticateToken, async (req: any, res) => {
  try {
    const [nfts, achievements] = await Promise.all([
      prisma.nFTToken.findMany({ 
        where: { userId: req.userId },
        include: { achievement: true }
      }),
      prisma.achievement.findMany({ 
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const predictions = await analyticsService.generateCareerPredictions(req.userId, nfts, achievements);

    res.json({
      success: true,
      predictions,
      totalPredictions: predictions.length,
      topPrediction: predictions[0] || null
    });
  } catch (error: any) {
    console.error('Get career predictions error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate career predictions' });
  }
});

// Get market trends and insights
router.get('/market-trends', authenticateToken, async (req: any, res) => {
  try {
    const { skill, limit = 10 } = req.query;

    let trends = await analyticsService.getMarketTrends();

    // Filter by skill if provided
    if (skill) {
      trends = trends.filter(trend => 
        trend.skill.toLowerCase().includes((skill as string).toLowerCase())
      );
    }

    // Limit results
    trends = trends.slice(0, parseInt(limit as string));

    res.json({
      success: true,
      trends,
      totalTrends: trends.length,
      lastUpdated: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Get market trends error:', error);
    res.status(500).json({ error: error.message || 'Failed to get market trends' });
  }
});

// Get platform-wide analytics (admin only)
router.get('/platform', authenticateToken, async (req: any, res) => {
  try {
    // Check if user is admin
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get platform statistics
    const [
      totalUsers,
      totalNFTs,
      totalAchievements,
      totalOpportunities,
      verifiedAchievements,
      mintedNFTs,
      activeUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.nFTToken.count(),
      prisma.achievement.count(),
      prisma.opportunity.count(),
      prisma.achievement.count({ where: { verified: true } }),
      prisma.nFTToken.count({ where: { minted: true } }),
      prisma.user.count({ 
        where: { 
          lastLoginAt: { 
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          } 
        } 
      })
    ]);

    // Get user growth over time
    const userGrowthData = await prisma.user.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      orderBy: { createdAt: 'asc' }
    });

    // Process growth data by month
    const monthlyGrowth = userGrowthData.reduce((acc, user) => {
      const month = new Date(user.createdAt).toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + user._count.id;
      return acc;
    }, {} as Record<string, number>);

    // Get NFT rarity distribution
    const rarityDistribution = await prisma.nFTToken.groupBy({
      by: ['rarity'],
      _count: { id: true }
    });

    // Get achievement type distribution
    const achievementTypeDistribution = await prisma.achievement.groupBy({
      by: ['type'],
      _count: { id: true }
    });

    // Get top universities
    const universityStats = await prisma.user.groupBy({
      by: ['university'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    });

    // Calculate engagement metrics
    const engagementMetrics = {
      averageNFTsPerUser: totalUsers > 0 ? (totalNFTs / totalUsers).toFixed(2) : 0,
      averageAchievementsPerUser: totalUsers > 0 ? (totalAchievements / totalUsers).toFixed(2) : 0,
      verificationRate: totalAchievements > 0 ? ((verifiedAchievements / totalAchievements) * 100).toFixed(1) : 0,
      mintingRate: totalNFTs > 0 ? ((mintedNFTs / totalNFTs) * 100).toFixed(1) : 0,
      activeUserRate: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0
    };

    res.json({
      success: true,
      platformStats: {
        totalUsers,
        totalNFTs,
        totalAchievements,
        totalOpportunities,
        verifiedAchievements,
        mintedNFTs,
        activeUsers
      },
      growthData: {
        monthlyGrowth,
        totalMonths: Object.keys(monthlyGrowth).length
      },
      distributions: {
        nftRarity: rarityDistribution,
        achievementTypes: achievementTypeDistribution
      },
      topUniversities: universityStats,
      engagementMetrics,
      generatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Get platform analytics error:', error);
    res.status(500).json({ error: error.message || 'Failed to get platform analytics' });
  }
});

// Get skill gap analysis for user
router.get('/skill-gaps', authenticateToken, async (req: any, res) => {
  try {
    const analytics = await analyticsService.generateUserAnalytics(req.userId);
    
    res.json({
      success: true,
      skillGaps: analytics.skillGaps,
      totalGaps: analytics.skillGaps.length,
      highPriorityGaps: analytics.skillGaps.filter(gap => gap.priority === 'high').length
    });
  } catch (error: any) {
    console.error('Get skill gaps error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze skill gaps' });
  }
});

// Get user's market position
router.get('/market-position', authenticateToken, async (req: any, res) => {
  try {
    const analytics = await analyticsService.generateUserAnalytics(req.userId);
    
    res.json({
      success: true,
      marketPosition: analytics.marketPosition,
      profileStrength: analytics.profileStrength
    });
  } catch (error: any) {
    console.error('Get market position error:', error);
    res.status(500).json({ error: error.message || 'Failed to calculate market position' });
  }
});

// Get network insights for user
router.get('/network-insights', authenticateToken, async (req: any, res) => {
  try {
    const analytics = await analyticsService.generateUserAnalytics(req.userId);
    
    res.json({
      success: true,
      networkInsights: analytics.networkInsights
    });
  } catch (error: any) {
    console.error('Get network insights error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate network insights' });
  }
});

// Get achievement trends for user
router.get('/achievement-trends', authenticateToken, async (req: any, res) => {
  try {
    const analytics = await analyticsService.generateUserAnalytics(req.userId);
    
    res.json({
      success: true,
      achievementTrends: analytics.achievementTrends
    });
  } catch (error: any) {
    console.error('Get achievement trends error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze achievement trends' });
  }
});

// Compare user with peers
router.get('/peer-comparison', authenticateToken, async (req: any, res) => {
  try {
    const { university, graduationYear } = req.query;

    // Get current user's analytics
    const userAnalytics = await analyticsService.generateUserAnalytics(req.userId);

    // Get similar users for comparison
    const whereClause: any = {
      id: { not: req.userId } // Exclude current user
    };

    if (university) whereClause.university = university as string;
    if (graduationYear) whereClause.graduationYear = parseInt(graduationYear as string);

    const peers = await prisma.user.findMany({
      where: whereClause,
      include: {
        nftTokens: true,
        achievements: true
      },
      take: 50 // Limit for performance
    });

    // Calculate peer statistics
    const peerStats = {
      averageNFTs: 0,
      averageAchievements: 0,
      averageProfileStrength: 0,
      totalPeers: peers.length
    };

    if (peers.length > 0) {
      const peerMetrics = await Promise.all(
        peers.map(async (peer) => {
          try {
            const peerAnalytics = await analyticsService.generateUserAnalytics(peer.id);
            return {
              nftCount: peer.nftTokens.length,
              achievementCount: peer.achievements.length,
              profileStrength: peerAnalytics.profileStrength
            };
          } catch (error) {
            return {
              nftCount: peer.nftTokens.length,
              achievementCount: peer.achievements.length,
              profileStrength: 50 // Default
            };
          }
        })
      );

      peerStats.averageNFTs = peerMetrics.reduce((sum, peer) => sum + peer.nftCount, 0) / peers.length;
      peerStats.averageAchievements = peerMetrics.reduce((sum, peer) => sum + peer.achievementCount, 0) / peers.length;
      peerStats.averageProfileStrength = peerMetrics.reduce((sum, peer) => sum + peer.profileStrength, 0) / peers.length;
    }

    // Calculate user's ranking
    const userNFTCount = await prisma.nFTToken.count({ where: { userId: req.userId } });
    const userAchievementCount = await prisma.achievement.count({ where: { userId: req.userId } });

    const comparison = {
      nfts: {
        user: userNFTCount,
        peerAverage: Math.round(peerStats.averageNFTs * 10) / 10,
        performance: userNFTCount > peerStats.averageNFTs ? 'above' : userNFTCount === peerStats.averageNFTs ? 'average' : 'below'
      },
      achievements: {
        user: userAchievementCount,
        peerAverage: Math.round(peerStats.averageAchievements * 10) / 10,
        performance: userAchievementCount > peerStats.averageAchievements ? 'above' : userAchievementCount === peerStats.averageAchievements ? 'average' : 'below'
      },
      profileStrength: {
        user: userAnalytics.profileStrength,
        peerAverage: Math.round(peerStats.averageProfileStrength * 10) / 10,
        performance: userAnalytics.profileStrength > peerStats.averageProfileStrength ? 'above' : userAnalytics.profileStrength === peerStats.averageProfileStrength ? 'average' : 'below'
      }
    };

    res.json({
      success: true,
      comparison,
      peerStats,
      filters: { university, graduationYear }
    });
  } catch (error: any) {
    console.error('Get peer comparison error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate peer comparison' });
  }
});

export default router;