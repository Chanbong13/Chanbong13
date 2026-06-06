import { Metadata } from "next";
import { TasksClient } from "@/components/tasks/tasks-client";

export const metadata: Metadata = { title: "Tasks" };

export default function TasksPage() {
  return <TasksClient />;
}
