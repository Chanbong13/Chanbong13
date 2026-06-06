"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { foodLogSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { estimateCalories } from "@/lib/utils";

type FoodFormData = z.infer<typeof foodLogSchema>;

const COMMON_FOODS = [
  { name: "ข้าวกะเพราไก่ไข่ดาว", cal: 750 },
  { name: "ข้าวมันไก่", cal: 500 },
  { name: "ก๋วยเตี๋ยว", cal: 350 },
  { name: "ผัดซีอิ๊ว", cal: 500 },
  { name: "ส้มตำ", cal: 200 },
  { name: "ไข่ดาว", cal: 100 },
];

export function FoodForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FoodFormData>({
    resolver: zodResolver(foodLogSchema),
    defaultValues: {
      mealType: "MEAL",
      calories: 0,
    },
  });

  const foodName = watch("foodName");
  const calories = watch("calories");
  const mealType = watch("mealType");

  function handleFoodNameChange(name: string) {
    setValue("foodName", name);
    if (name.length > 2) {
      const estimated = estimateCalories(name);
      if (estimated > 0) setValue("calories", estimated);
    }
  }

  async function onSubmit(data: FoodFormData) {
    setLoading(true);
    try {
      const res = await fetch("/api/food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        toast({ title: "Error", description: json.error, variant: "destructive" });
        return;
      }

      toast({ title: "Food logged! 🍽️" });
      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Quick add */}
      <div>
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Quick Add</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {COMMON_FOODS.map((f) => (
            <button
              key={f.name}
              type="button"
              onClick={() => { setValue("foodName", f.name); setValue("calories", f.cal); }}
              className="text-xs px-2.5 py-1.5 rounded-lg border hover:bg-accent transition-colors"
            >
              {f.name} ({f.cal})
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Food Name *</Label>
        <Input
          placeholder="e.g. ข้าวกะเพราไก่"
          className="mt-1 rounded-xl"
          value={foodName || ""}
          onChange={(e) => handleFoodNameChange(e.target.value)}
        />
        {errors.foodName && <p className="text-destructive text-xs mt-1">{errors.foodName.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Calories *</Label>
          <Input
            type="number"
            placeholder="400"
            className="mt-1 rounded-xl"
            value={calories || ""}
            onChange={(e) => setValue("calories", parseInt(e.target.value) || 0)}
          />
          {errors.calories && <p className="text-destructive text-xs mt-1">{errors.calories.message}</p>}
        </div>

        <div>
          <Label>Meal Type</Label>
          <Select value={mealType} onValueChange={(v) => setValue("mealType", v as FoodFormData["mealType"])}>
            <SelectTrigger className="mt-1 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BREAKFAST">Breakfast</SelectItem>
              <SelectItem value="LUNCH">Lunch</SelectItem>
              <SelectItem value="DINNER">Dinner</SelectItem>
              <SelectItem value="SNACK">Snack</SelectItem>
              <SelectItem value="MEAL">Meal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Notes</Label>
        <Input placeholder="Optional notes" className="mt-1 rounded-xl" {...register("notes")} />
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="flex-1 rounded-xl" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Log Food
        </Button>
      </div>
    </form>
  );
}
