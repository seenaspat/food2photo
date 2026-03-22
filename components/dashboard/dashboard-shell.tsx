import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  return (
    <main className={cn(
      "flex-1 overflow-auto bg-background",
      className
    )}>
      <div className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">
        {children}
      </div>
    </main>
  );
}
