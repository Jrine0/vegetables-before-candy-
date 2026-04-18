const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedDemoData() {
  console.log('🌱 Seeding demo data...');

  // Seed universities
  const universities = [
    { name: 'Eastern Michigan University', emailDomain: 'emich.edu', adminEmail: 'admin@emich.edu' },
    { name: 'Eastern University', emailDomain: 'eastern.edu', adminEmail: 'admin@eastern.edu' },
    { name: 'Thomas Edison State University', emailDomain: 'tesu.edu', adminEmail: 'admin@tesu.edu' },
    { name: 'Oakland University', emailDomain: 'oakland.edu', adminEmail: 'admin@oakland.edu' },
    { name: 'Virginia Tech', emailDomain: 'vt.edu', adminEmail: 'admin@vt.edu' },
  ];

  for (const uni of universities) {
    await prisma.university.upsert({
      where: { name: uni.name },
      update: {},
      create: uni,
    });
  }

  // Create demo opportunities
  const opportunities = [
    {
      title: "Premium Research Database Access",
      description: "Unlock access to IEEE Xplore, ACM Digital Library, and other premium research databases",
      type: "research_database",
      category: "digital",
      requiredNFTs: JSON.stringify(["gpa_guardian", "research_rockstar"]),
      url: "https://research.university.edu/premium-access",
      active: true
    },
    {
      title: "Google Engineering Internship Fast-Track",
      description: "Direct application pipeline to Google's engineering internship program",
      type: "internship",
      category: "digital", 
      requiredNFTs: JSON.stringify(["gpa_guardian"]),
      company: "Google",
      url: "https://careers.google.com/fast-track",
      active: true
    },
    {
      title: "Exclusive Alumni Mentorship Network",
      description: "Connect with successful alumni for career guidance and networking",
      type: "mentorship",
      category: "digital",
      requiredNFTs: JSON.stringify(["leadership_legend"]),
      url: "https://alumni.network/mentorship",
      active: true
    },
    {
      title: "VIP Access to Tech Conference 2024",
      description: "Front row seats and networking access at the premier tech conference",
      type: "event",
      category: "physical",
      requiredNFTs: JSON.stringify(["research_rockstar", "leadership_legend"]),
      location: "San Francisco, CA",
      startDate: new Date('2024-06-15'),
      endDate: new Date('2024-06-17'),
      maxParticipants: 50,
      active: true
    },
    {
      title: "Priority Lab Equipment Booking",
      description: "Priority access to research lab equipment during peak times",
      type: "lab_access", 
      category: "physical",
      requiredNFTs: JSON.stringify(["research_rockstar"]),
      location: "University Research Labs",
      active: true
    },
    {
      title: "Startup Pitch Competition Entry",
      description: "Exclusive entry to university startup pitch competition with $50K prize",
      type: "competition",
      category: "physical",
      requiredNFTs: JSON.stringify(["leadership_legend"]),
      location: "University Innovation Center",
      startDate: new Date('2024-04-20'),
      maxParticipants: 25,
      active: true
    }
  ];

  for (const opp of opportunities) {
    await prisma.opportunity.upsert({
      where: { title: opp.title },
      update: {},
      create: opp,
    });
  }

  console.log('✅ Demo data seeded successfully!');
  console.log('🎯 Your hackathon platform is ready!');
}

seedDemoData()
  .catch((e) => {
    console.error('Error seeding demo data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });