"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { mentalLogSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { getMoodEmoji } from "@/lib/utils";

type MentalFormData = z.infer<typeof mentalLogSchema>;

export function MentalForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, watch, setValue } = useForm<MentalFormData>({
    resolver: zodResolver(mentalLogSchema),
    defaultValues: {
      moodScore: 7,
      stressLevel: 5,
      energyLevel: 7,
    },
  });

  const mood = watch("moodScore");
  const stress = watch("stressLevel");
  const energy = watch("energyLevel");

  async function onSubmit(data: MentalFormData) {
    setLoading(true);
    try {
      const res = await fetch("/api/mental", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        toast({ title: "Error", description: json.error, variant: "destructive" });
        return;
      }

      toast({ title: "Journal entry saved! 🌟" });
      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  const ScoreSlider = ({
    label,
    value,
    field,
    emoji,
  }: {
    label: string;
    value: number;
    field: "moodScore" | "stressLevel" | "energyLevel";
    emoji: string;
  }) => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label>{label}</Label>
        <span className="text-lg font-bold">{emoji} {value}/10</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => setValue(field, parseInt(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-secondary accent-primary"
      />
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>1</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="text-center py-4 bg-violet-50 dark:bg-violet-950/30 rounded-xl">
        <div className="text-5xl mb-1">{getMoodEmoji(mood)}</div>
        <p className="text-sm text-muted-foreground">How are you feeling?</p>
      </div>

      <ScoreSlider label="Mood Score" value={mood} field="moodScore" emoji="😊" />
      <ScoreSlider label="Stress Level" value={stress} field="stressLevel" emoji="😤" />
      <ScoreSlider label="Energy Level" value={energy} field="energyLevel" emoji="⚡" />

      <div>
        <Label>Daily Reflection</Label>
        <textarea
          placeholder="How was your day? What happened?"
          className="mt-1 w-full min-h-[80px] rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          {...register("reflectionNote")}
        />
      </div>

      <div>
        <Label>Gratitude Note 🙏</Label>
        <textarea
          placeholder="What are you grateful for today?"
          className="mt-1 w-full min-h-[60px] rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          {...register("gratitudeNote")}
        />
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="flex-1 rounded-xl" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Entry
        </Button>
      </div>
    </form>
  );
}
