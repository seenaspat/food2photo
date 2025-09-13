"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "f2p_cookie_consent_v1";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const v = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : "1";
      setVisible(!v);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto w-full max-w-6xl px-4 pb-4">
        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 border rounded-md p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">
            We use cookies for essential functionality and to improve the service. See our {" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                try { window.localStorage.setItem(STORAGE_KEY, "1"); } catch {}
                setVisible(false);
              }}
            >
              Got it
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href="/privacy">Learn more</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
