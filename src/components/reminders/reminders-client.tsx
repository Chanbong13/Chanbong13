"use client";

import { useState, useEffect, useCallback } from "react";
import { CalendarHeart, Plus, Trash2, Edit, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, differenceInDays, isPast } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { ReminderForm } from "./reminder-form";
import { cn } from "@/lib/utils";

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

const TYPE_ICONS: Record<string, string> = {
  BIRTHDAY: "🎂",
  APPOINTMENT: "📅",
  BILL: "💳",
  ANNIVERSARY: "💑",
  CUSTOM: "⭐",
};

const TYPE_COLORS: Record<string, string> = {
  BIRTHDAY: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  APPOINTMENT: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  BILL: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  ANNIVERSARY: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  CUSTOM: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export function RemindersClient() {
  const [dates, setDates] = useState<ImportantDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDate, setEditingDate] = useState<ImportantDate | null>(null);
  const { toast } = useToast();

  const fetchDates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reminders");
      const data = await res.json();
      setDates(data.dates || []);
    } catch {
      toast({ title: "Error loading reminders", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchDates(); }, [fetchDates]);

  async function handleDelete(id: string) {
    const res = await fetch(`/api/reminders/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDates((prev) => prev.filter((d) => d.id !== id));
      toast({ title: "Reminder deleted" });
    }
  }

  const upcoming = dates
    .map((d) => ({ ...d, daysUntil: differenceInDays(new Date(d.date), new Date()) }))
    .sort((a, b) => Math.abs(a.daysUntil) - Math.abs(b.daysUntil));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CalendarHeart className="w-8 h-8 text-pink-500" />
            Important Dates
          </h1>
          <p className="text-muted-foreground mt-1">Never miss a special occasion</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Date
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 glass-card rounded-2xl animate-pulse" />)}
        </div>
      ) : dates.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-16 text-center">
            <CalendarHeart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">No important dates added</p>
            <Button className="mt-4" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add your first reminder
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {upcoming.map((date) => {
            const isOverdue = date.daysUntil < 0;
            const isSoon = date.daysUntil >= 0 && date.daysUntil <= 7;

            return (
              <Card key={date.id} className={cn(
                "glass-card group",
                isSoon && !isOverdue && "border-yellow-200 dark:border-yellow-900",
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{TYPE_ICONS[date.type]}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{date.title}</h3>
                        <Badge className={`text-xs ${TYPE_COLORS[date.type]}`}>{date.type}</Badge>
                        {date.isRecurring && (
                          <Badge variant="outline" className="text-xs">🔄 {date.recurringType}</Badge>
                        )}
                      </div>
                      {date.description && (
                        <p className="text-sm text-muted-foreground mt-1">{date.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-muted-foreground">
                          📅 {format(new Date(date.date), "MMM d, yyyy")}
                        </span>
                        <span className={cn(
                          "font-medium",
                          isOverdue && "text-red-500",
                          isSoon && !isOverdue && "text-yellow-600 dark:text-yellow-400",
                          !isSoon && !isOverdue && "text-green-500"
                        )}>
                          {isOverdue ? `${Math.abs(date.daysUntil)} days ago` :
                           date.daysUntil === 0 ? "🎉 Today!" :
                           date.daysUntil === 1 ? "Tomorrow" :
                           `In ${date.daysUntil} days`}
                        </span>
                        {date.reminderDaysBefore > 0 && (
                          <span className="flex items-center gap-1 text-muted-foreground text-xs">
                            <Bell className="w-3 h-3" />
                            {date.reminderDaysBefore}d before
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingDate(date)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(date.id)}>
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

      <Dialog open={showForm || !!editingDate} onOpenChange={(open) => { if (!open) { setShowForm(false); setEditingDate(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingDate ? "Edit Date" : "Add Important Date"}</DialogTitle>
          </DialogHeader>
          <ReminderForm
            reminder={editingDate}
            onSuccess={() => { setShowForm(false); setEditingDate(null); fetchDates(); }}
            onCancel={() => { setShowForm(false); setEditingDate(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
