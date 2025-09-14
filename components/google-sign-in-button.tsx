"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export function GoogleSignInButton({ label = "Continue with Google" }: { label?: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={loading}
      onClick={async () => {
        try {
          setLoading(true);
          const supabase = createClient();
          const redirectTo = `${window.location.origin}/auth/callback?next=/generatorv1`;
          await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo, queryParams: { prompt: "select_account" } },
          });
        } finally {
          // Supabase hará redirect; mantenemos loading para evitar dobles clics
        }
      }}
    >
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {label}
    </Button>
  );
}

export default GoogleSignInButton;


