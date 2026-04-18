"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const server_1 = require("../server");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../utils/validation");
const aiVerification_1 = require("../services/aiVerification");
const nftEvolution_1 = require("../services/nftEvolution");
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/achievements/');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Only documents and images are allowed'));
        }
    }
});
router.post('/', auth_1.authenticateToken, auth_1.requireEmailVerification, upload.single('proof'), async (req, res) => {
    try {
        const { type, title, description, gpaValue, enableAIVerification = true } = req.body;
        if (!(0, validation_1.validateAchievementType)(type)) {
            return res.status(400).json({ error: 'Invalid achievement type' });
        }
        if (type === 'gpa' && (!gpaValue || !(0, validation_1.validateGPA)(parseFloat(gpaValue)))) {
            return res.status(400).json({ error: 'Valid GPA value required for GPA achievements' });
        }
        if (type === 'gpa' && parseFloat(gpaValue) < 3.5) {
            return res.status(400).json({ error: 'GPA must be 3.5 or higher for GPA Guardian NFT' });
        }
        let aiAnalysisResult = null;
        let verified = false;
        let verificationStatus = 'pending';
        if (req.file && enableAIVerification) {
            try {
                const documentType = type === 'gpa' ? 'transcript' : type === 'research' ? 'research' : 'leadership';
                const filePath = path_1.default.join('uploads/achievements', req.file.filename);
                console.log('🤖 Running AI verification on document...');
                aiAnalysisResult = await aiVerification_1.aiVerificationService.analyzeDocument(filePath, documentType);
                if (aiAnalysisResult.recommendedAction === 'auto_approve') {
                    verified = true;
                    verificationStatus = 'auto_approved';
                    console.log('✅ AI auto-approved achievement');
                }
                else if (aiAnalysisResult.recommendedAction === 'reject') {
                    verificationStatus = 'rejected';
                    console.log('❌ AI rejected achievement due to fraud indicators');
                }
                else {
                    verificationStatus = 'manual_review';
                    console.log('👁️ AI flagged for manual review');
                }
            }
            catch (error) {
                console.error('AI verification failed:', error);
                verificationStatus = 'ai_failed';
            }
        }
        const achievement = await server_1.prisma.achievement.create({
            data: {
                userId: req.userId,
                type,
                title,
                description,
                gpaValue: type === 'gpa' ? parseFloat(gpaValue) : null,
                proofUrl: req.file ? `/uploads/achievements/${req.file.filename}` : null,
                verified,
                verifiedAt: verified ? new Date() : null,
                verifiedBy: verified ? 'ai_system' : null
            }
        });
        const response = {
            achievement,
            aiAnalysis: aiAnalysisResult ? {
                confidence: aiAnalysisResult.confidence,
                recommendedAction: aiAnalysisResult.recommendedAction,
                extractedData: aiAnalysisResult.extractedData,
                fraudIndicators: aiAnalysisResult.fraudIndicators,
                status: verificationStatus
            } : null
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Create achievement error:', error);
        res.status(500).json({ error: 'Failed to create achievement' });
    }
});
router.get('/all', async (req, res) => {
    try {
        const achievements = await server_1.prisma.achievement.findMany({
            where: { verified: true },
            include: {
                user: {
                    select: { firstName: true, lastName: true, university: true }
                },
                nftTokens: true
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json(achievements);
    }
    catch (error) {
        console.error('Get all achievements error:', error);
        res.status(500).json({ error: 'Failed to get achievements' });
    }
});
router.get('/user', auth_1.authenticateToken, async (req, res) => {
    try {
        const achievements = await server_1.prisma.achievement.findMany({
            where: { userId: req.userId },
            include: {
                nftTokens: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(achievements);
    }
    catch (error) {
        console.error('Get user achievements error:', error);
        res.status(500).json({ error: 'Failed to get achievements' });
    }
});
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const achievement = await server_1.prisma.achievement.findUnique({
            where: { id },
            include: {
                user: {
                    select: { firstName: true, lastName: true, university: true }
                },
                nftTokens: true
            }
        });
        if (!achievement) {
            return res.status(404).json({ error: 'Achievement not found' });
        }
        if (achievement.userId !== req.userId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.json(achievement);
    }
    catch (error) {
        console.error('Get achievement error:', error);
        res.status(500).json({ error: 'Failed to get achievement' });
    }
});
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const achievements = await server_1.prisma.achievement.findMany({
            where: { userId: req.userId },
            include: {
                nftTokens: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(achievements);
    }
    catch (error) {
        console.error('Get achievements error:', error);
        res.status(500).json({ error: 'Failed to get achievements' });
    }
});
router.get('/pending-verification', auth_1.authenticateToken, async (req, res) => {
    try {
        const achievements = await server_1.prisma.achievement.findMany({
            where: { verified: false },
            include: {
                user: {
                    select: { firstName: true, lastName: true, university: true, universityEmail: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(achievements);
    }
    catch (error) {
        console.error('Get pending achievements error:', error);
        res.status(500).json({ error: 'Failed to get pending achievements' });
    }
});
router.put('/:id/verify', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { approved, reason } = req.body;
        const achievement = await server_1.prisma.achievement.findUnique({
            where: { id },
            include: { user: true }
        });
        if (!achievement) {
            return res.status(404).json({ error: 'Achievement not found' });
        }
        const updatedAchievement = await server_1.prisma.achievement.update({
            where: { id },
            data: {
                verified: approved,
                verifiedBy: req.userId,
                verifiedAt: new Date()
            }
        });
        if (approved) {
            const nftType = achievement.type === 'gpa' ? 'gpa_guardian' :
                achievement.type === 'research' ? 'research_rockstar' : 'leadership_legend';
            const evolutionPoints = nftEvolution_1.nftEvolutionService.calculateEvolutionPoints(achievement.type, achievement.gpaValue || undefined, {
                aiConfidence: 85,
                university: achievement.user.university
            });
            await server_1.prisma.nFTToken.create({
                data: {
                    userId: achievement.userId,
                    achievementId: achievement.id,
                    tokenId: `${Date.now()}-${achievement.userId}`,
                    contractAddress: process.env.APTOS_MODULE_ADDRESS || process.env.APTOS_RESOURCE_ACCOUNT || 'aptos_move_module',
                    blockchain: 'aptos',
                    nftType,
                    metadataUri: `${process.env.API_URL}/api/nfts/metadata/${achievement.id}`,
                    evolutionPoints,
                    level: 1,
                    rarity: 'common'
                }
            });
        }
        res.json(updatedAchievement);
    }
    catch (error) {
        console.error('Verify achievement error:', error);
        res.status(500).json({ error: 'Failed to verify achievement' });
    }
});
router.post('/ai-verify', auth_1.authenticateToken, auth_1.requireEmailVerification, upload.single('document'), async (req, res) => {
    try {
        const { type } = req.body;
        if (!req.file) {
            return res.status(400).json({ error: 'Document file is required' });
        }
        if (!(0, validation_1.validateAchievementType)(type)) {
            return res.status(400).json({ error: 'Invalid achievement type' });
        }
        const documentType = type === 'gpa' ? 'transcript' : type === 'research' ? 'research' : 'leadership';
        const filePath = path_1.default.join('uploads/achievements', req.file.filename);
        console.log('🤖 Starting real-time AI document analysis...');
        const aiAnalysisResult = await aiVerification_1.aiVerificationService.analyzeDocument(filePath, documentType);
        const user = await server_1.prisma.user.findUnique({ where: { id: req.userId } });
        const verificationReport = await aiVerification_1.aiVerificationService.generateVerificationReport(aiAnalysisResult, user);
        console.log(`✅ AI analysis complete - Confidence: ${aiAnalysisResult.confidence}%`);
        res.json({
            analysis: aiAnalysisResult,
            verificationReport,
            processingTime: Date.now(),
            demoMode: !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'demo-key'
        });
    }
    catch (error) {
        console.error('AI verification error:', error);
        res.status(500).json({ error: 'AI verification failed' });
    }
});
router.post('/ai-batch-verify', auth_1.authenticateToken, auth_1.requireEmailVerification, upload.array('documents', 5), async (req, res) => {
    try {
        const { types } = req.body;
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'At least one document is required' });
        }
        const typesArray = JSON.parse(types);
        if (typesArray.length !== req.files.length) {
            return res.status(400).json({ error: 'Number of types must match number of documents' });
        }
        console.log(`🤖 Starting batch AI analysis of ${req.files.length} documents...`);
        const documents = req.files.map((file, index) => ({
            path: path_1.default.join('uploads/achievements', file.filename),
            type: typesArray[index] === 'gpa' ? 'transcript' : typesArray[index] === 'research' ? 'research' : 'leadership'
        }));
        const results = await aiVerification_1.aiVerificationService.batchAnalyze(documents);
        console.log('✅ Batch AI analysis complete');
        res.json({
            results,
            summary: {
                total: results.length,
                autoApproved: results.filter(r => r.recommendedAction === 'auto_approve').length,
                manualReview: results.filter(r => r.recommendedAction === 'manual_review').length,
                rejected: results.filter(r => r.recommendedAction === 'reject').length,
                avgConfidence: results.reduce((sum, r) => sum + r.confidence, 0) / results.length
            },
            processingTime: Date.now()
        });
    }
    catch (error) {
        console.error('Batch AI verification error:', error);
        res.status(500).json({ error: 'Batch AI verification failed' });
    }
});
exports.default = router;
