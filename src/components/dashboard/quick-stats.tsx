import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckSquare, Flame, Moon, Footprints, Smile } from "lucide-react";
import { getMoodEmoji } from "@/lib/utils";

interface QuickStatsProps {
  totalTasks: number;
  completedTasks: number;
  totalCalories: number;
  moodScore?: number | null;
  sleepHours?: number | null;
  steps?: number | null;
}

export function QuickStats({
  totalTasks,
  completedTasks,
  totalCalories,
  moodScore,
  sleepHours,
  steps,
}: QuickStatsProps) {
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const calorieTarget = 2000;
  const calorieProgress = Math.min(Math.round((totalCalories / calorieTarget) * 100), 100);
  const sleepTarget = 8;
  const sleepProgress = Math.min(Math.round(((sleepHours || 0) / sleepTarget) * 100), 100);
  const stepTarget = 10000;
  const stepProgress = Math.min(Math.round(((steps || 0) / stepTarget) * 100), 100);

  const stats = [
    {
      label: "Tasks",
      value: `${completedTasks}/${totalTasks}`,
      progress: taskProgress,
      icon: CheckSquare,
      color: "from-blue-500 to-blue-600",
      progressColor: "bg-blue-500",
    },
    {
      label: "Calories",
      value: `${totalCalories} kcal`,
      progress: calorieProgress,
      icon: Flame,
      color: "from-orange-500 to-amber-500",
      progressColor: "bg-orange-500",
    },
    {
      label: "Sleep",
      value: sleepHours ? `${sleepHours}h` : "—",
      progress: sleepProgress,
      icon: Moon,
      color: "from-violet-500 to-purple-600",
      progressColor: "bg-violet-500",
    },
    {
      label: "Steps",
      value: steps ? steps.toLocaleString() : "—",
      progress: stepProgress,
      icon: Footprints,
      color: "from-green-500 to-emerald-600",
      progressColor: "bg-green-500",
    },
    {
      label: "Mood",
      value: moodScore ? `${getMoodEmoji(moodScore)} ${moodScore}/10` : "—",
      progress: moodScore ? moodScore * 10 : 0,
      icon: Smile,
      color: "from-pink-500 to-rose-500",
      progressColor: "bg-pink-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="glass-card overflow-hidden">
          <CardContent className="p-4">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
            <p className="text-lg font-bold mt-0.5">{stat.value}</p>
            <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full ${stat.progressColor} rounded-full transition-all duration-500`}
                style={{ width: `${stat.progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stat.progress}%</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
