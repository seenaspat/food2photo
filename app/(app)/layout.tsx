import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  
  // Redirect unauthenticated users to login
  if (!data.user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      {/* Main content area - offset by sidebar on desktop */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <DashboardShell>{children}</DashboardShell>
      </div>
    </div>
  );
}
