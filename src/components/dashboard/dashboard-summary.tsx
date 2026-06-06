import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Utensils, Clock } from "lucide-react";
import { format } from "date-fns";

interface WorkoutPlan {
  title: string;
  exerciseType: string;
  scheduledAt: Date;
  duration: number;
  completed: boolean;
}

interface DashboardSummaryProps {
  workout: WorkoutPlan | null;
  foodCount: number;
  totalCalories: number;
}

export function DashboardSummary({ workout, foodCount, totalCalories }: DashboardSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Workout Card */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-green-500" />
            Today&apos;s Workout
          </CardTitle>
        </CardHeader>
        <CardContent>
          {workout ? (
            <div>
              <p className="font-semibold text-lg">{workout.title}</p>
              <p className="text-sm text-muted-foreground">{workout.exerciseType}</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  {format(new Date(workout.scheduledAt), "HH:mm")}
                </div>
                <div className="text-sm text-muted-foreground">
                  {workout.duration} min
                </div>
                {workout.completed && (
                  <span className="text-xs text-green-500 font-medium">✓ Done</span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No workout planned today</p>
          )}
        </CardContent>
      </Card>

      {/* Food Card */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Utensils className="w-4 h-4 text-orange-500" />
            Food Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{totalCalories}</span>
            <span className="text-muted-foreground mb-1">kcal</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {foodCount} meal{foodCount !== 1 ? "s" : ""} logged
          </p>
          <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all"
              style={{ width: `${Math.min((totalCalories / 2000) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{2000 - totalCalories > 0 ? `${2000 - totalCalories} kcal remaining` : "Target reached! 🎉"}</p>
        </CardContent>
      </Card>
    </div>
  );
}
