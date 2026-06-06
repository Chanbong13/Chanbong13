import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen gradient-bg">
      <Sidebar />
      <Navbar user={session.user} />
      <main className="ml-64 pt-16 p-6 min-h-screen transition-all duration-300">
        <div className="animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
