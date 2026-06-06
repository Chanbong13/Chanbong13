import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, MessageSquare, Activity } from "lucide-react";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="w-8 h-8" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">Manage your account and integrations</p>
      </div>

      {/* Profile */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{session?.user?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{session?.user?.email}</span>
          </div>
        </CardContent>
      </Card>

      {/* LINE Integration */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-500" />
            LINE OA Integration
          </CardTitle>
          <CardDescription>Connect your LINE account for notifications and food logging</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl bg-green-50 dark:bg-green-950/30 p-4 border border-green-200 dark:border-green-900">
            <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">Setup Instructions</h4>
            <ol className="text-sm text-green-600 dark:text-green-400 space-y-2 list-decimal list-inside">
              <li>Create a LINE Official Account at <code className="bg-green-100 dark:bg-green-900 px-1 rounded">developers.line.biz</code></li>
              <li>Set webhook URL to: <code className="bg-green-100 dark:bg-green-900 px-1 rounded">{process.env.NEXT_PUBLIC_APP_URL}/api/line/webhook</code></li>
              <li>Add <code className="bg-green-100 dark:bg-green-900 px-1 rounded">LINE_CHANNEL_ACCESS_TOKEN</code> and <code className="bg-green-100 dark:bg-green-900 px-1 rounded">LINE_CHANNEL_SECRET</code> to your .env</li>
              <li>Users send messages to your LINE OA bot</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Available Commands:</h4>
            <div className="space-y-1 text-sm">
              {[
                { cmd: "กิน [ชื่ออาหาร]", desc: "Log food and calories" },
                { cmd: "สรุป", desc: "Get today's summary" },
                { cmd: "task: [title]", desc: "Create a quick task" },
              ].map((item) => (
                <div key={item.cmd} className="flex gap-3 p-2 rounded-lg bg-muted/50">
                  <code className="text-primary font-mono text-xs">{item.cmd}</code>
                  <span className="text-muted-foreground text-xs">→ {item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-500" />
            Future Integrations
          </CardTitle>
          <CardDescription>Coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "Strava", icon: "🚴", status: "Coming soon" },
              { name: "Apple Health", icon: "🍎", status: "Coming soon" },
              { name: "Google Fit", icon: "🏃", status: "Coming soon" },
              { name: "Fitbit", icon: "⌚", status: "Coming soon" },
            ].map((integration) => (
              <div key={integration.name} className="flex items-center gap-3 p-3 rounded-xl border">
                <span className="text-2xl">{integration.icon}</span>
                <div>
                  <p className="font-medium text-sm">{integration.name}</p>
                  <p className="text-xs text-muted-foreground">{integration.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Notification Schedule</CardTitle>
          <CardDescription>Automated LINE notifications via cron</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {[
              { time: "07:00", desc: "Morning summary: tasks + workout for today" },
              { time: "20:00", desc: "Evening summary: completed tasks + calories" },
              { time: "1h before", desc: "Task deadline reminders" },
              { time: "N days before", desc: "Important date reminders" },
            ].map((n) => (
              <div key={n.time} className="flex gap-3 p-2 rounded-lg hover:bg-accent/30 transition-colors">
                <span className="font-mono font-bold text-primary w-20 flex-shrink-0">{n.time}</span>
                <span className="text-muted-foreground">{n.desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
