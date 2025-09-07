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

    const effectiveLensLook = lensLook && lensLook.trim().length > 0 ? lensLook : "50mm prime lens";
    const narrativeText = [
      backgroundDataUrl
        ? "Image 1 = dish reference only. Image 2 = environment. Discard all of image 1's background/table/lighting and re-render a single cohesive commercial food photograph that merges the subject into the environment. Do not paste or superimpose."
        : "Using the provided image as the dish reference, re-render a single cohesive commercial food photograph; do not keep the original backdrop if it conflicts with the scene.",
      "Preserve the dish's core identity (primary components and cuisine) while allowing tasteful enhancements for appetite appeal. You may freshen wilted elements, add minimal garnish consistent with the cuisine, subtly increase moisture/juiciness, add gentle glaze/sheens, crisp edges, slight melting/stretch where plausible, re-stack or tidy arrangement, and adjust sauce quantity/placement. Do not invent new major components or change the dish type.",
      `Camera and angle: ${effectiveLensLook} look, slightly elevated 45° or eye-level depending on what best flatters the dish. Shallow depth of field with natural, believable bokeh.`,
      "Camera geometry: Adopt the environment's horizon line (eye level) and principal vanishing points. Match camera pitch, yaw and roll to image 2. If the requested lens look conflicts, prioritize matching the environment field-of-view.",
      "Projection consistency: Render the serving vessel or support surface with correct projection—ellipse for rims/tops and cylinders for glasses/bowls—whose minor/major axis ratio matches camera height. For flat foods (e.g., pizzas, toasts, pastries), align the top plane and edges to the environment's vanishing directions. Align utensil foreshortening with those directions as well.",
      backgroundDataUrl
        ? "Physical placement: Place the subject (and its serving vessel if present) on the nearest table plane in image 2 at realistic scale. Align the vessel rim/top and any straight edges to the environment perspective."
        : "Physical placement: Place the subject (and its serving vessel if present) on a plausible tabletop consistent with the scene, aligned to perspective.",
      "Surface contact: The base of the serving vessel or the subject itself must be flush with the tabletop with no visible gap. Add an ambient-occlusion ring at contact, darkest near the base and fading out.",
      "Occlusion: The subject/vessel must occlude any table grain/seams directly beneath it (no visible lines passing through).",
      "Environment preservation: Do not alter environment geometry. Straight lines remain straight; table plank seams, tile grout and window frames keep their perspective and spacing. Only add occlusion, contact shadows and, if applicable, soft reflections.",
      "Projective constraint: Parallel lines on the table must converge to the same vanishing point with no local warping or curvature. Do not bend or misalign seams around the subject; simply interrupt them at occlusion and continue beyond.",
      backgroundDataUrl
        ? "Lighting and integration: Match the environment's light direction and color temperature. Add grounded contact shadows directly under the plate and utensil, with soft penumbra and physically plausible offset. Add subtle reflections only if the surface is glossy."
        : "Lighting: Soft, directional light with gentle fill; clean, diffused highlights; avoid harsh specular hotspots. Add realistic contact shadows for depth.",
      "Depth of field: Keep the subject tack-sharp; background bokeh must be consistent with the lens. Avoid cutout halos or pasted edges; integrate rim micro-shadows to eliminate sticker-like appearance. Shadows and AO must preserve underlying line straightness (multiplicative darkening only, no smearing).",
      "Color and tone: Clean, appetizing grading with accurate whites and neutral grays; gentle contrast; avoid sickly color casts (excessive green/yellow). Minimal noise and grain.",
      "Composition: Commercial hero presentation—rule of thirds or strong center; use negative space for copy. Keep framing clean with minimal, coherent props only if they support the dish story.",
      "Props and styling: Optional minimal props (linen, utensil, ingredient sprinkle) placed to lead the eye toward the hero without clutter. Garnish should be fresh, not wilted.",
      "Material realism (dish-agnostic): Respect inherent materials—crisp textures stay crisp, sauces remain glossy not plastic, bread/crumbs show irregular pores, meats show rendered fat sheen, fruits/greens show subtle translucency. For liquids, include natural meniscus and, for glassware, realistic refraction and soft reflections.",
      "Appetite appeal (dish-agnostic): Emphasize crisp-vs-creamy contrasts, natural gloss on sauces/oils (not plastic), juicy highlights, and soft translucency where appropriate. Include small, fresh garnishes with believable moisture and color. Avoid desaturation; keep vibrant yet natural hues.",
      "Ad aesthetic: Crisp hero focus, controlled specular highlights on glazes and oils, no greasy glare. Steam only if realistic and subtle.",
      "Negative guidance: No floating dishes, no soft ghost edges, no duplicated plates/utensils, no drop-shadow style effects, no mismatch in perspective or lighting.",
      prompt && prompt.trim().length > 0
        ? `Tastefully incorporate this user style hint as soft guidance only: “${prompt}”.`
        : "",
      "Output intent: Photorealistic, print-ready quality. For social, prefer 4:5 portrait or 1:1 square crops with safe margins for overlays; otherwise 3:2."
    ].filter(Boolean).join(" ");

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
        temperature: 0.25,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: narrativeText },
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


