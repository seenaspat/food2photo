export type BillingProvider = "stripe" | "polar";

export function getBillingProvider(): BillingProvider {
  const provider = (process.env.BILLING_PROVIDER ?? "stripe").toLowerCase();
  return provider === "polar" ? "polar" : "stripe";
}

export function getPolarPortalUrl(): string {
  const url = process.env.POLAR_PORTAL_URL;
  if (!url) throw new Error("Missing POLAR_PORTAL_URL");
  return url;
}

export function getPolarCheckoutUrlForPlan(planCode: string): string {
  const directKey = `POLAR_CHECKOUT_${planCode.toUpperCase()}`;
  let url = process.env[directKey];
  if (!url && (planCode.endsWith("_monthly") || planCode.endsWith("_yearly"))) {
    const base = planCode.replace(/_(monthly|yearly)$/i, "");
    const baseKey = `POLAR_CHECKOUT_${base.toUpperCase()}`;
    url = process.env[baseKey];
  }
  if (!url) throw new Error(`Missing ${directKey}`);
  return url;
}

export function getPolarCheckoutUrlForCredits(lookupKey: string): string {
  const key = `POLAR_CHECKOUT_${lookupKey.toUpperCase()}`;
  const url = process.env[key];
  if (!url) throw new Error(`Missing ${key}`);
  return url;
}

export type SupportedCurrency = "USD" | "EUR" | "SEK";

export function readPolarPriceCents(keyBase: string, currency: SupportedCurrency): number | null {
  const envKey = `POLAR_PRICE_${keyBase.toUpperCase()}_${currency}_CENTS`;
  const val = process.env[envKey];
  if (!val) return null;
  const n = Number(val);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

 // SDK Client
import { Polar } from "@polar-sh/sdk";

export function getPolarClient() {
  const token = process.env.POLAR_ACCESS_TOKEN;
  if (!token) throw new Error("Missing POLAR_ACCESS_TOKEN");
  const server = (process.env.POLAR_ENV ?? "production").toLowerCase();
  const isSandbox = server === "sandbox" || server === "test";
  return new Polar({ accessToken: token, server: isSandbox ? "sandbox" : "production" });
}

export function getPolarOrganizationId(): string {
  const orgId = process.env.POLAR_ORGANIZATION_ID;
  if (!orgId) throw new Error("Missing POLAR_ORGANIZATION_ID");
  return orgId;
}

export function getPolarProductIdForKey(key: string): string | null {
  const upper = key.toUpperCase();
  const tryKeys = (names: string[]): string | null => {
    for (const name of names) {
      const v = process.env[name];
      if (v) return v as string;
    }
    return null;
  };

  // Direct patterns for the exact key
  const direct = tryKeys([
    `POLAR_PRODUCT_ID_${upper}`,
    `POLAR_PRICE_ID_${upper}`,
    `POLAR_PRODUCT_${upper}`,
    `POLAR_PRICE_${upper}`,
  ]);
  if (direct) return direct;

  // Base variant without _MONTHLY/_YEARLY
  const base = key.replace(/_(monthly|yearly)$/i, "");
  const baseUpper = base.toUpperCase();
  const baseMatch = tryKeys([
    `POLAR_PRODUCT_ID_${baseUpper}`,
    `POLAR_PRICE_ID_${baseUpper}`,
    `POLAR_PRODUCT_${baseUpper}`,
    `POLAR_PRICE_${baseUpper}`,
  ]);
  if (baseMatch) return baseMatch;

  // Credits alt naming using PACK_*
  if (/^CREDITS_/i.test(upper)) {
    const packUpper = upper.replace(/^CREDITS_/i, "PACK_");
    const packDirect = tryKeys([
      `POLAR_PRODUCT_ID_${packUpper}`,
      `POLAR_PRICE_ID_${packUpper}`,
      `POLAR_PRODUCT_${packUpper}`,
      `POLAR_PRICE_${packUpper}`,
    ]);
    if (packDirect) return packDirect;
  }

  return null;
}


