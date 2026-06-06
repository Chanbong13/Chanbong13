import { Metadata } from "next";
import { MentalClient } from "@/components/mental/mental-client";

export const metadata: Metadata = { title: "Mental Wellness" };

export default function MentalPage() {
  return <MentalClient />;
}
