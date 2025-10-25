import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { getBillingSummary, type BillingSummary } from "@/lib/billing/summary.server";

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

  const summary: BillingSummary = await getBillingSummary(supabase, user.id);
  const hasActiveSubscription = Boolean(summary?.hasActiveSubscription);
  const balance = Number(summary?.balance ?? 0);
  const subRemaining = Number(summary?.breakdown?.subscription?.remaining_in_period ?? 0);
  const topupRemaining = Number(summary?.breakdown?.topup?.remaining_for_now ?? 0);

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
            <div className="text-sm">Credits: {subRemaining + topupRemaining}</div>
            {topupRemaining > 0 ? (
              <div className="text-xs text-muted-foreground">Top-up credits: {topupRemaining}</div>
            ) : null}
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


