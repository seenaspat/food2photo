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

  // Idempotency guard
  const evtId = event.id;
  try {
    await supabase.from("idempotency_keys").insert({ key: evtId }).select("key").single();
  } catch {
    return NextResponse.json({ ok: true, duplicate: true }, { status: 200 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = (session.metadata?.user_id as string | undefined) ?? null;
        if (!userId) break;
        if (session.mode === "subscription") {
          const subId = session.subscription as string;
          if (!subId) break;
          const subscription = await stripe.subscriptions.retrieve(subId);
          const planCode = session.metadata?.plan_code ?? null;
          const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
          await supabase.from("user_subscriptions").upsert({
            user_id: userId,
            plan_code: planCode,
            status: (subscription.status as any),
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
          }, { onConflict: "stripe_subscription_id" });
        } else if (session.mode === "payment") {
          const tokens = Number(session.metadata?.credit_tokens ?? 0);
          const pi = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;
          await supabase.from("credit_purchases").insert({ user_id: userId, tokens_granted: tokens, stripe_payment_intent_id: pi ?? undefined, status: "succeeded" });
          // grant_tokens via RPC
          await supabase.rpc("grant_tokens", { user_id_input: userId, tokens: tokens, reason: "checkout.topup", metadata: {} });
        }
        break;
      }
      case "invoice.paid":
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id ?? null;
        if (!subId) break;
        const { data: rec } = await supabase.from("user_subscriptions").select("user_id, plan_code").eq("stripe_subscription_id", subId).single();
        const userId = rec?.user_id as string | undefined;
        const planCode = rec?.plan_code as string | undefined;
        if (!userId || !planCode) break;
        const { data: plan } = await supabase.from("billing_plans").select("monthly_token_quota").eq("code", planCode).single();
        const quota = Number(plan?.monthly_token_quota ?? 0);
        if (quota > 0) {
          await supabase.rpc("grant_tokens", { user_id_input: userId, tokens: quota, reason: "invoice.renewal", metadata: {}, kind: "subscription" });
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unhandled error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}


