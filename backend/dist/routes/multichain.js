"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server_1 = require("../server");
const auth_1 = require("../middleware/auth");
const multiChain_1 = require("../services/multiChain");
const router = express_1.default.Router();
router.get('/chains', auth_1.authenticateToken, async (req, res) => {
    try {
        const chains = multiChain_1.multiChainService.getSupportedChains();
        const healthStatus = await multiChain_1.multiChainService.getChainHealthStatus();
        const chainsWithHealth = chains.map(chain => ({
            ...chain,
            health: healthStatus[chain.name.toLowerCase().replace(' ', '_')] || { status: 'unknown' }
        }));
        res.json({
            chains: chainsWithHealth,
            totalChains: chains.length,
            healthyChains: Object.values(healthStatus).filter(h => h.status === 'healthy').length
        });
    }
    catch (error) {
        console.error('Get chains error:', error);
        res.status(500).json({ error: 'Failed to get chain information' });
    }
});
router.get('/health', auth_1.authenticateToken, async (req, res) => {
    try {
        const healthStatus = await multiChain_1.multiChainService.getChainHealthStatus();
        res.json(healthStatus);
    }
    catch (error) {
        console.error('Get chain health error:', error);
        res.status(500).json({ error: 'Failed to get chain health status' });
    }
});
router.get('/recommend', auth_1.authenticateToken, async (req, res) => {
    try {
        const { considerGasCost = 'true', features } = req.query;
        const preferredFeatures = features ?
            features.split(',').map(f => f.trim()) :
            [];
        const recommendation = await multiChain_1.multiChainService.getOptimalChainRecommendation(considerGasCost === 'true', preferredFeatures);
        res.json(recommendation);
    }
    catch (error) {
        console.error('Get chain recommendation error:', error);
        res.status(500).json({ error: error.message || 'Failed to get chain recommendation' });
    }
});
router.post('/mint', auth_1.authenticateToken, auth_1.requireEmailVerification, async (req, res) => {
    try {
        const { nftId, chain, walletAddress } = req.body;
        if (!nftId || !chain || !walletAddress) {
            return res.status(400).json({ error: 'Missing required parameters: nftId, chain, walletAddress' });
        }
        const nft = await server_1.prisma.nFTToken.findFirst({
            where: { id: nftId, userId: req.userId }
        });
        if (!nft) {
            return res.status(404).json({ error: 'NFT not found or not owned by user' });
        }
        if (nft.minted) {
            return res.status(400).json({ error: 'NFT already minted' });
        }
        const result = await multiChain_1.multiChainService.mintNFTOnChain(nftId, chain, walletAddress);
        res.json({
            message: `NFT successfully minted on ${chain}!`,
            ...result,
            explorerUrl: `${multiChain_1.multiChainService.getChainConfig(chain)?.blockExplorer}/tx/${result.txHash}`
        });
    }
    catch (error) {
        console.error('Mint NFT on chain error:', error);
        res.status(400).json({ error: error.message || 'Failed to mint NFT' });
    }
});
router.post('/bridge', auth_1.authenticateToken, auth_1.requireEmailVerification, async (req, res) => {
    try {
        const { nftId, fromChain, toChain, walletAddress } = req.body;
        if (!nftId || !fromChain || !toChain || !walletAddress) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        if (fromChain === toChain) {
            return res.status(400).json({ error: 'Cannot bridge to the same chain' });
        }
        const nft = await server_1.prisma.nFTToken.findFirst({
            where: { id: nftId, userId: req.userId }
        });
        if (!nft) {
            return res.status(404).json({ error: 'NFT not found or not owned by user' });
        }
        const bridgeTransaction = await multiChain_1.multiChainService.bridgeNFT(nftId, fromChain, toChain, walletAddress);
        res.json({
            message: `Bridge initiated from ${fromChain} to ${toChain}`,
            bridgeTransaction,
            estimatedTime: '5-10 minutes',
            status: 'pending'
        });
    }
    catch (error) {
        console.error('Bridge NFT error:', error);
        res.status(400).json({ error: error.message || 'Failed to bridge NFT' });
    }
});
router.post('/bridge/estimate', auth_1.authenticateToken, async (req, res) => {
    try {
        const { fromChain, toChain } = req.body;
        if (!fromChain || !toChain) {
            return res.status(400).json({ error: 'Missing required parameters: fromChain, toChain' });
        }
        const estimate = await multiChain_1.multiChainService.estimateBridgeCost(fromChain, toChain);
        res.json(estimate);
    }
    catch (error) {
        console.error('Estimate bridge cost error:', error);
        res.status(400).json({ error: error.message || 'Failed to estimate bridge cost' });
    }
});
router.get('/portfolio', auth_1.authenticateToken, async (req, res) => {
    try {
        const portfolio = await multiChain_1.multiChainService.getCrossChainPortfolio(req.userId);
        res.json(portfolio);
    }
    catch (error) {
        console.error('Get cross-chain portfolio error:', error);
        res.status(500).json({ error: 'Failed to get portfolio' });
    }
});
router.post('/batch-mint', auth_1.authenticateToken, auth_1.requireEmailVerification, async (req, res) => {
    try {
        const { nftId, chains, walletAddress } = req.body;
        if (!nftId || !chains || !walletAddress || !Array.isArray(chains)) {
            return res.status(400).json({ error: 'Missing or invalid parameters' });
        }
        const nft = await server_1.prisma.nFTToken.findFirst({
            where: { id: nftId, userId: req.userId }
        });
        if (!nft) {
            return res.status(404).json({ error: 'NFT not found or not owned by user' });
        }
        const { results, errors } = await multiChain_1.multiChainService.batchMintAcrossChains(nftId, chains, walletAddress);
        res.json({
            message: `Batch mint completed across ${results.length} chains`,
            results,
            errors,
            totalChains: chains.length,
            successfulChains: results.length,
            failedChains: errors.length
        });
    }
    catch (error) {
        console.error('Batch mint error:', error);
        res.status(400).json({ error: error.message || 'Failed to batch mint' });
    }
});
router.get('/gas-prices', auth_1.authenticateToken, async (req, res) => {
    try {
        const chains = multiChain_1.multiChainService.getSupportedChains();
        const gasPrices = {};
        for (const chain of chains) {
            try {
                const chainName = chain.name.toLowerCase().replace(' ', '_');
                const gasData = await multiChain_1.multiChainService.getGasPrice(chainName);
                gasPrices[chainName] = {
                    ...gasData,
                    nativeToken: chain.nativeToken,
                    chainName: chain.name
                };
            }
            catch (error) {
                gasPrices[chain.name.toLowerCase().replace(' ', '_')] = {
                    error: 'Unable to fetch gas price',
                    nativeToken: chain.nativeToken,
                    chainName: chain.name
                };
            }
        }
        res.json(gasPrices);
    }
    catch (error) {
        console.error('Get gas prices error:', error);
        res.status(500).json({ error: 'Failed to get gas prices' });
    }
});
router.get('/analytics', auth_1.authenticateToken, async (req, res) => {
    try {
        const nftDistribution = await server_1.prisma.nFTToken.groupBy({
            by: ['blockchain'],
            where: { minted: true },
            _count: { id: true },
            _avg: { evolutionPoints: true }
        });
        const userChainPreferences = await server_1.prisma.nFTToken.groupBy({
            by: ['blockchain', 'userId'],
            where: { minted: true },
            _count: { id: true }
        });
        const uniqueUsersPerChain = userChainPreferences.reduce((acc, item) => {
            acc[item.blockchain] = (acc[item.blockchain] || new Set()).add(item.userId);
            return acc;
        }, {});
        const userStats = Object.entries(uniqueUsersPerChain).map(([chain, users]) => ({
            blockchain: chain,
            uniqueUsers: users.size
        }));
        const bridgeActivity = {
            totalBridges: 0,
            popularRoutes: [
                { from: 'ethereum', to: 'polygon', count: 12 },
                { from: 'polygon', to: 'base', count: 8 },
                { from: 'base', to: 'arbitrum', count: 5 }
            ]
        };
        res.json({
            nftDistribution,
            userStats,
            bridgeActivity,
            totalChainsUsed: nftDistribution.length,
            totalNFTsMinted: nftDistribution.reduce((sum, item) => sum + item._count.id, 0)
        });
    }
    catch (error) {
        console.error('Get chain analytics error:', error);
        res.status(500).json({ error: 'Failed to get analytics' });
    }
});
router.post('/demo/simulate-bridge', auth_1.authenticateToken, async (req, res) => {
    try {
        const { fromChain, toChain, amount = 1 } = req.body;
        if (!fromChain || !toChain) {
            return res.status(400).json({ error: 'Missing chain parameters' });
        }
        const simulationSteps = [
            { step: 1, status: 'Initiating bridge transaction', progress: 20 },
            { step: 2, status: 'Locking tokens on source chain', progress: 40 },
            { step: 3, status: 'Generating merkle proof', progress: 60 },
            { step: 4, status: 'Submitting proof to destination chain', progress: 80 },
            { step: 5, status: 'Minting tokens on destination chain', progress: 100 }
        ];
        const bridgeDetails = {
            bridgeId: `bridge_${Date.now()}`,
            fromChain,
            toChain,
            amount,
            estimatedTime: '5-10 minutes',
            steps: simulationSteps,
            txHash: `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`
        };
        res.json({
            message: 'Bridge simulation initiated',
            bridgeDetails,
            note: 'This is a demo simulation. In production, this would interact with real bridge contracts.'
        });
    }
    catch (error) {
        console.error('Simulate bridge error:', error);
        res.status(500).json({ error: 'Failed to simulate bridge' });
    }
});
exports.default = router;
