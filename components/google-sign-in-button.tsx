"use client";

import { useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.042,6.053,28.761,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.659,15.108,19.004,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C33.042,6.053,28.761,4,24,4C16.318,4,9.682,8.337,6.306,14.691z"/>
      <path fill="#4CAF50" d="M24,44c4.696,0,8.985-1.799,12.229-4.737l-5.657-5.657C28.555,35.091,26.393,36,24,36c-5.202,0-9.619-3.328-11.283-7.976l-6.56,5.047C9.5,39.556,16.227,44,24,44z"/>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.239-2.231,4.166-4.074,5.572l5.657,5.657 C39.423,36.674,44,30.716,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
  );
}

export function GoogleSignInButton({ label = "Continue with Google", variant = "outline", size = "default", className }: { label?: string; variant?: ButtonProps["variant"]; size?: ButtonProps["size"]; className?: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={"w-full " + (className ?? "")}
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
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <span className="mr-2 inline-flex h-5 w-5 items-center justify-center">
          <GoogleIcon />
        </span>
      )}
      <span>{label}</span>
    </Button>
  );
}

export default GoogleSignInButton;


