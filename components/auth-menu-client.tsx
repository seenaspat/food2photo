"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";

interface Props {
  mobile?: boolean;
}

export function AuthMenuClient({ mobile }: Props) {
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      const name = (u?.user_metadata as Record<string, unknown> | undefined)?.name as string | undefined
        || (u?.user_metadata as Record<string, unknown> | undefined)?.full_name as string | undefined
        || u?.email
        || null;
      setDisplayName(name);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      const name = (u?.user_metadata as Record<string, unknown> | undefined)?.name as string | undefined
        || (u?.user_metadata as Record<string, unknown> | undefined)?.full_name as string | undefined
        || u?.email
        || null;
      setDisplayName(name);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  if (displayName) {
    return (
      <div className={mobile ? "grid gap-2" : "flex items-center gap-2"}>
        {!mobile && <span className="text-sm text-muted-foreground">Hey, {displayName}!</span>}
        <LogoutButton />
      </div>
    );
  }

  return mobile ? (
    <>
      <Button asChild variant="ghost" className="justify-start">
        <Link href="/auth/login">Log in</Link>
      </Button>
      <Button asChild className="justify-start">
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </>
  ) : (
    <div className="hidden items-center gap-2 md:flex">
      <Button asChild variant="ghost" size="sm">
        <Link href="/auth/login">Log in</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}

export default AuthMenuClient;


