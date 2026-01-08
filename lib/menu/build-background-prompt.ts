/**
 * Menu Background Prompt Builder
 *
 * Generates narrative-style prompts aligned with Google's Gemini best practices:
 * - Descriptive paragraphs over keyword lists
 * - Clear style and aesthetic definitions
 * - Parameterized for variation
 * - Negative prompts for exclusions
 */

import { z } from "zod";
import type { MenuDesignSpec } from "./menu-design-schema";

/**
 * Schema for background generation variables
 */
export const backgroundPromptVarsSchema = z.object({
  // Core identity
  restaurantMood: z.string().describe("The overall atmosphere: 'elegant fine-dining', 'cozy cafe', etc."),
  cuisineStyle: z.string().describe("Cuisine influence: 'French', 'Japanese', 'American BBQ', etc."),
  
  // Visual style
  colorPalette: z.object({
    primary: z.string().describe("Primary background color with description"),
    accent: z.string().describe("Accent color for highlights"),
    mood: z.string().describe("Color mood: 'warm', 'cool', 'dramatic', 'soft'"),
  }),
  
  // Texture and depth
  textureStyle: z.enum([
    "smooth-gradient",
    "subtle-texture",
    "rich-texture",
    "atmospheric-depth",
    "dramatic-lighting",
  ]),
  
  // Decorative elements
  decorativeStyle: z.object({
    corners: z.string().describe("Corner treatment: 'ornate flourishes', 'minimal lines', 'none'"),
    border: z.string().describe("Border style: 'elegant frame', 'subtle edge', 'none'"),
    motifs: z.string().describe("Cultural or thematic motifs to include on edges"),
  }),
  
  // Variation seed
  variation: z.enum(["A", "B", "C"]).optional().describe("Variation for diversity"),
});

export type BackgroundPromptVars = z.infer<typeof backgroundPromptVarsSchema>;

/**
 * Extract prompt variables from a MenuDesignSpec
 */
export function extractBackgroundVars(spec: MenuDesignSpec): BackgroundPromptVars {
  return {
    restaurantMood: spec.atmosphere.overall_mood,
    cuisineStyle: spec.atmosphere.era,
    colorPalette: {
      primary: spec.palette.background,
      accent: spec.palette.accent,
      mood: spec.atmosphere.lighting_suggestion.includes("warm") ? "warm" : 
            spec.atmosphere.lighting_suggestion.includes("cool") ? "cool" :
            spec.atmosphere.lighting_suggestion.includes("dramatic") ? "dramatic" : "soft",
    },
    textureStyle: spec.decorations.background_pattern.includes("texture") ? "rich-texture" :
                  spec.decorations.background_pattern.includes("gradient") ? "smooth-gradient" :
                  spec.decorations.background_pattern.includes("subtle") ? "subtle-texture" :
                  "atmospheric-depth",
    decorativeStyle: {
      corners: spec.decorations.corner_elements,
      border: spec.decorations.border,
      motifs: spec.decorations.background_pattern,
    },
    variation: ["A", "B", "C"][Math.floor(Math.random() * 3)] as "A" | "B" | "C",
  };
}

/**
 * Build a narrative prompt for background generation
 * Following Google's recommendation: descriptive paragraphs, not keyword lists
 */
export function buildBackgroundPrompt(vars: BackgroundPromptVars): string {
  const { restaurantMood, cuisineStyle, colorPalette, textureStyle, decorativeStyle, variation } = vars;

  // Build the narrative in descriptive paragraphs
  const prompt = `
Create a stunning, professional background design for a restaurant menu display.

The design should evoke the atmosphere of ${restaurantMood}. This is a ${cuisineStyle} establishment, and the visual language should reflect that culinary tradition while feeling contemporary and premium.

For the color treatment, work with ${colorPalette.primary} as the foundation. The overall color mood should feel ${colorPalette.mood}, with ${colorPalette.accent} used sparingly for visual interest. Create depth through ${getTextureDescription(textureStyle)} rather than flat, boring solid colors.

The composition must have a clear hierarchy: the center 70% of the image should remain relatively clean and uncluttered, as text will be overlaid there. This doesn't mean empty—use subtle color gradients, gentle atmospheric effects, or very soft texture to give it life. The outer edges and corners are where decorative elements belong.

For the decorative treatment: ${decorativeStyle.corners !== "none" ? `Add ${decorativeStyle.corners} to the corners of the design.` : "Keep corners clean and minimal."} ${decorativeStyle.border !== "none" ? `Include ${decorativeStyle.border} around the perimeter.` : ""} ${decorativeStyle.motifs !== "none" ? `Incorporate ${decorativeStyle.motifs} as subtle visual motifs, but only on the edges—never in the center content area.` : ""}

${getVariationDescription(variation)}

The output should be a single cohesive image at 2550x3300 pixels (US Letter at 300 DPI), portrait orientation. Make it look like something from a professional design agency, not a template.

Do not include any text, letters, words, numbers, or writing of any kind. Do not include food photographs or illustrations. The entire center area must remain suitable for overlaying menu text.
`.trim();

  return prompt;
}

/**
 * Get texture style description
 */
function getTextureDescription(style: BackgroundPromptVars["textureStyle"]): string {
  const descriptions: Record<typeof style, string> = {
    "smooth-gradient": "smooth, elegant gradients that flow naturally across the canvas",
    "subtle-texture": "subtle material textures like fine paper, soft fabric, or gentle brushstrokes",
    "rich-texture": "rich, tactile textures with visible depth—aged surfaces, natural materials, or artistic brush effects",
    "atmospheric-depth": "atmospheric depth with soft lighting effects, ambient glows, or environmental haze",
    "dramatic-lighting": "dramatic lighting with bold shadows, spotlight effects, or cinematic contrast",
  };
  return descriptions[style];
}

/**
 * Get variation-specific description for diversity
 */
function getVariationDescription(variation?: "A" | "B" | "C"): string {
  const variations: Record<string, string> = {
    A: "For this variation, emphasize warmth and invitation—the kind of atmosphere that makes people feel welcome.",
    B: "For this variation, emphasize sophistication and refinement—clean lines, subtle luxury, understated elegance.",
    C: "For this variation, emphasize character and personality—something distinctive that tells a story.",
  };
  return variations[variation || "A"];
}
