"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hrPortalService = exports.HRPortalService = void 0;
const server_1 = require("../server");
class HRPortalService {
    static async searchTalent(companyId, searchCriteria, recruiterId) {
        const company = await server_1.prisma.company.findFirst({
            where: {
                id: companyId,
                recruiters: { some: { id: recruiterId } }
            }
        });
        if (!company) {
            throw new Error('Unauthorized access to company');
        }
        const whereClause = {
            emailVerified: true,
            privacySettings: { path: ['profileVisibility'], equals: 'public' }
        };
        if (searchCriteria.universities?.length) {
            whereClause.university = { in: searchCriteria.universities };
        }
        if (searchCriteria.graduationYears?.length) {
            whereClause.graduationYear = { in: searchCriteria.graduationYears };
        }
        if (searchCriteria.location) {
            whereClause.location = { contains: searchCriteria.location, mode: 'insensitive' };
        }
        const users = await server_1.prisma.user.findMany({
            where: whereClause,
            include: {
                nfts: {
                    include: { achievement: true }
                },
                achievements: true,
                socialProfile: true
            },
            take: searchCriteria.limit || 50,
            skip: searchCriteria.offset || 0
        });
        const talentProfiles = [];
        for (const user of users) {
            const skills = this.extractUserSkills(user.nfts, user.achievements);
            if (searchCriteria.skills?.length) {
                const hasRequiredSkills = searchCriteria.skills.some(skill => skills.includes(skill.toLowerCase()));
                if (!hasRequiredSkills)
                    continue;
            }
            if (searchCriteria.nftRarities?.length) {
                const userRarities = user.nfts.map(nft => nft.rarity);
                const hasRequiredRarity = searchCriteria.nftRarities.some(rarity => userRarities.includes(rarity));
                if (!hasRequiredRarity)
                    continue;
            }
            if (searchCriteria.achievementTypes?.length) {
                const userAchievementTypes = user.achievements.map(ach => ach.type);
                const hasRequiredAchievement = searchCriteria.achievementTypes.some(type => userAchievementTypes.includes(type));
                if (!hasRequiredAchievement)
                    continue;
            }
            const profileStrength = this.calculateProfileStrength(user);
            const matchScore = this.calculateMatchScore(user, searchCriteria);
            const talentProfile = {
                userId: user.id,
                name: user.name,
                university: user.university,
                graduationYear: user.graduationYear,
                email: user.email,
                profileStrength,
                nftCount: user.nfts.length,
                achievementCount: user.achievements.length,
                topSkills: skills.slice(0, 6),
                careerInterests: this.extractCareerInterests(user),
                availabilityStatus: user.privacySettings?.availability || 'open_to_opportunities',
                location: user.location || 'Not specified',
                willingToRelocate: user.preferences?.willingToRelocate || false,
                workAuthorization: user.preferences?.workAuthorization || 'Unknown',
                portfolioUrl: user.links?.portfolio,
                resumeUrl: user.links?.resume,
                matchScore
            };
            talentProfiles.push(talentProfile);
        }
        const sortBy = searchCriteria.sortBy || 'relevance';
        talentProfiles.sort((a, b) => {
            switch (sortBy) {
                case 'profile_strength':
                    return b.profileStrength - a.profileStrength;
                case 'nft_count':
                    return b.nftCount - a.nftCount;
                case 'relevance':
                default:
                    return (b.matchScore || 0) - (a.matchScore || 0);
            }
        });
        const insights = this.generateSearchInsights(talentProfiles, searchCriteria);
        const total = await server_1.prisma.user.count({ where: whereClause });
        return {
            talents: talentProfiles,
            total,
            insights
        };
    }
    static async getTalentProfile(userId, companyId, recruiterId) {
        const company = await server_1.prisma.company.findFirst({
            where: {
                id: companyId,
                recruiters: { some: { id: recruiterId } }
            }
        });
        if (!company) {
            throw new Error('Unauthorized access');
        }
        const user = await server_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                nfts: {
                    include: { achievement: true },
                    orderBy: { evolutionPoints: 'desc' }
                },
                achievements: {
                    include: { nft: true },
                    orderBy: { createdAt: 'desc' }
                },
                socialProfile: {
                    include: { endorsements: true, posts: true }
                }
            }
        });
        if (!user) {
            throw new Error('User not found');
        }
        const profileVisibility = user.privacySettings?.profileVisibility;
        if (profileVisibility === 'private') {
            throw new Error('Profile is private');
        }
        const skills = this.extractUserSkills(user.nfts, user.achievements);
        const profileStrength = this.calculateProfileStrength(user);
        const analytics = await this.generateCandidateAnalytics(user);
        const profile = {
            userId: user.id,
            name: user.name,
            university: user.university,
            graduationYear: user.graduationYear,
            email: user.email,
            profileStrength,
            nftCount: user.nfts.length,
            achievementCount: user.achievements.length,
            topSkills: skills,
            careerInterests: this.extractCareerInterests(user),
            availabilityStatus: user.privacySettings?.availability || 'open_to_opportunities',
            location: user.location || 'Not specified',
            willingToRelocate: user.preferences?.willingToRelocate || false,
            workAuthorization: user.preferences?.workAuthorization || 'Unknown',
            portfolioUrl: user.links?.portfolio,
            resumeUrl: user.links?.resume,
            detailedAchievements: user.achievements,
            nftPortfolio: user.nfts,
            analytics
        };
        return profile;
    }
    static async createRecruitmentCampaign(companyId, campaignData, recruiterId) {
        const company = await server_1.prisma.company.findFirst({
            where: {
                id: companyId,
                recruiters: { some: { id: recruiterId } }
            }
        });
        if (!company) {
            throw new Error('Unauthorized access to company');
        }
        const campaign = await server_1.prisma.recruitmentCampaign.create({
            data: {
                companyId,
                title: campaignData.title,
                description: campaignData.description,
                requirements: campaignData.requirements,
                preferences: campaignData.preferences,
                compensation: campaignData.compensation,
                location: campaignData.location,
                remote: campaignData.remote || false,
                type: campaignData.type,
                status: campaignData.status || 'draft',
                targetCount: campaignData.targetCount || 10,
                budget: campaignData.budget || 0,
                deadline: campaignData.deadline,
                createdBy: recruiterId
            }
        });
        return campaign;
    }
    static async getTalentInsights(companyId, recruiterId, filters) {
        const company = await server_1.prisma.company.findFirst({
            where: {
                id: companyId,
                recruiters: { some: { id: recruiterId } }
            }
        });
        if (!company) {
            throw new Error('Unauthorized access to company');
        }
        const users = await server_1.prisma.user.findMany({
            where: {
                emailVerified: true,
                privacySettings: { path: ['profileVisibility'], equals: 'public' }
            },
            include: {
                nfts: { include: { achievement: true } },
                achievements: true
            }
        });
        const universityDistribution = {};
        const skillDistribution = {};
        const graduationYearDistribution = {};
        const nftRarityDistribution = {};
        let totalProfileStrength = 0;
        users.forEach(user => {
            if (user.university) {
                universityDistribution[user.university] = (universityDistribution[user.university] || 0) + 1;
            }
            if (user.graduationYear) {
                graduationYearDistribution[user.graduationYear] = (graduationYearDistribution[user.graduationYear] || 0) + 1;
            }
            const skills = this.extractUserSkills(user.nfts, user.achievements);
            skills.forEach(skill => {
                skillDistribution[skill] = (skillDistribution[skill] || 0) + 1;
            });
            user.nfts.forEach(nft => {
                nftRarityDistribution[nft.rarity] = (nftRarityDistribution[nft.rarity] || 0) + 1;
            });
            totalProfileStrength += this.calculateProfileStrength(user);
        });
        const topUniversities = Object.entries(universityDistribution)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([university]) => university);
        const emergingSkills = Object.entries(skillDistribution)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 15)
            .map(([skill]) => skill);
        const marketSalaryRanges = {
            'software_engineer': { min: 80000, max: 150000 },
            'data_scientist': { min: 90000, max: 160000 },
            'product_manager': { min: 100000, max: 180000 },
            'designer': { min: 70000, max: 130000 },
            'marketing': { min: 60000, max: 120000 }
        };
        return {
            totalCandidates: users.length,
            universityDistribution,
            skillDistribution,
            graduationYearDistribution,
            nftRarityDistribution,
            averageProfileStrength: users.length > 0 ? totalProfileStrength / users.length : 0,
            topUniversities,
            emergingSkills,
            competitiveCompanies: ['Google', 'Meta', 'Microsoft', 'Amazon', 'Apple'],
            marketSalaryRanges
        };
    }
    static async trackHiringMetrics(companyId, recruiterId) {
        const campaigns = await server_1.prisma.recruitmentCampaign.findMany({
            where: { companyId },
            include: {
                applications: {
                    include: { user: true }
                }
            }
        });
        const campaignMetrics = campaigns.map(campaign => ({
            id: campaign.id,
            title: campaign.title,
            applicationsReceived: campaign.applications.length,
            shortlistedCount: campaign.applications.filter((app) => app.status === 'shortlisted').length,
            interviewCount: campaign.applications.filter((app) => app.status === 'interview').length,
            offerCount: campaign.applications.filter((app) => app.status === 'offer').length,
            hiredCount: campaign.applications.filter((app) => app.status === 'hired').length,
            rejectedCount: campaign.applications.filter((app) => app.status === 'rejected').length,
            conversionRate: campaign.applications.length > 0 ?
                (campaign.applications.filter((app) => app.status === 'hired').length / campaign.applications.length) * 100 : 0,
            costPerHire: campaign.budget > 0 && campaign.applications.filter((app) => app.status === 'hired').length > 0 ?
                campaign.budget / campaign.applications.filter((app) => app.status === 'hired').length : 0
        }));
        const totalApplications = campaigns.reduce((sum, c) => sum + c.applications.length, 0);
        const totalShortlisted = campaigns.reduce((sum, c) => sum + c.applications.filter((app) => app.status === 'shortlisted').length, 0);
        const totalHired = campaigns.reduce((sum, c) => sum + c.applications.filter((app) => app.status === 'hired').length, 0);
        const hiringFunnel = {
            applications: totalApplications,
            shortlisted: totalShortlisted,
            hired: totalHired,
            applicationToShortlistRate: totalApplications > 0 ? (totalShortlisted / totalApplications) * 100 : 0,
            shortlistToHireRate: totalShortlisted > 0 ? (totalHired / totalShortlisted) * 100 : 0,
            overallConversionRate: totalApplications > 0 ? (totalHired / totalApplications) * 100 : 0
        };
        const sourcingEffectiveness = {
            byUniversity: this.calculateSourceEffectiveness(campaigns, 'university'),
            bySkill: this.calculateSourceEffectiveness(campaigns, 'skill'),
            byNFTRarity: this.calculateSourceEffectiveness(campaigns, 'nftRarity')
        };
        const timeToHire = 21;
        const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
        const costPerHire = totalHired > 0 ? totalBudget / totalHired : 0;
        return {
            campaignMetrics,
            hiringFunnel,
            sourcingEffectiveness,
            timeToHire,
            costPerHire
        };
    }
    static extractUserSkills(nfts, achievements) {
        const skills = new Set();
        nfts.forEach(nft => {
            if (nft.achievement?.type) {
                skills.add(nft.achievement.type);
            }
        });
        achievements.forEach(achievement => {
            if (achievement.type) {
                skills.add(achievement.type);
            }
        });
        return Array.from(skills);
    }
    static calculateProfileStrength(user) {
        let strength = 0;
        if (user.name)
            strength += 5;
        if (user.university)
            strength += 5;
        if (user.emailVerified)
            strength += 10;
        strength += Math.min(user.achievements?.length * 5 || 0, 20);
        const verifiedAchievements = user.achievements?.filter((a) => a.verificationStatus === 'verified').length || 0;
        strength += Math.min(verifiedAchievements * 2, 20);
        strength += Math.min(user.nfts?.length * 3 || 0, 15);
        const totalXP = user.nfts?.reduce((sum, nft) => sum + nft.evolutionPoints, 0) || 0;
        strength += Math.min(totalXP / 100, 15);
        if (user.socialProfile) {
            strength += Math.min((user.socialProfile.endorsements?.length || 0) * 2, 5);
            strength += Math.min((user.socialProfile.posts?.length || 0), 5);
        }
        return Math.min(strength, 100);
    }
    static calculateMatchScore(user, criteria) {
        let score = 0;
        let factors = 0;
        if (criteria.skills?.length) {
            const userSkills = this.extractUserSkills(user.nfts, user.achievements);
            const matchingSkills = criteria.skills.filter(skill => userSkills.some(userSkill => userSkill.toLowerCase().includes(skill.toLowerCase())));
            score += (matchingSkills.length / criteria.skills.length) * 30;
            factors += 30;
        }
        if (criteria.universities?.length) {
            const universityMatch = criteria.universities.includes(user.university) ? 20 : 0;
            score += universityMatch;
            factors += 20;
        }
        if (criteria.nftRarities?.length) {
            const userRarities = user.nfts.map((nft) => nft.rarity);
            const hasPreferredRarity = criteria.nftRarities.some(rarity => userRarities.includes(rarity));
            score += hasPreferredRarity ? 15 : 0;
            factors += 15;
        }
        if (criteria.achievementTypes?.length) {
            const userAchievementTypes = user.achievements.map((ach) => ach.type);
            const matchingTypes = criteria.achievementTypes.filter(type => userAchievementTypes.includes(type));
            score += (matchingTypes.length / criteria.achievementTypes.length) * 15;
            factors += 15;
        }
        const profileStrength = this.calculateProfileStrength(user);
        score += (profileStrength / 100) * 20;
        factors += 20;
        return factors > 0 ? (score / factors) * 100 : profileStrength;
    }
    static extractCareerInterests(user) {
        const interests = new Set();
        const achievementTypes = user.achievements?.map((a) => a.type) || [];
        if (achievementTypes.includes('research'))
            interests.add('Research & Development');
        if (achievementTypes.includes('leadership'))
            interests.add('Management');
        if (achievementTypes.includes('internship'))
            interests.add('Industry Experience');
        if (achievementTypes.includes('project'))
            interests.add('Product Development');
        return Array.from(interests).slice(0, 4);
    }
    static generateSearchInsights(profiles, criteria) {
        return {
            averageProfileStrength: profiles.reduce((sum, p) => sum + p.profileStrength, 0) / profiles.length,
            topUniversities: [...new Set(profiles.map(p => p.university))].slice(0, 5),
            skillDistribution: this.calculateSkillDistribution(profiles),
            availabilityBreakdown: this.calculateAvailabilityBreakdown(profiles)
        };
    }
    static calculateSkillDistribution(profiles) {
        const distribution = {};
        profiles.forEach(profile => {
            profile.topSkills.forEach(skill => {
                distribution[skill] = (distribution[skill] || 0) + 1;
            });
        });
        return distribution;
    }
    static calculateAvailabilityBreakdown(profiles) {
        const breakdown = {};
        profiles.forEach(profile => {
            breakdown[profile.availabilityStatus] = (breakdown[profile.availabilityStatus] || 0) + 1;
        });
        return breakdown;
    }
    static async generateCandidateAnalytics(user) {
        return {
            activityScore: this.calculateActivityScore(user),
            growthTrend: this.calculateGrowthTrend(user),
            skillProgression: this.analyzeSkillProgression(user),
            competitiveRanking: await this.calculateCompetitiveRanking(user)
        };
    }
    static calculateActivityScore(user) {
        const recentAchievements = user.achievements?.filter((a) => new Date(a.createdAt) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)).length || 0;
        const recentNFTs = user.nfts?.filter((n) => new Date(n.createdAt) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)).length || 0;
        return Math.min((recentAchievements * 10 + recentNFTs * 15), 100);
    }
    static calculateGrowthTrend(user) {
        const achievements = user.achievements || [];
        if (achievements.length < 2)
            return 'stable';
        const recent = achievements.filter((a) => new Date(a.createdAt) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)).length;
        const older = achievements.filter((a) => {
            const date = new Date(a.createdAt);
            const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
            const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
            return date <= threeMonthsAgo && date > sixMonthsAgo;
        }).length;
        if (recent > older)
            return 'rising';
        if (recent < older)
            return 'declining';
        return 'stable';
    }
    static analyzeSkillProgression(user) {
        const skillLevels = {};
        user.nfts?.forEach((nft) => {
            const skill = nft.achievement?.type;
            if (skill) {
                if (!skillLevels[skill])
                    skillLevels[skill] = [];
                skillLevels[skill].push(nft.level);
            }
        });
        const progression = {};
        Object.entries(skillLevels).forEach(([skill, levels]) => {
            const maxLevel = Math.max(...levels);
            const avgLevel = levels.reduce((sum, l) => sum + l, 0) / levels.length;
            if (maxLevel >= 4)
                progression[skill] = 'advanced';
            else if (avgLevel >= 2.5)
                progression[skill] = 'intermediate';
            else
                progression[skill] = 'beginner';
        });
        return progression;
    }
    static async calculateCompetitiveRanking(user) {
        const totalUsers = await server_1.prisma.user.count();
        const profileStrength = this.calculateProfileStrength(user);
        return Math.round((profileStrength / 100) * 95);
    }
    static calculateSourceEffectiveness(campaigns, source) {
        const effectiveness = {};
        campaigns.forEach(campaign => {
            campaign.applications?.forEach((app) => {
                let sourceKey = 'Unknown';
                if (source === 'university') {
                    sourceKey = app.user?.university || 'Unknown';
                }
                else if (source === 'skill') {
                    sourceKey = 'General';
                }
                if (!effectiveness[sourceKey]) {
                    effectiveness[sourceKey] = { applications: 0, hired: 0, rate: 0 };
                }
                effectiveness[sourceKey].applications++;
                if (app.status === 'hired') {
                    effectiveness[sourceKey].hired++;
                }
            });
        });
        Object.keys(effectiveness).forEach(key => {
            const data = effectiveness[key];
            data.rate = data.applications > 0 ? (data.hired / data.applications) * 100 : 0;
        });
        return effectiveness;
    }
}
exports.HRPortalService = HRPortalService;
exports.hrPortalService = HRPortalService;
