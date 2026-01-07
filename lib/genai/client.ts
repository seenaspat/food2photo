/**
 * Google GenAI Client
 *
 * Modular wrapper around @google/genai for image generation.
 * Provides typed interfaces and error handling.
 */
import { Content, GoogleGenAI, Part } from "@google/genai";

// Supported aspect ratios for Gemini 3 Pro Image Preview
export type AspectRatio =
  | "1:1"
  | "3:4"
  | "4:3"
  | "9:16"
  | "16:9"
  | "2:3"
  | "3:2"
  | "4:5"
  | "5:4"
  | "21:9";

export interface GenAIClientConfig {
  apiKey?: string;
}

export interface ImageGenerationOptions {
  /** The prompt describing what to generate */
  prompt: string;
  /** Optional input images as base64 data URLs */
  inputImages?: string[];
  /** Desired aspect ratio for output image (native support) */
  aspectRatio?: AspectRatio;
  /** Temperature for generation (0-1, default 0 for consistency) */
  temperature?: number;
  /** Top-p sampling (0-1, default 0.9) */
  topP?: number;
  /** Model to use */
  model?: string;
}

export interface GeneratedImage {
  /** Base64 data URL of the generated image */
  dataUrl: string;
  /** MIME type of the image */
  mimeType: string;
  /** Raw base64 data (without data URL prefix) */
  base64: string;
}

export interface ImageGenerationResult {
  /** Generated images (usually 1) */
  images: GeneratedImage[];
  /** Text response if any */
  text?: string;
  /** Whether the generation was successful */
  success: boolean;
  /** Error message if generation failed */
  error?: string;
}

// Default model for image generation
const DEFAULT_IMAGE_MODEL = "gemini-3-pro-image-preview";

/**
 * Create a Google GenAI client instance
 */
export function createGenAIClient(config: GenAIClientConfig = {}) {
  const apiKey = config.apiKey ?? process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing GEMINI_API_KEY. Provide it via config or environment variable."
    );
  }

  return new GoogleGenAI({ apiKey });
}

/**
 * Parse a base64 data URL into components
 */
function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } | null {
  if (!dataUrl.startsWith("data:")) return null;
  const commaIdx = dataUrl.indexOf(",");
  if (commaIdx < 0) return null;

  const header = dataUrl.substring(5, commaIdx); // skip "data:"
  const mimeType = header.split(";")[0];
  const base64 = dataUrl.substring(commaIdx + 1);

  return { mimeType, base64 };
}

/**
 * Convert data URL images to GenAI Parts
 */
function imagesToParts(dataUrls: string[]): Part[] {
  return dataUrls
    .map((url) => {
      const parsed = parseDataUrl(url);
      if (!parsed) return null;
      return {
        inlineData: {
          mimeType: parsed.mimeType,
          data: parsed.base64,
        },
      } as Part;
    })
    .filter((p): p is Part => p !== null);
}

/**
 * Extract generated images from GenAI response
 */
function extractImages(response: unknown): GeneratedImage[] {
  const images: GeneratedImage[] = [];

  // Handle the response structure from @google/genai
  // The response.candidates[].content.parts[] may contain inlineData or images
  const candidates = (response as { candidates?: unknown[] })?.candidates;
  if (!Array.isArray(candidates)) return images;

  for (const candidate of candidates) {
    const content = (candidate as { content?: { parts?: unknown[] } })?.content;
    if (!content?.parts) continue;

    for (const part of content.parts) {
      // Check for inlineData format
      const inlineData = (part as { inlineData?: { mimeType?: string; data?: string } })?.inlineData;
      if (inlineData?.mimeType && inlineData?.data) {
        images.push({
          mimeType: inlineData.mimeType,
          base64: inlineData.data,
          dataUrl: `data:${inlineData.mimeType};base64,${inlineData.data}`,
        });
      }
    }
  }

  return images;
}

/**
 * Extract text content from GenAI response
 */
function extractText(response: unknown): string | undefined {
  const candidates = (response as { candidates?: unknown[] })?.candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return undefined;

  const content = (candidates[0] as { content?: { parts?: unknown[] } })?.content;
  if (!content?.parts) return undefined;

  for (const part of content.parts) {
    const text = (part as { text?: string })?.text;
    if (text) return text;
  }

  return undefined;
}

/**
 * Generate an image using Google GenAI
 */
export async function generateImage(
  options: ImageGenerationOptions
): Promise<ImageGenerationResult> {
  const {
    prompt,
    inputImages = [],
    aspectRatio,
    temperature = 0,
    topP = 0.9,
    model = DEFAULT_IMAGE_MODEL,
  } = options;

  try {
    const client = createGenAIClient();

    // Build content parts: text prompt + any input images
    const parts: Part[] = [{ text: prompt }];

    if (inputImages.length > 0) {
      parts.push(...imagesToParts(inputImages));
    }

    const contents: Content[] = [
      {
        role: "user",
        parts,
      },
    ];

    // Build generation config with native aspect ratio support
    const generationConfig: Record<string, unknown> = {
      temperature,
      topP,
      responseModalities: ["TEXT", "IMAGE"],
    };

    // Add aspect ratio to prompt if specified (model-native support)
    // Note: Some models support aspectRatio in config, others need it in prompt
    let effectivePrompt = prompt;
    if (aspectRatio) {
      // Append aspect ratio instruction for models that handle it via prompt
      effectivePrompt = `${prompt}\n\nIMPORTANT: Generate the image with exactly ${aspectRatio} aspect ratio.`;
      // Also set in config for models that support it
      generationConfig.aspectRatio = aspectRatio;
    }

    // Update the text part with effective prompt
    parts[0] = { text: effectivePrompt };

    const response = await client.models.generateContent({
      model,
      contents,
      config: generationConfig,
    });

    const images = extractImages(response);
    const text = extractText(response);

    if (images.length === 0) {
      return {
        images: [],
        text,
        success: false,
        error: "No image was generated. The model may have declined the request.",
      };
    }

    return {
      images,
      text,
      success: true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error during image generation";
    return {
      images: [],
      success: false,
      error: message,
    };
  }
}

/**
 * Generate text with optional image understanding
 */
export async function generateText(options: {
  prompt: string;
  inputImages?: string[];
  temperature?: number;
  model?: string;
}): Promise<{ text: string | null; success: boolean; error?: string }> {
  const {
    prompt,
    inputImages = [],
    temperature = 0,
    model = DEFAULT_IMAGE_MODEL,
  } = options;

  try {
    const client = createGenAIClient();

    const parts: Part[] = [{ text: prompt }];
    if (inputImages.length > 0) {
      parts.push(...imagesToParts(inputImages));
    }

    const contents: Content[] = [
      {
        role: "user",
        parts,
      },
    ];

    const response = await client.models.generateContent({
      model,
      contents,
      config: {
        temperature,
        responseModalities: ["TEXT"],
      },
    });

    const text = extractText(response);

    return {
      text: text ?? null,
      success: true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      text: null,
      success: false,
      error: message,
    };
  }
}
