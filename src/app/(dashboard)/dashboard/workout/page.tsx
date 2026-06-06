import { Metadata } from "next";
import { WorkoutClient } from "@/components/workout/workout-client";

export const metadata: Metadata = { title: "Workout Planner" };

export default function WorkoutPage() {
  return <WorkoutClient />;
}
