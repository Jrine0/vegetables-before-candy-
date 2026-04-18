import express from 'express';
import { prisma } from '../server';
import { authenticateToken } from '../middleware/auth';
import { nftEvolutionService } from '../services/nftEvolution';
import { aptosChainService } from '../services/aptosChain';

const router = express.Router();

router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const nfts = await prisma.nFTToken.findMany({
      where: { userId: req.userId },
      include: {
        achievement: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(nfts);
  } catch (error) {
    console.error('Get NFTs error:', error);
    res.status(500).json({ error: 'Failed to get NFTs' });
  }
});

router.post('/:id/mint', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { walletAddress } = req.body;

    const nft = await prisma.nFTToken.findFirst({
      where: { id, userId: req.userId }
    });

    if (!nft) {
      return res.status(404).json({ error: 'NFT not found' });
    }

    if (nft.minted) {
      return res.status(400).json({ error: 'NFT already minted' });
    }

    if (!walletAddress) {
      return res.status(400).json({ error: 'Aptos wallet address is required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { university: true }
    });

    const minted = await aptosChainService.mintSoulboundAchievementNFT({
      recipientAddress: walletAddress,
      achievementType: nft.nftType,
      achievementId: nft.achievementId,
      metadataUri: `${process.env.API_URL}/api/nfts/metadata/${nft.achievementId}`,
      university: user?.university || 'unknown',
    });

    const updatedNFT = await prisma.nFTToken.update({
      where: { id },
      data: {
        tokenId: minted.tokenId,
        blockchain: 'aptos',
        contractAddress: process.env.APTOS_MODULE_ADDRESS || process.env.APTOS_RESOURCE_ACCOUNT || 'aptos_move_module',
        minted: true,
        mintedAt: new Date()
      }
    });

    // Update user's wallet address if provided
    if (walletAddress) {
      await prisma.user.update({
        where: { id: req.userId },
        data: { walletAddress }
      });
    }

    res.json({
      ...updatedNFT,
      txHash: minted.txHash,
      explorerUrl: aptosChainService.getExplorerTxnUrl(minted.txHash),
    });
  } catch (error) {
    console.error('Mint NFT error:', error);
    res.status(500).json({ error: 'Failed to mint NFT' });
  }
});

router.get('/metadata/:achievementId', async (req, res) => {
  try {
    const { achievementId } = req.params;
    const { level } = req.query;

    const metadata = await nftEvolutionService.generateDynamicMetadata(
      achievementId,
      level ? parseInt(level as string) : 1
    );

    res.json(metadata);
  } catch (error) {
    console.error('Get NFT metadata error:', error);
    res.status(500).json({ error: 'Failed to get NFT metadata' });
  }
});

router.get('/image/:nftType', (req, res) => {
  const { nftType } = req.params;
  const { level = '1', rarity = 'common' } = req.query;

  // Dynamic image generation based on level and rarity
  const baseImages = {
    'gpa_guardian': '4F46E5',
    'research_rockstar': '10B981',
    'leadership_legend': 'F59E0B',
    'academic_titan': '9013FE',
    'scholar_leader': 'FF6B6B',
    'innovation_pioneer': 'FFD93D',
    'academic_legend': 'FF3366'
  };

  const rarityEffects = {
    'common': '',
    'rare': '+✨',
    'epic': '+⚡✨',
    'legendary': '+👑⚡✨',
    'mythic': '+🔥👑⚡✨'
  };

  const color = baseImages[nftType as keyof typeof baseImages] || baseImages.gpa_guardian;
  const effect = rarityEffects[rarity as keyof typeof rarityEffects] || '';
  const levelIndicator = level !== '1' ? `+Lv.${level}` : '';

  const imageUrl = `https://via.placeholder.com/400x400/${color}/FFFFFF?text=${nftType.replace('_', '+').toUpperCase()}${levelIndicator}${effect}`;
  res.redirect(imageUrl);
});

// NFT Evolution endpoints
router.get('/evolution-summary', authenticateToken, async (req: any, res) => {
  try {
    const summary = await nftEvolutionService.getUserNFTEvolutionSummary(req.userId);
    res.json(summary);
  } catch (error) {
    console.error('Get evolution summary error:', error);
    res.status(500).json({ error: 'Failed to get evolution summary' });
  }
});

router.post('/:id/evolve', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;

    // Verify NFT ownership
    const nft = await prisma.nFTToken.findFirst({
      where: { id, userId: req.userId }
    });

    if (!nft) {
      return res.status(404).json({ error: 'NFT not found or not owned by user' });
    }

    const evolutionResult = await nftEvolutionService.evolveNFT(id);

    res.json({
      message: 'NFT evolved successfully!',
      ...evolutionResult
    });
  } catch (error: any) {
    console.error('NFT evolution error:', error);
    res.status(400).json({ error: error.message || 'Evolution failed' });
  }
});

router.post('/:id/add-points', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { points, reason } = req.body;

    // Verify NFT ownership
    const nft = await prisma.nFTToken.findFirst({
      where: { id, userId: req.userId }
    });

    if (!nft) {
      return res.status(404).json({ error: 'NFT not found or not owned by user' });
    }

    const result = await nftEvolutionService.addEvolutionPoints(id, points, reason);

    res.json(result);
  } catch (error) {
    console.error('Add evolution points error:', error);
    res.status(500).json({ error: 'Failed to add evolution points' });
  }
});

// Achievement Stacking endpoints
router.get('/stacking-opportunities', authenticateToken, async (req: any, res) => {
  try {
    const opportunities = await nftEvolutionService.checkForStacking(req.userId);
    res.json(opportunities);
  } catch (error) {
    console.error('Get stacking opportunities error:', error);
    res.status(500).json({ error: 'Failed to get stacking opportunities' });
  }
});

router.post('/stack', authenticateToken, async (req: any, res) => {
  try {
    const { sourceNFTIds, stackingRuleIndex } = req.body;

    // Get available stacking opportunities
    const opportunities = await nftEvolutionService.checkForStacking(req.userId);
    const selectedRule = opportunities[stackingRuleIndex];

    if (!selectedRule || !selectedRule.canCreate) {
      return res.status(400).json({ error: 'Invalid stacking opportunity' });
    }

    const result = await nftEvolutionService.createCompositeNFT(
      req.userId,
      selectedRule.rule,
      sourceNFTIds
    );

    res.json({
      message: 'Composite NFT created successfully!',
      ...result
    });
  } catch (error: any) {
    console.error('NFT stacking error:', error);
    res.status(400).json({ error: error.message || 'Stacking failed' });
  }
});

// Animation endpoint for dynamic NFTs
router.get('/animation/:nftType', (req, res) => {
  const { nftType } = req.params;
  const { animation = 'pulse' } = req.query;

  // Return animation configuration
  const animations = {
    'pulse': {
      type: 'css',
      keyframes: '@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }',
      duration: '2s',
      iteration: 'infinite'
    },
    'pulse-glow': {
      type: 'css',
      keyframes: '@keyframes pulse-glow { 0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(79, 70, 229, 0.5); } 50% { transform: scale(1.05); box-shadow: 0 0 40px rgba(79, 70, 229, 0.8); } }',
      duration: '2s',
      iteration: 'infinite'
    },
    'pulse-sparkle': {
      type: 'css',
      keyframes: '@keyframes pulse-sparkle { 0%, 100% { transform: scale(1) rotate(0deg); filter: brightness(1); } 50% { transform: scale(1.1) rotate(5deg); filter: brightness(1.2); } }',
      duration: '3s',
      iteration: 'infinite'
    },
    'epic-transformation': {
      type: 'css',
      keyframes: '@keyframes epic-transformation { 0% { transform: scale(1) rotate(0deg); filter: hue-rotate(0deg); } 25% { transform: scale(1.2) rotate(90deg); filter: hue-rotate(90deg); } 50% { transform: scale(1.1) rotate(180deg); filter: hue-rotate(180deg); } 75% { transform: scale(1.3) rotate(270deg); filter: hue-rotate(270deg); } 100% { transform: scale(1) rotate(360deg); filter: hue-rotate(360deg); } }',
      duration: '4s',
      iteration: 'infinite'
    }
  };

  const animationConfig = animations[animation as keyof typeof animations] || animations.pulse;
  res.json(animationConfig);
});

export default router;