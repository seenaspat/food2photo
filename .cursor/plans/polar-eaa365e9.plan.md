<!-- eaa365e9-42ee-403d-a3fa-d8678ca31798 34bd1c09-eb01-4166-8d81-011df21d86d7 -->
# Polar Billing Integration

## Summary

Reuse the existing billing UX but replace checkout/portal flows with Polar. Keep Stripe code behind a provider switch so it stays dormant. Add an Account page for profile + conditional credit top-ups gated by the new balance response.

## Steps

1. Configuration & helpers  

- Add a provider switch (e.g. `BILLING_PROVIDER=polar|stripe`) in `app/api/billing/create-checkout-session/route.ts` and other billing handlers so Stripe paths become no-ops when Polar is active.  
- Introduce a thin Polar client helper (e.g. `lib/polar/server.ts`) that reads `POLAR_ACCESS_TOKEN`, `POLAR_ORGANIZATION_ID`, and plan/product env vars.

2. Polar start-subscription endpoint  

- Create `app/api/billing/start-subscription/route.ts` that validates auth, inspects `user_subscriptions`, and calls Polar to either return a portal URL (active) or checkout URL (new).  
- Ensure responses follow `{ type: "portal" | "checkout", url: string }` and respect the billing provider switch.

3. Balance route updates  

- Extend `app/api/billing/balance/route.ts` to include `hasActiveSubscription` and the user’s total credits.  
- Verify credit totals via `get_current_credit_balance` and reuse the active-status logic so the Account page can gate Buy Credits.

4. Pricing API adjustments  

- Update `/api/billing/prices` to short-circuit when Polar is active by reading plan and credit-pack pricing from Polar (or Polar-configured env vars), while retaining the existing Stripe lookup path when the provider is `stripe`.  
- Make sure credit-pack metadata continues to be returned when Polar is active so the frontend can render purchase options.

5. Pricing page UX  

- Keep Basic, Pro, Enterprise, and the credit-pack section, but ensure all actions use the new Polar flows instead of the Stripe checkout endpoints.  
- Unauthenticated users go to `/auth/login?next=/pricing?autoPlan=basic|pro`.  
- When authenticated, call `/api/billing/start-subscription` for subscriptions or the new Polar credit-purchase endpoint for packs; open checkout in the same tab and the portal in a new tab.  
- Add the post-login auto-continue based on `searchParams.autoPlan`.

6. Account experience  

- Add `app/account/page.tsx` showing name/email (via Supabase) plus current balance/subscription state.  
- Mirror the existing dropdown actions: include buttons for Manage Subscription (portal), Buy Credits (when allowed), and Sign out, so the page feels like a fuller version of the menu without removing items from the navbar.  
- Reuse the Polar credit purchase flow from the pricing page for the Buy Credits button when eligible.

7. Navigation tweaks  

- Update `components/site-navbar.tsx` to add an “Account” link in the authenticated dropdown and mobile sheet that routes to `/account`, while keeping the existing Billing and Log out actions unchanged.  
- Ensure mobile sheet mirrors these options.

8. Documentation & env notes  

- Update `.cursor/plans/polar-8d958220.plan.md` (or add a new doc) with Polar-specific env requirements and instructions for flipping between providers.  
- Document any new env vars and describe how to keep Stripe dormant.

### To-dos

- [ ] Add BILLING_PROVIDER switch and Polar helper under lib/polar/
- [ ] Implement /api/billing/start-subscription to talk to Polar and return portal/checkout URLs
- [ ] Extend /api/billing/balance response with hasActiveSubscription and totals
- [ ] Adjust /api/billing/prices to respect billing provider and remove credit packs for Polar
- [ ] Update pricing page CTA flow, remove credits, add auto-continue
- [ ] Implement /account page with profile info, logout, conditional Buy Credits
- [ ] Expose Account link + updated Billing action in site navbar
- [ ] Document new env vars and provider switch details