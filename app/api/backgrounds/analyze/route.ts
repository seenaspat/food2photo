import { SPACE_ANALYSIS_PROMPT, validateEnvironmentSpec } from "@/lib/backgrounds/analyze-space";
import type { CustomEnvironmentSpec } from "@/lib/backgrounds/custom-background-schema";
import { generateText } from "@/lib/genai/client";
import { prepareImageForApi } from "@/lib/genai/image-generation";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60; // Allow up to 60s for analysis

/**
 * POST /api/backgrounds/analyze
 * Analyze uploaded space images and extract environment specification.
 * Does NOT persist - caller must save if desired.
 */
export async function POST(req: Request) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const images: File[] = [];

    // Collect all image files from form data
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("image") && value instanceof File && value.size > 0) {
        images.push(value);
      }
    }

    if (images.length === 0) {
      return Response.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    if (images.length > 3) {
      return Response.json(
        { error: "Maximum 3 images allowed" },
        { status: 400 }
      );
    }

    // Prepare images as data URLs for Gemini
    const imageDataUrls: string[] = [];
    for (const img of images) {
      const buffer = Buffer.from(await img.arrayBuffer());
      const dataUrl = await prepareImageForApi(buffer, {
        maxDimension: 1024,
        quality: 85,
      });
      imageDataUrls.push(dataUrl);
    }

    // Call Gemini to analyze the space
    const result = await generateText({
      prompt: SPACE_ANALYSIS_PROMPT,
      inputImages: imageDataUrls,
      temperature: 0,
    });

    if (!result.success || !result.text) {
      return Response.json(
        { error: result.error ?? "Analysis failed - no response" },
        { status: 500 }
      );
    }

    // Parse JSON from response
    let spec: CustomEnvironmentSpec;
    try {
      let jsonText = result.text;
      // Handle potential markdown code blocks
      const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }
      spec = JSON.parse(jsonText.trim());
    } catch (parseError) {
      console.error("[analyze] JSON parse error:", parseError);
      console.error("[analyze] Raw response:", result.text.slice(0, 500));
      return Response.json(
        { error: "Failed to parse analysis response as JSON" },
        { status: 500 }
      );
    }

    // Validate the spec structure
    const validationError = validateEnvironmentSpec(spec);
    if (validationError) {
      console.error("[analyze] Validation error:", validationError);
      return Response.json(
        { error: `Invalid specification: ${validationError}` },
        { status: 500 }
      );
    }

    return Response.json({ spec });
  } catch (error) {
    console.error("[analyze] Error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
