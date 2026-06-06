"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { taskSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type TaskFormData = z.infer<typeof taskSchema>;

interface Task {
  id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  reminderAt: string | null;
  status: string;
  priority: string;
  category: string | null;
}

interface TaskFormProps {
  task?: Task | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TaskForm({ task, onSuccess, onCancel }: TaskFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      deadline: task?.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : "",
      reminderAt: task?.reminderAt ? new Date(task.reminderAt).toISOString().slice(0, 16) : "",
      status: (task?.status as TaskFormData["status"]) || "PENDING",
      priority: (task?.priority as TaskFormData["priority"]) || "MEDIUM",
      category: task?.category || "",
    },
  });

  const priority = watch("priority");
  const status = watch("status");

  async function onSubmit(data: TaskFormData) {
    setLoading(true);
    try {
      const url = task ? `/api/tasks/${task.id}` : "/api/tasks";
      const method = task ? "PATCH" : "POST";

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

      toast({ title: task ? "Task updated!" : "Task created!" });
      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Title *</Label>
        <Input placeholder="Task title" className="mt-1 rounded-xl" {...register("title")} />
        {errors.title && <p className="text-destructive text-xs mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <Label>Description</Label>
        <textarea
          placeholder="Description (optional)"
          className="mt-1 w-full min-h-[80px] rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          {...register("description")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Priority</Label>
          <Select value={priority} onValueChange={(v) => setValue("priority", v as TaskFormData["priority"])}>
            <SelectTrigger className="mt-1 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setValue("status", v as TaskFormData["status"])}>
            <SelectTrigger className="mt-1 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Deadline</Label>
          <Input type="datetime-local" className="mt-1 rounded-xl" {...register("deadline")} />
        </div>
        <div>
          <Label>Reminder</Label>
          <Input type="datetime-local" className="mt-1 rounded-xl" {...register("reminderAt")} />
        </div>
      </div>

      <div>
        <Label>Category</Label>
        <Input placeholder="e.g. work, personal, health" className="mt-1 rounded-xl" {...register("category")} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1 rounded-xl" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {task ? "Update" : "Create"} Task
        </Button>
      </div>
    </form>
  );
}
