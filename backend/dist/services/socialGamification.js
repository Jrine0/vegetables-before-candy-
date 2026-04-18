"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialGamificationService = exports.SocialGamificationService = void 0;
const server_1 = require("../server");
class SocialGamificationService {
    static async initializeSocialProfile(userId) {
        const user = await server_1.prisma.user.findUnique({
            where: { id: userId },
            include: { socialProfile: true }
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (user.socialProfile) {
            return user.socialProfile;
        }
        const socialProfile = await server_1.prisma.socialProfile.create({
            data: {
                userId,
                displayName: `${user.firstName} ${user.lastName}`,
                bio: `${user.university} student passionate about academic excellence`,
                totalPoints: 0,
                level: 1,
                streak: 0
            }
        });
        await this.createSocialPost(userId, {
            type: 'welcome',
            title: '🎉 Welcome to future me!',
            content: `Just joined the platform to showcase my academic achievements and unlock exclusive opportunities!`,
            isPublic: true
        });
        return socialProfile;
    }
    static async createSocialPost(userId, postData) {
        const post = await server_1.prisma.socialPost.create({
            data: {
                userId,
                ...postData,
                isPublic: postData.isPublic ?? true
            }
        });
        await this.awardPoints(userId, 10, 'social_post_created');
        return post;
    }
    static async getActivityFeed(userId, page = 1, limit = 20, feedType = 'global') {
        const user = await server_1.prisma.user.findUnique({
            where: { id: userId },
            select: { university: true }
        });
        let whereClause = { isPublic: true };
        if (feedType === 'university') {
            whereClause.user = { university: user?.university };
        }
        const posts = await server_1.prisma.socialPost.findMany({
            where: whereClause,
            include: {
                user: {
                    include: {
                        socialProfile: true,
                        nftTokens: {
                            where: { minted: true },
                            take: 3,
                            orderBy: { level: 'desc' }
                        }
                    }
                },
                socialLikes: {
                    where: { userId },
                    select: { id: true }
                },
                _count: {
                    select: { socialLikes: true }
                }
            },
            orderBy: [
                { isPinned: 'desc' },
                { createdAt: 'desc' }
            ],
            skip: (page - 1) * limit,
            take: limit
        });
        const postIds = posts.map(p => p.id);
        await server_1.prisma.socialPost.updateMany({
            where: { id: { in: postIds } },
            data: { views: { increment: 1 } }
        });
        return posts.map(post => ({
            ...post,
            isLiked: post.socialLikes.length > 0,
            likesCount: post._count.socialLikes,
            userNFTPreview: post.user.nftTokens
        }));
    }
    static async togglePostLike(userId, postId) {
        const existingLike = await server_1.prisma.socialLike.findUnique({
            where: { userId_postId: { userId, postId } }
        });
        if (existingLike) {
            await server_1.prisma.socialLike.delete({
                where: { id: existingLike.id }
            });
            await server_1.prisma.socialPost.update({
                where: { id: postId },
                data: { likes: { decrement: 1 } }
            });
            const post = await server_1.prisma.socialPost.findUnique({
                where: { id: postId },
                select: { likes: true }
            });
            return { liked: false, totalLikes: post?.likes || 0 };
        }
        else {
            await server_1.prisma.socialLike.create({
                data: { userId, postId }
            });
            await server_1.prisma.socialPost.update({
                where: { id: postId },
                data: { likes: { increment: 1 } }
            });
            const post = await server_1.prisma.socialPost.findUnique({
                where: { id: postId },
                select: { likes: true, userId: true }
            });
            if (post && post.userId !== userId) {
                await this.awardPoints(post.userId, 5, 'post_liked');
            }
            return { liked: true, totalLikes: post?.likes || 0 };
        }
    }
    static async createEndorsement(endorserId, endorseeId, achievementId, endorsementData) {
        if (endorserId === endorseeId) {
            throw new Error('Cannot endorse yourself');
        }
        const endorsement = await server_1.prisma.endorsement.create({
            data: {
                endorserId,
                endorseeId,
                achievementId,
                ...endorsementData,
                isPublic: endorsementData.isPublic ?? true
            }
        });
        await this.awardPoints(endorserId, 15, 'endorsement_given');
        await this.awardPoints(endorseeId, 25, 'endorsement_received');
        const endorser = await server_1.prisma.user.findUnique({
            where: { id: endorserId },
            select: { firstName: true, lastName: true }
        });
        await this.createSocialPost(endorseeId, {
            type: 'endorsement_received',
            title: '⭐ Received New Endorsement!',
            content: `${endorser?.firstName} ${endorser?.lastName} endorsed me for ${endorsementData.type}: "${endorsementData.message}"`,
            isPublic: true
        });
        return endorsement;
    }
    static async generateLeaderboards() {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const currentWeek = this.getWeekString(new Date());
        await this.generateLeaderboard('global', 'overall', currentMonth);
        await this.generateLeaderboard('weekly', 'overall', currentWeek);
        await this.generateLeaderboard('global', 'gpa', currentMonth);
        await this.generateLeaderboard('global', 'research', currentMonth);
        await this.generateLeaderboard('global', 'leadership', currentMonth);
        const universities = await server_1.prisma.user.groupBy({
            by: ['university'],
            _count: { id: true }
        });
        for (const uni of universities) {
            await this.generateLeaderboard('university', 'overall', currentMonth, uni.university);
        }
    }
    static async generateLeaderboard(type, category, period, university) {
        let users = [];
        const baseWhere = university ? { university } : {};
        switch (category) {
            case 'overall':
                users = await server_1.prisma.user.findMany({
                    where: baseWhere,
                    include: {
                        socialProfile: true,
                        nftTokens: { where: { minted: true } },
                        achievements: { where: { verified: true } }
                    }
                });
                users = users.map(user => ({
                    ...user,
                    score: (user.socialProfile?.totalPoints || 0) +
                        (user.nftTokens.reduce((sum, nft) => sum + nft.level * nft.evolutionPoints, 0)) +
                        (user.achievements.length * 50)
                }));
                break;
            case 'gpa':
                users = await server_1.prisma.user.findMany({
                    where: baseWhere,
                    include: {
                        achievements: {
                            where: { type: 'gpa', verified: true },
                            orderBy: { gpaValue: 'desc' },
                            take: 1
                        }
                    }
                });
                users = users
                    .filter(user => user.achievements.length > 0)
                    .map(user => ({
                    ...user,
                    score: user.achievements[0]?.gpaValue || 0
                }));
                break;
            case 'research':
                users = await server_1.prisma.user.findMany({
                    where: baseWhere,
                    include: {
                        nftTokens: {
                            where: { nftType: 'research_rockstar', minted: true }
                        }
                    }
                });
                users = users.map(user => ({
                    ...user,
                    score: user.nftTokens.reduce((sum, nft) => sum + nft.level + nft.evolutionPoints / 10, 0)
                }));
                break;
            case 'leadership':
                users = await server_1.prisma.user.findMany({
                    where: baseWhere,
                    include: {
                        nftTokens: {
                            where: { nftType: 'leadership_legend', minted: true }
                        },
                        endorsementsReceived: {
                            where: { type: 'leadership' }
                        }
                    }
                });
                users = users.map(user => ({
                    ...user,
                    score: user.nftTokens.reduce((sum, nft) => sum + nft.level + nft.evolutionPoints / 10, 0) +
                        user.endorsementsReceived.length * 20
                }));
                break;
        }
        users.sort((a, b) => b.score - a.score);
        await server_1.prisma.leaderboard.deleteMany({
            where: { type, category, period }
        });
        const leaderboardEntries = users.slice(0, 100).map((user, index) => ({
            type,
            category,
            period,
            userId: user.id,
            rank: index + 1,
            score: user.score
        }));
        if (leaderboardEntries.length > 0) {
            await server_1.prisma.leaderboard.createMany({
                data: leaderboardEntries
            });
        }
    }
    static async getLeaderboard(type, category, limit = 50) {
        const currentPeriod = type === 'weekly' ?
            this.getWeekString(new Date()) :
            new Date().toISOString().slice(0, 7);
        const leaderboard = await server_1.prisma.leaderboard.findMany({
            where: { type, category, period: currentPeriod },
            include: {
                userId: true
            },
            orderBy: { rank: 'asc' },
            take: limit
        });
        const userIds = leaderboard.map(entry => entry.userId);
        const users = await server_1.prisma.user.findMany({
            where: { id: { in: userIds } },
            include: {
                socialProfile: true,
                nftTokens: { where: { minted: true } }
            }
        });
        const userMap = users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {});
        return leaderboard.map(entry => {
            const user = userMap[entry.userId];
            const nftStats = {
                totalNFTs: user.nftTokens.length,
                highestLevel: Math.max(...user.nftTokens.map((nft) => nft.level), 0),
                rareCount: user.nftTokens.filter((nft) => ['rare', 'epic', 'legendary', 'mythic'].includes(nft.rarity)).length
            };
            return {
                userId: entry.userId,
                rank: entry.rank,
                score: entry.score,
                user: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    university: user.university,
                    socialProfile: user.socialProfile
                },
                nftStats
            };
        });
    }
    static async awardPoints(userId, points, reason) {
        let socialProfile = await server_1.prisma.socialProfile.findUnique({
            where: { userId }
        });
        if (!socialProfile) {
            socialProfile = await this.initializeSocialProfile(userId);
        }
        const newTotalPoints = socialProfile.totalPoints + points;
        const newLevel = Math.floor(newTotalPoints / 1000) + 1;
        const leveledUp = newLevel > socialProfile.level;
        const updatedProfile = await server_1.prisma.socialProfile.update({
            where: { userId },
            data: {
                totalPoints: newTotalPoints,
                level: newLevel
            }
        });
        if (leveledUp) {
            await this.createSocialPost(userId, {
                type: 'level_up',
                title: `🎉 Level Up! Reached Level ${newLevel}`,
                content: `Just reached level ${newLevel} with ${newTotalPoints} total points! Keep climbing! 🚀`,
                isPublic: true
            });
            await this.checkAndAwardBadges(userId);
        }
        return {
            pointsAwarded: points,
            reason,
            newTotalPoints,
            newLevel,
            leveledUp,
            profile: updatedProfile
        };
    }
    static async checkAndAwardBadges(userId) {
        const user = await server_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                socialProfile: true,
                achievements: { where: { verified: true } },
                nftTokens: { where: { minted: true } },
                endorsementsReceived: true
            }
        });
        if (!user)
            return [];
        const availableBadges = await this.getAvailableBadges();
        const userBadges = await server_1.prisma.userBadge.findMany({
            where: { userId },
            select: { badgeId: true }
        });
        const earnedBadgeIds = userBadges.map(ub => ub.badgeId);
        const newBadges = [];
        for (const badge of availableBadges) {
            if (earnedBadgeIds.includes(badge.id))
                continue;
            if (this.checkBadgeCondition(badge.condition, user)) {
                await server_1.prisma.userBadge.create({
                    data: { userId, badgeId: badge.id }
                });
                newBadges.push(badge);
                await this.createSocialPost(userId, {
                    type: 'badge_earned',
                    title: `🏆 Badge Earned: ${badge.name}`,
                    content: `Just earned the "${badge.name}" badge! ${badge.description}`,
                    imageUrl: badge.iconUrl,
                    isPublic: true
                });
                await this.awardPoints(userId, 100, `badge_earned_${badge.name}`);
            }
        }
        return newBadges;
    }
    static checkBadgeCondition(conditions, user) {
        return conditions.every(condition => {
            switch (condition.type) {
                case 'achievement_count':
                    return user.achievements.length >= condition.threshold;
                case 'nft_level':
                    return user.nftTokens.some((nft) => nft.level >= condition.threshold);
                case 'gpa_threshold':
                    const gpaAch = user.achievements.find((a) => a.type === 'gpa');
                    return gpaAch && gpaAch.gpaValue >= condition.threshold;
                case 'endorsement_count':
                    return user.endorsementsReceived.length >= condition.threshold;
                default:
                    return false;
            }
        });
    }
    static async getAvailableBadges() {
        return await server_1.prisma.badge.findMany({
            where: { isActive: true }
        });
    }
    static getWeekString(date) {
        const year = date.getFullYear();
        const week = Math.ceil((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
        return `${year}-W${week.toString().padStart(2, '0')}`;
    }
    static async getUserSocialStats(userId) {
        const socialProfile = await server_1.prisma.socialProfile.findUnique({
            where: { userId },
            include: {
                user: {
                    include: {
                        posts: {
                            select: {
                                _count: { select: { socialLikes: true } },
                                views: true
                            }
                        },
                        endorsementsReceived: {
                            select: { type: true }
                        }
                    }
                }
            }
        });
        if (!socialProfile) {
            return null;
        }
        const totalLikes = socialProfile.user.posts.reduce((sum, post) => sum + post._count.socialLikes, 0);
        const totalViews = socialProfile.user.posts.reduce((sum, post) => sum + post.views, 0);
        const endorsementsByType = socialProfile.user.endorsementsReceived.reduce((acc, endorsement) => {
            acc[endorsement.type] = (acc[endorsement.type] || 0) + 1;
            return acc;
        }, {});
        return {
            ...socialProfile,
            engagement: {
                totalLikes,
                totalViews,
                totalPosts: socialProfile.user.posts.length,
                avgLikesPerPost: socialProfile.user.posts.length > 0 ? totalLikes / socialProfile.user.posts.length : 0
            },
            endorsements: {
                total: socialProfile.user.endorsementsReceived.length,
                byType: endorsementsByType
            }
        };
    }
}
exports.SocialGamificationService = SocialGamificationService;
exports.socialGamificationService = SocialGamificationService;
