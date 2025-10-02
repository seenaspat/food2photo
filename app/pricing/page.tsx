"use client";

import NumberFlow from "@number-flow/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const plans = [
  {
    id: "basic",
    name: "Basic",
    price: {
      monthly: "$9/month",
      yearly: "Monthly only",
    },
    description: "Great for solo owners who need a few shots each month.",
    features: [
      "20 generations / month",
      "Upload dish & background",
      "Lens looks & aspect ratios",
      "Curated presets & style templates",
      "Standard-quality PNG/JPEG outputs",
      "Standard support & reliable processing",
    ],
    cta: "Subscribe to Basic",
  },
  {
    id: "pro",
    name: "Pro",
    price: {
      monthly: 29,
      yearly: 278, // used only as a fallback; live prices come from Stripe
    },
    description: "Everything you need for consistent, production‑quality photos.",
    features: [
      "100 generations / month",
      "Upload dish & background customization",
      "Advanced lens looks & aspect ratios",
      "Full preset library & pro templates",
      "High-quality PNG/JPEG outputs",
      "Priority support + priority queue",
    ],
    cta: "Subscribe to Pro",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Business",
    price: {
      monthly: "Get in touch",
      yearly: "Get in touch",
    },
    description: "Custom backgrounds, presets and integrations.",
    features: [
      "Custom backgrounds & presets",
      "SLAs and priority support",
      "Usage-based throughput guarantees",
      "Custom integrations",
    ],
    cta: "Contact us",
  },
];

export default function PricingPage() {
  const [frequency, setFrequency] = useState<string>("monthly");
  const proPlanPriceId = useMemo(() => (frequency === "yearly" ? "pro_yearly" : "pro_monthly"), [frequency]);
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [renewAt, setRenewAt] = useState<string | null>(null);
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [prices, setPrices] = useState<{
    pro?: { monthly?: { unit_amount: number | null; currency: string | null }; yearly?: { unit_amount: number | null; currency: string | null } };
    basic?: { monthly?: { unit_amount: number | null; currency: string | null } };
    credits?: { c10?: { unit_amount: number | null; currency: string | null }; c50?: { unit_amount: number | null; currency: string | null } };
  }>({});
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState<boolean>(false);
  const [loadingBilling, setLoadingBilling] = useState<boolean>(true);
  const [loadingPrices, setLoadingPrices] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        // auth gate
        let authed = false;
        try {
          const supabase = createClient();
          const { data } = await supabase.auth.getUser();
          authed = Boolean(data.user?.id);
          setIsAuthed(authed);
        } catch {}

        if (authed) {
          const res = await fetch("/api/billing/balance", { method: "GET" });
          if (res.ok) {
            const json = await res.json();
            const status = json?.subscription?.status as string | undefined;
            const renew = json?.subscription?.renew_at as string | undefined;
            const willCancel = Boolean(json?.subscription?.cancel_at_period_end);
            const isActive = status === "trialing" || status === "active" || status === "past_due";
            setSubscribed(Boolean(isActive));
            setRenewAt(renew ?? null);
            setCancelAtPeriodEnd(willCancel);
          }
        } else {
          setSubscribed(false);
          setRenewAt(null);
          setCancelAtPeriodEnd(false);
        }
      } catch {} finally { setLoadingBilling(false); }
      try {
        const search = typeof window !== 'undefined' ? window.location.search : '';
        const r = await fetch(`/api/billing/prices${search}`, { method: "GET" });
        const j = await r.json();
        setPrices(j ?? {});
      } catch {} finally { setLoadingPrices(false); }
    })();
  }, []);

  const createCheckout = useCallback(async () => {
    try {
      const body = { planCode: proPlanPriceId };
      const res = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Checkout failed");
      if (json?.url) window.location.href = json.url as string;
    } catch (e) {
      console.error(e);
      alert("Could not start checkout. Please try again.");
    }
  }, [proPlanPriceId]);

  const createBasicCheckout = useCallback(async () => {
    try {
      const body = { planCode: "basic_monthly" };
      const res = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Checkout failed");
      if (json?.url) window.location.href = json.url as string;
    } catch (e) {
      console.error(e);
      alert("Could not start checkout. Please try again.");
    }
  }, []);

  const buyCredits = useCallback(async (lookupKey: string, tokens: number) => {
    try {
      const res = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creditPackTokens: tokens, creditLookupKey: lookupKey }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Checkout failed");
      if (json?.url) window.location.href = json.url as string;
    } catch (e) {
      console.error(e);
      alert("Could not start checkout. Please try again.");
    }
  }, []);

  const openPortal = useCallback(async () => {
    try {
      const res = await fetch("/api/billing/portal", { method: "GET" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Portal failed");
      if (json?.url) window.location.href = json.url as string;
    } catch (e) {
      console.error(e);
      alert("Could not open billing portal. Please try again.");
    }
  }, []);
  return (
    <div className="not-prose flex flex-col gap-16 px-8 py-24 text-center">
      <div className="flex flex-col items-center justify-center gap-8">
        <h1 className="mb-0 text-balance font-medium text-5xl tracking-tighter!">
          Simple, transparent pricing
        </h1>
        <p className="mx-auto mt-0 mb-0 max-w-2xl text-balance text-lg text-muted-foreground">
          Managing a business is hard enough, so why not make your life easier?
          Our pricing plans are simple, transparent and scale with you.
        </p>
        <Tabs value={frequency} onValueChange={setFrequency}>
          <TabsList className="rounded-full bg-zinc-100 dark:bg-zinc-900 p-1 ring-1 ring-zinc-300 dark:ring-zinc-700">
            <TabsTrigger
              value="monthly"
              className="rounded-full px-4 py-1.5 text-zinc-700 dark:text-zinc-300 data-[state=active]:bg-white data-[state=active]:text-zinc-900 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white data-[state=active]:border-zinc-300 dark:data-[state=active]:border-zinc-700"
            >
              Monthly
            </TabsTrigger>
            <TabsTrigger
              value="yearly"
              className="rounded-full px-4 py-1.5 text-zinc-700 dark:text-zinc-300 data-[state=active]:bg-white data-[state=active]:text-zinc-900 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white data-[state=active]:border-zinc-300 dark:data-[state=active]:border-zinc-700"
            >
              Yearly
              <Badge variant="secondary">20% off</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="mt-8 grid w-full max-w-4xl gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              className={cn(
                "relative w-full text-left",
                plan.popular && "ring-2 ring-primary",
              )}
              key={plan.id}
            >
              {plan.popular && (
                <Badge className="-translate-x-1/2 -translate-y-1/2 absolute top-0 left-1/2 rounded-full">
                  Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="font-medium text-xl">
                  {plan.name}
                </CardTitle>
                <CardDescription>
                  <p>{plan.description}</p>
                  {plan.id === "pro" ? (
                    (() => {
                      const p = frequency === "yearly" ? prices.pro?.yearly : prices.pro?.monthly;
                      const amount = p?.unit_amount ?? null;
                      const currency = (p?.currency ?? "USD").toUpperCase();
                      if (loadingPrices) {
                        return (
                          <span className="inline-block h-5 w-28 rounded bg-muted animate-pulse" aria-busy="true" />
                        );
                      }
                      if (typeof amount === "number") {
                        return (
                          <NumberFlow
                            className="font-medium text-foreground"
                            format={{
                              style: "currency",
                              currency,
                              maximumFractionDigits: 0,
                            }}
                            suffix={`/month, billed ${frequency}.`}
                            value={frequency === "yearly" ? Math.round(amount / 12) / 100 : Math.round(amount) / 100}
                          />
                        );
                      }
                      return (
                        <span className="font-medium text-foreground">
                          {plan.price[frequency as keyof typeof plan.price]}.
                        </span>
                      );
                    })()
                  ) : plan.id === "basic" ? (
                    (() => {
                      const p = prices.basic?.monthly;
                      const amount = p?.unit_amount ?? null;
                      const currency = (p?.currency ?? "USD").toUpperCase();
                      if (loadingPrices) {
                        return (
                          <span className="inline-block h-5 w-28 rounded bg-muted animate-pulse" aria-busy="true" />
                        );
                      }
                      if (typeof amount === "number") {
                        return (
                          <NumberFlow
                            className="font-medium text-foreground"
                            format={{ style: "currency", currency, maximumFractionDigits: 0 }}
                            suffix="/month"
                            value={Math.round(amount) / 100}
                          />
                        );
                      }
                      return (
                        <span className="font-medium text-foreground">{plan.price.monthly}.</span>
                      );
                    })()
                  ) : (
                    <span className="font-medium text-foreground">
                      {plan.price[frequency as keyof typeof plan.price]}.
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                {plan.features.map((feature, index) => (
                  <div
                    className="flex items-center gap-2 text-muted-foreground text-sm"
                    key={index}
                  >
                    <BadgeCheck className="h-4 w-4" />
                    {feature}
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                {plan.id === "pro" ? (
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "secondary"}
                    onClick={subscribed ? openPortal : (isAuthed ? createCheckout : () => (window.location.href = "/auth/login"))}
                  >
                    {subscribed ? "Manage billing" : (isAuthed ? plan.cta : "Log in to subscribe")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : plan.id === "basic" ? (
                  <Button className="w-full" variant="secondary" onClick={isAuthed ? createBasicCheckout : () => (window.location.href = "/auth/login") }>
                    {isAuthed ? plan.cta : "Log in to subscribe"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button className="w-full" variant="secondary" onClick={() => (window.location.href = "/contact") }>
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
        {subscribed && (
          <div className="mt-10 w-full max-w-4xl text-left">
            <h2 className="text-lg font-medium mb-3">Top up your credits</h2>
            <p className="text-sm text-muted-foreground mb-4">Need more credits this month? Top up anytime.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { key: "credits_10", label: "10 Credits", tokens: 10, price: prices.credits?.c10 },
              { key: "credits_50", label: "50 Credits", tokens: 50, price: prices.credits?.c50 },
            ].map((pack) => (
              <Card key={pack.key}>
                <CardHeader>
                  <CardTitle className="text-base">{pack.label}</CardTitle>
                  <CardDescription>
                    {loadingPrices ? (
                      <span className="inline-block h-5 w-24 rounded bg-muted animate-pulse" aria-busy="true" />
                    ) : typeof pack.price?.unit_amount === "number" ? (
                      <NumberFlow
                        className="font-medium text-foreground"
                        format={{ style: "currency", currency: (pack.price?.currency ?? "USD").toUpperCase(), maximumFractionDigits: 0 }}
                        value={Math.round(pack.price.unit_amount) / 100}
                      />
                    ) : (
                      <span className="font-medium text-foreground">{pack.key === "credits_10" ? "$5" : "$18"}</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full" variant="secondary" onClick={isAuthed ? () => buyCredits(pack.key, pack.tokens) : () => (window.location.href = "/auth/login")}>
                    {isAuthed ? "Buy credits" : "Log in to buy"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
        )}
        <div className="mt-2 text-sm text-muted-foreground min-h-5">
          {loadingBilling ? (
            <div className="inline-block h-4 w-64 rounded bg-muted animate-pulse" aria-busy="true" />
          ) : subscribed ? (
            cancelAtPeriodEnd ? (
              <>
                <span>Your subscription will not renew.</span>{" "}
                {renewAt ? <span>Access ends on {new Date(renewAt).toLocaleDateString()}.</span> : null}
              </>
            ) : (
              <>
                <span>You have an active subscription.</span>{" "}
                {renewAt ? <span>Renews on {new Date(renewAt).toLocaleDateString()}.</span> : null}
              </>
            )
          ) : (
            <span>No active subscription yet. Choose a plan to get started.</span>
          )}
        </div>
      </div>
    </div>
  );
}
