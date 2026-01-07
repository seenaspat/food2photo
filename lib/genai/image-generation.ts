/**
 * Image Generation Module
 *
 * High-level functions for food photography image generation
 * using the Google GenAI client.
 */
import sharp from "sharp";
import { AspectRatio, generateImage, generateText } from "./client";

// Re-export types for convenience
export type { AspectRatio } from "./client";

/**
 * Supported aspect ratios with their dimension hints
 */
export const ASPECT_RATIO_DIMENSIONS: Record<AspectRatio, { width: number; height: number }> = {
  "1:1": { width: 1024, height: 1024 },
  "4:5": { width: 1024, height: 1280 },
  "5:4": { width: 1280, height: 1024 },
  "3:4": { width: 1024, height: 1365 },
  "4:3": { width: 1365, height: 1024 },
  "2:3": { width: 1024, height: 1536 },
  "3:2": { width: 1536, height: 1024 },
  "9:16": { width: 720, height: 1280 },
  "16:9": { width: 1280, height: 720 },
  "21:9": { width: 1680, height: 720 },
};

/**
 * Normalize user-provided aspect ratio to supported format
 */
export function normalizeAspectRatio(ar: string): AspectRatio {
  const normalized = ar.replace(/\s/g, "").toLowerCase();
  const mapping: Record<string, AspectRatio> = {
    "1:1": "1:1",
    "1x1": "1:1",
    "square": "1:1",
    "4:5": "4:5",
    "4x5": "4:5",
    "5:4": "5:4",
    "5x4": "5:4",
    "3:4": "3:4",
    "3x4": "3:4",
    "4:3": "4:3",
    "4x3": "4:3",
    "2:3": "2:3",
    "2x3": "2:3",
    "3:2": "3:2",
    "3x2": "3:2",
    "9:16": "9:16",
    "9x16": "9:16",
    "16:9": "16:9",
    "16x9": "16:9",
    "21:9": "21:9",
    "21x9": "21:9",
  };
  return mapping[normalized] ?? "1:1";
}

/**
 * Prepare an image for API submission
 * Compresses and resizes to keep payload small
 */
export async function prepareImageForApi(
  imageBuffer: Buffer,
  options: { maxDimension?: number; quality?: number } = {}
): Promise<string> {
  const { maxDimension = 1280, quality = 88 } = options;

  const prepared = await sharp(imageBuffer)
    .rotate() // Auto-rotate based on EXIF
    .resize({
      width: maxDimension,
      height: maxDimension,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();

  return `data:image/jpeg;base64,${prepared.toString("base64")}`;
}

export interface AnalyzeDishOptions {
  /** Image data URL */
  imageDataUrl: string;
  /** Optional JSON schema/template for structured output */
  schemaTemplate?: string;
  /** Debug mode */
  debug?: boolean;
}

export interface DishAnalysisResult {
  /** Parsed dish specification object */
  spec: Record<string, unknown> | null;
  /** Raw text response */
  raw: string | null;
  /** Whether analysis succeeded */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

/**
 * Analyze a dish image and return structured specification
 */
export async function analyzeDish(options: AnalyzeDishOptions): Promise<DishAnalysisResult> {
  const { imageDataUrl, schemaTemplate, debug } = options;

  const analysisPrompt = [
    "Analyze Image A (the dish) and return a strict JSON object describing it.",
    schemaTemplate
      ? `Use this JSON schema and fill plausible values only: ${schemaTemplate}`
      : "Return a compact JSON with fields described below.",
    !schemaTemplate ? "Fields:" : "",
    !schemaTemplate ? "- name, category, cuisine, course" : "",
    !schemaTemplate
      ? "- components[] with role,name,prep,cut,count,approx_size_mm,color,texture,gloss,translucency,must_preserve"
      : "",
    !schemaTemplate
      ? "- arrangement (serving_state, layer_order with coverage_pct & thickness_mm, footprint shape/dimensions, repeated_units)"
      : "",
    !schemaTemplate ? "- vessel (type, material, color, finish, shape, rim_profile, diameter_cm, depth_cm, liner)" : "",
    !schemaTemplate ? "- sauces[], garnish[], base_area, optics, temperature" : "",
    !schemaTemplate ? "- approximate_scale, camera_hint, constraints, category_addons (optional)" : "",
    "Return JSON only. No prose.",
  ]
    .filter(Boolean)
    .join("\n");

  const result = await generateText({
    prompt: analysisPrompt,
    inputImages: [imageDataUrl],
    temperature: 0,
  });

  if (!result.success || !result.text) {
    return {
      spec: null,
      raw: null,
      success: false,
      error: result.error ?? "Analysis failed - no text response",
    };
  }

  if (debug) {
    console.log("[analyzeDish] raw response:", result.text.slice(0, 1200));
  }

  // Try to parse JSON from response
  let spec: Record<string, unknown> | null = null;
  try {
    // Handle potential markdown code blocks
    let jsonText = result.text;
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }
    spec = JSON.parse(jsonText.trim());
  } catch {
    if (debug) {
      console.log("[analyzeDish] JSON parse failed");
    }
  }

  return {
    spec,
    raw: result.text,
    success: true,
  };
}

export interface GenerateFoodImageOptions {
  /** Dish image data URL */
  dishImageUrl: string;
  /** Optional background image data URL */
  backgroundImageUrl?: string;
  /** Composition prompt */
  prompt: string;
  /** Desired aspect ratio */
  aspectRatio: AspectRatio;
  /** Temperature (default 0) */
  temperature?: number;
  /** Debug mode */
  debug?: boolean;
}

export interface GenerateFoodImageResult {
  /** Generated image data URL */
  imageDataUrl: string | null;
  /** MIME type */
  mimeType: string | null;
  /** Raw base64 data */
  base64: string | null;
  /** Whether generation succeeded */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

/**
 * Generate a food photography image
 */
export async function generateFoodImage(
  options: GenerateFoodImageOptions
): Promise<GenerateFoodImageResult> {
  const {
    dishImageUrl,
    backgroundImageUrl,
    prompt,
    aspectRatio,
    temperature = 0,
    debug,
  } = options;

  const inputImages = [dishImageUrl];
  if (backgroundImageUrl) {
    inputImages.push(backgroundImageUrl);
  }

  if (debug) {
    console.log("[generateFoodImage] aspectRatio:", aspectRatio);
    console.log("[generateFoodImage] inputImages count:", inputImages.length);
    console.log("[generateFoodImage] prompt length:", prompt.length);
  }

  const result = await generateImage({
    prompt,
    inputImages,
    aspectRatio,
    temperature,
  });

  if (!result.success || result.images.length === 0) {
    return {
      imageDataUrl: null,
      mimeType: null,
      base64: null,
      success: false,
      error: result.error ?? "No image generated",
    };
  }

  const image = result.images[0];

  return {
    imageDataUrl: image.dataUrl,
    mimeType: image.mimeType,
    base64: image.base64,
    success: true,
  };
}
