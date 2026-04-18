import { prisma } from '../server';

const badges = [
  {
    name: "First Steps",
    description: "Created your first achievement",
    iconUrl: "🎯",
    rarity: "common",
    condition: [{ type: "achievement_count", threshold: 1 }]
  },
  {
    name: "Overachiever",
    description: "Submitted 5 achievements",
    iconUrl: "⭐",
    rarity: "rare",
    condition: [{ type: "achievement_count", threshold: 5 }]
  },
  {
    name: "Academic Elite",
    description: "Maintained a 3.8+ GPA",
    iconUrl: "🎓",
    rarity: "epic",
    condition: [{ type: "gpa_threshold", threshold: 3.8 }]
  },
  {
    name: "Dean's List",
    description: "Achieved a perfect 4.0 GPA",
    iconUrl: "👑",
    rarity: "legendary",
    condition: [{ type: "gpa_threshold", threshold: 4.0 }]
  },
  {
    name: "Evolution Master",
    description: "Evolved an NFT to level 3+",
    iconUrl: "🚀",
    rarity: "epic",
    condition: [{ type: "nft_level", threshold: 3 }]
  },
  {
    name: "Legendary Scholar",
    description: "Reached maximum NFT level (5)",
    iconUrl: "💎",
    rarity: "legendary",
    condition: [{ type: "nft_level", threshold: 5 }]
  },
  {
    name: "Social Butterfly",
    description: "Received 10 endorsements",
    iconUrl: "🦋",
    rarity: "rare",
    condition: [{ type: "endorsement_count", threshold: 10 }]
  },
  {
    name: "Community Leader",
    description: "Received 25 endorsements",
    iconUrl: "🌟",
    rarity: "epic",
    condition: [{ type: "endorsement_count", threshold: 25 }]
  },
  {
    name: "Triple Threat",
    description: "Earned all three main NFT types",
    iconUrl: "🏆",
    rarity: "epic",
    condition: [
      { type: "achievement_count", threshold: 3, category: "mixed" }
    ]
  },
  {
    name: "Pioneer",
    description: "One of the first 100 users",
    iconUrl: "🔥",
    rarity: "legendary",
    condition: [{ type: "early_adopter", threshold: 100 }]
  }
];

export async function seedBadges() {
  console.log('🏆 Seeding badges...');

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: {
        name: badge.name,
        description: badge.description,
        iconUrl: badge.iconUrl,
        rarity: badge.rarity,
        condition: JSON.stringify(badge.condition)
      }
    });
  }

  console.log('✅ Badges seeded successfully!');
}

// Run if called directly
if (require.main === module) {
  seedBadges()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}