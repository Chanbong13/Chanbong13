import { Metadata } from "next";
import { RemindersClient } from "@/components/reminders/reminders-client";

export const metadata: Metadata = { title: "Important Dates" };

export default function RemindersPage() {
  return <RemindersClient />;
}
