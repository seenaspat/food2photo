import { NextResponse } from "next/server";
import path from "node:path";
import { readFile } from "node:fs/promises";
import sharp from "sharp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const dish = formData.get("dish");
    const background = formData.get("background");
    const bgPreset = String(formData.get("bgPreset") || "");
    const prompt = String(formData.get("prompt") || "");
    const lensLook = String(formData.get("lensLook") || "");
    const aspectRatio = String(formData.get("aspectRatio") || "");
    const preservePlate = String(formData.get("preservePlate") || "0") === "1";
    const debug = (process.env.DEBUG_ANALYSIS === "1") || (() => { try { return new URL(request.url).searchParams.get("debug") === "1"; } catch { return false; }})();

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
    const dishOriginalBuffer = Buffer.from(new Uint8Array(dishArrayBuffer));
    // Create AR-locked canvas with the dish centered (single reference image with target aspect)
    // Reduce dimensions and use JPEG to keep the request body small and avoid 413 from the gateway
    const canvasDims = (() => {
      // Max long edge ~1280px to keep payloads small
      switch (aspectRatio) {
        case "1:1": return { w: 1024, h: 1024 };
        case "4:5": return { w: 1024, h: 1280 };
        case "3:2": return { w: 1200, h: 800 };
        case "16:9": return { w: 1280, h: 720 };
        case "9:16": return { w: 720, h: 1280 };
        default: return { w: 1024, h: 1024 };
      }
    })();
    // Build AR-locked canvas: blurred cover background + sharp contain overlay to avoid bars AND prevent subject crop
    const coverBgJpg = await sharp(dishOriginalBuffer)
      .rotate()
      .resize({ width: canvasDims.w, height: canvasDims.h, fit: "cover" })
      .blur(24)
      .jpeg({ quality: 72, mozjpeg: true })
      .toBuffer();
    const overlayPng = await sharp(dishOriginalBuffer)
      .rotate()
      .resize({ width: Math.floor(canvasDims.w * 0.92), height: Math.floor(canvasDims.h * 0.92), fit: "inside", background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer();
    const canvasJpg = await sharp(coverBgJpg)
      .composite([{ input: overlayPng, gravity: "center" }])
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();
    const dishDataUrl = `data:image/jpeg;base64,${canvasJpg.toString("base64")}`;

    // Load analysis template (external JSON) if available
    let analysisTemplateJson = "";
    try {
      const analysisPath = path.join(process.cwd(), "templates", "analysis", "dish-spec-template-v1.json");
      const raw = await readFile(analysisPath, "utf8");
      analysisTemplateJson = raw;
    } catch {}

    // First pass: analyze dish → JSON spec (strict)
    const analysisPrompt = [
      "Analyze Image A (the dish) and return a strict JSON object describing it.",
      analysisTemplateJson ? `Use this JSON schema and fill plausible values only: ${analysisTemplateJson}` : "Return a compact JSON with fields described below.",
      !analysisTemplateJson ? "Fields:" : "",
      !analysisTemplateJson ? "- name, category, cuisine, course" : "",
      !analysisTemplateJson ? "- components[] with role,name,prep,cut,count,approx_size_mm,color,texture,gloss,translucency,must_preserve" : "",
      !analysisTemplateJson ? "- arrangement (serving_state, layer_order with coverage_pct & thickness_mm, footprint shape/dimensions, repeated_units)" : "",
      !analysisTemplateJson ? "- vessel (type, material, color, finish, shape, rim_profile, diameter_cm, depth_cm, liner)" : "",
      !analysisTemplateJson ? "- sauces[], garnish[], base_area, optics, temperature" : "",
      !analysisTemplateJson ? "- approximate_scale, camera_hint, constraints, category_addons (optional)" : "",
      "Return JSON only. No prose.",
    ].filter(Boolean).join("\n");

    const analysisResp = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        stream: false,
        modalities: ["text", "image"],
        temperature: 0,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: analysisPrompt },
              { type: "image_url", image_url: { url: dishDataUrl } },
            ],
          },
        ],
      }),
    });
    if (debug) console.log("[analysis] status:", analysisResp.status, analysisResp.statusText);

    let dishSpec: unknown = null;
    if (analysisResp.ok) {
      type ChatCompletion = {
        choices: Array<{
          message?: { content?: unknown }
        }>
      };
      const analysisJson = (await analysisResp.json()) as ChatCompletion;
      const content = analysisJson?.choices?.[0]?.message?.content as unknown;
      const text = typeof content === "string" ? content : (Array.isArray(content) ? (content as Array<{ text?: string }>)[0]?.text : undefined);
      if (debug) {
        const preview = typeof text === "string" ? text.slice(0, 1200) : "<non-text content>";
        console.log("[analysis] raw content (trunc):", preview);
      }
      if (typeof text === "string") {
        try { dishSpec = JSON.parse(text); } catch {}
      }
    } else if (debug) {
      try { console.log("[analysis] error:", await analysisResp.text()); } catch {}
    }

    let dishSpecSnippet = "";
    if (dishSpec && typeof dishSpec === "object") {
      dishSpecSnippet = `DISH_SPEC:\n${JSON.stringify(dishSpec)}`;
      if (debug) {
        try { console.log("[analysis] parsed keys:", Object.keys(dishSpec as Record<string, unknown>)); } catch {}
        console.log("[analysis] dishSpec JSON:", dishSpec);
      }
    }

    let backgroundDataUrl: string | null = null;
    if (!bgPreset && background instanceof File) {
      // Compress background to keep payload small as well
      const bgArrayBuffer = await background.arrayBuffer();
      const bgBuffer = Buffer.from(bgArrayBuffer);
      const bgCompressed = await sharp(bgBuffer)
        .rotate()
        .resize({ width: 1280, height: 1280, fit: "inside" })
        .jpeg({ quality: 78, mozjpeg: true })
        .toBuffer();
      backgroundDataUrl = `data:image/jpeg;base64,${bgCompressed.toString("base64")}`;
    }

    const effectiveLensLook = lensLook && lensLook.trim().length > 0 ? lensLook : "50mm";
    const lens = effectiveLensLook.toLowerCase();
    const lensMap = (() => {
      if (lens.includes("85")) {
        return {
          focalDesc: "85mm / macro portrait look",
          dof: "shallow",
          subjectOcc: "55–70%",
          fovHint: "tight composition; compressed background and strong bokeh",
          cropRule: "Frame tight on the dish. If needed, zoom or crop so the subject fills most of the frame with minimal surrounding environment."
        };
      }
      if (lens.includes("35")) {
        return {
          focalDesc: "35mm wide-normal",
          dof: "medium",
          subjectOcc: "28–40%",
          fovHint: "wider field of view; more environment visible; gentle bokeh",
          cropRule: "Pull back to include more of the environment around the dish. Keep generous negative space and context."
        };
      }
      return {
        focalDesc: "50mm natural perspective",
        dof: "shallow–medium",
        subjectOcc: "40–55%",
        fovHint: "balanced FOV; natural background compression",
        cropRule: "Compose with a balanced crop: subject prominent, but leave clear context around it."
      };
    })();
    // Compose prompt from external generation template
    let genTemplate = "";
    try {
      const genPath = path.join(process.cwd(), "templates", "generation", "compose-v1.md");
      genTemplate = await readFile(genPath, "utf8");
    } catch {}

    // If preset: load backgrounds-v3.md template and vars JSON
    let envSpecBlock = "";
    if (bgPreset) {
      try {
        const bgTplPath = path.join(process.cwd(), "templates", "backgrounds-v3.md");
        const bgTpl = await readFile(bgTplPath, "utf8");
        const presetPath = path.join(process.cwd(), "templates", "varsv3", `${bgPreset}.json`);
        const presetJson = await readFile(presetPath, "utf8");
        envSpecBlock = [
          "BACKGROUND_SPEC:",
          "Template backgrounds-v3.md (excerpt)",
          "---",
          bgTpl.slice(0, 1200),
          "---",
          "Vars:",
          presetJson
        ].join("\n");
      } catch {}
    }

    const bgLine = bgPreset
      ? `Environment preset: ${bgPreset} via backgrounds-v3.md + vars`
      : (backgroundDataUrl ? "Image B: the target environment/background" : "No background provided; synthesize a plausible environment consistent with restaurant photography");
    const platePolicy = preservePlate ? "AND its original plate/vessel exactly" : "ONLY (render a new plate/vessel suitable to the environment)";

    const filledTemplate = (genTemplate || "")
      .replaceAll("{{BG_INPUT_LINE}}", bgLine)
      .replaceAll("{{DISH_SPEC_JSON}}", dishSpecSnippet || "{}")
      .replaceAll("{{FOCAL_DESC}}", lensMap.focalDesc)
      .replaceAll("{{DOF_HINT}}", lensMap.dof)
      .replaceAll("{{SUBJECT_OCC}}", lensMap.subjectOcc)
      .replaceAll("{{FOV_HINT}}", lensMap.fovHint)
      .replaceAll("{{CROP_RULE}}", lensMap.cropRule)
      .replaceAll("{{ASPECT_RATIO}}", aspectRatio || "original")
      .replaceAll("{{PLATE_POLICY}}", platePolicy)
      .replaceAll("{{ENV_SPEC_BLOCK}}", envSpecBlock);

    const compositionTemplate = filledTemplate || [
      "Create a single photorealistic food photograph by combining the provided images.",
      backgroundDataUrl
        ? "- Image A: the dish (subject). - Image B: the target environment/background."
        : "- Image A: the dish (subject). - No background is provided; generate a plausible environment consistent with instructions.",
      dishSpecSnippet ? dishSpecSnippet : "",
      "Task:",
      "1) Extract ONLY the edible dish (and, if 'Preserve plate' is enabled, its original plate/vessel) from Image A with precise edges and natural rim micro‑shadows.",
      preservePlate
        ? "   - Preserve the original plate/vessel exactly as described in DISH_SPEC.vessel if present."
        : "   - Do not preserve the original plate/vessel; render a new plate/vessel appropriate to the target environment.",
      "2) Place the dish on a plausible tabletop plane in the environment.",
      `3) Camera look must match ${effectiveLensLook} (authoritative). Reflect its field of view, perspective, and depth of field.`,
      aspectRatio ? `4) Output aspect ratio: ${aspectRatio}.` : "",
      "5) Lighting: match direction, color, and softness to the environment; add realistic contact shadow and ambient occlusion under the plate.",
      "6) Keep environment geometry straight (tiles, seams) with correct vanishing lines. Do not warp; simply occlude under the dish.",
      prompt && prompt.trim().length > 0 ? `7) Style hint (soft): ${prompt}` : "",
      "Output: One cohesive, high‑quality, photorealistic image. No floating subjects, no pasted look, no duplicate plates."
    ].filter(Boolean).join("\n");

    const narrativeText = compositionTemplate;

    const messagesContent: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [
      { type: "text", text: narrativeText },
      { type: "image_url", image_url: { url: dishDataUrl } },
    ];
    if (backgroundDataUrl) {
      messagesContent.push({ type: "image_url", image_url: { url: backgroundDataUrl } });
    }

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
        temperature: 0,
        top_p: 0.9,
        messages: [
          {
            role: "user",
            content: messagesContent,
          },
        ],
        // Hard cap the server-side request size to avoid 413 on the gateway
        // by explicitly keeping a compact context (no system/tool messages here)
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return NextResponse.json({ error: `Gateway error: ${resp.status} ${errText}` }, { status: 502 });
    }
    const json = (await resp.json()) as unknown;

    // Narrow the JSON structure to extract base64 image
    type GatewayResponse = {
      choices?: Array<{ message?: { images?: Array<{ image_url?: { url?: string } }> } }>
    };
    const images =
      typeof json === "object" && json !== null &&
      "choices" in (json as GatewayResponse) && Array.isArray((json as GatewayResponse).choices) &&
      (json as GatewayResponse).choices?.[0]?.message?.images;

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


