"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart, Plus, Activity, Moon, Footprints, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HealthForm } from "./health-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface HealthLog {
  id: string;
  date: string;
  heartRate: number | null;
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  sleepHours: number | null;
  steps: number | null;
  caloriesBurned: number | null;
  weight: number | null;
  notes: string | null;
}

export function HealthClient() {
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("week");
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/health?period=${period}`);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch {
      toast({ title: "Error loading health data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [period, toast]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const latest = logs[logs.length - 1];

  const chartData = logs.map((log) => ({
    date: format(new Date(log.date), "MM/dd"),
    heartRate: log.heartRate,
    sleep: log.sleepHours,
    steps: log.steps ? log.steps / 1000 : null,
    weight: log.weight,
  }));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-500" />
            Health Tracking
          </h1>
          <p className="text-muted-foreground mt-1">Monitor your vitals and wellness metrics</p>
        </div>
        <div className="flex gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">7 Days</SelectItem>
              <SelectItem value="month">30 Days</SelectItem>
              <SelectItem value="year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Log Health
          </Button>
        </div>
      </div>

      {/* Latest Stats */}
      {latest && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Heart Rate", value: latest.heartRate ? `${latest.heartRate} bpm` : "—", icon: Activity, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950" },
            { label: "Blood Pressure", value: latest.bloodPressureSystolic ? `${latest.bloodPressureSystolic}/${latest.bloodPressureDiastolic}` : "—", icon: Heart, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950" },
            { label: "Sleep", value: latest.sleepHours ? `${latest.sleepHours}h` : "—", icon: Moon, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950" },
            { label: "Steps", value: latest.steps ? latest.steps.toLocaleString() : "—", icon: Footprints, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950" },
            { label: "Calories Out", value: latest.caloriesBurned ? `${latest.caloriesBurned}` : "—", icon: Activity, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950" },
            { label: "Weight", value: latest.weight ? `${latest.weight} kg` : "—", icon: Scale, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950" },
          ].map((stat) => (
            <Card key={stat.label} className={`glass-card border-0 ${stat.bg}`}>
              <CardContent className="p-4">
                <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Heart Rate & Sleep</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="heartRate" stroke="#ef4444" name="Heart Rate" dot={false} />
                <Line type="monotone" dataKey="sleep" stroke="#8b5cf6" name="Sleep (h)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Steps (thousands) & Weight</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="steps" stroke="#22c55e" name="Steps (k)" dot={false} />
                <Line type="monotone" dataKey="weight" stroke="#3b82f6" name="Weight (kg)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Log History */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />)}
            </div>
          ) : logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No health logs yet. Start tracking!</p>
          ) : (
            <div className="space-y-2">
              {[...logs].reverse().map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/30 transition-colors">
                  <span className="text-sm font-medium">{format(new Date(log.date), "MMM d, yyyy")}</span>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {log.heartRate && <span>❤️ {log.heartRate} bpm</span>}
                    {log.sleepHours && <span>😴 {log.sleepHours}h</span>}
                    {log.steps && <span>🚶 {log.steps.toLocaleString()}</span>}
                    {log.weight && <span>⚖️ {log.weight}kg</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Log Health Data</DialogTitle>
          </DialogHeader>
          <HealthForm
            onSuccess={() => { setShowForm(false); fetchLogs(); }}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
