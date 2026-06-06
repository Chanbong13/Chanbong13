import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BarChart3, Brain, CalendarCheck, Dumbbell, Heart, Utensils } from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">LP</span>
            </div>
            <span className="font-bold text-xl gradient-text">LifePilot</span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-8">
            <span>✨</span>
            <span>Your Complete Life Management System</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Pilot Your Life
            <br />
            <span className="gradient-text">With Clarity</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Track tasks, monitor health, journal your mental wellness, plan workouts,
            and log meals — all in one beautiful dashboard with LINE notifications.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Button size="lg" className="text-base px-8" asChild>
              <Link href="/register">Start for Free</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass-card rounded-2xl p-6 hover:scale-[1.02] transition-transform"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-muted-foreground text-sm">
        <p>© {new Date().getFullYear()} LifePilot. Built with Next.js & Prisma.</p>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "Task Management",
    description: "Organize daily tasks with priorities, deadlines, and smart reminders.",
    icon: CalendarCheck,
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
  },
  {
    title: "Health Tracking",
    description: "Monitor heart rate, sleep, steps, and weight with beautiful charts.",
    icon: Heart,
    color: "bg-gradient-to-br from-red-500 to-pink-600",
  },
  {
    title: "Mental Wellness",
    description: "Journal your mood, stress, and gratitude for emotional clarity.",
    icon: Brain,
    color: "bg-gradient-to-br from-violet-500 to-purple-600",
  },
  {
    title: "Workout Planner",
    description: "Schedule and track your workouts with calorie targets.",
    icon: Dumbbell,
    color: "bg-gradient-to-br from-green-500 to-emerald-600",
  },
  {
    title: "Food Tracking",
    description: "Log meals via LINE OA chatbot and track daily calories.",
    icon: Utensils,
    color: "bg-gradient-to-br from-orange-500 to-amber-600",
  },
  {
    title: "Analytics",
    description: "Weekly and monthly trends to keep you on track.",
    icon: BarChart3,
    color: "bg-gradient-to-br from-cyan-500 to-teal-600",
  },
];
