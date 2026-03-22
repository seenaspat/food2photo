"use client";

import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
    CreditCard,
    ImageIcon,
    LogOut,
    Menu,
    Sparkles,
    User
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { label: "Generator", href: "/dashboard", icon: ImageIcon },
  { label: "Account", href: "/account", icon: User },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const res = await fetch("/api/billing/balance");
        if (res.ok) {
          const data = await res.json();
          setCredits(data?.totalCredits ?? data?.balance ?? 0);
        }
      } catch {
        // Silently fail
      }
    };
    fetchCredits();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href || 
          (item.href === "/dashboard" && pathname === "/dashboard");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>Food2Photo</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto p-4">
        <NavLinks onNavigate={onNavigate} />
      </div>

      {/* Credits & Actions */}
      <div className="border-t p-4 space-y-4">
        {/* Credits display */}
        {credits !== null && (
          <div className="rounded-lg bg-accent/50 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4" />
                <span className="text-muted-foreground">Credits</span>
              </div>
              <span className="font-semibold">{credits}</span>
            </div>
            <Link
              href="/pricing"
              className="mt-2 block text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Get more credits →
            </Link>
          </div>
        )}

        {/* Theme & Sign Out */}
        <div className="flex items-center justify-between">
          <ThemeSwitcher />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r bg-card">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between h-16 border-b bg-card px-4 sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>Food2Photo</span>
        </Link>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent onNavigate={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}
