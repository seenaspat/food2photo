import { NextResponse } from "next/server";
import { loadCatalog } from "../../../lib/backgrounds/catalog.server";

export const runtime = "nodejs";

export async function GET(request: Request) {
	try {
		const url = new URL(request.url);
		const family = url.searchParams.get("family") || undefined;
		const limit = Math.max(0, Math.min(100, Number(url.searchParams.get("limit") || 50)));
		const offset = Math.max(0, Number(url.searchParams.get("offset") || 0));

		const catalog = await loadCatalog();
		const families = catalog.families;
		let items = catalog.items;
		if (family) items = items.filter(i => i.familyId === family);
		const total = items.length;
		const page = items.slice(offset, offset + limit);
		return NextResponse.json({ families, items: page, total, limit, offset });
	} catch (err) {
		const message = err instanceof Error ? err.message : "Unknown error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
