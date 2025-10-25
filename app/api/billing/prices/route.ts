import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getBillingProvider, getPolarClient, getPolarProductIdForKey } from "@/lib/polar/server";

export const runtime = "nodejs";

type SupportedCurrency = "USD" | "EUR" | "SEK";

function normalizeCurrency(input: string | null | undefined): SupportedCurrency | null {
  const c = (input ?? "").toUpperCase();
  if (c === "USD" || c === "EUR" || c === "SEK") return c;
  return null;
}

function detectCurrencyFromRequest(request: Request): SupportedCurrency {
  const url = new URL(request.url);
  const forced = normalizeCurrency(url.searchParams.get("currency"));
  if (forced) return forced;

  const headers = request.headers;
  const country = (headers.get("x-vercel-ip-country") ?? "").toUpperCase();
  if (country === "SE") return "SEK";
  const EUR_COUNTRIES = new Set([
    "AT","BE","CY","EE","FI","FR","DE","GR","IE","IT","LV","LT","LU","MT","NL","PT","SK","SI","ES"
  ]);
  if (EUR_COUNTRIES.has(country)) return "EUR";

  const acceptLanguage = headers.get("accept-language") ?? "";
  // Try to infer from locale region, e.g., sv-SE, de-DE, fr-FR
  const regionMatch = /-([A-Z]{2})/.exec(acceptLanguage.toUpperCase());
  const region = regionMatch?.[1] ?? "";
  if (region === "SE") return "SEK";
  if (EUR_COUNTRIES.has(region)) return "EUR";

  return "USD";
}

export async function GET(request: Request) {
	try {
		if (process.env.BILLING_ENABLED !== "true") {
			return NextResponse.json({ error: "Billing disabled" }, { status: 400 });
		}

		const wantedCurrency = detectCurrencyFromRequest(request);

		const provider = getBillingProvider();
		if (provider === "polar") {
			// Polar: solo USD y planes mensuales. Leer precios reales desde producto por ID.
			const polar = getPolarClient();
			async function getUsdPriceCentsForKey(key: string): Promise<number | null> {
				const productId = getPolarProductIdForKey(key);
				if (!productId) return null;
				try {
					const product = await polar.products.get({ id: productId });
					for (const price of product.prices ?? []) {
						const p: unknown = price;
						if (
							typeof p === 'object' && p !== null &&
							(price as { amountType?: unknown }).amountType === 'fixed' &&
							typeof (price as { priceAmount?: unknown }).priceAmount === 'number' &&
							typeof (price as { priceCurrency?: unknown }).priceCurrency === 'string' &&
							((price as { priceCurrency: string }).priceCurrency.toLowerCase() === 'usd')
						) {
							return (price as { priceAmount: number }).priceAmount;
						}
					}
					return null;
				} catch {
					return null;
				}
			}

			const [proM, basicM, c10, c50] = await Promise.all([
				getUsdPriceCentsForKey('pro_monthly'),
				getUsdPriceCentsForKey('basic_monthly'),
				getUsdPriceCentsForKey('credits_10'),
				getUsdPriceCentsForKey('credits_50'),
			]);

			const res = NextResponse.json({
				currency: 'USD',
				pro: {
					monthly: { unit_amount: proM, currency: 'usd', lookup_key: 'pro_monthly' },
					yearly: { unit_amount: null, currency: null, lookup_key: null },
				},
				basic: {
					monthly: { unit_amount: basicM, currency: 'usd', lookup_key: 'basic_monthly' },
				},
				credits: {
					c10: { unit_amount: c10, currency: 'usd', lookup_key: 'credits_10' },
					c50: { unit_amount: c50, currency: 'usd', lookup_key: 'credits_50' },
				},
			});
			res.headers.set("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
			res.headers.set("Vary", "X-Vercel-IP-Country, Accept-Language");
			return res;
		}

		const stripeSecret = process.env.STRIPE_SECRET_KEY;
		if (!stripeSecret) return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
		const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });

		// Base Stripe Price lookup_keys. We rely on presentment prices (currency_options)
		const BASE_KEYS = {
			pro_monthly: "pro_monthly",
			pro_yearly: "pro_yearly",
			basic_monthly: "basic_monthly",
			credits_10: "credits_10",
			credits_50: "credits_50",
		} as const;

		async function getByLookupKey(lookupKey: string, desiredCurrency: SupportedCurrency) {
			const search = await stripe.prices.search({
				query: `lookup_key:'${lookupKey}' AND active:'true'`,
				limit: 1,
				expand: ['data.currency_options'],
			});
			const p = search.data?.[0] ?? null;
			if (!p) return { unit_amount: null, currency: null, lookup_key: null } as { unit_amount: number | null; currency: string | null; lookup_key: string | null };
			const presentment = p as Stripe.Price & { currency_options?: Record<string, { unit_amount?: number | null }> };
			const desiredLower = desiredCurrency.toLowerCase();
			const opt = presentment.currency_options?.[desiredLower];
			if (opt && typeof opt.unit_amount === 'number') {
				return { unit_amount: opt.unit_amount ?? null, currency: desiredLower, lookup_key: (p.lookup_key ?? null) as string | null };
			}
			return { unit_amount: p.unit_amount ?? null, currency: p.currency, lookup_key: (p.lookup_key ?? null) as string | null };
		}

		const [proMonthly, proYearly, basicMonthly, credits10, credits50] = await Promise.all([
			getByLookupKey(BASE_KEYS.pro_monthly, wantedCurrency),
			getByLookupKey(BASE_KEYS.pro_yearly, wantedCurrency),
			getByLookupKey(BASE_KEYS.basic_monthly, wantedCurrency),
			getByLookupKey(BASE_KEYS.credits_10, wantedCurrency),
			getByLookupKey(BASE_KEYS.credits_50, wantedCurrency),
		]);

		const res = NextResponse.json({
			currency: wantedCurrency,
			pro: {
				monthly: proMonthly,
				yearly: proYearly,
			},
			basic: {
				monthly: basicMonthly,
			},
			credits: {
				c10: credits10,
				c50: credits50,
			},
		});
		// Cache at the edge for 1 hour, allow stale for a day while revalidating
		res.headers.set("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
		// Ensure cache key varies by geo/language when not forcing via query param
		res.headers.set("Vary", "X-Vercel-IP-Country, Accept-Language");
		return res;
	} catch (e) {
		const message = e instanceof Error ? e.message : "Unknown error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}


