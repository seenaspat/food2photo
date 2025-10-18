import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id ?? null;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: balance, error: balErr } = await supabase.rpc("get_current_credit_balance", { user_id_input: userId });
    if (balErr) throw balErr;

    const { data: sub } = await supabase
      .from("user_subscriptions")
      .select("plan_code, status, current_period_end, cancel_at_period_end, cancel_at, canceled_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let plan = null as { code: string; name: string; monthly_token_quota: number } | null;
    if (sub?.plan_code) {
      const { data: planRec } = await supabase
        .from("billing_plans")
        .select("code, name, monthly_token_quota")
        .eq("code", sub.plan_code)
        .single();
      if (planRec) plan = { code: planRec.code, name: planRec.name, monthly_token_quota: Number(planRec.monthly_token_quota ?? 0) };
    }

    const hasActiveSubscription = Boolean(sub && (sub.status === "trialing" || sub.status === "active" || sub.status === "past_due"));

    return NextResponse.json({
      balance: Number(balance ?? 0),
      totalCredits: Number(balance ?? 0),
      hasActiveSubscription,
      subscription: sub ? {
        status: sub.status,
        renew_at: sub.current_period_end,
        cancel_at_period_end: sub.cancel_at_period_end,
        cancel_at: sub.cancel_at,
        canceled_at: sub.canceled_at,
      } : null,
      plan,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


