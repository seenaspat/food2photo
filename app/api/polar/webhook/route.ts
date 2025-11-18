import { NextResponse } from "next/server";
import { validateEvent } from "@polar-sh/sdk/webhooks";
import { createServiceClient } from "@/lib/supabase/server";
import { getPolarProductIdForKey } from "@/lib/polar/server";

export const runtime = "nodejs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(obj: Record<string, unknown>, key: string): string | null {
  const v = obj[key];
  return typeof v === "string" ? v : null;
}

function getDateFlexible(obj: Record<string, unknown>, snake: string, camel: string): Date | null {
  const sv = obj[snake];
  const cv = obj[camel];
  const v = (typeof sv !== 'undefined') ? sv : cv;
  if (typeof v === 'string' || v instanceof Date) {
    const d = new Date(String(v));
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function computeEventKey(type: string, data: Record<string, unknown>, eventTimestamp?: unknown): string | null {
  const primary =
    getString(data, "id") ||
    getString(data, "subscription_id") ||
    getString(data, "checkout_id") ||
    getString(data, "order_id");
  if (!primary) return null;
  const ts = (eventTimestamp instanceof Date) ? eventTimestamp.toISOString() : (typeof eventTimestamp === 'string' ? eventTimestamp : null);
  return ts ? `polar:${type}:${primary}:${ts}` : `polar:${type}:${primary}`;
}

const KNOWN_PLAN_MAP: Record<string, string> = {
  pro_monthly: "pro_monthly",
  pro_yearly: "pro_monthly",
  basic_monthly: "pro_monthly",
  basic_yearly: "pro_monthly",
};

function canonicalPlanCode(code: string | null): string | null {
  if (!code) return null;
  const normalized = code.endsWith("_yearly") ? code.replace(/_yearly$/, "_monthly") : code;
  return KNOWN_PLAN_MAP[normalized] ?? normalized;
}

function resolvePlanCodeFromPayload(obj: Record<string, unknown>): string | null {
  // 1) product.metadata.lookup_key (Portal plan changes often update product, not metadata)
  const product = isRecord(obj["product"]) ? (obj["product"] as Record<string, unknown>) : null;
  if (product) {
    const pMeta = isRecord(product["metadata"]) ? (product["metadata"] as Record<string, unknown>) : null;
    const lk = pMeta ? getString(pMeta, "lookup_key") : null;
    if (lk) return canonicalPlanCode(lk);
  }
  // 2) metadata.plan_code
  const meta = isRecord(obj["metadata"]) ? (obj["metadata"] as Record<string, unknown>) : null;
  const metaPlan = meta ? getString(meta, "plan_code") : null;
  if (metaPlan) return canonicalPlanCode(metaPlan);
  // 3) Map via configured product/price IDs
  const productId = getString(obj as Record<string, unknown>, "product_id") || (product ? getString(product, "id") : null);
  const priceId = getString(obj as Record<string, unknown>, "price_id") || (isRecord(obj["price"]) ? getString(obj["price"] as Record<string, unknown>, "id") : null);
  for (const [legacyCode, canonical] of Object.entries(KNOWN_PLAN_MAP)) {
    const configured = getPolarProductIdForKey(legacyCode);
    if (configured && (configured === productId || configured === priceId)) return canonicalPlanCode(canonical);
  }
  return null;
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

  try {
    if (!isRecord(event) || typeof event["type"] !== "string") {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    const eventType = String(event["type"]);
    const data = isRecord(event["data"]) ? (event["data"] as Record<string, unknown>) : {};

    // Idempotency key derived from Polar resource id + event type
    const evtTs = (event as Record<string, unknown>)["timestamp"] as unknown;
    const evtKey = computeEventKey(eventType, data, evtTs);
    if (evtKey) {
      const { error: idemErr } = await supabase.from("idempotency_keys").insert({ key: evtKey });
      if (idemErr) {
        const msg = String((idemErr as { message?: unknown })?.message ?? "");
        const code = (idemErr as { code?: unknown })?.code as string | undefined;
        const isDup = code === "23505" || /duplicate|already exists/i.test(msg);
        if (isDup) return NextResponse.json({ ok: true, duplicate: true }, { status: 200 });
        return NextResponse.json({ error: "Idempotency insert failed", details: msg }, { status: 500 });
      }
    }

    switch (eventType) {
      case "checkout.created":
      case "checkout.updated": {
        const status = getString(data, "status");
        if (status !== "succeeded") break; // evitar doble grant en 'confirmed' y luego 'succeeded'
        const metadata = isRecord(data["metadata"]) ? (data["metadata"] as Record<string, unknown>) : (isRecord(data["customer_metadata"]) ? (data["customer_metadata"] as Record<string, unknown>) : null);
        if (!metadata) break;
        const userId = getString(metadata, "user_id");
        const planCode = canonicalPlanCode(getString(metadata, "plan_code"));
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
          const payload = { user_id: userId, plan_code: planCode, status: "active", stripe_subscription_id: subscriptionId } as Record<string, unknown>;
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
      case "subscription.updated":
      case "subscription.active": {
        const subscriptionId = getString(data, "id");
        const status = getString(data, "status") ?? "active";
        const effectiveStart = getDateFlexible(data, "current_period_start", "currentPeriodStart");
        const effectiveEnd = getDateFlexible(data, "current_period_end", "currentPeriodEnd");
        const metadata = isRecord(data["metadata"]) ? (data["metadata"] as Record<string, unknown>) : null;
        const userId = metadata ? getString(metadata, "user_id") : null;
        const planCode = canonicalPlanCode(resolvePlanCodeFromPayload(data));
        if (subscriptionId && userId) {
          const { data: existing } = await supabase
            .from("user_subscriptions")
            .select("id, current_period_start, current_period_end, granted_period_start, plan_quota_snapshot")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          // Use event period if provided; otherwise keep existing to avoid resetting the cycle during plan changes
          const startDate = effectiveStart ?? (existing?.current_period_start ? new Date(String(existing.current_period_start)) : null);
          const endDate = effectiveEnd ?? (existing?.current_period_end ? new Date(String(existing.current_period_end)) : null);
          // Grant as long as we have a reliable cycle start.
          // Polar may omit current_period_end in some transitions; we still want to grant once per cycle.
          const hasStart = Boolean(startDate);
          const hasEnd = Boolean(endDate);
          const payload = {
            user_id: userId,
            plan_code: planCode,
            status,
            current_period_start: startDate ? startDate.toISOString() : (existing?.current_period_start ?? null),
            current_period_end: endDate ? endDate.toISOString() : (existing?.current_period_end ?? null),
            stripe_subscription_id: subscriptionId ?? null,
          } as Record<string, unknown>;
          if (existing?.id) {
            await supabase.from("user_subscriptions").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", existing.id);
          } else {
            await supabase.from("user_subscriptions").insert(payload);
          }

          // Periodic subscription grant (align with Stripe behavior)
          if (planCode && hasStart) {
            const { data: planRec } = await supabase
              .from("billing_plans")
              .select("monthly_token_quota")
              .eq("code", planCode)
              .single();
            const quota = Number(planRec?.monthly_token_quota ?? 0);
            if (quota > 0) {
              // Guards: snapshot + (if we have an end date) ensure no grant exists inside this period
              const grantedISO = existing?.granted_period_start ? new Date(String(existing.granted_period_start)).toISOString() : null;
              const currISO = (startDate as Date).toISOString();
              const alreadySnapshotted = grantedISO === currISO;
              let alreadyGranted = false;
              if (hasEnd) {
                const periodStartISO = (startDate as Date).toISOString();
                const periodEndISO = (endDate as Date).toISOString();
                const { data: inPeriodGrant } = await supabase
                  .from("credit_purchases")
                  .select("id")
                  .eq("user_id", userId)
                  .eq("kind", "subscription")
                  .gte("created_at", periodStartISO)
                  .lt("created_at", periodEndISO)
                  .limit(1)
                  .maybeSingle();
                alreadyGranted = Boolean(inPeriodGrant);
              }
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
              } else if (hasEnd) {
                // Mid-cycle upgrade delta (prorated): quota increased within same period
                const previousSnapshot = Number(existing.plan_quota_snapshot ?? 0);
                if (quota > previousSnapshot) {
                  const now = new Date();
                  const totalMs = (endDate as Date).getTime() - (startDate as Date).getTime();
                  const remainingMs = (endDate as Date).getTime() - now.getTime();
                  const remainingFraction = totalMs > 0 ? Math.max(0, Math.min(1, remainingMs / totalMs)) : 0;
                  const deltaBase = quota - previousSnapshot;
                  const deltaTokens = Math.floor(deltaBase * remainingFraction);
                  if (deltaTokens > 0) {
                    await supabase.rpc("grant_tokens", {
                      user_id_input: userId,
                      tokens: deltaTokens,
                      reason: "polar.subscription.upgrade-delta",
                      metadata: {},
                      kind: 'subscription',
                    });
                  }
                  // Update snapshot to the new plan quota to make this idempotent
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
        // 1) If this is a subscription order, Polar includes a nested subscription with period info → update + grant
        const sub = isRecord(data["subscription"]) ? (data["subscription"] as Record<string, unknown>) : null;
        if (sub) {
          const subId = getString(sub, "id");
          const subsMeta = isRecord(sub["metadata"]) ? (sub["metadata"] as Record<string, unknown>) : null;
          const userId = subsMeta ? getString(subsMeta, "user_id") : null;
          const planCode = canonicalPlanCode(subsMeta ? getString(subsMeta, "plan_code") : null);
          const startDate = getDateFlexible(sub, "current_period_start", "currentPeriodStart");
          const endDate = getDateFlexible(sub, "current_period_end", "currentPeriodEnd");
          if (subId && userId) {
            const { data: existing } = await supabase
              .from("user_subscriptions")
              .select("id, current_period_start, current_period_end, granted_period_start, plan_quota_snapshot")
              .eq("stripe_subscription_id", subId)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            const effectiveStart = startDate ?? (existing?.current_period_start ? new Date(String(existing.current_period_start)) : null);
            const effectiveEnd = endDate ?? (existing?.current_period_end ? new Date(String(existing.current_period_end)) : null);
            const hasStart = Boolean(effectiveStart);
            const hasEnd = Boolean(effectiveEnd);

            const payload = {
              user_id: userId,
              plan_code: planCode,
              status: "active",
              current_period_start: hasStart ? (effectiveStart as Date).toISOString() : (existing?.current_period_start ?? null),
              current_period_end: hasEnd ? (effectiveEnd as Date).toISOString() : (existing?.current_period_end ?? null),
              stripe_subscription_id: subId,
            } as Record<string, unknown>;
            if (existing?.id) {
              await supabase.from("user_subscriptions").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", existing.id);
            } else {
              await supabase.from("user_subscriptions").insert(payload);
            }

            if (planCode && hasStart) {
              const { data: planRec } = await supabase
                .from("billing_plans")
                .select("monthly_token_quota")
                .eq("code", planCode)
                .single();
              const quota = Number(planRec?.monthly_token_quota ?? 0);
              if (quota > 0) {
                const grantedISO = existing?.granted_period_start ? new Date(String(existing.granted_period_start)).toISOString() : null;
              const currISO = (effectiveStart as Date).toISOString();
                const alreadySnapshotted = grantedISO === currISO;
                let alreadyGranted = false;
                if (hasEnd) {
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
                  alreadyGranted = Boolean(inPeriodGrant);
                }
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
                }
              }
            }
          }
        }

        // 2) Top-ups via order.paid are granted only in production (sandbox uses checkout.updated)
        if ((process.env.POLAR_ENV ?? "production").toLowerCase() !== "sandbox") {
          const metadata = isRecord(data["metadata"]) ? (data["metadata"] as Record<string, unknown>) : null;
          const userId = metadata ? getString(metadata, "user_id") : null;
          const creditStr = metadata ? getString(metadata, "credit_tokens") : null;
          const credits = creditStr && /^\d+$/.test(creditStr) ? parseInt(creditStr, 10) : 0;
          if (userId && credits > 0) {
            await supabase.rpc("grant_tokens", { user_id_input: userId, tokens: credits, reason: "polar.order.paid", metadata: {}, kind: 'topup' });
          }
        }
        break;
      }

      default:
        break;
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unhandled error";
    // Best effort: no delete of idempotency key here since we derive keys; failures should be visible
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}


