"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Edit, Trash2, Clock, Tag } from "lucide-react";
import { cn, getPriorityColor, getStatusColor, formatDeadline } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  reminderAt: string | null;
  status: string;
  priority: string;
  category: string | null;
  createdAt: string;
}

interface TaskCardProps {
  task: Task;
  onComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onComplete, onEdit, onDelete }: TaskCardProps) {
  return (
    <Card className={cn(
      "glass-card transition-all hover:shadow-md group",
      task.status === "COMPLETED" && "opacity-70"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => onComplete(task)}
            className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
              task.status === "COMPLETED"
                ? "bg-green-500 border-green-500 text-white"
                : "border-muted-foreground/30 hover:border-green-500"
            )}
          >
            {task.status === "COMPLETED" && <Check className="w-3.5 h-3.5" />}
          </button>

          <div className="flex-1 min-w-0">
            <p className={cn(
              "font-medium",
              task.status === "COMPLETED" && "line-through text-muted-foreground"
            )}>
              {task.title}
            </p>

            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="outline" className={cn("text-xs", getPriorityColor(task.priority))}>
                {task.priority}
              </Badge>
              <Badge variant="outline" className={cn("text-xs", getStatusColor(task.status))}>
                {task.status.replace("_", " ")}
              </Badge>
              {task.deadline && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatDeadline(new Date(task.deadline))}
                </span>
              )}
              {task.category && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Tag className="w-3 h-3" />
                  {task.category}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(task)}>
              <Edit className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
