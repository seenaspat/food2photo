import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "../../../../lib/supabase/server";
import { getBillingProvider, getPolarClient } from "@/lib/polar/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    if (process.env.BILLING_ENABLED !== "true") {
      return NextResponse.json({ error: "Billing disabled" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id ?? null;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const provider = getBillingProvider();
    const wantsRedirect = (() => { try { const u = new URL(request.url); return u.searchParams.get("redirect") === "1"; } catch { return false; } })();
    if (provider === "polar") {
      const email = authData.user?.email ?? null;
      const polar = getPolarClient();
      let customerId: string | null = null;
      // Try to locate existing Polar customer by email
      if (email) {
        try {
          const iterator = await polar.customers.list({ email });
          for await (const page of iterator) {
            const items = (page as { result?: { items?: Array<{ id: string; email?: string | null }> } }).result?.items ?? [];
            const match = items.find((c) => (c.email ?? null) === email);
            if (match) { customerId = match.id; break; }
          }
        } catch {}
      }
      if (!customerId) {
        if (!email) return NextResponse.json({ error: "Email required for Polar portal" }, { status: 400 });
        const created = await polar.customers.create({ externalId: String(userId), email });
        customerId = (created as { id: string }).id;
      }
      const session = await polar.customerSessions.create({ customerId: String(customerId) });
      const url = (session as { customerPortalUrl?: string }).customerPortalUrl ?? null;
      if (!url) return NextResponse.json({ error: "Portal unavailable" }, { status: 500 });
      if (wantsRedirect) return NextResponse.redirect(url);
      return NextResponse.json({ url }, { status: 200 });
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
    const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });

    const { data: sub } = await supabase
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const customerId = sub?.stripe_customer_id;
    if (!customerId) return NextResponse.json({ error: "No customer" }, { status: 400 });

    try {
      const portalConfigId = process.env.STRIPE_BILLING_PORTAL_CONFIGURATION_ID;
      const params: Stripe.BillingPortal.SessionCreateParams = {
        customer: customerId,
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
      };
      if (portalConfigId) params.configuration = portalConfigId;
      const session = await stripe.billingPortal.sessions.create(params);
      if (wantsRedirect && session.url) return NextResponse.redirect(session.url);
      return NextResponse.json({ url: session.url }, { status: 200 });
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
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


