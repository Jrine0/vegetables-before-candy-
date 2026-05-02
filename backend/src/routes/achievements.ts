import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../server';
import { authenticateToken, requireEmailVerification } from '../middleware/auth';
import { validateAchievementType, validateGPA } from '../utils/validation';
import { aiVerificationService } from '../services/aiVerification';
import { nftEvolutionService } from '../services/nftEvolution';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/achievements/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only documents and images are allowed'));
    }
  }
});

router.post('/', authenticateToken, requireEmailVerification, upload.single('proof'), async (req: any, res) => {
  try {
    const { type, title, description, gpaValue, enableAIVerification = true } = req.body;

    if (!validateAchievementType(type)) {
      return res.status(400).json({ error: 'Invalid achievement type' });
    }

    if (type === 'gpa' && (!gpaValue || !validateGPA(parseFloat(gpaValue)))) {
      return res.status(400).json({ error: 'Valid GPA value required for GPA achievements' });
    }

    if (type === 'gpa' && parseFloat(gpaValue) < 3.5) {
      return res.status(400).json({ error: 'GPA must be 3.5 or higher for GPA Guardian NFT' });
    }

    let aiAnalysisResult = null;
    let verified = false;
    let verificationStatus = 'pending';

    // AI-powered document verification
    if (req.file && enableAIVerification) {
      try {
        const documentType = type === 'gpa' ? 'transcript' : type === 'research' ? 'research' : 'leadership';
        const filePath = path.join('uploads/achievements', req.file.filename);
        
        console.log('🤖 Running AI verification on document...');
        aiAnalysisResult = await aiVerificationService.analyzeDocument(filePath, documentType as any);
        
        // Auto-approve if AI is highly confident and no fraud detected
        if (aiAnalysisResult.recommendedAction === 'auto_approve') {
          verified = true;
          verificationStatus = 'auto_approved';
          console.log('✅ AI auto-approved achievement');
        } else if (aiAnalysisResult.recommendedAction === 'reject') {
          verificationStatus = 'rejected';
          console.log('❌ AI rejected achievement due to fraud indicators');
        } else {
          verificationStatus = 'manual_review';
          console.log('👁️ AI flagged for manual review');
        }
      } catch (error) {
        console.error('AI verification failed:', error);
        verificationStatus = 'ai_failed';
      }
    }

    const achievement = await prisma.achievement.create({
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

    // Store AI analysis in a separate table (extend schema if needed)
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
  } catch (error) {
    console.error('Create achievement error:', error);
    res.status(500).json({ error: 'Failed to create achievement' });
  }
});

// Get all achievements (public or admin)
router.get('/all', async (req, res) => {
  try {
    const achievements = await prisma.achievement.findMany({
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
  } catch (error) {
    console.error('Get all achievements error:', error);
    res.status(500).json({ error: 'Failed to get achievements' });
  }
});

// Get user's own achievements
router.get('/user', authenticateToken, async (req: any, res) => {
  try {
    const achievements = await prisma.achievement.findMany({
      where: { userId: req.userId },
      include: {
        nftTokens: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(achievements);
  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({ error: 'Failed to get achievements' });
  }
});

// Get single achievement by ID
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const achievement = await prisma.achievement.findUnique({
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

    // Check if user owns this achievement or is admin
    if (achievement.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(achievement);
  } catch (error) {
    console.error('Get achievement error:', error);
    res.status(500).json({ error: 'Failed to get achievement' });
  }
});

// Legacy route for backward compatibility
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const achievements = await prisma.achievement.findMany({
      where: { userId: req.userId },
      include: {
        nftTokens: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(achievements);
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Failed to get achievements' });
  }
});

router.get('/pending-verification', authenticateToken, async (req: any, res) => {
  try {
    // This would typically be admin-only, but for demo purposes we'll allow users to see all pending
    const achievements = await prisma.achievement.findMany({
      where: { verified: false },
      include: {
        user: {
          select: { firstName: true, lastName: true, university: true, universityEmail: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(achievements);
  } catch (error) {
    console.error('Get pending achievements error:', error);
    res.status(500).json({ error: 'Failed to get pending achievements' });
  }
});

router.put('/:id/verify', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { approved, reason } = req.body;

    const achievement = await prisma.achievement.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    const updatedAchievement = await prisma.achievement.update({
      where: { id },
      data: {
        verified: approved,
        verifiedBy: req.userId,
        verifiedAt: new Date()
      }
    });

    if (approved) {
      // Create NFT token record with evolution system
      const nftType = achievement.type === 'gpa' ? 'gpa_guardian' : 
                    achievement.type === 'research' ? 'research_rockstar' : 'leadership_legend';

      // Calculate initial evolution points
      const evolutionPoints = nftEvolutionService.calculateEvolutionPoints(
        achievement.type,
        achievement.gpaValue || undefined,
        {
          aiConfidence: 85, // Default for manually verified
          university: achievement.user.university
        }
      );

      // Note: No NFT creation in task-based system
      // Achievements are now separate from blockchain rewards
    }

    res.json(updatedAchievement);
  } catch (error) {
    console.error('Verify achievement error:', error);
    res.status(500).json({ error: 'Failed to verify achievement' });
  }
});

// AI Verification endpoint for real-time analysis
router.post('/ai-verify', authenticateToken, requireEmailVerification, upload.single('document'), async (req: any, res) => {
  try {
    const { type } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Document file is required' });
    }

    if (!validateAchievementType(type)) {
      return res.status(400).json({ error: 'Invalid achievement type' });
    }

    const documentType = type === 'gpa' ? 'transcript' : type === 'research' ? 'research' : 'leadership';
    const filePath = path.join('uploads/achievements', req.file.filename);
    
    console.log('🤖 Starting real-time AI document analysis...');
    
    const aiAnalysisResult = await aiVerificationService.analyzeDocument(filePath, documentType as any);
    
    // Generate detailed verification report
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const verificationReport = await aiVerificationService.generateVerificationReport(aiAnalysisResult, user);
    
    console.log(`✅ AI analysis complete - Confidence: ${aiAnalysisResult.confidence}%`);
    
    res.json({
      analysis: aiAnalysisResult,
      verificationReport,
      processingTime: Date.now(), // Add timestamp for demo
      demoMode: !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'demo-key'
    });
    
  } catch (error) {
    console.error('AI verification error:', error);
    res.status(500).json({ error: 'AI verification failed' });
  }
});

// Batch AI verification for multiple documents
router.post('/ai-batch-verify', authenticateToken, requireEmailVerification, upload.array('documents', 5), async (req: any, res) => {
  try {
    const { types } = req.body; // Array of types corresponding to documents
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one document is required' });
    }

    const typesArray = JSON.parse(types);
    
    if (typesArray.length !== req.files.length) {
      return res.status(400).json({ error: 'Number of types must match number of documents' });
    }

    console.log(`🤖 Starting batch AI analysis of ${req.files.length} documents...`);
    
    const documents = req.files.map((file: any, index: number) => ({
      path: path.join('uploads/achievements', file.filename),
      type: typesArray[index] === 'gpa' ? 'transcript' : typesArray[index] === 'research' ? 'research' : 'leadership'
    }));
    
    const results = await aiVerificationService.batchAnalyze(documents);
    
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
    
  } catch (error) {
    console.error('Batch AI verification error:', error);
    res.status(500).json({ error: 'Batch AI verification failed' });
  }
});

export default router;