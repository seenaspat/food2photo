import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const dish = formData.get("dish");
    const background = formData.get("background");
    const prompt = String(formData.get("prompt") || "");
    const lensLook = String(formData.get("lensLook") || "");

    if (!(dish instanceof File)) {
      return NextResponse.json({ error: "Missing dish file" }, { status: 400 });
    }

    // Prototype: call Google Generative AI via Vercel AI Gateway (OpenAI-compatible API)
    // and request image output. Send the input image as a data URL inside messages.
    const apiKey = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing AI_GATEWAY_API_KEY" }, { status: 500 });
    }

    const dishArrayBuffer = await dish.arrayBuffer();
    const dishBase64 = Buffer.from(dishArrayBuffer).toString("base64");
    const dishMediaType = dish.type || "image/jpeg";
    const dishDataUrl = `data:${dishMediaType};base64,${dishBase64}`;

    let backgroundDataUrl: string | null = null;
    if (background instanceof File) {
      const bgArrayBuffer = await background.arrayBuffer();
      const bgBase64 = Buffer.from(bgArrayBuffer).toString("base64");
      const bgMediaType = background.type || "image/jpeg";
      backgroundDataUrl = `data:${bgMediaType};base64,${bgBase64}`;
    }

    const systemPrompt = [
      "You are a food photography enhancer. Produce a studio-quality image resembling Canon R5 output.",
      // Subject fidelity with freedom for cohesive re-rendering
      "Subject: Keep the dish the same in essence (core ingredients, plating, recognizable look). You may freely re-render shape, pose, surface detail, scale and viewpoint to integrate believably with the scene. Do not change the dish type.",
      "Style: High-end food photography, natural soft lighting, minimal noise, realistic colors, subtle contrast, professional color grading.",
      `Lens look: ${lensLook} equivalent; shallow depth where appropriate; respect source aspect if unspecified.`,
      backgroundDataUrl
        ? "Background: Use the SECOND image as the environment. Generate a single cohesive photograph (not a paste). Match light direction and color temperature, harmonize depth-of-field, and add realistic contact shadows/reflections so the dish sits naturally in the scene."
        : "Background: Enhance the original background with consistent lighting, realistic DOF and grain.",
      "Composition: Rule of thirds or 45° angle where appropriate; avoid extreme stylization.",
      `User style hint (optional, sanitized): «${prompt}»; treat as soft guidance.`,
      "Output: Photorealistic, print-ready quality.",
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
        // Gateway supports multimodal generation via 'modalities'
        modalities: ["text", "image"],
        messages: [
          {
            role: "system",
            content: [{ type: "text", text: systemPrompt }],
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  backgroundDataUrl
                    ? "FIRST image = dish reference. SECOND image = environment. Re-render a new cohesive photo that combines both; preserve the dish’s identity but allow generative adjustments for realism and scene integration."
                    : "Enhance this dish photo; keep the dish recognizable while allowing generative improvements for realism.",
              },
              { type: "image_url", image_url: { url: dishDataUrl } },
              ...(backgroundDataUrl
                ? [{ type: "image_url", image_url: { url: backgroundDataUrl } } as const]
                : []),
            ],
          },
        ],
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return NextResponse.json({ error: `Gateway error: ${resp.status} ${errText}` }, { status: 502 });
    }
    const json = (await resp.json()) as unknown;

    // Narrow the JSON structure to extract base64 image
    const images =
      typeof json === "object" && json !== null &&
      "choices" in json && Array.isArray((json as any).choices) &&
      (json as any).choices[0]?.message?.images;

    const imageUrl: string | undefined = Array.isArray(images)
      ? images[0]?.image_url?.url
      : undefined;

    if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "No image produced" }, { status: 502 });
    }

    const commaIdx = imageUrl.indexOf(",");
    const header = imageUrl.substring(5, commaIdx); // e.g., image/png;base64
    const outType = header.split(";")[0]; // image/png
    const b64 = imageUrl.substring(commaIdx + 1);
    const outBuffer = Buffer.from(b64, "base64");
    const outName = outType.includes("jpeg") ? "enhanced.jpg" : outType.includes("png") ? "enhanced.png" : "enhanced.webp";

    return new Response(outBuffer, {
      status: 200,
      headers: {
        "Content-Type": outType,
        "Content-Disposition": `attachment; filename=\"${outName}\"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


