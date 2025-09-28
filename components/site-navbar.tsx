"use client";

import Link from "next/link";
import { Menu, Sparkles, User, LogOut, CreditCard } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  NavigationMenu,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AuthMenuClient } from "@/components/auth-menu-client";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createClient } from "@/lib/supabase/client";

export function SiteNavbar({ initialIsAuthed = false }: { initialIsAuthed?: boolean }) {
  const headerRef = useRef<HTMLElement | null>(null);
  const [isAuthed, setIsAuthed] = useState<boolean>(initialIsAuthed);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el || typeof window === "undefined") return;

    const setHeightVar = () => {
      const h = el.offsetHeight || 64;
      document.documentElement.style.setProperty("--navbar-h", `${h}px`);
    };

    setHeightVar();
    const ro = new ResizeObserver(setHeightVar);
    ro.observe(el);
    window.addEventListener("resize", setHeightVar);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", setHeightVar);
    };
  }, []);

  useEffect(() => {
    const supabase = createClient();
    // One-time check to resync if SSR state changed
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      setIsAuthed(Boolean(u?.id));
      const name = (u?.user_metadata as Record<string, unknown> | undefined)?.name as string | undefined
        || (u?.user_metadata as Record<string, unknown> | undefined)?.full_name as string | undefined
        || u?.email
        || null;
      setDisplayName(name ?? null);
      setEmail(u?.email ?? null);
    }).catch(() => {});
    // Subscribe to auth state changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      setIsAuthed(Boolean(u?.id));
      const name = (u?.user_metadata as Record<string, unknown> | undefined)?.name as string | undefined
        || (u?.user_metadata as Record<string, unknown> | undefined)?.full_name as string | undefined
        || u?.email
        || null;
      setDisplayName(name ?? null);
      setEmail(u?.email ?? null);
    });
    return () => { try { sub.subscription.unsubscribe(); } catch {} };
  }, []);
  return (
    <header ref={headerRef} className="w-full border-b">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold tracking-tight">Food2Photo</Link>
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/#features">Features</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/pricing">Pricing</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                {isAuthed ? (
                  <NavigationMenuItem>
                    <Button asChild size="default" variant="outline">
                      <Link
                        href="/generatorv1"
                      >
                        <span>Generate</span>
                        <Sparkles className="h-4 w-4" />
                      </Link>
                    </Button>
                  </NavigationMenuItem>
                ) : null}
              </NavigationMenuList>
              <NavigationMenuViewport />
              <NavigationMenuIndicator />
            </NavigationMenu>
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeSwitcher />
          {isAuthed ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Account">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold tracking-wide leading-none uppercase">{displayName ?? "Account"}</span>
                  {email ? <span className="text-xs text-muted-foreground normal-case font-normal">{email}</span> : null}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-between" onClick={async () => {
                  try {
                    const res = await fetch("/api/billing/portal", { method: "GET" });
                    const json = await res.json();
                    if (res.ok && json?.url) window.location.href = json.url as string;
                  } catch {}
                }}>
                  <span>Billing</span>
                  <CreditCard className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-between" onClick={async () => {
                  try { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = "/auth/login"; } catch {}
                }}>
                  <span>Log out</span>
                  <LogOut className="h-4 w-4" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <AuthMenuClient />
          )}
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetTitle className="sr-only">Mobile navigation</SheetTitle>
              <nav className="mt-8 grid gap-2">
                <Button asChild variant="ghost" className="justify-start">
                  <Link href="/#features">Features</Link>
                </Button>
                <Button asChild variant="ghost" className="justify-start">
                  <Link href="/pricing">Pricing</Link>
                </Button>
                {isAuthed ? (
                  <Button asChild variant="default" size="default" className="justify-start">
                    <Link href="/generatorv1" className="inline-flex items-center gap-2">
                      <span>Generate</span>
                      <Sparkles className="h-4 w-4 text-primary-foreground" />
                    </Link>
                  </Button>
                ) : null}
                <div className="h-px bg-border my-2" />
                <ThemeSwitcher />
                <div className="h-px bg-border my-2" />
                {isAuthed ? (
                  <>
                    <div className="mb-2">
                      <div className="text-xs font-semibold leading-none uppercase">{displayName ?? "Account"}</div>
                      {email ? <div className="text-xs text-muted-foreground">{email}</div> : null}
                    </div>
                    <Button
                      variant="outline"
                      className="justify-between"
                      onClick={async () => {
                        try {
                          const res = await fetch("/api/billing/portal", { method: "GET" });
                          const json = await res.json();
                          if (res.ok && json?.url) window.location.href = json.url as string;
                        } catch {}
                      }}
                    >
                      <span>Billing</span>
                      <CreditCard className="h-4 w-4" />
                    </Button>
                    <Button
                      className="justify-between"
                      onClick={async () => {
                        try { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = "/auth/login"; } catch {}
                      }}
                    >
                      <span>Log out</span>
                      <LogOut className="h-4 w-4 " />
                    </Button>
                  </>
                ) : (
                  <AuthMenuClient mobile />
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default SiteNavbar;


