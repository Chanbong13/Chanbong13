"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { workoutPlanSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type WorkoutFormData = z.infer<typeof workoutPlanSchema>;

interface WorkoutPlan {
  id: string;
  title: string;
  exerciseType: string;
  scheduledAt: string;
  duration: number;
  caloriesTarget: number | null;
  notes: string | null;
}

const EXERCISE_TYPES = ["Running", "Cycling", "Swimming", "Yoga", "Strength", "HIIT", "Walking", "Boxing", "Pilates", "Other"];

export function WorkoutForm({
  plan,
  onSuccess,
  onCancel,
}: {
  plan?: WorkoutPlan | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutPlanSchema),
    defaultValues: {
      title: plan?.title || "",
      exerciseType: plan?.exerciseType || "Running",
      scheduledAt: plan?.scheduledAt ? new Date(plan.scheduledAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      duration: plan?.duration || 30,
      caloriesTarget: plan?.caloriesTarget || undefined,
      notes: plan?.notes || "",
    },
  });

  const exerciseType = watch("exerciseType");

  async function onSubmit(data: WorkoutFormData) {
    setLoading(true);
    try {
      const url = plan ? `/api/workout/${plan.id}` : "/api/workout";
      const method = plan ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        toast({ title: "Error", description: json.error, variant: "destructive" });
        return;
      }

      toast({ title: plan ? "Workout updated!" : "Workout added!" });
      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Title *</Label>
        <Input placeholder="e.g. Morning Run" className="mt-1 rounded-xl" {...register("title")} />
        {errors.title && <p className="text-destructive text-xs mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <Label>Exercise Type</Label>
        <Select value={exerciseType} onValueChange={(v) => setValue("exerciseType", v)}>
          <SelectTrigger className="mt-1 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EXERCISE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Scheduled At *</Label>
        <Input type="datetime-local" className="mt-1 rounded-xl" {...register("scheduledAt")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Duration (minutes) *</Label>
          <Input type="number" placeholder="30" className="mt-1 rounded-xl" {...register("duration", { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Calorie Target</Label>
          <Input type="number" placeholder="300" className="mt-1 rounded-xl" {...register("caloriesTarget", { valueAsNumber: true })} />
        </div>
      </div>

      <div>
        <Label>Notes</Label>
        <textarea
          placeholder="Any additional notes..."
          className="mt-1 w-full min-h-[60px] rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          {...register("notes")}
        />
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="flex-1 rounded-xl" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {plan ? "Update" : "Add"} Workout
        </Button>
      </div>
    </form>
  );
}
