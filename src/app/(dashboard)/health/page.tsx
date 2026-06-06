import { Metadata } from "next";
import { HealthClient } from "@/components/health/health-client";

export const metadata: Metadata = { title: "Health Tracking" };

export default function HealthPage() {
  return <HealthClient />;
}
