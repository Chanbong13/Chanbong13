"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckSquare, Plus, ArrowRight } from "lucide-react";
import { cn, getPriorityColor, getStatusColor, formatDeadline } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  deadline: Date | null;
  category: string | null;
}

interface TodayTasksProps {
  tasks: Task[];
}

export function TodayTasks({ tasks }: TodayTasksProps) {
  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-blue-500" />
          Today&apos;s Tasks
        </CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" asChild>
            <Link href="/dashboard/tasks">
              View all <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/tasks?new=true">
              <Plus className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tasks for today</p>
            <Button size="sm" className="mt-3" asChild>
              <Link href="/dashboard/tasks">Add a task</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all hover:bg-accent/50",
                  task.status === "COMPLETED" && "opacity-60"
                )}
              >
                <div
                  className={cn(
                    "w-3 h-3 rounded-full flex-shrink-0",
                    task.status === "COMPLETED" ? "bg-green-500" : "bg-muted"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    task.status === "COMPLETED" && "line-through"
                  )}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className={cn("text-xs py-0", getPriorityColor(task.priority))}
                    >
                      {task.priority}
                    </Badge>
                    {task.deadline && (
                      <span className="text-xs text-muted-foreground">
                        {formatDeadline(task.deadline)}
                      </span>
                    )}
                    {task.category && (
                      <span className="text-xs text-muted-foreground">#{task.category}</span>
                    )}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn("text-xs flex-shrink-0", getStatusColor(task.status))}
                >
                  {task.status.replace("_", " ")}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
