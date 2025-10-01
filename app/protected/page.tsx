import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { InfoIcon } from "lucide-react";
import { FetchDataSteps } from "@/components/tutorial/fetch-data-steps";
import GenerateForm from "@/components/generate-form";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  const disableAuthGuard =
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_DISABLE_AUTH_GUARD === "true";
  if (!disableAuthGuard && (error || !data?.claims)) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated
          user
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-2xl">Enhance your dish photo</h2>
        <GenerateForm />
      </div>
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Your user details</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          {JSON.stringify(
            disableAuthGuard ? { devAuthDisabled: true } : data?.claims ?? {},
            null,
            2,
          )}
        </pre>
      </div>
      <SubscriptionSection />
      <div>
        <h2 className="font-bold text-2xl mb-4">Next steps</h2>
        <FetchDataSteps />
      </div>
    </div>
  );
}

async function SubscriptionSection() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id ?? null;
  if (!userId) return null;
  const { data: sub } = await supabase
    .from("user_subscriptions")
    .select("plan_code, status, current_period_end")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  const status = sub?.status as string | undefined;
  const renewAt = sub?.current_period_end as string | undefined;
  const planCode = sub?.plan_code as string | undefined;
  const active = status === "trialing" || status === "active" || status === "past_due";
  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-bold text-2xl">Subscription</h2>
      {active ? (
        <div className="text-sm text-muted-foreground">
          Plan: {planCode ?? "(unknown)"}. Status: {status}. {renewAt ? `Renews on ${new Date(renewAt).toLocaleDateString()}.` : ""}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">No active subscription.</div>
      )}
    </div>
  );
}
