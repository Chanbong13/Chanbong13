import { Metadata } from "next";
import { HabitsClient } from "@/components/habits/habits-client";

export const metadata: Metadata = { title: "Habit Tracking" };

export default function HabitsPage() {
  return <HabitsClient />;
}
