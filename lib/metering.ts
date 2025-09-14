import type { SupabaseClient } from "@supabase/supabase-js";

export interface ReserveParams {
	userId: string;
	requestId: string;
	apiRoute: string;
	model?: string;
	metadata?: Record<string, unknown>;
}

export interface FinalizeParams {
	userId: string;
	requestId: string;
	success: boolean;
}

export async function reserveCredit(client: SupabaseClient, p: ReserveParams): Promise<boolean> {
	const { data, error } = await client.rpc("consume_credits_if_available", {
		user_id_input: p.userId,
		request_id_input: p.requestId,
		api_route_input: p.apiRoute,
		model_input: p.model ?? "",
		metadata_input: p.metadata ?? {},
	});
	if (error) throw error;
	return Boolean(data);
}

export async function finalizeCredit(client: SupabaseClient, p: FinalizeParams): Promise<void> {
	const { error } = await client.rpc("finalize_credit_usage", {
		user_id_input: p.userId,
		request_id_input: p.requestId,
		success: p.success,
	});
	if (error) throw error;
}

export async function getCreditBalance(client: SupabaseClient, userId: string): Promise<number> {
	const { data, error } = await client.rpc("get_current_credit_balance", { user_id_input: userId });
	if (error) throw error;
	return Number(data ?? 0);
}
