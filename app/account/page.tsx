import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect("/auth/login?next=/account");

  const name = (user.user_metadata as Record<string, unknown> | undefined)?.name as string | undefined
    || (user.user_metadata as Record<string, unknown> | undefined)?.full_name as string | undefined
    || user.email
    || "Account";

  const r = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/billing/balance`, { cache: "no-store" });
  const j = await r.json();
  const hasActiveSubscription = Boolean(j?.hasActiveSubscription);
  const balance = Number(j?.balance ?? 0);

  return (
    <div className="px-6 py-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold tracking-tight mb-6">Account</h1>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Basic information about your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm">Name: {name}</div>
            <div className="text-sm">Email: {user.email}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Billing</CardTitle>
            <CardDescription>Your subscription status and credits.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="text-sm">Subscription: {hasActiveSubscription ? "Active" : "None"}</div>
            <div className="text-sm">Credits: {balance}</div>
            <div className="flex gap-2">
              <Button asChild variant="secondary">
                <a href="/api/billing/portal?redirect=1">Manage subscription</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


