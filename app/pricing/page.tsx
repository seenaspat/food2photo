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
import { useState } from "react";
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
                  {typeof plan.price[frequency as keyof typeof plan.price] ===
                  "number" ? (
                    <NumberFlow
                      className="font-medium text-foreground"
                      format={{
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                      }}
                      suffix={`/month, billed ${frequency}.`}
                      value={
                        plan.price[
                          frequency as keyof typeof plan.price
                        ] as number
                      }
                    />
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
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "secondary"}
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
