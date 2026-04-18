import express from 'express';
import { prisma } from '../server';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/profile', authenticateToken, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
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
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

router.put('/profile', authenticateToken, async (req: any, res) => {
  try {
    const { firstName, lastName, studentId, walletAddress } = req.body;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        firstName,
        lastName,
        studentId,
        walletAddress
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

router.get('/dashboard-stats', authenticateToken, async (req: any, res) => {
  try {
    const achievements = await prisma.achievement.count({
      where: { userId: req.userId }
    });

    const verifiedAchievements = await prisma.achievement.count({
      where: { userId: req.userId, verified: true }
    });

    const nfts = await prisma.nFTToken.count({
      where: { userId: req.userId, minted: true }
    });

    const accessGrants = await prisma.accessGrant.count({
      where: { userId: req.userId }
    });

    res.json({
      totalAchievements: achievements,
      verifiedAchievements,
      mintedNFTs: nfts,
      unlockedOpportunities: accessGrants
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
});

export default router;