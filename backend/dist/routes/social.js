"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server_1 = require("../server");
const auth_1 = require("../middleware/auth");
const socialGamification_1 = require("../services/socialGamification");
const router = express_1.default.Router();
router.get('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        let socialProfile = await server_1.prisma.socialProfile.findUnique({
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
            socialProfile = await socialGamification_1.socialGamificationService.initializeSocialProfile(req.userId);
        }
        const stats = await socialGamification_1.socialGamificationService.getUserSocialStats(req.userId);
        res.json({
            profile: socialProfile,
            stats
        });
    }
    catch (error) {
        console.error('Get social profile error:', error);
        res.status(500).json({ error: 'Failed to get social profile' });
    }
});
router.put('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        const { displayName, bio, linkedinUrl, githubUrl, portfolioUrl, isPublic, showNFTs, showAchievements } = req.body;
        const updatedProfile = await server_1.prisma.socialProfile.upsert({
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
    }
    catch (error) {
        console.error('Update social profile error:', error);
        res.status(500).json({ error: 'Failed to update social profile' });
    }
});
router.get('/feed', auth_1.authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 20, type = 'global' } = req.query;
        const feed = await socialGamification_1.socialGamificationService.getActivityFeed(req.userId, parseInt(page), parseInt(limit), type);
        res.json({
            posts: feed,
            page: parseInt(page),
            limit: parseInt(limit),
            hasMore: feed.length === parseInt(limit)
        });
    }
    catch (error) {
        console.error('Get activity feed error:', error);
        res.status(500).json({ error: 'Failed to get activity feed' });
    }
});
router.post('/posts', auth_1.authenticateToken, auth_1.requireEmailVerification, async (req, res) => {
    try {
        const { type, title, content, imageUrl, achievementId, nftId, isPublic } = req.body;
        const post = await socialGamification_1.socialGamificationService.createSocialPost(req.userId, {
            type,
            title,
            content,
            imageUrl,
            achievementId,
            nftId,
            isPublic
        });
        res.status(201).json(post);
    }
    catch (error) {
        console.error('Create social post error:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});
router.post('/posts/:id/like', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await socialGamification_1.socialGamificationService.togglePostLike(req.userId, id);
        res.json(result);
    }
    catch (error) {
        console.error('Toggle post like error:', error);
        res.status(500).json({ error: 'Failed to toggle like' });
    }
});
router.post('/endorse', auth_1.authenticateToken, auth_1.requireEmailVerification, async (req, res) => {
    try {
        const { endorseeId, achievementId, type, message, isPublic } = req.body;
        const endorsement = await socialGamification_1.socialGamificationService.createEndorsement(req.userId, endorseeId, achievementId, { type, message, isPublic });
        res.status(201).json(endorsement);
    }
    catch (error) {
        console.error('Create endorsement error:', error);
        res.status(400).json({ error: error.message || 'Failed to create endorsement' });
    }
});
router.get('/endorsements', auth_1.authenticateToken, async (req, res) => {
    try {
        const { received = 'true' } = req.query;
        const endorsements = await server_1.prisma.endorsement.findMany({
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
    }
    catch (error) {
        console.error('Get endorsements error:', error);
        res.status(500).json({ error: 'Failed to get endorsements' });
    }
});
router.get('/leaderboards', auth_1.authenticateToken, async (req, res) => {
    try {
        const { type = 'global', category = 'overall', limit = 50 } = req.query;
        const leaderboard = await socialGamification_1.socialGamificationService.getLeaderboard(type, category, parseInt(limit));
        const userPosition = leaderboard.findIndex(entry => entry.userId === req.userId);
        res.json({
            leaderboard,
            userPosition: userPosition >= 0 ? userPosition + 1 : null,
            totalEntries: leaderboard.length
        });
    }
    catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ error: 'Failed to get leaderboard' });
    }
});
router.post('/leaderboards/generate', auth_1.authenticateToken, async (req, res) => {
    try {
        await socialGamification_1.socialGamificationService.generateLeaderboards();
        res.json({ message: 'Leaderboards generated successfully' });
    }
    catch (error) {
        console.error('Generate leaderboards error:', error);
        res.status(500).json({ error: 'Failed to generate leaderboards' });
    }
});
router.get('/badges', auth_1.authenticateToken, async (req, res) => {
    try {
        const userBadges = await server_1.prisma.userBadge.findMany({
            where: { userId: req.userId },
            orderBy: { earnedAt: 'desc' }
        });
        const badges = await server_1.prisma.badge.findMany({
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
    }
    catch (error) {
        console.error('Get user badges error:', error);
        res.status(500).json({ error: 'Failed to get badges' });
    }
});
router.post('/badges/check', auth_1.authenticateToken, async (req, res) => {
    try {
        const newBadges = await socialGamification_1.socialGamificationService.checkAndAwardBadges(req.userId);
        res.json({
            newBadges,
            message: newBadges.length > 0 ?
                `Congratulations! You earned ${newBadges.length} new badge(s)!` :
                'No new badges earned yet. Keep achieving!'
        });
    }
    catch (error) {
        console.error('Check badges error:', error);
        res.status(500).json({ error: 'Failed to check badges' });
    }
});
router.get('/users/:userId/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const socialProfile = await server_1.prisma.socialProfile.findUnique({
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
        const stats = await socialGamification_1.socialGamificationService.getUserSocialStats(userId);
        res.json({
            profile: socialProfile,
            stats,
            isOwnProfile: userId === req.userId
        });
    }
    catch (error) {
        console.error('Get public profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});
router.post('/points/award', auth_1.authenticateToken, async (req, res) => {
    try {
        const { points = 100, reason = 'manual_award' } = req.body;
        const result = await socialGamification_1.socialGamificationService.awardPoints(req.userId, points, reason);
        res.json(result);
    }
    catch (error) {
        console.error('Award points error:', error);
        res.status(500).json({ error: 'Failed to award points' });
    }
});
router.get('/insights', auth_1.authenticateToken, async (req, res) => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const insights = {
            totalUsers: await server_1.prisma.socialProfile.count(),
            activeUsers: await server_1.prisma.socialProfile.count({
                where: {
                    updatedAt: { gte: thirtyDaysAgo }
                }
            }),
            totalPosts: await server_1.prisma.socialPost.count(),
            recentPosts: await server_1.prisma.socialPost.count({
                where: {
                    createdAt: { gte: thirtyDaysAgo }
                }
            }),
            totalEndorsements: await server_1.prisma.endorsement.count(),
            recentEndorsements: await server_1.prisma.endorsement.count({
                where: {
                    createdAt: { gte: thirtyDaysAgo }
                }
            }),
            topPerformers: await server_1.prisma.socialProfile.findMany({
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
    }
    catch (error) {
        console.error('Get social insights error:', error);
        res.status(500).json({ error: 'Failed to get insights' });
    }
});
exports.default = router;
