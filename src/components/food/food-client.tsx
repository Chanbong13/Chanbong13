"use client";

import { useState, useEffect, useCallback } from "react";
import { Utensils, Plus, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FoodForm } from "./food-form";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface FoodLog {
  id: string;
  date: string;
  foodName: string;
  calories: number;
  mealType: string;
  notes: string | null;
  source: string | null;
}

const MEAL_COLORS: Record<string, string> = {
  BREAKFAST: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  LUNCH: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  DINNER: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  SNACK: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  MEAL: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

const CALORIE_TARGET = 2000;

export function FoodClient() {
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const { toast } = useToast();

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/food?date=${selectedDate}`);
      const data = await res.json();
      setLogs(data.logs || []);
      setTotalCalories(data.totalCalories || 0);
    } catch {
      toast({ title: "Error loading food logs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [selectedDate, toast]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  async function handleDelete(id: string) {
    const res = await fetch(`/api/food/${id}`, { method: "DELETE" });
    if (res.ok) {
      setLogs((prev) => prev.filter((l) => l.id !== id));
      const deleted = logs.find((l) => l.id === id);
      if (deleted) setTotalCalories((prev) => prev - deleted.calories);
      toast({ title: "Entry removed" });
    }
  }

  const remaining = CALORIE_TARGET - totalCalories;
  const progress = Math.min((totalCalories / CALORIE_TARGET) * 100, 100);

  const byMealType = logs.reduce<Record<string, FoodLog[]>>((acc, log) => {
    if (!acc[log.mealType]) acc[log.mealType] = [];
    acc[log.mealType].push(log);
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Utensils className="w-8 h-8 text-orange-500" />
            Food Tracking
          </h1>
          <p className="text-muted-foreground mt-1">Log your meals and track calories</p>
        </div>
        <div className="flex gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Log Food
          </Button>
        </div>
      </div>

      {/* Calorie Summary */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-end justify-between mb-4">
            <div>
              <span className="text-4xl font-bold">{totalCalories}</span>
              <span className="text-muted-foreground ml-2">/ {CALORIE_TARGET} kcal</span>
            </div>
            <div className="text-right">
              <p className={`text-sm font-medium ${remaining > 0 ? "text-green-500" : "text-red-500"}`}>
                {remaining > 0 ? `${remaining} remaining` : `${Math.abs(remaining)} over`}
              </p>
              <p className="text-xs text-muted-foreground">{logs.length} entries</p>
            </div>
          </div>
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>0</span>
            <span>1000</span>
            <span>2000 kcal</span>
          </div>
        </CardContent>
      </Card>

      {/* LINE OA tip */}
      <Card className="glass-card border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-sm text-green-700 dark:text-green-300">Log via LINE OA!</p>
            <p className="text-xs text-green-600 dark:text-green-400">
              Send &ldquo;กิน ข้าวกะเพราไก่&rdquo; to your LINE OA bot to auto-log calories
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Food Logs by Meal */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 glass-card rounded-2xl animate-pulse" />)}
        </div>
      ) : logs.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-16 text-center">
            <Utensils className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">No meals logged today</p>
            <Button className="mt-4" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" /> Log your first meal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(byMealType).map(([mealType, mealLogs]) => (
            <Card key={mealType} className="glass-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {mealType}
                  </CardTitle>
                  <span className="text-sm font-medium">
                    {mealLogs.reduce((s, l) => s + l.calories, 0)} kcal
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {mealLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/30 transition-colors group">
                    <div className="flex items-center gap-3">
                      <Badge className={`text-xs ${MEAL_COLORS[log.mealType]}`}>{log.mealType}</Badge>
                      <div>
                        <p className="text-sm font-medium">{log.foodName}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(log.date), "HH:mm")}
                          {log.source === "LINE" && " · via LINE"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-orange-500">{log.calories} kcal</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(log.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Log Food</DialogTitle>
          </DialogHeader>
          <FoodForm
            onSuccess={() => { setShowForm(false); fetchLogs(); }}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
