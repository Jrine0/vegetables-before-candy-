import express from 'express';
import { authenticateToken, requireEmailVerification } from '../middleware/auth';
import { aptosChainService } from '../services/aptosChain';

const router = express.Router();

router.get('/network', authenticateToken, async (_req: any, res) => {
    try {
        const config = aptosChainService.getNetworkConfig();
        res.json(config);
    } catch (error) {
        console.error('Get Aptos network error:', error);
        res.status(500).json({ error: 'Failed to load Aptos network configuration' });
    }
});

router.post('/mint', authenticateToken, requireEmailVerification, async (req: any, res) => {
    try {
        const { recipientAddress, achievementType, achievementId, metadataUri, university } = req.body;

        if (!recipientAddress || !achievementType || !achievementId || !metadataUri || !university) {
            return res.status(400).json({
                error: 'Missing required parameters: recipientAddress, achievementType, achievementId, metadataUri, university',
            });
        }

        const result = await aptosChainService.mintSoulboundAchievementNFT({
            recipientAddress,
            achievementType,
            achievementId,
            metadataUri,
            university,
        });

        res.json({
            ...result,
            explorerUrl: aptosChainService.getExplorerTxnUrl(result.txHash),
        });
    } catch (error: any) {
        console.error('Mint on Aptos error:', error);
        res.status(400).json({ error: error.message || 'Failed to mint on Aptos' });
    }
});

router.post('/verify-ownership', authenticateToken, async (req: any, res) => {
    try {
        const { ownerAddress, achievementType } = req.body;

        if (!ownerAddress || !achievementType) {
            return res.status(400).json({ error: 'ownerAddress and achievementType are required' });
        }

        const ownsType = await aptosChainService.verifyOwnershipByType(ownerAddress, achievementType);
        res.json({ ownerAddress, achievementType, ownsType });
    } catch (error: any) {
        console.error('Verify ownership error:', error);
        res.status(400).json({ error: error.message || 'Failed to verify on-chain ownership' });
    }
});

router.post('/assert-access', authenticateToken, async (req: any, res) => {
    try {
        const { ownerAddress, opportunityId, requiredTypes } = req.body;

        if (!ownerAddress || !opportunityId || !Array.isArray(requiredTypes)) {
            return res.status(400).json({ error: 'ownerAddress, opportunityId, and requiredTypes[] are required' });
        }

        const result = await aptosChainService.assertOpportunityAccess(ownerAddress, opportunityId, requiredTypes);
        res.json({
            ...result,
            explorerUrl: aptosChainService.getExplorerTxnUrl(result.txHash),
        });
    } catch (error: any) {
        console.error('Assert access on Aptos error:', error);
        res.status(403).json({ error: error.message || 'On-chain access assertion failed' });
    }
});

router.get('/events', authenticateToken, async (req: any, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
        const events = await aptosChainService.getMintAndVerificationEvents(limit);
        res.json({ count: events.length, events });
    } catch (error: any) {
        console.error('Get Aptos events error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch Aptos events' });
    }
});

export default router;
