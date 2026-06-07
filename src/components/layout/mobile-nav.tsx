"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CheckSquare,
  Heart,
  Utensils,
  Repeat,
  MoreHorizontal,
  Brain,
  Dumbbell,
  CalendarHeart,
  Settings,
} from "lucide-react";
import { useState } from "react";

const primaryNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/dashboard/tasks", icon: CheckSquare, label: "Tasks" },
  { href: "/dashboard/food", icon: Utensils, label: "Food" },
  { href: "/dashboard/habits", icon: Repeat, label: "Habits" },
];

const moreNav = [
  { href: "/dashboard/health", icon: Heart, label: "Health" },
  { href: "/dashboard/mental", icon: Brain, label: "Mental" },
  { href: "/dashboard/workout", icon: Dumbbell, label: "Workout" },
  { href: "/dashboard/reminders", icon: CalendarHeart, label: "Reminders" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function MobileNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  const isMoreActive = moreNav.some((item) => pathname === item.href);

  return (
    <>
      {/* More drawer */}
      {showMore && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setShowMore(false)}
        >
          <div
            className="absolute bottom-16 left-0 right-0 bg-background border-t rounded-t-2xl p-4 grid grid-cols-4 gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {moreNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMore(false)}
                  className={cn(
                    "flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-xs font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 z-50 bg-background/95 backdrop-blur border-t flex items-center justify-around px-2 md:hidden">
        {primaryNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-xs font-medium transition-all min-w-[56px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
              {item.label}
            </Link>
          );
        })}

        <button
          onClick={() => setShowMore(!showMore)}
          className={cn(
            "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-xs font-medium transition-all min-w-[56px]",
            isMoreActive ? "text-primary" : "text-muted-foreground"
          )}
        >
          <MoreHorizontal className={cn("w-5 h-5", isMoreActive && "stroke-[2.5]")} />
          More
        </button>
      </nav>
    </>
  );
}
