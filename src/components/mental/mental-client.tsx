"use client";

import { useState, useEffect, useCallback } from "react";
import { Brain, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MentalForm } from "./mental-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { getMoodEmoji, getMoodColor } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface MentalLog {
  id: string;
  date: string;
  moodScore: number;
  stressLevel: number;
  energyLevel: number;
  reflectionNote: string | null;
  gratitudeNote: string | null;
}

export function MentalClient() {
  const [logs, setLogs] = useState<MentalLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("week");
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/mental?period=${period}`);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch {
      toast({ title: "Error loading data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [period, toast]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const latest = logs[logs.length - 1];
  const avgMood = logs.length > 0 ? Math.round(logs.reduce((s, l) => s + l.moodScore, 0) / logs.length) : null;
  const avgStress = logs.length > 0 ? Math.round(logs.reduce((s, l) => s + l.stressLevel, 0) / logs.length) : null;

  const chartData = logs.map((log) => ({
    date: format(new Date(log.date), "MM/dd"),
    mood: log.moodScore,
    stress: log.stressLevel,
    energy: log.energyLevel,
  }));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8 text-violet-500" />
            Mental Wellness
          </h1>
          <p className="text-muted-foreground mt-1">Track your mood, stress, and reflections</p>
        </div>
        <div className="flex gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">7 Days</SelectItem>
              <SelectItem value="month">30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Log Entry
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card text-center">
          <CardContent className="py-6">
            {latest ? (
              <>
                <div className="text-5xl mb-2">{getMoodEmoji(latest.moodScore)}</div>
                <p className={cn("text-3xl font-bold", getMoodColor(latest.moodScore))}>
                  {latest.moodScore}/10
                </p>
                <p className="text-sm text-muted-foreground mt-1">Current Mood</p>
              </>
            ) : (
              <p className="text-muted-foreground">No data yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card text-center">
          <CardContent className="py-6">
            <p className="text-4xl font-bold text-blue-500">{avgMood ?? "—"}</p>
            <p className="text-sm text-muted-foreground mt-2">Avg Mood ({period})</p>
            <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${avgMood ? avgMood * 10 : 0}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card text-center">
          <CardContent className="py-6">
            <p className="text-4xl font-bold text-orange-500">{avgStress ?? "—"}</p>
            <p className="text-sm text-muted-foreground mt-2">Avg Stress ({period})</p>
            <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full"
                style={{ width: `${avgStress ? avgStress * 10 : 0}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Mood Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="mood" stroke="#8b5cf6" fill="url(#moodGrad)" name="Mood" />
              <Area type="monotone" dataKey="stress" stroke="#f97316" fill="url(#stressGrad)" name="Stress" />
              <Area type="monotone" dataKey="energy" stroke="#22c55e" fill="none" name="Energy" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Journal Entries */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Journal Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
            </div>
          ) : logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No entries yet. Start journaling!</p>
          ) : (
            <div className="space-y-3">
              {[...logs].reverse().map((log) => (
                <div key={log.id} className="p-4 rounded-xl border hover:bg-accent/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{format(new Date(log.date), "MMM d, yyyy")}</span>
                    <div className="flex gap-3 text-sm">
                      <span>{getMoodEmoji(log.moodScore)} {log.moodScore}/10</span>
                      <span className="text-muted-foreground">Stress: {log.stressLevel}/10</span>
                      <span className="text-muted-foreground">Energy: {log.energyLevel}/10</span>
                    </div>
                  </div>
                  {log.reflectionNote && (
                    <p className="text-sm text-muted-foreground italic border-l-2 border-violet-300 pl-2 mb-2">
                      &ldquo;{log.reflectionNote}&rdquo;
                    </p>
                  )}
                  {log.gratitudeNote && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      🙏 {log.gratitudeNote}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Journal Entry</DialogTitle>
          </DialogHeader>
          <MentalForm
            onSuccess={() => { setShowForm(false); fetchLogs(); }}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
