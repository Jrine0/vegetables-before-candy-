import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create universities
  const universities = [
    { name: 'Stanford University', emailDomain: 'stanford.edu', adminEmail: 'admin@stanford.edu' },
    { name: 'MIT', emailDomain: 'mit.edu', adminEmail: 'admin@mit.edu' },
    { name: 'Harvard University', emailDomain: 'harvard.edu', adminEmail: 'admin@harvard.edu' },
    { name: 'UC Berkeley', emailDomain: 'berkeley.edu', adminEmail: 'admin@berkeley.edu' },
    { name: 'Carnegie Mellon', emailDomain: 'cmu.edu', adminEmail: 'admin@cmu.edu' }
  ];

  for (const uni of universities) {
    await prisma.university.upsert({
      where: { name: uni.name },
      update: {},
      create: uni
    });
  }

  // Create companies
  const companies = [
    {
      name: 'Google',
      industry: 'Technology',
      size: 'enterprise',
      website: 'https://google.com',
      description: 'Leading technology company specializing in internet-related services and products.',
      contactEmail: 'recruiting@google.com',
      tier: 'enterprise',
      creditsBalance: 1000
    },
    {
      name: 'Meta',
      industry: 'Technology',
      size: 'enterprise',
      website: 'https://meta.com',
      description: 'Social technology company that builds tools to help people connect.',
      contactEmail: 'careers@meta.com',
      tier: 'enterprise',
      creditsBalance: 1000
    },
    {
      name: 'Tesla',
      industry: 'Automotive',
      size: 'large',
      website: 'https://tesla.com',
      description: 'Electric vehicle and clean energy company.',
      contactEmail: 'jobs@tesla.com',
      tier: 'premium',
      creditsBalance: 500
    },
    {
      name: 'Microsoft',
      industry: 'Technology',
      size: 'enterprise',
      website: 'https://microsoft.com',
      description: 'Multinational technology corporation.',
      contactEmail: 'careers@microsoft.com',
      tier: 'enterprise',
      creditsBalance: 1000
    }
  ];

  for (const company of companies) {
    await prisma.company.upsert({
      where: { name: company.name },
      update: {},
      create: company
    });
  }

  // Create demo users
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const users = [
    {
      email: 'alice@stanford.edu',
      universityEmail: 'alice@stanford.edu',
      firstName: 'Alice',
      lastName: 'Johnson',
      university: 'Stanford University',
      studentId: 'STU001',
      emailVerified: true
    },
    {
      email: 'bob@mit.edu',
      universityEmail: 'bob@mit.edu',
      firstName: 'Bob',
      lastName: 'Smith',
      university: 'MIT',
      studentId: 'MIT001',
      emailVerified: true
    },
    {
      email: 'carol@berkeley.edu',
      universityEmail: 'carol@berkeley.edu',
      firstName: 'Carol',
      lastName: 'Williams',
      university: 'UC Berkeley',
      studentId: 'UCB001',
      emailVerified: true
    }
  ];

  const createdUsers = [];
  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData
    });
    createdUsers.push(user);

    // Create social profile for each user
    await prisma.socialProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        displayName: `${userData.firstName} ${userData.lastName}`,
        bio: `${userData.university} student passionate about technology and innovation.`,
        isPublic: true,
        showNFTs: true,
        showAchievements: true,
        totalPoints: Math.floor(Math.random() * 1000) + 500,
        level: Math.floor(Math.random() * 5) + 1,
        streak: Math.floor(Math.random() * 30),
        badges: JSON.stringify(['early_adopter', 'achiever'])
      }
    });
  }

  // Create achievements for users
  const achievementTypes = ['gpa', 'research', 'leadership', 'internship', 'project'];
  
  for (let i = 0; i < createdUsers.length; i++) {
    const user = createdUsers[i];
    const numAchievements = Math.floor(Math.random() * 4) + 2; // 2-5 achievements per user

    for (let j = 0; j < numAchievements; j++) {
      const type = achievementTypes[Math.floor(Math.random() * achievementTypes.length)];
      const achievement = await prisma.achievement.create({
        data: {
          userId: user.id,
          type,
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} Achievement ${j + 1}`,
          description: `Outstanding ${type} accomplishment demonstrated through hard work and dedication.`,
          gpaValue: type === 'gpa' ? 3.5 + Math.random() * 0.5 : null,
          verified: Math.random() > 0.3, // 70% verified
          verifiedBy: Math.random() > 0.3 ? 'admin' : null,
          verifiedAt: Math.random() > 0.3 ? new Date() : null
        }
      });

      // Create NFT for verified achievements
      if (achievement.verified) {
        const rarities = ['common', 'rare', 'epic', 'legendary', 'mythic'];
        const rarity = rarities[Math.floor(Math.random() * rarities.length)];
        const level = Math.floor(Math.random() * 5) + 1;
        
        await prisma.nFTToken.create({
          data: {
            userId: user.id,
            achievementId: achievement.id,
            tokenId: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            contractAddress: process.env.APTOS_MODULE_ADDRESS || process.env.APTOS_RESOURCE_ACCOUNT || 'aptos_move_module',
            blockchain: 'aptos',
            nftType: `${type}_${rarity}`,
            metadataUri: `${process.env.API_URL}/api/nfts/metadata/${achievement.id}`,
            minted: true,
            mintedAt: new Date(),
            level,
            rarity,
            evolutionPoints: Math.floor(Math.random() * 1000) + level * 200,
            isComposite: false
          }
        });
      }
    }
  }

  // Create opportunities
  const opportunities = [
    {
      title: 'Software Engineer Intern',
      description: 'Join our engineering team to build next-generation products that impact billions of users worldwide.',
      type: 'internship',
      category: 'digital',
      requiredNFTs: JSON.stringify(['gpa', 'project']),
      minLevel: 2,
      minRarity: 'rare',
      salary: '$8,000 - $12,000 per month',
      location: 'Mountain View, CA',
      remote: true,
      url: 'https://careers.google.com/jobs/results/123456789',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-31'),
      applicationDeadline: new Date('2024-03-15'),
      maxParticipants: 50,
      currentParticipants: 12,
      status: 'active',
      featured: true,
      cost: 5
    },
    {
      title: 'Data Science Research Position',
      description: 'Work with cutting-edge AI and machine learning technologies to solve complex real-world problems.',
      type: 'job',
      category: 'digital',
      requiredNFTs: JSON.stringify(['research', 'gpa']),
      minLevel: 3,
      minRarity: 'epic',
      salary: '$120,000 - $180,000 per year',
      location: 'Seattle, WA',
      remote: true,
      startDate: new Date('2024-04-01'),
      applicationDeadline: new Date('2024-02-28'),
      maxParticipants: 10,
      currentParticipants: 3,
      status: 'active',
      featured: true,
      cost: 8
    },
    {
      title: 'Product Manager Internship',
      description: 'Drive product strategy and work cross-functionally with engineering, design, and business teams.',
      type: 'internship',
      category: 'digital',
      requiredNFTs: JSON.stringify(['leadership', 'project']),
      minLevel: 2,
      minRarity: 'rare',
      salary: '$7,500 - $10,000 per month',
      location: 'Menlo Park, CA',
      remote: false,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-31'),
      applicationDeadline: new Date('2024-03-01'),
      maxParticipants: 20,
      currentParticipants: 8,
      status: 'active',
      cost: 6
    }
  ];

  const googleCompany = await prisma.company.findFirst({ where: { name: 'Google' } });
  const metaCompany = await prisma.company.findFirst({ where: { name: 'Meta' } });
  const microsoftCompany = await prisma.company.findFirst({ where: { name: 'Microsoft' } });

  const companies_list = [googleCompany, metaCompany, microsoftCompany];

  for (let i = 0; i < opportunities.length; i++) {
    const company = companies_list[i % companies_list.length];
    if (company) {
      await prisma.opportunity.create({
        data: {
          ...opportunities[i],
          companyId: company.id,
          postedBy: 'system'
        }
      });
    }
  }

  // Create badges
  const badges = [
    {
      name: 'Early Adopter',
      description: 'One of the first 100 users on the platform',
      iconUrl: '/badges/early-adopter.png',
      rarity: 'legendary',
      condition: JSON.stringify({ type: 'user_count', threshold: 100 })
    },
    {
      name: 'Achievement Hunter',
      description: 'Earned 10 or more achievements',
      iconUrl: '/badges/achievement-hunter.png',
      rarity: 'epic',
      condition: JSON.stringify({ type: 'achievement_count', threshold: 10 })
    },
    {
      name: 'NFT Collector',
      description: 'Minted 5 or more NFTs',
      iconUrl: '/badges/nft-collector.png',
      rarity: 'rare',
      condition: JSON.stringify({ type: 'nft_count', threshold: 5 })
    },
    {
      name: 'Social Butterfly',
      description: 'Received 25 endorsements from peers',
      iconUrl: '/badges/social-butterfly.png',
      rarity: 'rare',
      condition: JSON.stringify({ type: 'endorsement_count', threshold: 25 })
    }
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`- ${universities.length} universities created`);
  console.log(`- ${companies.length} companies created`);
  console.log(`- ${users.length} demo users created`);
  console.log(`- ${opportunities.length} opportunities created`);
  console.log(`- ${badges.length} badges created`);
  console.log('\n🎯 Demo Login Credentials:');
  console.log('Email: alice@stanford.edu');
  console.log('Email: bob@mit.edu'); 
  console.log('Email: carol@berkeley.edu');
  console.log('Password: demo123 (for all users)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });