const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Create demo users
  const demoUsers = [
    {
      email: 'demo@student.edu',
      universityEmail: 'john.doe@harvard.edu',
      firstName: 'John',
      lastName: 'Doe',
      university: 'Harvard University',
      studentId: 'HU2024001',
      emailVerified: true
    },
    {
      email: 'demo2@student.edu',
      universityEmail: 'jane.smith@stanford.edu',
      firstName: 'Jane',
      lastName: 'Smith',
      university: 'Stanford University',
      studentId: 'SU2024002',
      emailVerified: true
    },
    {
      email: 'demo3@student.edu',
      universityEmail: 'alex.johnson@mit.edu',
      firstName: 'Alex',
      lastName: 'Johnson',
      university: 'MIT',
      studentId: 'MIT2024003',
      emailVerified: true
    }
  ];

  console.log('Creating demo users...');
  
  for (const userData of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData
    });
    console.log(`Created user: ${user.firstName} ${user.lastName} (${user.email})`);
  }

  console.log('Demo users created successfully!');
  
  // Create some sample achievements
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    await prisma.achievement.createMany({
      data: [
        {
          title: `${user.firstName}'s Academic Excellence`,
          description: 'Achieved Dean\'s List with 3.9 GPA',
          type: 'gpa',
          gpaValue: 3.9,
          proofUrl: 'https://example.com/transcript.pdf',
          userId: user.id,
          verified: true
        },
        {
          title: `${user.firstName}'s Research Project`,
          description: 'Published research paper on AI applications',
          type: 'research',
          proofUrl: 'https://example.com/research.pdf',
          userId: user.id,
          verified: true
        },
        {
          title: `${user.firstName}'s Leadership Excellence`,
          description: 'Led student organization with 100+ members',
          type: 'leadership',
          proofUrl: 'https://example.com/leadership.pdf',
          userId: user.id,
          verified: true
        }
      ]
    });
  }
  
  console.log('Sample achievements created!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });