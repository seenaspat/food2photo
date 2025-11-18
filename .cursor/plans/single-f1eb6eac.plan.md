<!-- f1eb6eac-d8e6-4e11-94af-2a67eddd5e82 f5135d96-f3c3-40d4-951f-d0c9f6956570 -->
# Single Pro Plan Rollout

## 1. Align billing data & env configuration

- Write a Supabase migration that (a) upserts one `billing_plans` row for `pro_monthly` with `monthly_token_quota = 60` and `monthly_price_cents = 1900`, (b) soft-deprecates/archives any `basic_*` rows, and (c) remaps existing `user_subscriptions` pointing at legacy codes if they exist.
- Update the Polar env/README settings so only the Pro plan remains and the documented price matches $19 (remove the Basic/yearly entries shown below and add any new `POLAR_PRODUCT_ID_PRO_MONTHLY`/price vars if needed).
```101:125:README.md
POLAR_CHECKOUT_PRO_MONTHLY=...
POLAR_CHECKOUT_PRO_YEARLY=...
POLAR_CHECKOUT_BASIC_MONTHLY=...
POLAR_PRICE_PRO_MONTHLY_USD_CENTS=2900
POLAR_PRICE_PRO_YEARLY_USD_CENTS=27800
POLAR_PRICE_BASIC_MONTHLY_USD_CENTS=900
// ...
```


## 2. Harden backend plan handling (Polar-first)

- Restrict plan codes accepted by `/api/billing/start-subscription` and `/api/billing/create-checkout-session` to `pro_monthly`, returning 400 for any other value; keep yearly → monthly normalization just in case older links exist.
- Simplify `/api/billing/prices` so the response only exposes the Pro plan plus the two credit packs (remove the Basic/yearly branches highlighted below) and hardcode the USD amount to the Polar price if present.
```73:150:app/api/billing/prices/route.ts
const [proM, basicM, c10, c50] = await Promise.all([
  getUsdPriceCentsForKey('pro_monthly'),
  getUsdPriceCentsForKey('basic_monthly'),
  // ...
]);
return NextResponse.json({
  pro: { monthly: ..., yearly: ... },
  basic: { monthly: ... },
  credits: { ... }
});
```

- Trim `KNOWN` plan codes in `app/api/polar/webhook/route.ts` to the single plan (still allow mapping old IDs to Pro so renewals don’t break) and make sure the grant logic always uses the 60-token quota pulled from `billing_plans`.
- Double-check `/api/billing/balance`/`lib/billing/summary.server.ts` don’t assume multiple plan tiers (no change expected, but verify).

## 3. Update pricing & generator UI copy

- In `app/pricing/page.tsx`, collapse the `plans` array down to a single Pro card, rewrite the feature bullets to highlight “60 pro-quality generations/month”, and leave a lightweight “Need more? Contact us” line instead of the Business card. Also ensure the CTA still calls `startSubscription("pro_monthly")` and consider moving the billing eligibility check server-side later (current client fetching is acceptable for now, but note it’s not best practice in Next).
```41:85:app/pricing/page.tsx
const plans: PricingPlan[] = [
  { id: "basic", name: "Basic", monthlyLabel: "$9/month", ... },
  { id: "pro", name: "Pro", monthlyLabel: "$29/month", ... },
  { id: "enterprise", name: "Business", monthlyLabel: "Get in touch", ... },
];
```

- Refresh the empty-balance banner in `app/generatorv1/GeneratorV1Client.tsx` so it references the new allowance and no longer asks Basic users to upgrade (detect Pro by `plan.code?.startsWith("pro")` so the logic matches DB values).
```599:620:app/generatorv1/GeneratorV1Client.tsx
{userPlan?.code === "pro"
  ? "Top up your credits..."
  : userPlan?.code === "basic"
  ? "Upgrade to Pro for 100 credits/month..."
  : "View Plans & Pricing"
}
```

- Sweep remaining docs/copy (`docs/prd/food2photo-v1.md`, FAQ, marketing blurbs) for the old limits so everything consistently states “Pro • $19/mo • 60 generations”.

## 4. QA & rollout checklist

- Verify Polar checkout/portal flows with the new product ID and ensure webhook renewals grant 60 credits.
- Create at least one manual subscription + top-up in staging, run `/api/generate` until credits hit zero, and confirm the updated UI copy + credit enforcement work.
- Regression-check credit-pack purchases and the account page balance to confirm no Basic references remain.

### Todos

- `migrate-plan` – Add Supabase migration + env doc updates for the single Pro plan
- `backend-guard` – Tighten billing APIs/webhooks around the lone `pro_monthly` plan
- `ux-update` – Refresh pricing + generator UI copy for $19/60 credits and remove Basic/Business cards
- `qa-regress` – Exercise Polar checkout, renewals, and credit exhaustion flows with the new plan