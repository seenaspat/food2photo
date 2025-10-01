import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { createClient } from "../../../../lib/supabase/server";

export const runtime = "nodejs";

const InputSchema = z.union([
  z.object({ planCode: z.string().min(1), creditPackTokens: z.never().optional() }),
  z.object({ creditPackTokens: z.number().int().positive(), planCode: z.never().optional(), creditLookupKey: z.string().min(1).optional() }),
]);

export async function POST(request: Request) {
  try {
    if (process.env.BILLING_ENABLED !== "true") {
      return NextResponse.json({ error: "Billing disabled" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = InputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 });
    }
    const data = parsed.data as { planCode?: string; creditPackTokens?: number; creditLookupKey?: string };

    const supabase = await createClient();
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
    const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });

    // Identify user
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id ?? null;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const uid: string = userId as string;

    // Duplicate Subscription Guard: if user already has an active/trialing/past_due subscription,
    // route to the Billing Portal instead of creating a new subscription
    const { data: activeSub } = await supabase
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .in("status", ["trialing", "active", "past_due"]) 
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // We will also try to fetch any known customer for attaching future sessions
    const { data: anySub } = await supabase
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    const existingCustomerId: string | null = (activeSub?.stripe_customer_id ?? anySub?.stripe_customer_id ?? null) as string | null;

    // Redirect subscribed users to the Billing Portal only when attempting to start a new subscription.
    if (data.planCode && activeSub) {
      if (!existingCustomerId) {
        return NextResponse.json({ error: "Subscription exists but no Stripe customer associated. Please contact support." }, { status: 400 });
      }
      try {
        const portalConfigId = process.env.STRIPE_BILLING_PORTAL_CONFIGURATION_ID;
        const params: Stripe.BillingPortal.SessionCreateParams = {
          customer: existingCustomerId as string,
          return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
        };
        if (portalConfigId) params.configuration = portalConfigId;
        const portalSession = await stripe.billingPortal.sessions.create(params);
        return NextResponse.json({ url: portalSession.url }, { status: 200 });
      } catch {
        const isLive = stripeSecret.startsWith("sk_live");
        const setupUrl = isLive
          ? "https://dashboard.stripe.com/settings/billing/portal"
          : "https://dashboard.stripe.com/test/settings/billing/portal";
        return NextResponse.json(
          { error: "Stripe Billing Portal not configured. Configure it in the Stripe Dashboard and try again.", setup_url: setupUrl, code: "PORTAL_NOT_CONFIGURED" },
          { status: 409 },
        );
      }
    }

    if (data.planCode) {
      const planCode = data.planCode as string;

      // Prefer Stripe Price lookup_key to avoid ID drift; fallback to DB if not found
      let finalPriceId: string | null = null;
      try {
        const search = await stripe.prices.search({ query: `lookup_key:'${planCode}' AND active:'true'`, limit: 1 });
        if (search.data && search.data[0]?.id) finalPriceId = search.data[0].id;
      } catch {}

      if (!finalPriceId) {
        const { data: plan } = await supabase
          .from("billing_plans")
          .select("stripe_price_id")
          .eq("code", planCode)
          .single();
        if (plan?.stripe_price_id) finalPriceId = plan.stripe_price_id;
      }

      if (!finalPriceId) return NextResponse.json({ error: "Unknown plan" }, { status: 400 });

      const priceIdStr: string = finalPriceId as string;
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: "subscription",
        line_items: [{ price: priceIdStr, quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?success=1`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=1`,
        metadata: { user_id: uid, plan_code: planCode },
      };
      if (existingCustomerId) sessionParams.customer = existingCustomerId;
      const session = await stripe.checkout.sessions.create(sessionParams);
      return NextResponse.json({ url: session.url }, { status: 200 });
    }

    const creditPackTokens = data.creditPackTokens as number;
    // Choose price via lookup_key when provided; fallback to single env price id
    let priceIdForCredits: string | null = null;
    if (data.creditLookupKey) {
      try {
        const search = await stripe.prices.search({ query: `lookup_key:'${data.creditLookupKey}' AND active:'true'`, limit: 1 });
        priceIdForCredits = search.data?.[0]?.id ?? null;
      } catch {}
    }
    if (!priceIdForCredits) {
      const creditPriceId = process.env.STRIPE_CREDIT_PRICE_ID;
      if (!creditPriceId) return NextResponse.json({ error: "Missing STRIPE_CREDIT_PRICE_ID" }, { status: 500 });
      priceIdForCredits = creditPriceId as string;
    }

    const paymentParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      line_items: [{ price: priceIdForCredits as string, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?topup_success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?topup_canceled=1`,
      metadata: { user_id: uid, credit_tokens: String(creditPackTokens) },
    };
    if (existingCustomerId) paymentParams.customer = existingCustomerId;
    const session = await stripe.checkout.sessions.create(paymentParams);
    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


