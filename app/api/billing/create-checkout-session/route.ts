import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { createClient } from "../../../../lib/supabase/server";
import { getBillingProvider, getPolarCheckoutUrlForCredits, getPolarPortalUrl, getPolarClient, getPolarOrganizationId, getPolarProductIdForKey } from "@/lib/polar/server";

export const runtime = "nodejs";

const InputSchema = z.union([
  z.object({ planCode: z.string().min(1), creditPackTokens: z.never().optional() }),
  z.object({ creditPackTokens: z.number().int().positive(), planCode: z.never().optional(), creditLookupKey: z.string().min(1).optional() }),
]);

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
    const parsed = InputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 });
    }
    const data = parsed.data as { planCode?: string; creditPackTokens?: number; creditLookupKey?: string };

    const supabase = await createClient();

    // Identify user
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id ?? null;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const uid: string = userId as string;
    const userEmail: string | null = (authData.user?.email ?? null) as string | null;

    // Duplicate Subscription Guard (provider-agnostic)
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

    // Redirect subscribed users to the Billing Portal/Polar Portal when attempting to start a new subscription.
    if (data.planCode && activeSub) {
      const provider = getBillingProvider();
      if (provider === "polar") {
        const url = getPolarPortalUrl();
        return NextResponse.json({ url }, { status: 200 });
      }
      const stripeSecret = process.env.STRIPE_SECRET_KEY;
      if (!stripeSecret) return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
      if (!existingCustomerId) {
        return NextResponse.json({ error: "Subscription exists but no Stripe customer associated. Please contact support." }, { status: 400 });
      }
      const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });
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

    if (data.planCode) {
      const planCode = normalizePlanCode(data.planCode as string);
      if (planCode !== PRO_PLAN_CODE) {
        return NextResponse.json({ error: "Unsupported plan" }, { status: 400 });
      }

      const provider = getBillingProvider();
      if (provider === "polar") {
        // Crear checkout vía SDK asegurando asociación al customer del usuario autenticado
        try {
          const polar = getPolarClient();
          const organizationId = getPolarOrganizationId();

          // Resolver customer Polar por sub previa, por email, o crearlo si no existe
          let customerId: string | null = null;
          try {
            const { data: subRow } = await supabase
              .from("user_subscriptions")
              .select("stripe_subscription_id")
              .eq("user_id", uid)
              .order("created_at", { ascending: false })
              .limit(1)
              .single();
            const subId = (subRow?.stripe_subscription_id as string | null) ?? null;
            if (subId) {
              const sub = await polar.subscriptions.get({ id: subId });
              customerId = (sub as unknown as { customerId?: string; customer_id?: string }).customerId ?? (sub as unknown as { customer_id?: string }).customer_id ?? null;
            }
          } catch {}
          // 2) Buscar por externalId (recomendado por Polar) y crear si no existe
          if (!customerId) {
            try {
              const byExt = await polar.customers.getExternal({ externalId: String(uid) });
              customerId = (byExt as { id: string }).id;
            } catch {}
          }
          if (!customerId) {
            const emailForCreate = userEmail ?? "no-email@local";
            const created = await polar.customers.create({ externalId: String(uid), email: emailForCreate });
            customerId = (created as { id: string }).id;
          }

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
          const checkout = await polar.checkouts.create({
            products: [productId],
            metadata: { user_id: uid, plan_code: planCode },
            customerId: customerId ?? undefined,
            customerEmail: userEmail ?? undefined,
            externalCustomerId: String(uid),
            customerMetadata: userEmail ? { email: userEmail } : undefined,
            successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?success=1`,
          });
          const url = (checkout as { url?: string }).url ?? "";
          if (!url) throw new Error("Polar checkout did not return a URL");
          return NextResponse.json({ url }, { status: 200 });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          return NextResponse.json({ error: message }, { status: 500 });
        }
      }

      const stripeSecret = process.env.STRIPE_SECRET_KEY;
      if (!stripeSecret) return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
      const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });

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
    const provider = getBillingProvider();
    if (provider === "polar") {
      const lookupKey = (data.creditLookupKey as string | undefined) ?? (creditPackTokens === 50 ? "credits_50" : "credits_10");
      try {
        const polar = getPolarClient();
        const organizationId = getPolarOrganizationId();

        // Resolver productId a partir de env y/o listado
        let productId: string | null = getPolarProductIdForKey(lookupKey);

        // Si el id proviene de un PRICE_ID, intentamos validar como productId o mapearlo buscando el price dentro de los productos
        const ensureProductId = async (maybeId: string | null): Promise<string | null> => {
          if (!maybeId) return null;
          try {
            const prod = await polar.products.get({ id: maybeId });
            if (prod?.id) return prod.id as string;
          } catch {}
          // Buscar producto cuyo price coincida con maybeId (priceId)
          try {
            const it = await polar.products.list({ organizationId, limit: 50 });
            for await (const page of it) {
              const items = (page as { items?: Array<{ id: string; prices?: Array<{ id?: string }> }> })?.items ?? [];
              for (const p of items) {
                const prices = (p.prices ?? []) as Array<{ id?: string }>;
                if (prices.some((pr) => pr.id === maybeId)) return p.id as string;
              }
            }
          } catch {}
          return null;
        };

        productId = await ensureProductId(productId);

        if (!productId) {
          const iterator = await polar.products.list({ organizationId, limit: 50 });
          for await (const page of iterator) {
            const items = (page as { items?: Array<{ id: string; metadata?: Record<string, unknown> }> })?.items ?? [];
            for (const p of items) {
              const meta = p.metadata ?? {};
              if ((meta as Record<string, unknown>)?.lookup_key === lookupKey) productId = p.id;
            }
          }
        }

        if (!productId) {
          // Último recurso: URL directa si está definida
          try {
            const direct = getPolarCheckoutUrlForCredits(lookupKey);
            return NextResponse.json({ url: direct }, { status: 200 });
          } catch {}
          return NextResponse.json({ error: "Polar product not found for credits" }, { status: 400 });
        }

        const checkout = await polar.checkouts.create({
          products: [productId],
          metadata: { user_id: uid, credit_tokens: String(creditPackTokens) },
          externalCustomerId: String(uid),
          customerEmail: userEmail ?? undefined,
          customerMetadata: userEmail ? { email: userEmail } : undefined,
          successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?topup_success=1`,
        });
        const url = (checkout as { url?: string }).url ?? "";
        if (!url) throw new Error("Polar checkout did not return a URL");
        return NextResponse.json({ url }, { status: 200 });
      } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
      }
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
    const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });

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


