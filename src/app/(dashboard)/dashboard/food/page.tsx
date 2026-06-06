import { Metadata } from "next";
import { FoodClient } from "@/components/food/food-client";

export const metadata: Metadata = { title: "Food Tracking" };

export default function FoodPage() {
  return <FoodClient />;
}
