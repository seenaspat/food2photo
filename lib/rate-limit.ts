import type { SupabaseClient } from "@supabase/supabase-js";

export interface RateLimitConfig {
	perMinute: number;
	perHour: number;
}

export async function logApiRequest(client: SupabaseClient, userId: string | null, ip: string, apiRoute: string): Promise<void> {
	await client.from("api_request_log").insert({ user_id: userId, ip, api_route: apiRoute });
}

export async function isRateLimited(client: SupabaseClient, userId: string | null, ip: string, cfg: RateLimitConfig, apiRoute: string): Promise<boolean> {
	const now = new Date();
	const oneMinuteAgo = new Date(now.getTime() - 60 * 1000).toISOString();
	const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

	const [{ count: userMin }, { count: userHour }, { count: ipMin }, { count: ipHour }] = await Promise.all([
		client.from("api_request_log").select("id", { count: "exact", head: true }).gte("created_at", oneMinuteAgo).eq("user_id", userId).eq("api_route", apiRoute),
		client.from("api_request_log").select("id", { count: "exact", head: true }).gte("created_at", oneHourAgo).eq("user_id", userId).eq("api_route", apiRoute),
		client.from("api_request_log").select("id", { count: "exact", head: true }).gte("created_at", oneMinuteAgo).eq("ip", ip).eq("api_route", apiRoute),
		client.from("api_request_log").select("id", { count: "exact", head: true }).gte("created_at", oneHourAgo).eq("ip", ip).eq("api_route", apiRoute),
	]);

	const userMinCount = typeof userMin === "number" ? userMin : 0;
	const userHourCount = typeof userHour === "number" ? userHour : 0;
	const ipMinCount = typeof ipMin === "number" ? ipMin : 0;
	const ipHourCount = typeof ipHour === "number" ? ipHour : 0;

	return (
		userMinCount >= cfg.perMinute || userHourCount >= cfg.perHour || ipMinCount >= cfg.perMinute || ipHourCount >= cfg.perHour
	);
}
