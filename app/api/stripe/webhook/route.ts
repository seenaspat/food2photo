import { headers } from "next/headers";
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createServiceClient } from "../../../../lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const sig = (await headers()).get("stripe-signature") ?? "";
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });

  const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = createServiceClient();
  async function withRetry<T>(fn: () => Promise<T>, attempts = 3, baseMs = 150): Promise<T> {
    let lastErr: unknown;
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (e) {
        lastErr = e;
        await new Promise((r) => setTimeout(r, baseMs * (i + 1)));
      }
    }
    // rethrow
    throw lastErr instanceof Error ? lastErr : new Error(String(lastErr ?? "unknown"));
  }

  // Idempotency guard
  const evtId = event.id;
  try {
    await supabase.from("idempotency_keys").insert({ key: evtId }).select("key").single();
  } catch {
    return NextResponse.json({ ok: true, duplicate: true }, { status: 200 });
  }

  try {
    console.log(`[stripe.webhook] event: ${event.type} id=${event.id}`);
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = (session.metadata?.user_id as string | undefined) ?? null;
        if (!userId) break;
        if (session.mode === "subscription") {
          const subId = session.subscription as string;
          if (!subId) break;
          const subscription = await withRetry(() => stripe.subscriptions.retrieve(subId));
          const planCode = session.metadata?.plan_code ?? null;
          const customerId: string | null =
            typeof session.customer === "string"
              ? session.customer
              : (session.customer && typeof (session.customer as { id?: unknown }).id === "string"
                ? (session.customer as { id: string }).id
                : null);
          await withRetry(async () => await supabase.from("user_subscriptions").upsert({
            user_id: userId,
            plan_code: planCode,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
          }, { onConflict: "stripe_subscription_id" }));
        } else if (session.mode === "payment") {
          const tokens = Number(session.metadata?.credit_tokens ?? 0);
          const pi = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;
          await withRetry(async () => await supabase.rpc("grant_tokens", { user_id_input: userId, tokens: tokens, reason: "checkout.topup", metadata: { stripe_payment_intent_id: pi ?? null }, kind: 'topup' }));
          console.log(`[stripe.webhook] topup granted user=${userId} tokens=${tokens} pi=${pi ?? "unknown"}`);
        }
        break;
      }
      case "invoice.paid":
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id ?? null;
        if (!subId) break;
        const { data: rec } = await withRetry(async () => await supabase.from("user_subscriptions").select("user_id, plan_code").eq("stripe_subscription_id", subId).single());
        const userId = rec?.user_id as string | undefined;
        const planCode = rec?.plan_code as string | undefined;
        if (!userId || !planCode) break;
        const { data: plan } = await withRetry(async () => await supabase.from("billing_plans").select("monthly_token_quota").eq("code", planCode).single());
        const quota = Number(plan?.monthly_token_quota ?? 0);
        if (quota > 0) {
          await withRetry(async () => await supabase.rpc("grant_tokens", { user_id_input: userId, tokens: quota, reason: "invoice.renewal", metadata: {}, kind: 'subscription' }));
          console.log(`[stripe.webhook] subscription grant user=${userId} quota=${quota} sub=${subId}`);
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id ?? null;
        if (!subId) break;
        await withRetry(async () => await supabase.from("user_subscriptions").update({ status: "past_due" }).eq("stripe_subscription_id", subId));
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        let planCode: string | null = null;
        const firstItem = subscription.items?.data?.[0];
        const price = firstItem?.price;
        if (price && typeof price !== "string" && typeof price.lookup_key === "string") {
          planCode = price.lookup_key;
        }
        if (!planCode && subscription.metadata && typeof subscription.metadata["plan_code"] === "string") {
          planCode = subscription.metadata["plan_code"] as string;
        }
        const periodStart = new Date(subscription.current_period_start * 1000).toISOString();
        const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();
        const customerId: string | null =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : (subscription.customer && typeof (subscription.customer as { id?: unknown }).id === 'string'
              ? (subscription.customer as { id: string }).id
              : null);
        const payload = {
          plan_code: planCode,
          status: subscription.status,
          current_period_start: periodStart,
          current_period_end: periodEnd,
          stripe_customer_id: customerId,
          cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
          cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
          canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
        };
        // Update existing row; avoid upsert so we never null out NOT NULL user_id
        await withRetry(async () => await supabase
          .from("user_subscriptions")
          .update(payload)
          .eq("stripe_subscription_id", subscription.id));
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await withRetry(async () => await supabase.from("user_subscriptions").update({ status: "canceled" }).eq("stripe_subscription_id", subscription.id));
        break;
      }
      default:
        break;
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unhandled error";
    try {
      // Allow Stripe to retry by removing the idempotency key when processing fails
      await supabase.from("idempotency_keys").delete().eq("key", evtId);
    } catch {}
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}


