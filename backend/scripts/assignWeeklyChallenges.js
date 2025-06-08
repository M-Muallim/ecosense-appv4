const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function assignWeeklyChallenges() {
  // Get start of current week (Monday)
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);

  // Remove previous week challenges
  await prisma.currentWeekChallenge.deleteMany({ where: { weekStart } });

  // Delete all uncompleted user challenges for the new week (keep completed ones)
  await prisma.userChallenge.deleteMany({
    where: {
      weekStart,
      completed: false,
    },
  });

  const challenges = await prisma.challenge.findMany();
  // Pick 3 random challenges
  const shuffled = challenges.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3);

  for (const challenge of selected) {
    await prisma.currentWeekChallenge.create({
      data: {
        challengeId: challenge.id,
        weekStart,
      },
    });
  }
  console.log('Current week challenges set!');
}

assignWeeklyChallenges()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect()); 