import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { loadCatalog, resolveBackground } from "../../../lib/backgrounds/catalog.server";
import type { BgRef, ResolvedBackground } from "../../../lib/backgrounds/types";
import {
  analyzeDish,
  generateFoodImage,
  normalizeAspectRatio,
  prepareImageForApi,
} from "../../../lib/genai";
import { buildCompositionPrompt } from "../../../lib/generation/prompt";
import { finalizeCredit, reserveCredit } from "../../../lib/metering";
import { isRateLimited, logApiRequest } from "../../../lib/rate-limit";
import { createClient } from "../../../lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id ?? null;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized", requestId }, { status: 401, headers: { "X-Request-Id": requestId } });
    }

    const ip = (() => {
      try { return (request.headers.get('x-forwarded-for') ?? '').split(',')[0] || '0.0.0.0'; } catch { return '0.0.0.0'; }
    })();
    const limited = await isRateLimited(supabase, userId, ip, { perMinute: 10, perHour: 200 }, "/api/generate");
    await logApiRequest(supabase, userId, ip, "/api/generate");
    if (limited) {
      return NextResponse.json({ error: "Rate limit exceeded", requestId }, { status: 429, headers: { "X-Request-Id": requestId } });
    }

    const reserved = await reserveCredit(supabase, {
      userId,
      requestId,
      apiRoute: "/api/generate",
      model: "gemini-3-pro-image-preview",
      metadata: {},
    });
    if (!reserved) {
      return NextResponse.json({ error: "Insufficient credits", requestId }, { status: 402, headers: { "X-Request-Id": requestId } });
    }
    
    const formData = await request.formData();
    const dish = formData.get("dish");
    const background = formData.get("background");
    const lensLook = String(formData.get("lensLook") || "");
    const aspectRatioRaw = String(formData.get("aspectRatio") || "");
    const preservePlate = String(formData.get("preservePlate") || "0") === "1";
    const debug = (process.env.DEBUG_ANALYSIS === "1") || (() => { try { return new URL(request.url).searchParams.get("debug") === "1"; } catch { return false; }})();

    if (!(dish instanceof File)) {
      await finalizeCredit(supabase, { userId, requestId, success: false });
      return NextResponse.json({ error: "Missing dish file", requestId }, { status: 400, headers: { "X-Request-Id": requestId } });
    }

    // Verify GEMINI_API_KEY is available
    if (!process.env.GEMINI_API_KEY) {
      await finalizeCredit(supabase, { userId, requestId, success: false });
      return NextResponse.json({ error: "Missing GEMINI_API_KEY", requestId }, { status: 500, headers: { "X-Request-Id": requestId } });
    }

    // Prefer explicit bgRef; fallback to legacy bgPreset → bgRef mapping
    const bgRefRaw = String(formData.get("bgRef") || "");
    const legacyBgPreset = String(formData.get("bgPreset") || "");
    const effectiveBgRef = bgRefRaw || (legacyBgPreset ? `v3-ambience:${legacyBgPreset}` : "");

    // Handle custom background ID (user-created backgrounds)
    const customBgId = String(formData.get("customBgId") || "");
    let customBgSnippet = "";
    if (customBgId) {
      const { data: customBg, error: customBgError } = await supabase
        .from("custom_backgrounds")
        .select("prompt_snippet")
        .eq("id", customBgId)
        .eq("user_id", userId)
        .single();
      
      if (customBgError || !customBg) {
        if (debug) console.log("[bg] custom background not found:", customBgId);
      } else {
        customBgSnippet = customBg.prompt_snippet;
        if (debug) console.log("[bg] using custom background snippet");
      }
    }

    // Normalize aspect ratio using native support
    const aspectRatio = normalizeAspectRatio(aspectRatioRaw || "1:1");

    // Prepare dish image for API (optimized for payload size)
    const dishArrayBuffer = await dish.arrayBuffer();
    const dishBuffer = Buffer.from(new Uint8Array(dishArrayBuffer));
    const dishDataUrl = await prepareImageForApi(dishBuffer, { maxDimension: 1280, quality: 90 });

    // Load analysis template (external JSON) if available
    let analysisTemplateJson = "";
    try {
      const analysisPath = path.join(process.cwd(), "templates", "analysis", "dish-spec-template-v1.json");
      const raw = await readFile(analysisPath, "utf8");
      analysisTemplateJson = raw;
    } catch {}

    // First pass: analyze dish → JSON spec
    const analysisResult = await analyzeDish({
      imageDataUrl: dishDataUrl,
      schemaTemplate: analysisTemplateJson || undefined,
      debug,
    });

    let dishSpecSnippet = "";
    if (analysisResult.success && analysisResult.spec) {
      dishSpecSnippet = `DISH_SPEC:\n${JSON.stringify(analysisResult.spec)}`;
      if (debug) {
        try { console.log("[analysis] parsed keys:", Object.keys(analysisResult.spec)); } catch {}
        console.log("[analysis] dishSpec JSON:", analysisResult.spec);
      }
    }

    // Prepare background image if provided
    let backgroundDataUrl: string | null = null;
    if (!effectiveBgRef && background instanceof File) {
      const bgArrayBuffer = await background.arrayBuffer();
      const bgBuffer = Buffer.from(bgArrayBuffer);
      backgroundDataUrl = await prepareImageForApi(bgBuffer, { maxDimension: 1280, quality: 78 });
    }

    const effectiveLensLook = lensLook && lensLook.trim().length > 0 ? lensLook : "50mm";
    const lens = effectiveLensLook.toLowerCase();
    const lensMap = (() => {
      if (lens.includes("85")) {
        return {
          focalDesc: "85mm / macro portrait look",
          dof: "shallow",
          subjectOcc: "70–80%",
          fovHint: "tight composition; compressed background and strong bokeh",
          cropRule: "Frame tight on the dish. If needed, zoom or crop so the subject fills most of the frame with minimal surrounding environment."
        };
      }
      if (lens.includes("35")) {
        return {
          focalDesc: "35mm wide-normal",
          dof: "medium",
          subjectOcc: "15–30%",
          fovHint: "wider field of view; more environment visible; gentle bokeh",
          cropRule: "Pull back to include more of the environment around the dish. Keep generous negative space and context."
        };
      }
      return {
        focalDesc: "50mm natural perspective",
        dof: "shallow–medium",
        subjectOcc: "40–50%",
        fovHint: "balanced FOV; natural background compression",
        cropRule: "Compose with a balanced crop: subject prominent, but leave clear context around it."
      };
    })();

    // Resolve background preset if provided; otherwise fall back to a neutral default when no upload
    let resolved: ResolvedBackground | null = null;
    let usedFallbackNoBgPreset = false;
    if (effectiveBgRef) {
      try {
        const catalog = await loadCatalog();
        resolved = resolveBackground(catalog, effectiveBgRef as BgRef);
      } catch (e) {
        if (debug) console.log("[bg] resolve error:", e instanceof Error ? e.message : e);
      }
    } else if (!backgroundDataUrl) {
      // No preset and no uploaded background → use a default, neutral v3 template+vars
      try {
        const templateAbsPath = path.join(process.cwd(), "templates", "backgrounds-v3.md");
        const varsAbsPath = path.join(process.cwd(), "templates", "varsv3", "no-background-default.json");
        resolved = {
          family: {
            id: "v3-ambience",
            label: "Ambience Presets",
            integration: { type: "template_vars", templatePath: "templates/backgrounds-v3.md", varsDir: "templates/varsv3" },
            styleProfile: "ambience",
          },
          item: {
            id: "no-background-default",
            label: "No background (default)",
            familyId: "v3-ambience",
            thumbUrl: "/opengraph-image.png",
            payload: { type: "template_vars", varsFile: "no-background-default.json" },
          },
          templateAbsPath,
          varsAbsPath,
        };
        usedFallbackNoBgPreset = true;
      } catch (e) {
        if (debug) console.log("[bg] fallback preset error:", e instanceof Error ? e.message : e);
      }
    }

    const bgLine = customBgSnippet
      ? `Custom Environment Specification:\n${customBgSnippet}`
      : effectiveBgRef
        ? `Environment preset: ${effectiveBgRef} via template + vars`
        : (backgroundDataUrl
          ? "Image B: the target environment/background"
          : (usedFallbackNoBgPreset
            ? "Environment preset: v3-ambience:no-background-default via template + vars"
            : "No background provided; synthesize a plausible environment consistent with restaurant and dish photography"));
    const platePolicy = preservePlate ? "AND its original plate/vessel exactly" : "ONLY (render a new plate/vessel suitable to the environment)";

    const narrativeText = await buildCompositionPrompt({
      resolved,
      bgLine,
      dishSpecSnippet: dishSpecSnippet || "{}",
      lensMap,
      aspectRatio: aspectRatio || "original",
      platePolicy,
    });

    // Generate the image using direct Google GenAI
    const result = await generateFoodImage({
      dishImageUrl: dishDataUrl,
      backgroundImageUrl: backgroundDataUrl ?? undefined,
      prompt: narrativeText,
      aspectRatio,
      temperature: 0,
      debug,
    });

    if (!result.success || !result.imageDataUrl) {
      await finalizeCredit(supabase, { userId, requestId, success: false });
      return NextResponse.json({ error: result.error ?? "No image produced", requestId }, { status: 502, headers: { "X-Request-Id": requestId } });
    }

    const outBuffer = Buffer.from(result.base64!, "base64");
    const outType = result.mimeType ?? "image/png";
    const outName = outType.includes("jpeg") ? "enhanced.jpg" : outType.includes("png") ? "enhanced.png" : "enhanced.webp";

    // Fetch updated balance and return it in headers to avoid extra client calls
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
