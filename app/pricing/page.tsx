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
    id: "hobby",
    name: "Hobby",
    price: {
      monthly: "Free forever",
      yearly: "Free forever",
    },
    description: "Perfect to try Food2Photo and share a few results.",
    features: [
      "20 generations / month",
      "Upload dish + optional background",
      "Lens look & aspect ratio controls",
      "Standard quality outputs",
      "Basic email support",
    ],
    cta: "Get started for free",
  },
  {
    id: "pro",
    name: "Pro",
    price: {
      monthly: 19,
      yearly: 15,
    },
    description: "Everything you need for consistent, production-quality photos.",
    features: [
      "Unlimited generations",
      "Background presets & style templates",
      "Priority queue + faster processing",
      "High-quality PNG/JPEG outputs",
      "Priority email support",
    ],
    cta: "Subscribe to Pro",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: {
      monthly: "Get in touch for pricing",
      yearly: "Get in touch for pricing",
    },
    description: "Security, customization and higher throughput for teams.",
    features: [
      "Custom presets & model configuration",
      "SLAs and priority support",
      "Team seats & role-based access",
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
  const [stripePrices, setStripePrices] = useState<{ monthly?: { unit_amount: number | null, currency: string | null }, yearly?: { unit_amount: number | null, currency: string | null } }>({});
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState<boolean>(false);
  const [loadingBilling, setLoadingBilling] = useState<boolean>(true);
  const [loadingPrices, setLoadingPrices] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        // auth gate
        try {
          const supabase = createClient();
          const { data } = await supabase.auth.getUser();
          setIsAuthed(Boolean(data.user?.id));
        } catch {}

        const res = await fetch("/api/billing/balance", { method: "GET" });
        const json = await res.json();
        const status = json?.subscription?.status as string | undefined;
        const renew = json?.subscription?.renew_at as string | undefined;
        const willCancel = Boolean(json?.subscription?.cancel_at_period_end);
        const isActive = status === "trialing" || status === "active" || status === "past_due";
        setSubscribed(Boolean(isActive));
        setRenewAt(renew ?? null);
        setCancelAtPeriodEnd(willCancel);
      } catch {} finally { setLoadingBilling(false); }
      try {
        const r = await fetch("/api/billing/prices", { method: "GET", cache: "no-store" });
        const j = await r.json();
        setStripePrices(j?.pro ?? {});
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
        <Tabs defaultValue={frequency} onValueChange={setFrequency}>
          <TabsList>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">
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
                      const p = frequency === "yearly" ? stripePrices.yearly : stripePrices.monthly;
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
                ) : plan.id === "hobby" ? (
                  <Button className="w-full" variant="secondary" onClick={() => (window.location.href = "/auth/sign-up") }>
                    {plan.cta}
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
