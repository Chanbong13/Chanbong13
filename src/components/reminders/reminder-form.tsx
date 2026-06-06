"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { importantDateSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type ReminderFormData = z.infer<typeof importantDateSchema>;

interface ImportantDate {
  id: string;
  title: string;
  description: string | null;
  date: string;
  type: string;
  reminderDaysBefore: number;
  isRecurring: boolean;
  recurringType: string | null;
}

export function ReminderForm({
  reminder,
  onSuccess,
  onCancel,
}: {
  reminder?: ImportantDate | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ReminderFormData>({
    resolver: zodResolver(importantDateSchema),
    defaultValues: {
      title: reminder?.title || "",
      description: reminder?.description || "",
      date: reminder?.date ? new Date(reminder.date).toISOString().slice(0, 10) : "",
      type: (reminder?.type as ReminderFormData["type"]) || "CUSTOM",
      reminderDaysBefore: reminder?.reminderDaysBefore ?? 1,
      isRecurring: reminder?.isRecurring ?? false,
      recurringType: (reminder?.recurringType as ReminderFormData["recurringType"]) || undefined,
    },
  });

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const recurringType = watch("recurringType");

  async function onSubmit(data: ReminderFormData) {
    setLoading(true);
    try {
      const url = reminder ? `/api/reminders/${reminder.id}` : "/api/reminders";
      const method = reminder ? "PATCH" : "POST";

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

      toast({ title: reminder ? "Updated!" : "Reminder added!" });
      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Title *</Label>
        <Input placeholder="e.g. Mom's Birthday" className="mt-1 rounded-xl" {...register("title")} />
        {errors.title && <p className="text-destructive text-xs mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <Label>Description</Label>
        <textarea
          placeholder="Optional details"
          className="mt-1 w-full min-h-[60px] rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          {...register("description")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Date *</Label>
          <Input type="date" className="mt-1 rounded-xl" {...register("date")} />
        </div>
        <div>
          <Label>Type</Label>
          <Select value={type} onValueChange={(v) => setValue("type", v as ReminderFormData["type"])}>
            <SelectTrigger className="mt-1 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BIRTHDAY">🎂 Birthday</SelectItem>
              <SelectItem value="APPOINTMENT">📅 Appointment</SelectItem>
              <SelectItem value="BILL">💳 Bill</SelectItem>
              <SelectItem value="ANNIVERSARY">💑 Anniversary</SelectItem>
              <SelectItem value="CUSTOM">⭐ Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Remind me before (days)</Label>
        <Input type="number" min={0} max={365} className="mt-1 rounded-xl" {...register("reminderDaysBefore", { valueAsNumber: true })} />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="recurring"
          checked={isRecurring}
          onChange={(e) => setValue("isRecurring", e.target.checked)}
          className="w-4 h-4 rounded accent-primary"
        />
        <Label htmlFor="recurring">Recurring event</Label>
      </div>

      {isRecurring && (
        <div>
          <Label>Recurring Type</Label>
          <Select value={recurringType || ""} onValueChange={(v) => setValue("recurringType", v as ReminderFormData["recurringType"])}>
            <SelectTrigger className="mt-1 rounded-xl">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="flex-1 rounded-xl" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {reminder ? "Update" : "Add"} Reminder
        </Button>
      </div>
    </form>
  );
}
