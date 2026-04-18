"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const aptosChain_1 = require("../services/aptosChain");
const router = express_1.default.Router();
router.get('/network', auth_1.authenticateToken, async (_req, res) => {
    try {
        const config = aptosChain_1.aptosChainService.getNetworkConfig();
        res.json(config);
    }
    catch (error) {
        console.error('Get Aptos network error:', error);
        res.status(500).json({ error: 'Failed to load Aptos network configuration' });
    }
});
router.post('/mint', auth_1.authenticateToken, auth_1.requireEmailVerification, async (req, res) => {
    try {
        const { recipientAddress, achievementType, achievementId, metadataUri, university } = req.body;
        if (!recipientAddress || !achievementType || !achievementId || !metadataUri || !university) {
            return res.status(400).json({
                error: 'Missing required parameters: recipientAddress, achievementType, achievementId, metadataUri, university',
            });
        }
        const result = await aptosChain_1.aptosChainService.mintSoulboundAchievementNFT({
            recipientAddress,
            achievementType,
            achievementId,
            metadataUri,
            university,
        });
        res.json({
            ...result,
            explorerUrl: aptosChain_1.aptosChainService.getExplorerTxnUrl(result.txHash),
        });
    }
    catch (error) {
        console.error('Mint on Aptos error:', error);
        res.status(400).json({ error: error.message || 'Failed to mint on Aptos' });
    }
});
router.post('/verify-ownership', auth_1.authenticateToken, async (req, res) => {
    try {
        const { ownerAddress, achievementType } = req.body;
        if (!ownerAddress || !achievementType) {
            return res.status(400).json({ error: 'ownerAddress and achievementType are required' });
        }
        const ownsType = await aptosChain_1.aptosChainService.verifyOwnershipByType(ownerAddress, achievementType);
        res.json({ ownerAddress, achievementType, ownsType });
    }
    catch (error) {
        console.error('Verify ownership error:', error);
        res.status(400).json({ error: error.message || 'Failed to verify on-chain ownership' });
    }
});
router.post('/assert-access', auth_1.authenticateToken, async (req, res) => {
    try {
        const { ownerAddress, opportunityId, requiredTypes } = req.body;
        if (!ownerAddress || !opportunityId || !Array.isArray(requiredTypes)) {
            return res.status(400).json({ error: 'ownerAddress, opportunityId, and requiredTypes[] are required' });
        }
        const result = await aptosChain_1.aptosChainService.assertOpportunityAccess(ownerAddress, opportunityId, requiredTypes);
        res.json({
            ...result,
            explorerUrl: aptosChain_1.aptosChainService.getExplorerTxnUrl(result.txHash),
        });
    }
    catch (error) {
        console.error('Assert access on Aptos error:', error);
        res.status(403).json({ error: error.message || 'On-chain access assertion failed' });
    }
});
router.get('/events', auth_1.authenticateToken, async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
        const events = await aptosChain_1.aptosChainService.getMintAndVerificationEvents(limit);
        res.json({ count: events.length, events });
    }
    catch (error) {
        console.error('Get Aptos events error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch Aptos events' });
    }
});
exports.default = router;
