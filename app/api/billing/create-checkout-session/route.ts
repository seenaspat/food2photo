import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { createClient } from "../../../../lib/supabase/server";

export const runtime = "nodejs";

const InputSchema = z.union([
  z.object({ planCode: z.string().min(1), creditPackTokens: z.never().optional() }),
  z.object({ creditPackTokens: z.number().int().positive(), planCode: z.never().optional() }),
]);

export async function POST(request: Request) {
  try {
    if (process.env.BILLING_ENABLED !== "true") {
      return NextResponse.json({ error: "Billing disabled" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = InputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = await createClient();
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
    const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });

    // Identify user
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id ?? null;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if ("planCode" in parsed.data) {
      const { planCode } = parsed.data;
      const { data: plan, error } = await supabase
        .from("billing_plans")
        .select("stripe_price_id, name")
        .eq("code", planCode)
        .single();
      if (error || !plan?.stripe_price_id) return NextResponse.json({ error: "Unknown plan" }, { status: 400 });

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?success=1`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=1`,
        metadata: { user_id: userId, plan_code: planCode },
      });
      return NextResponse.json({ url: session.url }, { status: 200 });
    }

    const creditPriceId = process.env.STRIPE_CREDIT_PRICE_ID;
    if (!creditPriceId) return NextResponse.json({ error: "Missing STRIPE_CREDIT_PRICE_ID" }, { status: 500 });

    const { creditPackTokens } = parsed.data as { creditPackTokens: number };
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: creditPriceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?topup_success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?topup_canceled=1`,
      metadata: { user_id: userId, credit_tokens: String(creditPackTokens) },
    });
    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


