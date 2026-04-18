"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server_1 = require("../server");
const auth_1 = require("../middleware/auth");
const analyticsService_1 = require("../services/analyticsService");
const router = express_1.default.Router();
router.get('/user/:userId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        if (req.userId !== userId && req.userRole !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        const analytics = await analyticsService_1.analyticsService.generateUserAnalytics(userId);
        res.json({
            success: true,
            analytics,
            generatedAt: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Get user analytics error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate analytics' });
    }
});
router.get('/me', auth_1.authenticateToken, async (req, res) => {
    try {
        const analytics = await analyticsService_1.analyticsService.generateUserAnalytics(req.userId);
        res.json({
            success: true,
            analytics,
            generatedAt: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Get my analytics error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate analytics' });
    }
});
router.get('/career-predictions', auth_1.authenticateToken, async (req, res) => {
    try {
        const [nfts, achievements] = await Promise.all([
            server_1.prisma.nFTToken.findMany({
                where: { userId: req.userId },
                include: { achievement: true }
            }),
            server_1.prisma.achievement.findMany({
                where: { userId: req.userId },
                orderBy: { createdAt: 'desc' }
            })
        ]);
        const predictions = await analyticsService_1.analyticsService.generateCareerPredictions(req.userId, nfts, achievements);
        res.json({
            success: true,
            predictions,
            totalPredictions: predictions.length,
            topPrediction: predictions[0] || null
        });
    }
    catch (error) {
        console.error('Get career predictions error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate career predictions' });
    }
});
router.get('/market-trends', auth_1.authenticateToken, async (req, res) => {
    try {
        const { skill, limit = 10 } = req.query;
        let trends = await analyticsService_1.analyticsService.getMarketTrends();
        if (skill) {
            trends = trends.filter(trend => trend.skill.toLowerCase().includes(skill.toLowerCase()));
        }
        trends = trends.slice(0, parseInt(limit));
        res.json({
            success: true,
            trends,
            totalTrends: trends.length,
            lastUpdated: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Get market trends error:', error);
        res.status(500).json({ error: error.message || 'Failed to get market trends' });
    }
});
router.get('/platform', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = await server_1.prisma.user.findUnique({ where: { id: req.userId } });
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const [totalUsers, totalNFTs, totalAchievements, totalOpportunities, verifiedAchievements, mintedNFTs, activeUsers] = await Promise.all([
            server_1.prisma.user.count(),
            server_1.prisma.nFTToken.count(),
            server_1.prisma.achievement.count(),
            server_1.prisma.opportunity.count(),
            server_1.prisma.achievement.count({ where: { verified: true } }),
            server_1.prisma.nFTToken.count({ where: { minted: true } }),
            server_1.prisma.user.count({
                where: {
                    lastLoginAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    }
                }
            })
        ]);
        const userGrowthData = await server_1.prisma.user.groupBy({
            by: ['createdAt'],
            _count: { id: true },
            orderBy: { createdAt: 'asc' }
        });
        const monthlyGrowth = userGrowthData.reduce((acc, user) => {
            const month = new Date(user.createdAt).toISOString().slice(0, 7);
            acc[month] = (acc[month] || 0) + user._count.id;
            return acc;
        }, {});
        const rarityDistribution = await server_1.prisma.nFTToken.groupBy({
            by: ['rarity'],
            _count: { id: true }
        });
        const achievementTypeDistribution = await server_1.prisma.achievement.groupBy({
            by: ['type'],
            _count: { id: true }
        });
        const universityStats = await server_1.prisma.user.groupBy({
            by: ['university'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 10
        });
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
    }
    catch (error) {
        console.error('Get platform analytics error:', error);
        res.status(500).json({ error: error.message || 'Failed to get platform analytics' });
    }
});
router.get('/skill-gaps', auth_1.authenticateToken, async (req, res) => {
    try {
        const analytics = await analyticsService_1.analyticsService.generateUserAnalytics(req.userId);
        res.json({
            success: true,
            skillGaps: analytics.skillGaps,
            totalGaps: analytics.skillGaps.length,
            highPriorityGaps: analytics.skillGaps.filter(gap => gap.priority === 'high').length
        });
    }
    catch (error) {
        console.error('Get skill gaps error:', error);
        res.status(500).json({ error: error.message || 'Failed to analyze skill gaps' });
    }
});
router.get('/market-position', auth_1.authenticateToken, async (req, res) => {
    try {
        const analytics = await analyticsService_1.analyticsService.generateUserAnalytics(req.userId);
        res.json({
            success: true,
            marketPosition: analytics.marketPosition,
            profileStrength: analytics.profileStrength
        });
    }
    catch (error) {
        console.error('Get market position error:', error);
        res.status(500).json({ error: error.message || 'Failed to calculate market position' });
    }
});
router.get('/network-insights', auth_1.authenticateToken, async (req, res) => {
    try {
        const analytics = await analyticsService_1.analyticsService.generateUserAnalytics(req.userId);
        res.json({
            success: true,
            networkInsights: analytics.networkInsights
        });
    }
    catch (error) {
        console.error('Get network insights error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate network insights' });
    }
});
router.get('/achievement-trends', auth_1.authenticateToken, async (req, res) => {
    try {
        const analytics = await analyticsService_1.analyticsService.generateUserAnalytics(req.userId);
        res.json({
            success: true,
            achievementTrends: analytics.achievementTrends
        });
    }
    catch (error) {
        console.error('Get achievement trends error:', error);
        res.status(500).json({ error: error.message || 'Failed to analyze achievement trends' });
    }
});
router.get('/peer-comparison', auth_1.authenticateToken, async (req, res) => {
    try {
        const { university, graduationYear } = req.query;
        const userAnalytics = await analyticsService_1.analyticsService.generateUserAnalytics(req.userId);
        const whereClause = {
            id: { not: req.userId }
        };
        if (university)
            whereClause.university = university;
        if (graduationYear)
            whereClause.graduationYear = parseInt(graduationYear);
        const peers = await server_1.prisma.user.findMany({
            where: whereClause,
            include: {
                nftTokens: true,
                achievements: true
            },
            take: 50
        });
        const peerStats = {
            averageNFTs: 0,
            averageAchievements: 0,
            averageProfileStrength: 0,
            totalPeers: peers.length
        };
        if (peers.length > 0) {
            const peerMetrics = await Promise.all(peers.map(async (peer) => {
                try {
                    const peerAnalytics = await analyticsService_1.analyticsService.generateUserAnalytics(peer.id);
                    return {
                        nftCount: peer.nftTokens.length,
                        achievementCount: peer.achievements.length,
                        profileStrength: peerAnalytics.profileStrength
                    };
                }
                catch (error) {
                    return {
                        nftCount: peer.nftTokens.length,
                        achievementCount: peer.achievements.length,
                        profileStrength: 50
                    };
                }
            }));
            peerStats.averageNFTs = peerMetrics.reduce((sum, peer) => sum + peer.nftCount, 0) / peers.length;
            peerStats.averageAchievements = peerMetrics.reduce((sum, peer) => sum + peer.achievementCount, 0) / peers.length;
            peerStats.averageProfileStrength = peerMetrics.reduce((sum, peer) => sum + peer.profileStrength, 0) / peers.length;
        }
        const userNFTCount = await server_1.prisma.nFTToken.count({ where: { userId: req.userId } });
        const userAchievementCount = await server_1.prisma.achievement.count({ where: { userId: req.userId } });
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
    }
    catch (error) {
        console.error('Get peer comparison error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate peer comparison' });
    }
});
exports.default = router;
