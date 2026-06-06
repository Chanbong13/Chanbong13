"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { healthLogSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type HealthFormData = z.infer<typeof healthLogSchema>;

export function HealthForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<HealthFormData>({
    resolver: zodResolver(healthLogSchema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 16),
    },
  });

  async function onSubmit(data: HealthFormData) {
    setLoading(true);
    try {
      const res = await fetch("/api/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        toast({ title: "Error", description: json.error, variant: "destructive" });
        return;
      }

      toast({ title: "Health log saved!" });
      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { name: "heartRate" as const, label: "Heart Rate (bpm)", placeholder: "72" },
    { name: "bloodPressureSystolic" as const, label: "Blood Pressure Systolic", placeholder: "120" },
    { name: "bloodPressureDiastolic" as const, label: "Blood Pressure Diastolic", placeholder: "80" },
    { name: "sleepHours" as const, label: "Sleep Hours", placeholder: "7.5" },
    { name: "steps" as const, label: "Steps", placeholder: "8000" },
    { name: "caloriesBurned" as const, label: "Calories Burned", placeholder: "300" },
    { name: "weight" as const, label: "Weight (kg)", placeholder: "70" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Date & Time</Label>
        <Input type="datetime-local" className="mt-1 rounded-xl" {...register("date")} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {fields.map((f) => (
          <div key={f.name}>
            <Label>{f.label}</Label>
            <Input
              type="number"
              step="0.1"
              placeholder={f.placeholder}
              className="mt-1 rounded-xl"
              {...register(f.name, { valueAsNumber: true })}
            />
          </div>
        ))}
      </div>

      <div>
        <Label>Notes</Label>
        <textarea
          placeholder="Any notes..."
          className="mt-1 w-full min-h-[60px] rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          {...register("notes")}
        />
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="flex-1 rounded-xl" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Log
        </Button>
      </div>
    </form>
  );
}
