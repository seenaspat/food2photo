import type { SupabaseClient } from "@supabase/supabase-js";

export type BillingPlanInfo = { code: string; name: string; monthly_token_quota: number } | null;

export type BillingSummary = {
  balance: number;
  totalCredits: number;
  hasActiveSubscription: boolean;
  subscription: {
    status: string | null;
    period_start: string | null;
    period_end: string | null;
    renew_at: string | null;
    cancel_at_period_end: boolean | null;
    cancel_at: string | null;
    canceled_at: string | null;
  } | null;
  plan: BillingPlanInfo;
  breakdown: {
    subscription: { monthly_quota: number; used_in_period: number; remaining_in_period: number };
    topup: { granted_total: number; spent_this_period: number; remaining_for_now: number };
  };
};

export async function getBillingSummary(supabase: SupabaseClient, userId: string): Promise<BillingSummary> {
  const { data: balance } = await supabase.rpc("get_current_credit_balance", { user_id_input: userId });

  const { data: sub } = await supabase
    .from("user_subscriptions")
    .select("plan_code, status, current_period_start, current_period_end, cancel_at_period_end, cancel_at, canceled_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let plan: BillingPlanInfo = null;
  if (sub?.plan_code) {
    const { data: planRec } = await supabase
      .from("billing_plans")
      .select("code, name, monthly_token_quota")
      .eq("code", sub.plan_code)
      .single();
    if (planRec) plan = { code: planRec.code, name: planRec.name, monthly_token_quota: Number(planRec.monthly_token_quota ?? 0) };
  }

  const hasActiveSubscription = Boolean(sub && (sub.status === "trialing" || sub.status === "active" || sub.status === "past_due"));

  const periodStartISO = sub?.current_period_start ?? null;
  const periodEndISO = sub?.current_period_end ?? null;
  let usedInPeriod = 0;
  if (periodStartISO && periodEndISO) {
    const { data: usageRows } = await supabase
      .from("usage_ledger")
      .select("tokens_used")
      .eq("user_id", userId)
      .gte("created_at", String(periodStartISO))
      .lt("created_at", String(periodEndISO));
    if (Array.isArray(usageRows)) usedInPeriod = usageRows.reduce((s, r) => s + Number((r as { tokens_used?: number }).tokens_used ?? 0), 0);
  }
  const monthlyQuota = Number(plan?.monthly_token_quota ?? 0);
  const subscriptionUsed = Math.min(usedInPeriod, monthlyQuota);
  const subscriptionRemaining = Math.max(0, monthlyQuota - subscriptionUsed);

  const { data: topupRows } = await supabase
    .from("credit_purchases")
    .select("tokens_granted, status, kind")
    .eq("user_id", userId)
    .eq("kind", "topup");
  const topupGrantedTotal = Array.isArray(topupRows)
    ? topupRows.filter((r) => (r as { status?: string }).status === "succeeded").reduce((s, r) => s + Number((r as { tokens_granted?: number }).tokens_granted ?? 0), 0)
    : 0;
  const topupRefundedTotal = Array.isArray(topupRows)
    ? topupRows.filter((r) => (r as { status?: string }).status === "refunded").reduce((s, r) => s + Number((r as { tokens_granted?: number }).tokens_granted ?? 0), 0)
    : 0;
  const topupNetTotal = Math.max(0, topupGrantedTotal - topupRefundedTotal);
  const topupSpentThisPeriod = Math.max(0, usedInPeriod - monthlyQuota);
  const topupDisplayRemaining = Math.max(0, topupNetTotal - topupSpentThisPeriod);

  return {
    balance: Number(balance ?? 0),
    totalCredits: Number(balance ?? 0),
    hasActiveSubscription,
    subscription: sub ? {
      status: sub.status,
      renew_at: sub.current_period_end,
      period_start: sub.current_period_start,
      period_end: sub.current_period_end,
      cancel_at_period_end: sub.cancel_at_period_end,
      cancel_at: sub.cancel_at,
      canceled_at: sub.canceled_at,
    } : null,
    plan,
    breakdown: {
      subscription: {
        monthly_quota: monthlyQuota,
        used_in_period: usedInPeriod,
        remaining_in_period: subscriptionRemaining,
      },
      topup: {
        granted_total: topupNetTotal,
        spent_this_period: topupSpentThisPeriod,
        remaining_for_now: topupDisplayRemaining,
      },
    },
  };
}


