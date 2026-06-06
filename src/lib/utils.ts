import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isTomorrow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM d, yyyy");
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM d, yyyy HH:mm");
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatDeadline(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "MMM d");
}

export function getMoodEmoji(score: number): string {
  if (score >= 9) return "😄";
  if (score >= 7) return "😊";
  if (score >= 5) return "😐";
  if (score >= 3) return "😕";
  return "😢";
}

export function getMoodColor(score: number): string {
  if (score >= 8) return "text-green-500";
  if (score >= 6) return "text-blue-500";
  if (score >= 4) return "text-yellow-500";
  if (score >= 2) return "text-orange-500";
  return "text-red-500";
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "URGENT": return "text-red-500 bg-red-50 dark:bg-red-950";
    case "HIGH": return "text-orange-500 bg-orange-50 dark:bg-orange-950";
    case "MEDIUM": return "text-yellow-500 bg-yellow-50 dark:bg-yellow-950";
    case "LOW": return "text-green-500 bg-green-50 dark:bg-green-950";
    default: return "text-gray-500 bg-gray-50 dark:bg-gray-950";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "COMPLETED": return "text-green-500 bg-green-50 dark:bg-green-950";
    case "IN_PROGRESS": return "text-blue-500 bg-blue-50 dark:bg-blue-950";
    case "PENDING": return "text-yellow-500 bg-yellow-50 dark:bg-yellow-950";
    case "CANCELLED": return "text-gray-500 bg-gray-100 dark:bg-gray-800";
    default: return "text-gray-500";
  }
}

export function estimateCalories(foodName: string): number {
  const calorieMap: Record<string, number> = {
    "ข้าวกะเพราไก่ไข่ดาว": 750,
    "ข้าวกะเพรา": 600,
    "ข้าวผัด": 550,
    "ผัดกะเพรา": 400,
    "ก๋วยเตี๋ยว": 350,
    "ข้าวมันไก่": 500,
    "ข้าวหมูแดง": 600,
    "ส้มตำ": 200,
    "ลาบ": 350,
    "ต้มยำ": 300,
    "แกงเขียวหวาน": 450,
    "ข้าวสวย": 200,
    "ขนมปัง": 250,
    "กาแฟ": 50,
    "นมสด": 150,
    "ไข่ต้ม": 80,
    "ไข่ดาว": 100,
    "ผักสด": 50,
    "สลัด": 100,
    "พิซซ่า": 700,
    "เบอร์เกอร์": 650,
    "ไก่ทอด": 400,
    "ข้าวมันไก่ต้ม": 450,
    "ผัดซีอิ๊ว": 500,
    "หมูกะทะ": 800,
    "ชาบู": 500,
    "ยำ": 200,
    "ข้าวต้ม": 200,
    "โจ๊ก": 250,
  };

  const lowerFood = foodName.toLowerCase();
  for (const [key, cal] of Object.entries(calorieMap)) {
    if (lowerFood.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerFood)) {
      return cal;
    }
  }

  // Default estimate
  return 400;
}
