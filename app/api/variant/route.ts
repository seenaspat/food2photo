import { NextResponse } from "next/server";
import { z } from "zod";
import { generateFoodImage, prepareImageForApi } from "../../../lib/genai";
import { finalizeCredit, reserveCredit } from "../../../lib/metering";
import { isRateLimited, logApiRequest } from "../../../lib/rate-limit";
import { createClient } from "../../../lib/supabase/server";

export const runtime = "nodejs";

const VariantInputSchema = z.object({
	hint: z.string().trim().min(1, "Hint is required").max(250, "Hint too long (max 250)"),
});

export async function POST(request: Request) {
	const requestId = crypto.randomUUID();

	try {
		const supabase = await createClient();
		const { data: authData } = await supabase.auth.getUser();
		const userId = authData.user?.id ?? null;
		if (!userId) return NextResponse.json({ error: "Unauthorized", requestId }, { status: 401, headers: { "X-Request-Id": requestId } });

		const ip = (() => { try { return (request.headers.get('x-forwarded-for') ?? '').split(',')[0] || '0.0.0.0'; } catch { return '0.0.0.0'; } })();
		const routePath = "/api/variant";
		const limited = await isRateLimited(supabase, userId, ip, { perMinute: 15, perHour: 300 }, routePath);
		await logApiRequest(supabase, userId, ip, routePath);
		if (limited) return NextResponse.json({ error: "Rate limit exceeded", requestId }, { status: 429, headers: { "X-Request-Id": requestId } });

		const formData = await request.formData();
		const image = formData.get("image");
		const hintRaw = String(formData.get("hint") || "");

		const parsed = VariantInputSchema.safeParse({ hint: hintRaw });
		if (!parsed.success) {
			return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten(), requestId }, { status: 400, headers: { "X-Request-Id": requestId } });
		}
		const hint = parsed.data.hint;

		if (!(image instanceof File)) {
			return NextResponse.json({ error: "Missing base image", requestId }, { status: 400, headers: { "X-Request-Id": requestId } });
		}

		// Verify GEMINI_API_KEY is available
		if (!process.env.GEMINI_API_KEY) {
			return NextResponse.json({ error: "Missing GEMINI_API_KEY", requestId }, { status: 500, headers: { "X-Request-Id": requestId } });
		}

		const reserved = await reserveCredit(supabase, { userId, requestId, apiRoute: routePath, model: "gemini-3-pro-image-preview", metadata: { kind: "variant" } });
		if (!reserved) return NextResponse.json({ error: "Insufficient credits", requestId }, { status: 402, headers: { "X-Request-Id": requestId } });

		// Prepare image for API
		const arrBuf = await image.arrayBuffer();
		const inputBuffer = Buffer.from(new Uint8Array(arrBuf));
		const baseDataUrl = await prepareImageForApi(inputBuffer, { maxDimension: 1280, quality: 88 });

		const prompt = [
			"You are a professional food photography assistant.",
			"Image A is a high-quality food photo. Generate a new variant that:",
			"- Preserves the dish identity, plating, and overall realism.",
			"- Applies the following subtle creative hint strictly as soft guidance:",
			`USER_HINT: "${hint}"`,
			"Keep lighting and composition plausible for food photography. Avoid surreal or non-food elements.",
		].join("\n");

		// Generate using direct Google GenAI
		const result = await generateFoodImage({
			dishImageUrl: baseDataUrl,
			prompt,
			aspectRatio: "1:1", // Variants maintain original aspect for consistency
			temperature: 0,
		});

		if (!result.success || !result.imageDataUrl) {
			await finalizeCredit(supabase, { userId, requestId, success: false });
			return NextResponse.json({ error: result.error ?? "No image produced", requestId }, { status: 502, headers: { "X-Request-Id": requestId } });
		}

		const outBuffer = Buffer.from(result.base64!, "base64");
		const outType = result.mimeType ?? "image/png";
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
				"X-Request-Id": requestId,
				...(balanceHeader ? { "X-Credit-Balance": balanceHeader } : {}),
			},
		});
		await finalizeCredit(supabase, { userId, requestId, success: true });
		return response;
	} catch (err) {
		const message = err instanceof Error ? err.message : "Unknown error";
		return NextResponse.json({ error: message, requestId }, { status: 500, headers: { "X-Request-Id": requestId } });
	}
}
