import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBillingProvider, getPolarPortalUrl, getPolarClient, getPolarOrganizationId, getPolarProductIdForKey } from "@/lib/polar/server";
import Stripe from "stripe";

export const runtime = "nodejs";

type ResponseShape = { type: "portal" | "checkout"; url: string };

const PRO_PLAN_CODE = "pro_monthly";

function normalizePlanCode(input: string): string {
  return input.endsWith("_yearly") ? input.replace(/_yearly$/, "_monthly") : input;
}

export async function POST(request: Request) {
  try {
    if (process.env.BILLING_ENABLED !== "true") {
      return NextResponse.json({ error: "Billing disabled" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const requestedPlan = typeof body?.planCode === "string" && body.planCode.length > 0 ? (body.planCode as string) : null;
    if (!requestedPlan) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    const planCode = normalizePlanCode(requestedPlan);
    if (planCode !== PRO_PLAN_CODE) {
      return NextResponse.json({ error: "Unsupported plan" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id ?? null;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: activeSub } = await supabase
      .from("user_subscriptions")
      .select("stripe_customer_id, status")
      .eq("user_id", userId)
      .in("status", ["trialing", "active", "past_due"]) 
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const provider = getBillingProvider();
    if (provider === "polar") {
      if (activeSub) {
        // Create a customer-bound portal session for the current user
        try {
          const polar = getPolarClient();
          const organizationId = getPolarOrganizationId();
          // Resolve Polar customer via latest subscription id
          const { data: subRow } = await (await createClient())
            .from("user_subscriptions")
            .select("stripe_subscription_id")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();
          let customerId: string | null = null;
          if (subRow?.stripe_subscription_id) {
            const sub = await polar.subscriptions.get({ id: subRow.stripe_subscription_id });
            customerId = (sub as unknown as { customerId?: string; customer_id?: string }).customerId ?? (sub as unknown as { customer_id?: string }).customer_id ?? null;
          }
          // Fallback: search by email if needed
          if (!customerId) {
            const { data: auth } = await (await createClient()).auth.getUser();
            const email = auth.user?.email ?? null;
            if (email) {
              const iterator = await polar.customers.list({ organizationId, limit: 50, email });
              for await (const page of iterator) {
                const items = (page as { items?: Array<{ id: string; email?: string }> }).items ?? [];
                const found = items.find((c) => (c as { email?: string }).email?.toLowerCase() === email.toLowerCase());
                if (found) { customerId = found.id; break; }
              }
            }
          }
          if (customerId) {
            const session = await polar.customerSessions.create({ customerId, returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing` });
            const url = (session as { customerPortalUrl?: string }).customerPortalUrl ?? getPolarPortalUrl();
            const payload: ResponseShape = { type: "portal", url };
            return NextResponse.json(payload, { status: 200 });
          }
        } catch {}
        // Last resort: generic portal URL
        const url = getPolarPortalUrl();
        const payload: ResponseShape = { type: "portal", url };
        return NextResponse.json(payload, { status: 200 });
      }
      // Crear checkout vía SDK asegurando asociación estricta al customer del usuario autenticado
      try {
        const polar = getPolarClient();
        const organizationId = getPolarOrganizationId();

        // Resolver CustomerId en este orden: sub previa -> externalId -> crear
        let customerId: string | null = null;
        try {
          const { data: subRow } = await (await createClient())
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
        if (!customerId) {
          try {
            const byExt = await polar.customers.getExternal({ externalId: String(userId) });
            customerId = (byExt as { id: string }).id;
          } catch {}
        }
        if (!customerId) {
          // email de sesión para prefill; si no existe, usar placeholder válido
          const { data: auth } = await (await createClient()).auth.getUser();
          const emailForCreate = (auth.user?.email ?? "no-email@local");
          const created = await polar.customers.create({ externalId: String(userId), email: emailForCreate });
          customerId = (created as { id: string }).id;
        }

        // Resolver productId
        let productId = getPolarProductIdForKey(planCode) ?? null;
        if (!productId) {
          const iterator = await polar.products.list({ organizationId, limit: 50 });
          for await (const page of iterator) {
            const items = (page as { items?: Array<{ id: string; metadata?: Record<string, unknown> }> })?.items ?? [];
            for (const p of items) {
              const meta = p.metadata ?? {};
              if ((meta as Record<string, unknown>)?.lookup_key === planCode) productId = p.id;
            }
          }
        }
        if (!productId) throw new Error("Polar product not found for planCode");

        // Email para pre-rellenar, pero la asociación la fija customerId/externalCustomerId
        const { data: auth2 } = await (await createClient()).auth.getUser();
        const sessionEmail = auth2.user?.email ?? null;

        const checkout = await polar.checkouts.create({
          products: [productId],
          metadata: { user_id: String(userId), plan_code: planCode },
          customerId: customerId ?? undefined,
          externalCustomerId: String(userId),
          customerEmail: sessionEmail ?? undefined,
          customerMetadata: sessionEmail ? { email: sessionEmail } : undefined,
          successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?success=1`,
        });
        const url = (checkout as { url?: string }).url ?? "";
        if (!url) throw new Error("Polar checkout did not return a URL");
        const payload: ResponseShape = { type: "checkout", url };
        return NextResponse.json(payload, { status: 200 });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }

    // Stripe path
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
    const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });

    if (activeSub?.stripe_customer_id) {
      try {
        const params: Stripe.BillingPortal.SessionCreateParams = {
          customer: activeSub.stripe_customer_id as string,
          return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
        };
        const portalSession = await stripe.billingPortal.sessions.create(params);
        const payload: ResponseShape = { type: "portal", url: portalSession.url ?? "" };
        return NextResponse.json(payload, { status: 200 });
      } catch {
        const isLive = (stripeSecret ?? "").startsWith("sk_live");
        const setupUrl = isLive
          ? "https://dashboard.stripe.com/settings/billing/portal"
          : "https://dashboard.stripe.com/test/settings/billing/portal";
        return NextResponse.json(
          { error: "Stripe Billing Portal not configured. Configure it in the Stripe Dashboard and try again.", setup_url: setupUrl, code: "PORTAL_NOT_CONFIGURED" },
          { status: 409 },
        );
      }
    }

    // No active sub: return checkout URL via Stripe Checkout using lookup_key
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

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      line_items: [{ price: finalPriceId as string, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=1`,
      metadata: { user_id: userId, plan_code: planCode },
    };
    const { data: anySub } = await supabase
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (anySub?.stripe_customer_id) sessionParams.customer = anySub.stripe_customer_id as string;

    const session = await stripe.checkout.sessions.create(sessionParams);
    const payload: ResponseShape = { type: "checkout", url: session.url ?? "" };
    return NextResponse.json(payload, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


