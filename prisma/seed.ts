import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create demo user
  const password = await bcrypt.hash("demo1234", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@lifepilot.app" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@lifepilot.app",
      password,
    },
  });

  console.log("Created demo user:", user.email);

  // Seed tasks
  await prisma.task.createMany({
    data: [
      { userId: user.id, title: "Morning workout", priority: "HIGH", status: "PENDING", category: "health" },
      { userId: user.id, title: "Review project proposal", priority: "URGENT", status: "IN_PROGRESS", category: "work" },
      { userId: user.id, title: "Call mom", priority: "MEDIUM", status: "PENDING", category: "personal" },
    ],
    skipDuplicates: true,
  });

  // Seed health logs
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(8, 0, 0, 0);

    await prisma.healthLog.create({
      data: {
        userId: user.id,
        date,
        heartRate: Math.floor(65 + Math.random() * 20),
        sleepHours: 6.5 + Math.random() * 2,
        steps: Math.floor(5000 + Math.random() * 8000),
        weight: 70 + (Math.random() - 0.5),
        caloriesBurned: Math.floor(200 + Math.random() * 400),
      },
    });
  }

  // Seed mental logs
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    await prisma.mentalLog.create({
      data: {
        userId: user.id,
        date,
        moodScore: Math.floor(5 + Math.random() * 5),
        stressLevel: Math.floor(3 + Math.random() * 5),
        energyLevel: Math.floor(5 + Math.random() * 5),
        reflectionNote: i === 0 ? "Had a productive day today!" : null,
        gratitudeNote: i === 0 ? "Grateful for my health and family" : null,
      },
    });
  }

  // Seed habits
  const habits = [
    { title: "Morning meditation", icon: "🧘", color: "#8b5cf6", frequency: "DAILY" as const },
    { title: "Read 30 minutes", icon: "📚", color: "#3b82f6", frequency: "DAILY" as const },
    { title: "Drink 8 glasses of water", icon: "💧", color: "#06b6d4", frequency: "DAILY" as const },
  ];

  for (const habit of habits) {
    await prisma.habit.upsert({
      where: { id: `seed-${habit.title}` },
      update: {},
      create: { id: `seed-${habit.title}`, userId: user.id, ...habit },
    });
  }

  console.log("Seed completed!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
