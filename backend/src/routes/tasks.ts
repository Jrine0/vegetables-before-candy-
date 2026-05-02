import express from 'express';
import { prisma } from '../server';
import { authenticateToken } from '../middleware/auth';
import { sorobanChainService } from '../services/sorobanChain';

const router = express.Router();

// Get user's tasks
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
});

// Create a new task
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const { description, rewardAmount, walletAddress } = req.body;

    if (!description || !rewardAmount || !walletAddress) {
      return res.status(400).json({ error: 'Description, reward amount, and wallet address are required' });
    }

    // Create task in database
    const task = await prisma.task.create({
      data: {
        userId: req.userId,
        description,
        rewardAmount: parseInt(rewardAmount),
        status: 'created',
        walletAddress,
      }
    });

    // Create task on-chain
    const chainResult = await sorobanChainService.createTask({
      userAddress: walletAddress,
      description,
      rewardAmount: rewardAmount.toString(),
    });

    // Update task with chain data
    const updatedTask = await prisma.task.update({
      where: { id: task.id },
      data: {
        taskId: chainResult.taskId,
        txHash: chainResult.txHash,
      }
    });

    res.json({
      ...updatedTask,
      explorerUrl: sorobanChainService.getExplorerTxnUrl(chainResult.txHash),
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Submit task completion
router.post('/:id/submit', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findFirst({
      where: { id, userId: req.userId }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.status !== 'created') {
      return res.status(400).json({ error: 'Task not in created status' });
    }

    // Submit completion on-chain
    const chainResult = await sorobanChainService.submitTaskCompletion(
      task.walletAddress,
      task.taskId
    );

    // Update task status
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: 'submitted',
        submittedAt: new Date(),
      }
    });

    res.json({
      ...updatedTask,
      txHash: chainResult.txHash,
      explorerUrl: sorobanChainService.getExplorerTxnUrl(chainResult.txHash),
    });
  } catch (error) {
    console.error('Submit task error:', error);
    res.status(500).json({ error: 'Failed to submit task' });
  }
});

// Verify task (admin/oracle only)
router.post('/:id/verify', authenticateToken, async (req: any, res) => {
  try {
    // TODO: Check if user is admin/oracle
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.status !== 'submitted') {
      return res.status(400).json({ error: 'Task not submitted' });
    }

    // Verify on-chain
    const chainResult = await sorobanChainService.verifyTask(
      task.walletAddress,
      task.taskId
    );

    // Update task status
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: 'verified',
        verifiedAt: new Date(),
      }
    });

    res.json({
      ...updatedTask,
      txHash: chainResult.txHash,
      explorerUrl: sorobanChainService.getExplorerTxnUrl(chainResult.txHash),
    });
  } catch (error) {
    console.error('Verify task error:', error);
    res.status(500).json({ error: 'Failed to verify task' });
  }
});

// Claim reward
router.post('/:id/claim', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findFirst({
      where: { id, userId: req.userId }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.status !== 'verified') {
      return res.status(400).json({ error: 'Task not verified' });
    }

    // Claim reward on-chain
    const chainResult = await sorobanChainService.claimReward(
      task.walletAddress,
      task.taskId
    );

    // Update task status
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: 'claimed',
        claimedAt: new Date(),
      }
    });

    res.json({
      ...updatedTask,
      txHash: chainResult.txHash,
      explorerUrl: sorobanChainService.getExplorerTxnUrl(chainResult.txHash),
    });
  } catch (error) {
    console.error('Claim reward error:', error);
    res.status(500).json({ error: 'Failed to claim reward' });
  }
});

export default router;
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