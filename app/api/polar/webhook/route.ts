import { NextResponse } from "next/server";
import { validateEvent } from "@polar-sh/sdk/webhooks";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(obj: Record<string, unknown>, key: string): string | null {
  const v = obj[key];
  return typeof v === "string" ? v : null;
}

export async function POST(request: Request) {
  if (process.env.BILLING_ENABLED !== "true") {
    return NextResponse.json({ error: "Billing disabled" }, { status: 400 });
  }
  if ((process.env.BILLING_PROVIDER ?? "").toLowerCase() !== "polar") {
    return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
  }

  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: "Missing POLAR_WEBHOOK_SECRET" }, { status: 500 });

  const rawBody = await request.text();
  const hdrs: Record<string, string> = {};
  request.headers.forEach((value, key) => { hdrs[key.toLowerCase()] = value; });

  let event: unknown;
  try {
    event = validateEvent(rawBody, hdrs, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const evtId = isRecord(event) && typeof event["id"] === "string" ? String(event["id"]) : null;
  if (evtId) {
    try {
      await supabase.from("idempotency_keys").insert({ key: evtId }).select("key").single();
    } catch {
      return NextResponse.json({ ok: true, duplicate: true }, { status: 200 });
    }
  }

  try {
    if (!isRecord(event) || typeof event["type"] !== "string") {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    const eventType = String(event["type"]);
    const data = isRecord(event["data"]) ? (event["data"] as Record<string, unknown>) : {};

    switch (eventType) {
      case "checkout.created":
      case "checkout.updated": {
        const status = getString(data, "status");
        if (status !== "succeeded") break; // evitar doble grant en 'confirmed' y luego 'succeeded'
        const metadata = isRecord(data["metadata"]) ? (data["metadata"] as Record<string, unknown>) : (isRecord(data["customer_metadata"]) ? (data["customer_metadata"] as Record<string, unknown>) : null);
        if (!metadata) break;
        const userId = getString(metadata, "user_id");
        const planCode = getString(metadata, "plan_code");
        const subscriptionId = getString(data, "subscription_id");
        if (userId && subscriptionId) {
          // Insert or update last row for this user (no unique key on user_id)
          const { data: existing } = await supabase
            .from("user_subscriptions")
            .select("id")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          const payload = { user_id: userId, plan_code: planCode, status: "active" } as Record<string, unknown>;
          if (existing?.id) {
            await supabase.from("user_subscriptions").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", existing.id);
          } else {
            await supabase.from("user_subscriptions").insert(payload);
          }
        }

        // Sandbox-only credit grant for one-off packs in checkout phase (to support tunnels)
        if ((process.env.POLAR_ENV ?? "production").toLowerCase() === "sandbox") {
          // Only when not a subscription checkout
          const hasSub = typeof data["subscription_id"] === "string";
          const creditStr = getString(metadata, "credit_tokens");
          const credits = creditStr && /^\d+$/.test(creditStr) ? parseInt(creditStr, 10) : 0;
          if (userId && !hasSub && credits > 0) {
            await supabase.rpc("grant_tokens", { user_id_input: userId, tokens: credits, reason: "polar.checkout.updated.sandbox", metadata: {}, kind: 'topup' });
          }
        }
        break;
      }

      case "subscription.created":
      case "subscription.updated": {
        const subscriptionId = getString(data, "id");
        const status = getString(data, "status") ?? "active";
        const cpsRaw = data["current_period_start"];
        const cpeRaw = data["current_period_end"];
        const metadata = isRecord(data["metadata"]) ? (data["metadata"] as Record<string, unknown>) : null;
        const userId = metadata ? getString(metadata, "user_id") : null;
        const planCode = metadata ? getString(metadata, "plan_code") : null;
        if (subscriptionId && userId) {
          const { data: existing } = await supabase
            .from("user_subscriptions")
            .select("id, current_period_start, current_period_end, granted_period_start, plan_quota_snapshot")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          // Use event period if provided; otherwise keep existing to avoid resetting the cycle during plan changes
          const effectiveStart = (typeof cpsRaw === "string" || cpsRaw instanceof Date)
            ? new Date(String(cpsRaw))
            : (existing?.current_period_start ? new Date(String(existing.current_period_start)) : null);
          const effectiveEnd = (typeof cpeRaw === "string" || cpeRaw instanceof Date)
            ? new Date(String(cpeRaw))
            : (existing?.current_period_end ? new Date(String(existing.current_period_end)) : null);
          // If still missing, fall back to safe defaults but DO NOT grant in this case
          const hasReliablePeriod = Boolean(effectiveStart && effectiveEnd);
          const payload = {
            user_id: userId,
            plan_code: planCode,
            status,
            current_period_start: effectiveStart ? effectiveStart.toISOString() : (existing?.current_period_start ?? null),
            current_period_end: effectiveEnd ? effectiveEnd.toISOString() : (existing?.current_period_end ?? null),
          } as Record<string, unknown>;
          if (existing?.id) {
            await supabase.from("user_subscriptions").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", existing.id);
          } else {
            await supabase.from("user_subscriptions").insert(payload);
          }

          // Periodic subscription grant (align with Stripe behavior)
          if (planCode && hasReliablePeriod) {
            const { data: planRec } = await supabase
              .from("billing_plans")
              .select("monthly_token_quota")
              .eq("code", planCode)
              .single();
            const quota = Number(planRec?.monthly_token_quota ?? 0);
            if (quota > 0) {
              // Guards: snapshot + existing credit_purchases in current period
              const grantedISO = existing?.granted_period_start ? new Date(String(existing.granted_period_start)).toISOString() : null;
              const currISO = (effectiveStart as Date).toISOString();
              const alreadySnapshotted = grantedISO === currISO;
              const periodStartISO = (effectiveStart as Date).toISOString();
              const periodEndISO = (effectiveEnd as Date).toISOString();
              const { data: inPeriodGrant } = await supabase
                .from("credit_purchases")
                .select("id")
                .eq("user_id", userId)
                .eq("kind", "subscription")
                .gte("created_at", periodStartISO)
                .lt("created_at", periodEndISO)
                .limit(1)
                .maybeSingle();
              const alreadyGranted = Boolean(inPeriodGrant);
              if (!alreadySnapshotted && !alreadyGranted) {
                await supabase.rpc("grant_tokens", {
                  user_id_input: userId,
                  tokens: quota,
                  reason: "polar.subscription.cycle",
                  metadata: {},
                  kind: 'subscription',
                });
                await supabase
                  .from("user_subscriptions")
                  .update({ plan_quota_snapshot: quota, granted_period_start: currISO, updated_at: new Date().toISOString() })
                  .eq("user_id", userId)
                  .order("created_at", { ascending: false })
                  .limit(1);
              } else if (!existing?.plan_quota_snapshot) {
                // same cycle, just snapshot if missing
                await supabase
                  .from("user_subscriptions")
                  .update({ plan_quota_snapshot: quota, updated_at: new Date().toISOString() })
                  .eq("user_id", userId)
                  .order("created_at", { ascending: false })
                  .limit(1);
              }
            }
          }
        }
        break;
      }

      case "subscription.canceled": {
        const metadata = isRecord(event["data"]) && isRecord((event["data"] as Record<string, unknown>)["metadata"]) ? ((event["data"] as Record<string, unknown>)["metadata"] as Record<string, unknown>) : null;
        const userId = metadata ? getString(metadata, "user_id") : null;
        if (userId) {
          await supabase.from("user_subscriptions").update({ status: "canceled" }).eq("user_id", userId);
        }
        break;
      }

      case "order.paid": {
        // Production-only grant for topups; en sandbox ya se otorgan en checkout.updated
        if ((process.env.POLAR_ENV ?? "production").toLowerCase() === "sandbox") break;
        const metadata = isRecord(data["metadata"]) ? (data["metadata"] as Record<string, unknown>) : null;
        const userId = metadata ? getString(metadata, "user_id") : null;
        const creditStr = metadata ? getString(metadata, "credit_tokens") : null;
        const credits = creditStr && /^\d+$/.test(creditStr) ? parseInt(creditStr, 10) : 0;
        if (userId && credits > 0) {
          await supabase.rpc("grant_tokens", { user_id_input: userId, tokens: credits, reason: "polar.order.paid", metadata: {}, kind: 'topup' });
        }
        break;
      }

      default:
        break;
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unhandled error";
    if (evtId) {
      try { await supabase.from("idempotency_keys").delete().eq("key", evtId); } catch {}
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}


