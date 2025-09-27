"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { AuthMenuClient } from "@/components/auth-menu-client";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function SiteNavbar() {
  const headerRef = useRef<HTMLElement | null>(null);

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
              </NavigationMenuList>
              <NavigationMenuViewport />
              <NavigationMenuIndicator />
            </NavigationMenu>
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeSwitcher />
          <AuthMenuClient />
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
                <div className="h-px bg-border my-2" />
                <ThemeSwitcher />
                <div className="h-px bg-border my-2" />
                <AuthMenuClient mobile />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default SiteNavbar;


