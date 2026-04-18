import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../server';
import { authenticateToken, requireEmailVerification } from '../middleware/auth';
import { opportunityMarketplaceService } from '../services/opportunityMarketplace';

const router = express.Router();

// File upload configuration for resumes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/resumes/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed for resumes'));
    }
  }
});

// Seed demo companies and opportunities
const seedMarketplaceData = async () => {
  const existingCount = await prisma.company.count();
  if (existingCount > 0) return;

  // Create demo companies
  const companies = [
    {
      name: "Google",
      industry: "Technology",
      size: "enterprise",
      website: "https://google.com",
      description: "Leading technology company focused on organizing world's information",
      isVerified: true,
      contactEmail: "university@google.com",
      tier: "enterprise",
      creditsBalance: 100
    },
    {
      name: "Meta",
      industry: "Social Media",
      size: "large",
      website: "https://meta.com",
      description: "Building the metaverse and connecting people worldwide",
      isVerified: true,
      contactEmail: "recruiting@meta.com",
      tier: "premium",
      creditsBalance: 75
    },
    {
      name: "Tesla",
      industry: "Automotive",
      size: "large",
      website: "https://tesla.com",
      description: "Accelerating the world's transition to sustainable energy",
      isVerified: true,
      contactEmail: "university@tesla.com",
      tier: "premium",
      creditsBalance: 50
    },
    {
      name: "Microsoft",
      industry: "Technology",
      size: "enterprise",
      website: "https://microsoft.com",
      description: "Empowering every person and organization on the planet to achieve more",
      isVerified: true,
      contactEmail: "university@microsoft.com",
      tier: "enterprise",
      creditsBalance: 120
    }
  ];

  const createdCompanies = [];
  for (const company of companies) {
    const created = await prisma.company.create({ data: company });
    createdCompanies.push(created);
  }

  // Create demo opportunities
  const opportunities = [
    {
      title: "Software Engineering Internship - AI/ML",
      description: "Join our cutting-edge AI research team and work on large-scale machine learning systems that impact billions of users.",
      type: "internship",
      category: "digital",
      requiredNFTs: JSON.stringify(["gpa_guardian", "research_rockstar"]),
      minLevel: 2,
      minRarity: "rare",
      companyId: createdCompanies[0].id, // Google
      postedBy: "system",
      salary: "$8,000 - $10,000/month",
      location: "Mountain View, CA",
      remote: true,
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      maxParticipants: 20,
      featured: true,
      cost: 5
    },
    {
      title: "Research Scientist - Computer Vision",
      description: "Lead groundbreaking research in computer vision and AR/VR technologies that will shape the future of human interaction.",
      type: "job",
      category: "digital",
      requiredNFTs: JSON.stringify(["research_rockstar"]),
      minLevel: 3,
      minRarity: "epic",
      companyId: createdCompanies[1].id, // Meta
      postedBy: "system",
      salary: "$180,000 - $250,000",
      location: "Menlo Park, CA",
      remote: false,
      applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      maxParticipants: 5,
      urgent: true,
      cost: 8
    },
    {
      title: "Engineering Leadership Program",
      description: "Fast-track program for exceptional students to develop leadership skills in sustainable technology and energy systems.",
      type: "mentorship",
      category: "physical",
      requiredNFTs: JSON.stringify(["leadership_legend", "gpa_guardian"]),
      minLevel: 2,
      minRarity: "rare",
      companyId: createdCompanies[2].id, // Tesla
      postedBy: "system",
      location: "Austin, TX",
      remote: false,
      startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      maxParticipants: 15,
      cost: 6
    },
    {
      title: "Microsoft Student Ambassador",
      description: "Represent Microsoft on your campus and gain exclusive access to resources, events, and networking opportunities.",
      type: "mentorship",
      category: "digital",
      requiredNFTs: JSON.stringify(["leadership_legend"]),
      minLevel: 1,
      minRarity: "common",
      companyId: createdCompanies[3].id, // Microsoft
      postedBy: "system",
      remote: true,
      applicationDeadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      maxParticipants: 100,
      cost: 2
    },
    {
      title: "Premium IEEE Research Database Access",
      description: "One-year access to IEEE Xplore Digital Library and ACM Digital Library for your research projects.",
      type: "research",
      category: "digital",
      requiredNFTs: JSON.stringify(["research_rockstar", "gpa_guardian"]),
      minLevel: 1,
      minRarity: "common",
      postedBy: "system",
      url: "https://ieeexplore.ieee.org/premium",
      applicationDeadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      maxParticipants: 500,
      cost: 1
    },
    {
      title: "Tech Conference 2024 - VIP Pass",
      description: "VIP access to the largest technology conference with front-row seats, exclusive networking events, and speaker meet-and-greets.",
      type: "event",
      category: "physical",
      requiredNFTs: JSON.stringify(["research_rockstar", "leadership_legend"]),
      minLevel: 2,
      minRarity: "rare",
      postedBy: "system",
      location: "San Francisco, CA",
      startDate: new Date('2024-09-15'),
      endDate: new Date('2024-09-17'),
      applicationDeadline: new Date('2024-08-01'),
      maxParticipants: 50,
      featured: true,
      cost: 4
    }
  ];

  for (const opp of opportunities) {
    await prisma.opportunity.create({ data: opp });
  }
};

// Initialize marketplace data on first request
let initialized = false;

// GET /api/opportunities - Personalized opportunity feed with advanced filtering
router.get('/', authenticateToken, requireEmailVerification, async (req: any, res) => {
  try {
    if (!initialized) {
      await seedMarketplaceData();
      initialized = true;
    }

    const {
      page = 1,
      limit = 20,
      type,
      category,
      location,
      remote,
      company,
      industry,
      featured,
      urgent,
      level
    } = req.query;

    const filters = {
      type,
      category,
      location,
      remote: remote === 'true',
      company,
      industry,
      featured: featured === 'true',
      urgent: urgent === 'true',
      level
    };

    // Remove undefined values
    Object.keys(filters).forEach(key =>
      filters[key as keyof typeof filters] === undefined && delete filters[key as keyof typeof filters]
    );

    const result = await opportunityMarketplaceService.getPersonalizedOpportunities(
      req.userId,
      filters,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      ...result,
      filters: filters,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get personalized opportunities error:', error);
    res.status(500).json({ error: 'Failed to get opportunities' });
  }
});

// POST /api/opportunities/:id/apply - Apply to an opportunity
router.post('/:id/apply', authenticateToken, requireEmailVerification, upload.single('resume'), async (req: any, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const applicationData = {
      message,
      resumeUrl: req.file ? `/uploads/resumes/${req.file.filename}` : undefined
    };

    const result = await opportunityMarketplaceService.applyToOpportunity(
      req.userId,
      id,
      applicationData
    );

    res.json({
      message: 'Application submitted successfully!',
      ...result
    });
  } catch (error: any) {
    console.error('Apply to opportunity error:', error);
    res.status(400).json({ error: error.message || 'Application failed' });
  }
});

// GET /api/opportunities/my-applications - Get user's applications
router.get('/my-applications', authenticateToken, async (req: any, res) => {
  try {
    const applications = await prisma.opportunityApplication.findMany({
      where: { userId: req.userId },
      include: {
        opportunity: {
          include: {
            company: true
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    res.json(applications);
  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({ error: 'Failed to get applications' });
  }
});

// GET /api/opportunities/trends - Get marketplace trends and insights
router.get('/trends', authenticateToken, async (req: any, res) => {
  try {
    const trends = await opportunityMarketplaceService.getMarketplaceTrends();
    res.json(trends);
  } catch (error) {
    console.error('Get marketplace trends error:', error);
    res.status(500).json({ error: 'Failed to get trends' });
  }
});

// GET /api/opportunities/companies - Get all companies
router.get('/companies', authenticateToken, async (req: any, res) => {
  try {
    const companies = await prisma.company.findMany({
      include: {
        opportunities: {
          where: { status: 'active' },
          select: { id: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    const companiesWithCounts = companies.map(company => ({
      ...company,
      activeOpportunities: company.opportunities.length
    }));

    res.json(companiesWithCounts);
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Failed to get companies' });
  }
});

// GET /api/opportunities/:id - Get opportunity details
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        company: true,
        opportunityApplications: {
          where: { userId: req.userId },
          select: { id: true, status: true, appliedAt: true }
        }
      }
    });

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    // Increment view count
    await prisma.opportunity.update({
      where: { id },
      data: { views: { increment: 1 } }
    });

    // Check if user qualifies
    const userNFTs = await prisma.nFTToken.findMany({
      where: { userId: req.userId, minted: true },
      include: { achievement: true }
    });

    const requiredNFTs = JSON.parse(opportunity.requiredNFTs || '[]');
    const userNFTTypes = userNFTs.map(nft => nft.nftType);
    const userMaxLevel = Math.max(...userNFTs.map(nft => nft.level), 0);

    const qualifies = requiredNFTs.length === 0 ||
      requiredNFTs.some((required: string) => userNFTTypes.includes(required)) &&
      userMaxLevel >= opportunity.minLevel;

    res.json({
      ...opportunity,
      userQualifies: qualifies,
      userApplication: opportunity.opportunityApplications[0] || null,
      userNFTStats: {
        maxLevel: userMaxLevel,
        nftTypes: userNFTTypes,
        totalNFTs: userNFTs.length
      }
    });
  } catch (error) {
    console.error('Get opportunity details error:', error);
    res.status(500).json({ error: 'Failed to get opportunity details' });
  }
});

// Legacy endpoint for backward compatibility
router.post('/:id/request-access', authenticateToken, requireEmailVerification, async (req: any, res) => {
  try {
    const { id } = req.params;

    const result = await opportunityMarketplaceService.applyToOpportunity(
      req.userId,
      id,
      { message: 'Legacy access request' }
    );

    res.json({
      message: 'Access granted successfully',
      ...result
    });
  } catch (error: any) {
    console.error('Legacy request access error:', error);
    res.status(400).json({ error: error.message || 'Access request failed' });
  }
});

export default router;