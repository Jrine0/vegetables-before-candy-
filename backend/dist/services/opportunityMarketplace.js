"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.opportunityMarketplaceService = exports.OpportunityMarketplaceService = void 0;
const server_1 = require("../server");
const aptosChain_1 = require("./aptosChain");
class OpportunityMarketplaceService {
    static async getPersonalizedOpportunities(userId, filters = {}, page = 1, limit = 20) {
        const userNFTs = await server_1.prisma.nFTToken.findMany({
            where: { userId, minted: true },
            include: { achievement: true }
        });
        const whereClause = {
            status: 'active',
            applicationDeadline: filters.urgent ?
                { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } :
                { gte: new Date() }
        };
        if (filters.type)
            whereClause.type = filters.type;
        if (filters.category)
            whereClause.category = filters.category;
        if (filters.location)
            whereClause.location = { contains: filters.location };
        if (filters.remote !== undefined)
            whereClause.remote = filters.remote;
        if (filters.featured)
            whereClause.featured = true;
        if (filters.urgent)
            whereClause.urgent = true;
        if (filters.company) {
            whereClause.company = {
                name: { contains: filters.company, mode: 'insensitive' }
            };
        }
        if (filters.industry) {
            whereClause.company = {
                ...whereClause.company,
                industry: { contains: filters.industry, mode: 'insensitive' }
            };
        }
        const opportunities = await server_1.prisma.opportunity.findMany({
            where: whereClause,
            include: {
                company: true,
                accessGrants: true,
                applications: true
            },
            orderBy: [
                { featured: 'desc' },
                { urgent: 'desc' },
                { createdAt: 'desc' }
            ],
            skip: (page - 1) * limit,
            take: limit + 1
        });
        const hasMore = opportunities.length > limit;
        const paginatedOpportunities = hasMore ? opportunities.slice(0, -1) : opportunities;
        const matchingResults = await Promise.all(paginatedOpportunities.map(opportunity => this.calculateMatchScore(opportunity, userNFTs, userId)));
        matchingResults.sort((a, b) => b.matchScore - a.matchScore);
        const total = await server_1.prisma.opportunity.count({ where: whereClause });
        return {
            opportunities: matchingResults,
            total,
            hasMore
        };
    }
    static async calculateMatchScore(opportunity, userNFTs, userId) {
        let matchScore = 0;
        const matchReasons = [];
        const missingRequirements = [];
        const requiredNFTs = JSON.parse(opportunity.requiredNFTs || '[]');
        const userNFTTypes = userNFTs.map(nft => nft.nftType);
        const userMaxLevel = Math.max(...userNFTs.map(nft => nft.level), 0);
        const userRarities = userNFTs.map(nft => nft.rarity);
        matchScore += 10;
        const hasRequiredNFTs = requiredNFTs.length === 0 ||
            requiredNFTs.some((required) => userNFTTypes.includes(required));
        if (hasRequiredNFTs) {
            matchScore += 30;
            matchReasons.push('You have the required achievement NFTs');
        }
        else {
            missingRequirements.push(`Required NFTs: ${requiredNFTs.join(', ')}`);
        }
        if (userMaxLevel >= opportunity.minLevel) {
            matchScore += 20;
            matchReasons.push(`Your highest NFT level (${userMaxLevel}) meets requirements`);
        }
        else {
            missingRequirements.push(`Minimum NFT level: ${opportunity.minLevel} (you have: ${userMaxLevel})`);
        }
        const rarityValues = { common: 1, rare: 2, epic: 3, legendary: 4, mythic: 5 };
        const userMaxRarity = Math.max(...userRarities.map(r => rarityValues[r] || 1));
        const requiredRarityValue = rarityValues[opportunity.minRarity] || 1;
        if (userMaxRarity >= requiredRarityValue) {
            matchScore += 15;
            matchReasons.push(`Your NFT rarity meets requirements`);
        }
        else {
            missingRequirements.push(`Minimum rarity: ${opportunity.minRarity}`);
        }
        const userUniversity = userNFTs[0]?.achievement?.user?.university;
        if (opportunity.university && userUniversity === opportunity.university) {
            matchScore += 15;
            matchReasons.push('University-specific opportunity');
        }
        const gpaAchievement = userNFTs.find(nft => nft.achievement.type === 'gpa');
        if (gpaAchievement?.achievement?.gpaValue >= 3.8) {
            matchScore += 10;
            matchReasons.push('High GPA bonus');
        }
        const researchCount = userNFTs.filter(nft => nft.achievement.type === 'research').length;
        if (researchCount > 0 && opportunity.type === 'research') {
            matchScore += 15;
            matchReasons.push('Research experience match');
        }
        const leadershipCount = userNFTs.filter(nft => nft.achievement.type === 'leadership').length;
        if (leadershipCount > 0 && ['internship', 'job'].includes(opportunity.type)) {
            matchScore += 10;
            matchReasons.push('Leadership experience valued');
        }
        const recentActivity = userNFTs.filter(nft => new Date(nft.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000).length;
        if (recentActivity > 0) {
            matchScore += 5;
            matchReasons.push('Recent achievement activity');
        }
        const compositeNFTs = userNFTs.filter(nft => nft.isComposite);
        if (compositeNFTs.length > 0) {
            matchScore += 25;
            matchReasons.push('Rare composite NFT holder');
        }
        if (opportunity.urgent)
            matchScore += 10;
        if (opportunity.featured)
            matchScore += 5;
        const alreadyApplied = await server_1.prisma.opportunityApplication.findFirst({
            where: { userId, opportunityId: opportunity.id }
        });
        if (alreadyApplied) {
            matchScore = Math.max(0, matchScore - 50);
            matchReasons.push('Already applied');
        }
        const userQualifies = hasRequiredNFTs &&
            userMaxLevel >= opportunity.minLevel &&
            userMaxRarity >= requiredRarityValue;
        return {
            opportunity,
            matchScore: Math.min(100, matchScore),
            matchReasons,
            userQualifies,
            missingRequirements
        };
    }
    static async applyToOpportunity(userId, opportunityId, applicationData) {
        const userNFTs = await server_1.prisma.nFTToken.findMany({
            where: { userId, minted: true },
            include: { achievement: true }
        });
        const opportunity = await server_1.prisma.opportunity.findUnique({
            where: { id: opportunityId },
            include: { company: true }
        });
        if (!opportunity) {
            throw new Error('Opportunity not found');
        }
        if (opportunity.status !== 'active') {
            throw new Error('Opportunity is no longer active');
        }
        if (opportunity.applicationDeadline && new Date() > opportunity.applicationDeadline) {
            throw new Error('Application deadline has passed');
        }
        const existingApplication = await server_1.prisma.opportunityApplication.findFirst({
            where: { userId, opportunityId }
        });
        if (existingApplication) {
            throw new Error('You have already applied to this opportunity');
        }
        const matchResult = await this.calculateMatchScore(opportunity, userNFTs, userId);
        if (!matchResult.userQualifies) {
            throw new Error(`You don't meet the requirements: ${matchResult.missingRequirements.join(', ')}`);
        }
        const user = await server_1.prisma.user.findUnique({
            where: { id: userId },
            select: { walletAddress: true }
        });
        if (!user?.walletAddress) {
            throw new Error('Aptos wallet is required to apply for gated opportunities');
        }
        const requiredTypes = JSON.parse(opportunity.requiredNFTs || '[]');
        await aptosChain_1.aptosChainService.assertOpportunityAccess(user.walletAddress, opportunity.id, requiredTypes);
        const application = await server_1.prisma.opportunityApplication.create({
            data: {
                userId,
                opportunityId,
                message: applicationData.message,
                resume: applicationData.resumeUrl
            }
        });
        await server_1.prisma.opportunity.update({
            where: { id: opportunityId },
            data: {
                applications: { increment: 1 },
                currentParticipants: { increment: 1 }
            }
        });
        return {
            application,
            matchScore: matchResult.matchScore,
            matchReasons: matchResult.matchReasons
        };
    }
    static async getCompanyInsights(companyId) {
        const company = await server_1.prisma.company.findUnique({
            where: { id: companyId },
            include: {
                opportunities: {
                    include: {
                        applications: {
                            include: {
                                user: {
                                    include: {
                                        nftTokens: true,
                                        achievements: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!company) {
            throw new Error('Company not found');
        }
        const totalOpportunities = company.opportunities.length;
        const activeOpportunities = company.opportunities.filter(op => op.status === 'active').length;
        const totalApplications = company.opportunities.reduce((sum, op) => sum + op.applications.length, 0);
        const allApplicants = company.opportunities.flatMap(op => op.applications.map(app => app.user));
        const avgGPA = allApplicants
            .filter(user => user.achievements.some(ach => ach.type === 'gpa' && ach.gpaValue))
            .reduce((sum, user) => {
            const gpaAch = user.achievements.find(ach => ach.type === 'gpa' && ach.gpaValue);
            return sum + (gpaAch?.gpaValue || 0);
        }, 0) / allApplicants.length || 0;
        const topUniversities = allApplicants
            .reduce((acc, user) => {
            acc[user.university] = (acc[user.university] || 0) + 1;
            return acc;
        }, {});
        return {
            company,
            metrics: {
                totalOpportunities,
                activeOpportunities,
                totalApplications,
                avgApplicationsPerOpportunity: totalApplications / totalOpportunities || 0,
                applicantQuality: {
                    avgGPA: Math.round(avgGPA * 100) / 100,
                    totalNFTHolders: allApplicants.filter(user => user.nftTokens.length > 0).length,
                    topUniversities: Object.entries(topUniversities)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([uni, count]) => ({ university: uni, count }))
                }
            }
        };
    }
    static async createRealTimeOpportunity(companyId, opportunityData, createdBy) {
        const company = await server_1.prisma.company.findUnique({
            where: { id: companyId }
        });
        if (!company) {
            throw new Error('Company not found');
        }
        if (company.creditsBalance < opportunityData.cost) {
            throw new Error('Insufficient credits to post opportunity');
        }
        const opportunity = await server_1.prisma.opportunity.create({
            data: {
                ...opportunityData,
                companyId,
                postedBy: createdBy,
                status: 'active'
            }
        });
        await server_1.prisma.company.update({
            where: { id: companyId },
            data: {
                creditsBalance: { decrement: opportunityData.cost }
            }
        });
        this.notifyQualifiedUsers(opportunity.id);
        return opportunity;
    }
    static async notifyQualifiedUsers(opportunityId) {
        console.log(`🔔 Sending notifications for new opportunity: ${opportunityId}`);
        const opportunity = await server_1.prisma.opportunity.findUnique({
            where: { id: opportunityId },
            include: { company: true }
        });
        if (opportunity) {
            console.log(`📧 Notifying users about: ${opportunity.title} at ${opportunity.company?.name}`);
        }
    }
    static async getMarketplaceTrends() {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const trends = await server_1.prisma.opportunity.groupBy({
            by: ['type', 'category'],
            where: {
                createdAt: { gte: thirtyDaysAgo }
            },
            _count: {
                id: true
            },
            _avg: {
                applications: true
            }
        });
        const topCompanies = await server_1.prisma.company.findMany({
            include: {
                opportunities: {
                    where: {
                        createdAt: { gte: thirtyDaysAgo }
                    }
                }
            },
            orderBy: {
                opportunities: {
                    _count: 'desc'
                }
            },
            take: 10
        });
        const salaryTrends = await server_1.prisma.opportunity.findMany({
            where: {
                salary: { not: null },
                createdAt: { gte: thirtyDaysAgo }
            },
            select: {
                salary: true,
                type: true,
                location: true
            }
        });
        return {
            opportunityTrends: trends,
            topCompanies: topCompanies.map(company => ({
                name: company.name,
                industry: company.industry,
                opportunitiesPosted: company.opportunities.length,
                isVerified: company.isVerified
            })),
            salaryInsights: salaryTrends,
            marketHealth: {
                totalOpportunities: trends.reduce((sum, trend) => sum + trend._count.id, 0),
                avgApplications: trends.reduce((sum, trend) => sum + (trend._avg.applications || 0), 0) / trends.length || 0,
                mostPopularType: trends.sort((a, b) => b._count.id - a._count.id)[0]?.type || 'internship'
            }
        };
    }
}
exports.OpportunityMarketplaceService = OpportunityMarketplaceService;
exports.opportunityMarketplaceService = OpportunityMarketplaceService;
