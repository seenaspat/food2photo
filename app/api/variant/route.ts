import { NextResponse } from "next/server";
import sharp from "sharp";
import { z } from "zod";
import { createClient } from "../../../lib/supabase/server";
import { isRateLimited, logApiRequest } from "../../../lib/rate-limit";
import { reserveCredit, finalizeCredit } from "../../../lib/metering";

export const runtime = "nodejs";

const VariantInputSchema = z.object({
	hint: z.string().trim().min(1, "Hint is required").max(250, "Hint too long (max 250)"),
});

export async function POST(request: Request) {
	try {
		const supabase = await createClient();
		const { data: authData } = await supabase.auth.getUser();
		const userId = authData.user?.id ?? null;
		if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const ip = (() => { try { return (request.headers.get('x-forwarded-for') ?? '').split(',')[0] || '0.0.0.0'; } catch { return '0.0.0.0'; } })();
		const routePath = "/api/variant";
		const limited = await isRateLimited(supabase, userId, ip, { perMinute: 15, perHour: 300 }, routePath);
		await logApiRequest(supabase, userId, ip, routePath);
		if (limited) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

		const requestId = crypto.randomUUID();

		const formData = await request.formData();
		const image = formData.get("image");
		const hintRaw = String(formData.get("hint") || "");

		const parsed = VariantInputSchema.safeParse({ hint: hintRaw });
		if (!parsed.success) {
			return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
		}
		const hint = parsed.data.hint;

		if (!(image instanceof File)) {
			return NextResponse.json({ error: "Missing base image" }, { status: 400 });
		}

		const reserved = await reserveCredit(supabase, { userId, requestId, apiRoute: routePath, model: "gemini-2.5-flash-image-preview", metadata: { kind: "variant" } });
		if (!reserved) return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });

		const apiKey = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;
		if (!apiKey) {
			await finalizeCredit(supabase, { userId, requestId, success: false });
			return NextResponse.json({ error: "Missing AI_GATEWAY_API_KEY" }, { status: 500 });
		}

		const arrBuf = await image.arrayBuffer();
		const inputBuffer = Buffer.from(new Uint8Array(arrBuf));
		// Compact the input to keep payload small
		const compactJpeg = await sharp(inputBuffer)
			.rotate()
			.resize({ width: 1280, height: 1280, fit: "inside" })
			.jpeg({ quality: 88, mozjpeg: true })
			.toBuffer();
		const baseDataUrl = `data:image/jpeg;base64,${compactJpeg.toString("base64")}`;

		const prompt = [
			"You are a professional food photography assistant.",
			"Image A is a high-quality food photo. Generate a new variant that:",
			"- Preserves the dish identity, plating, and overall realism.",
			"- Applies the following subtle creative hint strictly as soft guidance:",
			`USER_HINT: "${hint}"`,
			"Keep lighting and composition plausible for food photography. Avoid surreal or non-food elements.",
		].join("\n");

		const resp = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: "google/gemini-2.5-flash-image-preview",
				stream: false,
				modalities: ["text", "image"],
				temperature: 0,
				top_p: 0.9,
				messages: [
					{ role: "user", content: [ { type: "text", text: prompt }, { type: "image_url", image_url: { url: baseDataUrl } } ] },
				],
			}),
		});

		if (!resp.ok) {
			const errText = await resp.text();
			await finalizeCredit(supabase, { userId, requestId, success: false });
			return NextResponse.json({ error: `Gateway error: ${resp.status} ${errText}` }, { status: 502 });
		}
		const json = (await resp.json()) as unknown;

		type GatewayResponse = {
			choices?: Array<{ message?: { images?: Array<{ image_url?: { url?: string } }> } }>
		};
		const images =
			typeof json === "object" && json !== null &&
			"choices" in (json as GatewayResponse) && Array.isArray((json as GatewayResponse).choices) &&
			(json as GatewayResponse).choices?.[0]?.message?.images;

		const imageUrl: string | undefined = Array.isArray(images) ? images[0]?.image_url?.url : undefined;
		if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.startsWith("data:image/")) {
			await finalizeCredit(supabase, { userId, requestId, success: false });
			return NextResponse.json({ error: "No image produced" }, { status: 502 });
		}

		const commaIdx = imageUrl.indexOf(",");
		const header = imageUrl.substring(5, commaIdx);
		const outType = header.split(";")[0];
		const b64 = imageUrl.substring(commaIdx + 1);
		const outBuffer = Buffer.from(b64, "base64");
		const outName = outType.includes("jpeg") ? "variant.jpg" : outType.includes("png") ? "variant.png" : "variant.webp";

		let balanceHeader = "";
		try {
			const { data: balance } = await supabase.rpc("get_current_credit_balance", { user_id_input: userId });
			balanceHeader = String(Number(balance ?? 0));
		} catch {}

		const response = new Response(outBuffer, {
			status: 200,
			headers: {
				"Content-Type": outType,
				"Content-Disposition": `attachment; filename=\"${outName}\"`,
				"Cache-Control": "no-store",
				...(balanceHeader ? { "X-Credit-Balance": balanceHeader } : {}),
			},
		});
		await finalizeCredit(supabase, { userId, requestId, success: true });
		return response;
	} catch (err) {
		const message = err instanceof Error ? err.message : "Unknown error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
