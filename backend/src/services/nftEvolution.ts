import { prisma } from '../server';

export interface NFTEvolutionConfig {
  level: number;
  requiredPoints: number;
  rarityUpgrade?: string;
  unlocksBonuses: string[];
  visualUpgrades: {
    background: string;
    effects: string[];
    animation: string;
  };
}

export interface StackingRule {
  combination: string[];
  resultType: string;
  rarity: string;
  bonusPoints: number;
  specialEffects: string[];
}

export class NFTEvolutionService {
  private static readonly EVOLUTION_LEVELS: NFTEvolutionConfig[] = [
    {
      level: 1,
      requiredPoints: 0,
      unlocksBonuses: ['Basic opportunities'],
      visualUpgrades: {
        background: 'gradient-basic',
        effects: [],
        animation: 'none'
      }
    },
    {
      level: 2,
      requiredPoints: 100,
      rarityUpgrade: 'rare',
      unlocksBonuses: ['Enhanced opportunities', '10% bonus multiplier'],
      visualUpgrades: {
        background: 'gradient-rare',
        effects: ['glow'],
        animation: 'pulse'
      }
    },
    {
      level: 3,
      requiredPoints: 300,
      rarityUpgrade: 'epic',
      unlocksBonuses: ['Premium opportunities', '25% bonus multiplier', 'Priority matching'],
      visualUpgrades: {
        background: 'gradient-epic',
        effects: ['glow', 'sparkle'],
        animation: 'pulse-glow'
      }
    },
    {
      level: 4,
      requiredPoints: 600,
      rarityUpgrade: 'legendary',
      unlocksBonuses: ['Exclusive opportunities', '50% bonus multiplier', 'VIP access', 'Early bird privileges'],
      visualUpgrades: {
        background: 'gradient-legendary',
        effects: ['glow', 'sparkle', 'aura'],
        animation: 'pulse-sparkle'
      }
    },
    {
      level: 5,
      requiredPoints: 1000,
      rarityUpgrade: 'mythic',
      unlocksBonuses: ['Ultra-rare opportunities', '100% bonus multiplier', 'Executive access', 'Founder privileges', 'Custom benefits'],
      visualUpgrades: {
        background: 'gradient-mythic',
        effects: ['glow', 'sparkle', 'aura', 'lightning'],
        animation: 'epic-transformation'
      }
    }
  ];

  private static readonly STACKING_RULES: StackingRule[] = [
    {
      combination: ['gpa_guardian', 'research_rockstar'],
      resultType: 'academic_titan',
      rarity: 'epic',
      bonusPoints: 200,
      specialEffects: ['academic_mastery', 'research_boost']
    },
    {
      combination: ['gpa_guardian', 'leadership_legend'],
      resultType: 'scholar_leader',
      rarity: 'epic',
      bonusPoints: 200,
      specialEffects: ['leadership_boost', 'academic_authority']
    },
    {
      combination: ['research_rockstar', 'leadership_legend'],
      resultType: 'innovation_pioneer',
      rarity: 'epic',
      bonusPoints: 200,
      specialEffects: ['innovation_boost', 'pioneer_status']
    },
    {
      combination: ['gpa_guardian', 'research_rockstar', 'leadership_legend'],
      resultType: 'academic_legend',
      rarity: 'mythic',
      bonusPoints: 500,
      specialEffects: ['ultimate_authority', 'legend_status', 'all_access_pass']
    }
  ];

  public static calculateEvolutionPoints(achievementType: string, gpaValue?: number, additionalFactors?: any): number {
    let basePoints = 0;

    switch (achievementType) {
      case 'gpa':
        if (gpaValue) {
          basePoints = Math.floor((gpaValue - 3.5) * 100) + 50; // 3.5 GPA = 50 points, 4.0 GPA = 100 points
        }
        break;
      case 'research':
        basePoints = 80; // Research publications are valuable
        break;
      case 'leadership':
        basePoints = 70; // Leadership experience
        break;
      default:
        basePoints = 40;
    }

    // Add bonus points for AI verification confidence
    if (additionalFactors?.aiConfidence >= 90) {
      basePoints += 20;
    } else if (additionalFactors?.aiConfidence >= 80) {
      basePoints += 10;
    }

    // Add bonus for premium universities
    const premiumUniversities = ['Virginia Tech', 'Eastern Michigan University'];
    if (additionalFactors?.university && premiumUniversities.includes(additionalFactors.university)) {
      basePoints += 15;
    }

    return basePoints;
  }

  public static async checkForStacking(userId: string): Promise<any[]> {
    const userNFTs = await prisma.nFTToken.findMany({
      where: { userId, minted: true },
      include: { achievement: true }
    });

    const nftTypes = userNFTs.map(nft => nft.nftType);
    const stackingOpportunities = [];

    for (const rule of this.STACKING_RULES) {
      const hasAllTypes = rule.combination.every(type => nftTypes.includes(type));

      if (hasAllTypes) {
        // Check if this combination already exists
        const existingComposite = userNFTs.find(nft =>
          nft.isComposite &&
          nft.nftType === rule.resultType
        );

        if (!existingComposite) {
          stackingOpportunities.push({
            rule,
            sourceNFTs: userNFTs.filter(nft => rule.combination.includes(nft.nftType)),
            canCreate: true
          });
        }
      }
    }

    return stackingOpportunities;
  }

  public static async createCompositeNFT(userId: string, stackingRule: StackingRule, sourceNFTIds: string[]): Promise<any> {
    const sourceNFTs = await prisma.nFTToken.findMany({
      where: {
        id: { in: sourceNFTIds },
        userId,
        minted: true
      },
      include: { achievement: true }
    });

    if (sourceNFTs.length !== stackingRule.combination.length) {
      throw new Error('Invalid source NFTs for stacking');
    }

    // Create the composite achievement
    const compositeAchievement = await prisma.achievement.create({
      data: {
        userId,
        type: 'composite',
        title: `${stackingRule.resultType.replace('_', ' ').toUpperCase()} - Ultimate Achievement`,
        description: `A legendary combination of ${stackingRule.combination.join(', ')} achievements, representing the pinnacle of academic excellence.`,
        verified: true,
        verifiedAt: new Date(),
        verifiedBy: 'evolution_system'
      }
    });

    // Create the composite NFT
    const compositeNFT = await prisma.nFTToken.create({
      data: {
        userId,
        achievementId: compositeAchievement.id,
        tokenId: `composite_${Date.now()}_${userId}`,
        contractAddress: process.env.APTOS_MODULE_ADDRESS || process.env.APTOS_RESOURCE_ACCOUNT || 'aptos_move_module',
        blockchain: 'aptos',
        nftType: stackingRule.resultType,
        metadataUri: `${process.env.API_URL}/api/nfts/metadata/${compositeAchievement.id}`,
        level: 3, // Start composite NFTs at level 3
        rarity: stackingRule.rarity,
        evolutionPoints: stackingRule.bonusPoints,
        isComposite: true,
        stackedAchievements: JSON.stringify(sourceNFTs.map(nft => nft.achievementId)),
        minted: false // Will be minted by user
      }
    });

    return {
      compositeNFT,
      compositeAchievement,
      sourceNFTs,
      bonusPoints: stackingRule.bonusPoints,
      specialEffects: stackingRule.specialEffects
    };
  }

  public static async evolveNFT(nftId: string): Promise<any> {
    const nft = await prisma.nFTToken.findUnique({
      where: { id: nftId },
      include: { achievement: true, user: true }
    });

    if (!nft) {
      throw new Error('NFT not found');
    }

    const currentLevel = nft.level;
    const nextLevelConfig = this.EVOLUTION_LEVELS.find(config => config.level === currentLevel + 1);

    if (!nextLevelConfig) {
      throw new Error('NFT is already at maximum level');
    }

    if (nft.evolutionPoints < nextLevelConfig.requiredPoints) {
      throw new Error(`Insufficient evolution points. Need ${nextLevelConfig.requiredPoints}, have ${nft.evolutionPoints}`);
    }

    // Evolve the NFT
    const evolvedNFT = await prisma.nFTToken.update({
      where: { id: nftId },
      data: {
        level: nextLevelConfig.level,
        rarity: nextLevelConfig.rarityUpgrade || nft.rarity,
        evolutionPoints: nft.evolutionPoints - nextLevelConfig.requiredPoints, // Keep excess points
        metadataUri: `${process.env.API_URL}/api/nfts/metadata/${nft.achievementId}?level=${nextLevelConfig.level}`
      }
    });

    return {
      evolvedNFT,
      newLevel: nextLevelConfig.level,
      newRarity: nextLevelConfig.rarityUpgrade || nft.rarity,
      unlocksBonuses: nextLevelConfig.unlocksBonuses,
      visualUpgrades: nextLevelConfig.visualUpgrades
    };
  }

  public static async addEvolutionPoints(nftId: string, points: number, reason: string): Promise<any> {
    const nft = await prisma.nFTToken.update({
      where: { id: nftId },
      data: {
        evolutionPoints: {
          increment: points
        }
      }
    });

    // Check if NFT can evolve now
    const nextLevelConfig = this.EVOLUTION_LEVELS.find(config => config.level === nft.level + 1);
    const canEvolve = nextLevelConfig && nft.evolutionPoints >= nextLevelConfig.requiredPoints;

    return {
      nft,
      pointsAdded: points,
      reason,
      canEvolve,
      nextLevelRequirement: nextLevelConfig?.requiredPoints
    };
  }

  public static async generateDynamicMetadata(achievementId: string, level: number = 1): Promise<any> {
    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId },
      include: {
        user: { select: { firstName: true, lastName: true, university: true } },
        nftTokens: true
      }
    });

    if (!achievement) {
      throw new Error('Achievement not found');
    }

    const nft = achievement.nftTokens[0];
    const levelConfig = this.EVOLUTION_LEVELS.find(config => config.level === level) || this.EVOLUTION_LEVELS[0];

    const baseType = achievement.type === 'gpa' ? 'GPA Guardian' :
      achievement.type === 'research' ? 'Research Rockstar' :
        achievement.type === 'leadership' ? 'Leadership Legend' :
          achievement.title;

    return {
      name: `${baseType} ${level > 1 ? `Lv.${level}` : ''} - ${achievement.title}`,
      description: `${achievement.description}\n\nThis ${nft?.rarity || 'common'} NFT represents verified academic achievement and has evolved to level ${level}.`,
      image: `${process.env.API_URL}/api/nfts/image/${achievement.type}?level=${level}&rarity=${nft?.rarity || 'common'}`,
      animation_url: levelConfig.visualUpgrades.animation !== 'none' ?
        `${process.env.API_URL}/api/nfts/animation/${achievement.type}?animation=${levelConfig.visualUpgrades.animation}` : null,
      attributes: [
        { trait_type: "Achievement Type", value: achievement.type },
        { trait_type: "University", value: achievement.user.university },
        { trait_type: "Level", value: level },
        { trait_type: "Rarity", value: nft?.rarity || 'common' },
        { trait_type: "Evolution Points", value: nft?.evolutionPoints || 0 },
        { trait_type: "Verified", value: achievement.verified ? "Yes" : "No" },
        { trait_type: "Issue Date", value: achievement.createdAt.toISOString().split('T')[0] },
        ...(achievement.gpaValue ? [{ trait_type: "GPA", value: achievement.gpaValue }] : []),
        ...(nft?.isComposite ? [{ trait_type: "Composite", value: "Yes" }] : []),
        ...levelConfig.visualUpgrades.effects.map(effect => ({ trait_type: "Visual Effect", value: effect }))
      ],
      properties: {
        level,
        rarity: nft?.rarity || 'common',
        evolutionPoints: nft?.evolutionPoints || 0,
        isComposite: nft?.isComposite || false,
        unlocksBonuses: levelConfig.unlocksBonuses,
        visualUpgrades: levelConfig.visualUpgrades
      },
      external_url: `${process.env.FRONTEND_URL}/nfts/${nft?.id || achievementId}`,
      background_color: this.getRarityColor(nft?.rarity || 'common')
    };
  }

  private static getRarityColor(rarity: string): string {
    const colors = {
      common: '4A90E2',      // Blue
      rare: '9013FE',        // Purple  
      epic: 'FF6B6B',        // Red
      legendary: 'FFD93D',   // Gold
      mythic: 'FF3366'       // Pink
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  }

  public static async getUserNFTEvolutionSummary(userId: string): Promise<any> {
    const nfts = await prisma.nFTToken.findMany({
      where: { userId, minted: true },
      include: { achievement: true }
    });

    const summary = {
      totalNFTs: nfts.length,
      totalEvolutionPoints: nfts.reduce((sum, nft) => sum + nft.evolutionPoints, 0),
      levelDistribution: {} as any,
      rarityDistribution: {} as any,
      canEvolveCount: 0,
      stackingOpportunities: await this.checkForStacking(userId)
    };

    nfts.forEach(nft => {
      // Level distribution
      summary.levelDistribution[nft.level] = (summary.levelDistribution[nft.level] || 0) + 1;

      // Rarity distribution  
      summary.rarityDistribution[nft.rarity] = (summary.rarityDistribution[nft.rarity] || 0) + 1;

      // Can evolve check
      const nextLevel = this.EVOLUTION_LEVELS.find(config => config.level === nft.level + 1);
      if (nextLevel && nft.evolutionPoints >= nextLevel.requiredPoints) {
        summary.canEvolveCount++;
      }
    });

    return summary;
  }
}

export const nftEvolutionService = NFTEvolutionService;