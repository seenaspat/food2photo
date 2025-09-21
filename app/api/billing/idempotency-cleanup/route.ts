import { NextResponse } from "next/server";
import { createServiceClient } from "../../../../lib/supabase/server";

export const runtime = "nodejs";

export async function POST() {
	if (process.env.NODE_ENV === "production") {
		return NextResponse.json({ error: "Not available in production" }, { status: 403 });
	}
	try {
		const days = Number(process.env.IDEMPOTENCY_CLEANUP_DAYS ?? 30);
		const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
		const svc = createServiceClient();
		const { error } = await svc.from("idempotency_keys").delete().lt("created_at", cutoff);
		if (error) throw error;
		return NextResponse.json({ ok: true, deleted_before: cutoff }, { status: 200 });
	} catch (e) {
		const message = e instanceof Error ? e.message : "Unknown error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}


