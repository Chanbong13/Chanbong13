"use client";

import { useState, useEffect, useCallback } from "react";
import { Dumbbell, Plus, Check, Clock, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WorkoutForm } from "./workout-form";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface WorkoutPlan {
  id: string;
  title: string;
  exerciseType: string;
  scheduledAt: string;
  duration: number;
  caloriesTarget: number | null;
  completed: boolean;
  notes: string | null;
}

const EXERCISE_ICONS: Record<string, string> = {
  Running: "🏃",
  Cycling: "🚴",
  Swimming: "🏊",
  Yoga: "🧘",
  Strength: "🏋️",
  HIIT: "⚡",
  Walking: "🚶",
  Boxing: "🥊",
  Pilates: "🤸",
  Other: "💪",
};

export function WorkoutClient() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);
  const { toast } = useToast();

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/workout?period=month");
      const data = await res.json();
      setPlans(data.plans || []);
    } catch {
      toast({ title: "Error loading workouts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  async function toggleComplete(plan: WorkoutPlan) {
    const res = await fetch(`/api/workout/${plan.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !plan.completed }),
    });
    if (res.ok) {
      setPlans((prev) => prev.map((p) => p.id === plan.id ? { ...p, completed: !p.completed } : p));
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/workout/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPlans((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Workout removed" });
    }
  }

  const stats = {
    total: plans.length,
    completed: plans.filter((p) => p.completed).length,
    totalDuration: plans.filter((p) => p.completed).reduce((s, p) => s + p.duration, 0),
    totalCalories: plans.filter((p) => p.completed).reduce((s, p) => s + (p.caloriesTarget || 0), 0),
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Dumbbell className="w-8 h-8 text-green-500" />
            Workout Planner
          </h1>
          <p className="text-muted-foreground mt-1">Schedule and track your exercise sessions</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Workout
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Planned", value: stats.total, icon: "📋" },
          { label: "Completed", value: stats.completed, icon: "✅" },
          { label: "Total Time", value: `${stats.totalDuration}min`, icon: "⏱️" },
          { label: "Calories Burned", value: `${stats.totalCalories}kcal`, icon: "🔥" },
        ].map((s) => (
          <Card key={s.label} className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Workout List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 glass-card rounded-2xl animate-pulse" />)}
        </div>
      ) : plans.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-16 text-center">
            <Dumbbell className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">No workouts planned</p>
            <Button className="mt-4" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" /> Plan your first workout
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id} className={cn("glass-card group", plan.completed && "opacity-75")}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="text-3xl">
                    {EXERCISE_ICONS[plan.exerciseType] || "💪"}
                  </div>
                  <button
                    onClick={() => toggleComplete(plan)}
                    className={cn(
                      "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all",
                      plan.completed
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-muted-foreground/30 hover:border-green-500"
                    )}
                  >
                    {plan.completed && <Check className="w-4 h-4" />}
                  </button>
                </div>

                <div className="mt-3">
                  <h3 className={cn("font-semibold text-lg", plan.completed && "line-through")}>{plan.title}</h3>
                  <Badge variant="outline" className="mt-1 text-xs">{plan.exerciseType}</Badge>
                </div>

                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {format(new Date(plan.scheduledAt), "MMM d, HH:mm")}
                  </span>
                  <span>{plan.duration} min</span>
                  {plan.caloriesTarget && (
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      {plan.caloriesTarget}
                    </span>
                  )}
                </div>

                {plan.notes && (
                  <p className="text-xs text-muted-foreground mt-2 italic">{plan.notes}</p>
                )}

                <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="outline" className="flex-1 rounded-lg text-xs" onClick={() => setEditingPlan(plan)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-lg text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(plan.id)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm || !!editingPlan} onOpenChange={(open) => { if (!open) { setShowForm(false); setEditingPlan(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Edit Workout" : "Add Workout"}</DialogTitle>
          </DialogHeader>
          <WorkoutForm
            plan={editingPlan}
            onSuccess={() => { setShowForm(false); setEditingPlan(null); fetchPlans(); }}
            onCancel={() => { setShowForm(false); setEditingPlan(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
