import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  deadline: z.string().optional(),
  reminderAt: z.string().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  category: z.string().optional(),
});

export const importantDateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string(),
  type: z.enum(["BIRTHDAY", "APPOINTMENT", "BILL", "ANNIVERSARY", "CUSTOM"]),
  reminderDaysBefore: z.number().min(0).max(365).default(1),
  isRecurring: z.boolean().default(false),
  recurringType: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
});

export const healthLogSchema = z.object({
  date: z.string().optional(),
  heartRate: z.number().min(20).max(300).optional(),
  bloodPressureSystolic: z.number().min(60).max(250).optional(),
  bloodPressureDiastolic: z.number().min(40).max(150).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  steps: z.number().min(0).optional(),
  caloriesBurned: z.number().min(0).optional(),
  weight: z.number().min(0).max(500).optional(),
  notes: z.string().optional(),
});

export const mentalLogSchema = z.object({
  date: z.string().optional(),
  moodScore: z.number().min(1).max(10),
  stressLevel: z.number().min(1).max(10),
  energyLevel: z.number().min(1).max(10),
  reflectionNote: z.string().optional(),
  gratitudeNote: z.string().optional(),
});

export const workoutPlanSchema = z.object({
  title: z.string().min(1, "Title is required"),
  exerciseType: z.string().min(1, "Exercise type is required"),
  scheduledAt: z.string(),
  duration: z.number().min(1).max(480),
  caloriesTarget: z.number().min(0).optional(),
  completed: z.boolean().default(false),
  notes: z.string().optional(),
});

export const foodLogSchema = z.object({
  date: z.string().optional(),
  foodName: z.string().min(1, "Food name is required"),
  calories: z.number().min(0).max(10000),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK", "MEAL"]).default("MEAL"),
  notes: z.string().optional(),
  source: z.string().optional(),
});

export const habitSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]).default("DAILY"),
  targetDays: z.number().min(1).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});
