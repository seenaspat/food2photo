import { NextResponse } from "next/server";
import { createServiceClient, createClient } from "../../../../lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
	if (process.env.NODE_ENV === "production") {
		return NextResponse.json({ error: "Not available in production" }, { status: 403 });
	}
	try {
		const supabase = await createClient();
		const { data: authData } = await supabase.auth.getUser();
		const userId = authData.user?.id ?? null;
		if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const service = createServiceClient();
		const [{ data: balance }, { data: purchases }, { data: sub }, { data: keys }] = await Promise.all([
			service.rpc("get_current_credit_balance", { user_id_input: userId }),
			service.from("credit_purchases").select("id, tokens_granted, status, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
			service.from("user_subscriptions").select("plan_code, status, current_period_start, current_period_end, stripe_customer_id, stripe_subscription_id").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).single(),
			service.from("idempotency_keys").select("key, created_at").order("created_at", { ascending: false }).limit(5),
		]);

		return NextResponse.json({
			userId,
			balance: Number(balance ?? 0),
			recentPurchases: purchases ?? [],
			subscription: sub ?? null,
			idempotencyKeys: keys ?? [],
		}, { status: 200 });
	} catch (e) {
		const message = e instanceof Error ? e.message : "Unknown error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
