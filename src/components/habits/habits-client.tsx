"use client";

import { useState, useEffect, useCallback } from "react";
import { Repeat, Plus, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { habitSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitLog {
  id: string;
  date: string;
  completed: boolean;
}

interface Habit {
  id: string;
  title: string;
  description: string | null;
  frequency: string;
  color: string | null;
  icon: string | null;
  habitLogs: HabitLog[];
}

type HabitFormData = z.infer<typeof habitSchema>;

const HABIT_COLORS = [
  { value: "#3b82f6", label: "Blue" },
  { value: "#22c55e", label: "Green" },
  { value: "#f97316", label: "Orange" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ef4444", label: "Red" },
  { value: "#ec4899", label: "Pink" },
];

const HABIT_ICONS = ["💪", "🏃", "📚", "💧", "🧘", "🥗", "😴", "✍️", "🎯", "🌱"];

export function HabitsClient() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0].value);
  const [selectedIcon, setSelectedIcon] = useState(HABIT_ICONS[0]);
  const { toast } = useToast();

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    defaultValues: { frequency: "DAILY" },
  });

  const frequency = watch("frequency");

  const fetchHabits = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/habits");
      const data = await res.json();
      setHabits(data.habits || []);
    } catch {
      toast({ title: "Error loading habits", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  async function toggleHabit(habitId: string) {
    const res = await fetch(`/api/habits/${habitId}`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setHabits((prev) => prev.map((h) => {
        if (h.id !== habitId) return h;
        if (data.completed) {
          return { ...h, habitLogs: [{ id: "temp", date: new Date().toISOString(), completed: true }] };
        } else {
          return { ...h, habitLogs: [] };
        }
      }));
    }
  }

  async function deleteHabit(habitId: string) {
    const res = await fetch(`/api/habits/${habitId}`, { method: "DELETE" });
    if (res.ok) {
      setHabits((prev) => prev.filter((h) => h.id !== habitId));
      toast({ title: "Habit removed" });
    }
  }

  async function onSubmit(data: HabitFormData) {
    setFormLoading(true);
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, color: selectedColor, icon: selectedIcon }),
      });

      if (!res.ok) {
        const json = await res.json();
        toast({ title: "Error", description: json.error, variant: "destructive" });
        return;
      }

      toast({ title: "Habit created! 🎯" });
      reset();
      setShowForm(false);
      fetchHabits();
    } finally {
      setFormLoading(false);
    }
  }

  const completedToday = habits.filter((h) => h.habitLogs.length > 0).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Repeat className="w-8 h-8 text-teal-500" />
            Habit Tracking
          </h1>
          <p className="text-muted-foreground mt-1">Build positive habits daily</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Habit
        </Button>
      </div>

      {/* Progress */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-2xl font-bold">{completedToday}/{habits.length}</p>
              <p className="text-sm text-muted-foreground">habits completed today</p>
            </div>
            <div className="text-4xl">{completedToday === habits.length && habits.length > 0 ? "🏆" : "🎯"}</div>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-green-500 rounded-full transition-all duration-500"
              style={{ width: habits.length > 0 ? `${(completedToday / habits.length) * 100}%` : "0%" }}
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 glass-card rounded-2xl animate-pulse" />)}
        </div>
      ) : habits.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-16 text-center">
            <Repeat className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">No habits yet</p>
            <Button className="mt-4" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" /> Build your first habit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {habits.map((habit) => {
            const isCompleted = habit.habitLogs.length > 0;
            return (
              <Card key={habit.id} className={cn("glass-card group transition-all", isCompleted && "opacity-80")}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ backgroundColor: `${habit.color}20`, border: `2px solid ${habit.color}40` }}
                    >
                      {habit.icon}
                    </div>
                    <div className="flex-1">
                      <p className={cn("font-semibold", isCompleted && "line-through text-muted-foreground")}>{habit.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{habit.frequency}</Badge>
                        {habit.description && (
                          <p className="text-xs text-muted-foreground truncate">{habit.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleHabit(habit.id)}
                        className={cn(
                          "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all",
                          isCompleted
                            ? "text-white"
                            : "border-muted-foreground/30 hover:border-current"
                        )}
                        style={isCompleted ? { backgroundColor: habit.color || "#22c55e", borderColor: habit.color || "#22c55e" } : {}}
                      >
                        {isCompleted && <Check className="w-5 h-5" />}
                      </button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                        onClick={() => deleteHabit(habit.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Habit</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Habit Name *</Label>
              <Input placeholder="e.g. Morning workout" className="mt-1 rounded-xl" {...register("title")} />
              {errors.title && <p className="text-destructive text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <Label>Description</Label>
              <Input placeholder="Optional description" className="mt-1 rounded-xl" {...register("description")} />
            </div>

            <div>
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={(v) => setValue("frequency", v as HabitFormData["frequency"])}>
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {HABIT_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={cn(
                      "w-10 h-10 rounded-xl border-2 text-xl transition-all",
                      selectedIcon === icon ? "border-primary scale-110" : "border-transparent hover:border-muted-foreground/30"
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Color</Label>
              <div className="flex gap-2 mt-2">
                {HABIT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setSelectedColor(c.value)}
                    className={cn(
                      "w-8 h-8 rounded-full border-4 transition-all",
                      selectedColor === c.value ? "border-foreground scale-110" : "border-transparent"
                    )}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" className="flex-1 rounded-xl" disabled={formLoading}>
                {formLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Habit
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
