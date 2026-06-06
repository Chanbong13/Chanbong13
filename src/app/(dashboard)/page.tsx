import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSummary } from "@/components/dashboard/dashboard-summary";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { TodayTasks } from "@/components/dashboard/today-tasks";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [tasks, foodLogs, latestHealth, latestMental, todayWorkout] = await Promise.all([
    prisma.task.findMany({
      where: { userId, deadline: { gte: today, lt: tomorrow } },
      orderBy: [{ priority: "desc" }, { deadline: "asc" }],
      take: 5,
    }),
    prisma.foodLog.findMany({
      where: { userId, date: { gte: today, lt: tomorrow } },
    }),
    prisma.healthLog.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
    }),
    prisma.mentalLog.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
    }),
    prisma.workoutPlan.findFirst({
      where: { userId, scheduledAt: { gte: today, lt: tomorrow } },
    }),
  ]);

  const totalCalories = foodLogs.reduce((s, f) => s + f.calories, 0);
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">
          Good {getGreeting()},{" "}
          <span className="gradient-text">{session?.user?.name?.split(" ")[0]}</span> 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here&apos;s your life overview for today.</p>
      </div>

      <QuickStats
        totalTasks={tasks.length}
        completedTasks={completedTasks}
        totalCalories={totalCalories}
        moodScore={latestMental?.moodScore}
        sleepHours={latestHealth?.sleepHours}
        steps={latestHealth?.steps}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TodayTasks tasks={tasks} />
          <DashboardSummary
            workout={todayWorkout}
            foodCount={foodLogs.length}
            totalCalories={totalCalories}
          />
        </div>
        <div>
          <RecentActivity
            latestHealth={latestHealth}
            latestMental={latestMental}
          />
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}
