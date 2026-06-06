import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Heart, Brain, Thermometer, Moon } from "lucide-react";
import { getMoodEmoji, getMoodColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface HealthLog {
  heartRate: number | null;
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  sleepHours: number | null;
  steps: number | null;
  weight: number | null;
}

interface MentalLog {
  moodScore: number;
  stressLevel: number;
  energyLevel: number;
  reflectionNote: string | null;
}

interface RecentActivityProps {
  latestHealth: HealthLog | null;
  latestMental: MentalLog | null;
}

export function RecentActivity({ latestHealth, latestMental }: RecentActivityProps) {
  return (
    <div className="space-y-4">
      {/* Health */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {latestHealth ? (
            <>
              {latestHealth.heartRate && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="w-3.5 h-3.5" />
                    Heart Rate
                  </div>
                  <span className="font-semibold text-sm">{latestHealth.heartRate} bpm</span>
                </div>
              )}
              {latestHealth.bloodPressureSystolic && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Thermometer className="w-3.5 h-3.5" />
                    Blood Pressure
                  </div>
                  <span className="font-semibold text-sm">
                    {latestHealth.bloodPressureSystolic}/{latestHealth.bloodPressureDiastolic}
                  </span>
                </div>
              )}
              {latestHealth.sleepHours && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Moon className="w-3.5 h-3.5" />
                    Sleep
                  </div>
                  <span className="font-semibold text-sm">{latestHealth.sleepHours}h</span>
                </div>
              )}
              {latestHealth.weight && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-3.5 h-3.5 inline-flex items-center justify-center text-xs">⚖️</span>
                    Weight
                  </div>
                  <span className="font-semibold text-sm">{latestHealth.weight} kg</span>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No health data yet</p>
          )}
        </CardContent>
      </Card>

      {/* Mental */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="w-4 h-4 text-violet-500" />
            Mental Wellness
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {latestMental ? (
            <>
              <div className="text-center py-2">
                <span className="text-4xl">{getMoodEmoji(latestMental.moodScore)}</span>
                <p className={cn("text-2xl font-bold mt-1", getMoodColor(latestMental.moodScore))}>
                  {latestMental.moodScore}/10
                </p>
                <p className="text-xs text-muted-foreground">Mood Score</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 rounded-lg bg-secondary/50">
                  <p className="text-sm font-semibold">{latestMental.stressLevel}/10</p>
                  <p className="text-xs text-muted-foreground">Stress</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-secondary/50">
                  <p className="text-sm font-semibold">{latestMental.energyLevel}/10</p>
                  <p className="text-xs text-muted-foreground">Energy</p>
                </div>
              </div>
              {latestMental.reflectionNote && (
                <p className="text-xs text-muted-foreground italic border-l-2 border-violet-300 pl-2">
                  &ldquo;{latestMental.reflectionNote}&rdquo;
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No journal entry yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
