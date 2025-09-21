import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function GET() {
	try {
		if (process.env.BILLING_ENABLED !== "true") {
			return NextResponse.json({ error: "Billing disabled" }, { status: 400 });
		}
		const stripeSecret = process.env.STRIPE_SECRET_KEY;
		if (!stripeSecret) return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
		const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });

		async function getByLookupKey(lookupKey: string) {
			const res = await stripe.prices.search({ query: `lookup_key:'${lookupKey}' AND active:'true'`, limit: 1 });
			const p = res.data?.[0];
			return p ? { unit_amount: p.unit_amount ?? null, currency: p.currency } : { unit_amount: null, currency: null };
		}

		const [proMonthly, proYearly] = await Promise.all([
			getByLookupKey("pro_monthly"),
			getByLookupKey("pro_yearly"),
		]);

		return NextResponse.json({
			pro: {
				monthly: proMonthly,
				yearly: proYearly,
			},
		});
	} catch (e) {
		const message = e instanceof Error ? e.message : "Unknown error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}


