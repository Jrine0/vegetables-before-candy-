"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server_1 = require("../server");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = await server_1.prisma.user.findUnique({
            where: { id: req.userId },
            include: {
                achievements: {
                    include: {
                        nftTokens: true
                    }
                },
                nftTokens: true,
                accessGrants: {
                    include: {
                        opportunity: true
                    }
                }
            }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ error: 'Failed to get user profile' });
    }
});
router.put('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, studentId, walletAddress } = req.body;
        const user = await server_1.prisma.user.update({
            where: { id: req.userId },
            data: {
                firstName,
                lastName,
                studentId,
                walletAddress
            }
        });
        res.json(user);
    }
    catch (error) {
        console.error('Update user profile error:', error);
        res.status(500).json({ error: 'Failed to update user profile' });
    }
});
router.get('/dashboard-stats', auth_1.authenticateToken, async (req, res) => {
    try {
        const achievements = await server_1.prisma.achievement.count({
            where: { userId: req.userId }
        });
        const verifiedAchievements = await server_1.prisma.achievement.count({
            where: { userId: req.userId, verified: true }
        });
        const nfts = await server_1.prisma.nFTToken.count({
            where: { userId: req.userId, minted: true }
        });
        const accessGrants = await server_1.prisma.accessGrant.count({
            where: { userId: req.userId }
        });
        res.json({
            totalAchievements: achievements,
            verifiedAchievements,
            mintedNFTs: nfts,
            unlockedOpportunities: accessGrants
        });
    }
    catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to get dashboard stats' });
    }
});
exports.default = router;
