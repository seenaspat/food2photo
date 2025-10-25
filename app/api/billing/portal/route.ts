import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "../../../../lib/supabase/server";
import { getBillingProvider, getPolarClient, getPolarOrganizationId } from "@/lib/polar/server";

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
      const organizationId = getPolarOrganizationId();
      let customerId: string | null = null;

      // 1) Prefer resolving via the user's latest Polar subscription id
      try {
        const { data: subRow } = await supabase
          .from("user_subscriptions")
          .select("stripe_subscription_id")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        const subId = (subRow?.stripe_subscription_id as string | null) ?? null;
        if (subId) {
          const sub = await polar.subscriptions.get({ id: subId });
          customerId = (sub as unknown as { customerId?: string; customer_id?: string }).customerId ?? (sub as unknown as { customer_id?: string }).customer_id ?? null;
        }
      } catch {}

      // 2) Try by externalId (recommended)
      if (!customerId) {
        try {
          const byExt = await polar.customers.getExternal({ externalId: String(userId) });
          customerId = (byExt as { id: string }).id;
        } catch {}
      }
      // 3) Fallback: locate customer by email within the org
      if (!customerId && email) {
        try {
          const iterator = await polar.customers.list({ organizationId, limit: 50, email });
          for await (const page of iterator) {
            const items = (page as { result?: { items?: Array<{ id: string; email?: string | null }> }, items?: Array<{ id: string; email?: string | null }> }).result?.items
              ?? (page as { items?: Array<{ id: string; email?: string | null }> }).items
              ?? [];
            const match = items.find((c) => (c.email ?? null)?.toLowerCase() === email.toLowerCase());
            if (match) { customerId = match.id; break; }
          }
        } catch {}
      }

      // 4) Last resort: create a customer bound to the app user (only if no existing customer)
      if (!customerId) {
        if (!email) return NextResponse.json({ error: "Email required for Polar portal" }, { status: 400 });
        try {
          const created = await polar.customers.create({ externalId: String(userId), email });
          customerId = (created as { id: string }).id;
        } catch (err) {
          // Handle duplicate customer gracefully by resolving existing one
          const msg = err instanceof Error ? err.message : String(err ?? "");
          const isDup = /already exists/i.test(msg);
          if (!isDup) return NextResponse.json({ error: msg || "POLAR customer create failed" }, { status: 500 });
          // Try externalId
          try {
            const itExt = await polar.customers.list({ organizationId, externalId: String(userId) } as unknown as { organizationId: string });
            for await (const page of itExt) {
              const items = (page as { result?: { items?: Array<{ id: string; externalId?: string | null }> }, items?: Array<{ id: string; externalId?: string | null }> }).result?.items
                ?? (page as { items?: Array<{ id: string; externalId?: string | null }> }).items
                ?? [];
              const m = items.find((c) => (c as { externalId?: string | null }).externalId === String(userId));
              if (m) { customerId = m.id; break; }
            }
          } catch {}
          // Fallback to email search again (race conditions)
          if (!customerId) {
            try {
              const itMail = await polar.customers.list({ organizationId, limit: 50, email });
              for await (const page of itMail) {
                const items = (page as { result?: { items?: Array<{ id: string; email?: string | null }> }, items?: Array<{ id: string; email?: string | null }> }).result?.items
                  ?? (page as { items?: Array<{ id: string; email?: string | null }> }).items
                  ?? [];
                const m = items.find((c) => (c.email ?? null)?.toLowerCase() === email.toLowerCase());
                if (m) { customerId = m.id; break; }
              }
            } catch {}
          }
          if (!customerId) return NextResponse.json({ error: "POLAR customer exists but cannot be retrieved" }, { status: 500 });
        }
      }

      const session = await polar.customerSessions.create({ customerId: String(customerId), returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing` });
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


