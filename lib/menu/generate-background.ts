/**
 * Menu Background Generator
 *
 * Generates styled background designs for menu overlay.
 * Uses narrative prompts aligned with Google's Gemini best practices.
 */

import { generateImage, type AspectRatio } from "@/lib/genai/client";
import { buildBackgroundPrompt, extractBackgroundVars } from "./build-background-prompt";
import type { MenuDesignSpec } from "./menu-design-schema";

export interface GenerateBackgroundOptions {
  designSpec: MenuDesignSpec;
  aspectRatio?: AspectRatio;
}

export interface GenerateBackgroundResult {
  imageDataUrl: string | null;
  success: boolean;
  error?: string;
  promptUsed?: string; // For debugging
}

/**
 * Generate a menu background using AI
 */
export async function generateMenuBackground(
  options: GenerateBackgroundOptions
): Promise<GenerateBackgroundResult> {
  const { designSpec, aspectRatio = "3:4" } = options;

  try {
    // Extract variables and build narrative prompt
    const vars = extractBackgroundVars(designSpec);
    const prompt = buildBackgroundPrompt(vars);

    console.log("[generateMenuBackground] Variation:", vars.variation);
    console.log("[generateMenuBackground] Prompt length:", prompt.length);

    const result = await generateImage({
      prompt,
      aspectRatio,
      temperature: 0.9, // Higher for creative variety
    });

    if (!result.success || result.images.length === 0) {
      return {
        imageDataUrl: null,
        success: false,
        error: result.error || "Failed to generate background",
        promptUsed: prompt,
      };
    }

    return {
      imageDataUrl: result.images[0].dataUrl,
      success: true,
      promptUsed: prompt,
    };
  } catch (error) {
    return {
      imageDataUrl: null,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
