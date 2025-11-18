"use client";

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
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const CREDIT_PACK_PRICES = {
  credits_10: { amount: 5, currency: "USD" },
  credits_50: { amount: 18, currency: "USD" },
} as const;

type SubscriptionPlanCode = "pro_monthly";
type CreditPackKey = keyof typeof CREDIT_PACK_PRICES;

const CREDIT_PACKS: Array<{ key: CreditPackKey; label: string; tokens: number }> = [
  { key: "credits_10", label: "10 Credits", tokens: 10 },
  { key: "credits_50", label: "50 Credits", tokens: 50 },
];

type PricingPlan = {
  id: "pro";
  name: string;
  monthlyLabel?: string;
  description: string;
  features: string[];
  cta: string;
};

const plans: PricingPlan[] = [
  {
    id: "pro",
    name: "Pro",
    monthlyLabel: "$19/month",
    description: "Production-ready food photography with predictable monthly credits.",
    features: [
      "60 pro-quality generations / month",
      "Upload dish + background customization",
      "Advanced lens looks & aspect ratios",
      "Full preset library & pro templates",
      "High-quality PNG/JPEG outputs",
      "Priority support + priority queue",
    ],
    cta: "Subscribe to Pro",
  },
];

export default function PricingPage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isEligibleForTopUps, setIsEligibleForTopUps] = useState(false);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const fetchBillingState = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (!data.user?.id) {
          setIsEligibleForTopUps(false);
          return;
        }

        const res = await fetch("/api/billing/balance", { method: "GET" });
        if (!res.ok) {
          setIsEligibleForTopUps(false);
          return;
        }
        const json = await res.json();
        const hasActiveSubscription = Boolean(json?.hasActiveSubscription);
        const remainingCredits = Number(json?.totalCredits ?? json?.balance ?? 0);
        setIsEligibleForTopUps(hasActiveSubscription && remainingCredits <= 0);
      } catch {
        setIsEligibleForTopUps(false);
      }
    };

    void fetchBillingState();
  }, []);
  const startSubscription = useCallback(async (planCode: SubscriptionPlanCode) => {
    try {
      const res = await fetch("/api/billing/start-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode }),
      });
      const json = await res.json();
      if (res.status === 401 || res.status === 403) {
        window.location.href = "/auth/login";
        return;
      }
      if (!res.ok) throw new Error(json?.error || "Checkout failed");
      const type = json?.type as "portal" | "checkout" | undefined;
      const url = json?.url as string | undefined;
      if (!url) throw new Error("No URL returned");
      if (type === "portal") {
        window.location.href = url;
        return;
      }
      window.location.href = url;
    } catch (e) {
      console.error(e);
      alert("Could not start checkout. Please try again.");
    }
  }, []);

  const buyCredits = useCallback(async (lookupKey: CreditPackKey, tokens: number) => {
    try {
      const res = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creditPackTokens: tokens, creditLookupKey: lookupKey }),
      });
      const json = await res.json();
      if (res.status === 401 || res.status === 403) {
        window.location.href = "/auth/login";
        return;
      }
      if (!res.ok) throw new Error(json?.error || "Checkout failed");
      if (json?.url) window.location.href = json.url as string;
    } catch (e) {
      console.error(e);
      alert("Could not start checkout. Please try again.");
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
        <div className="mt-8 grid w-full max-w-xl gap-4 place-items-center">
          {plans.map((plan) => (
            <Card
              className={cn(
                "relative w-full text-left ring-2 ring-primary",
              )}
              key={plan.id}
            >
              <CardHeader>
                <CardTitle className="font-medium text-xl">
                  {plan.name}
                </CardTitle>
                <CardDescription>
                  <p>{plan.description}</p>
                  <span className="font-medium text-foreground">
                    {plan.monthlyLabel}.
                  </span>
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
                <Button className="w-full" onClick={() => startSubscription("pro_monthly")}>
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Need more than 60 generations each month? <a className="underline" href="/contact">Reach out</a> for a custom plan.
        </p>
        {isHydrated && isEligibleForTopUps ? (
          <div className="mt-10 w-full max-w-4xl text-left">
            <h2 className="text-lg font-medium mb-3">Top up your credits</h2>
            <p className="text-sm text-muted-foreground mb-4">Need more credits this month? Top up anytime.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {CREDIT_PACKS.map((pack) => (
                <Card key={pack.key}>
                  <CardHeader>
                    <CardTitle className="text-base">{pack.label}</CardTitle>
                    <CardDescription>
                      {CREDIT_PACK_PRICES[pack.key].currency === "USD" ? (
                        <span className="font-medium text-foreground">${CREDIT_PACK_PRICES[pack.key].amount}</span>
                      ) : (
                        <span className="font-medium text-foreground">
                          {CREDIT_PACK_PRICES[pack.key].amount} {CREDIT_PACK_PRICES[pack.key].currency}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button className="w-full" variant="secondary" onClick={() => buyCredits(pack.key, pack.tokens)}>
                      Buy credits
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
