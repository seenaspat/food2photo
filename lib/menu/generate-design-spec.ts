/**
 * AI-Driven Menu Design Spec Generator
 *
 * Takes a free-form vibe description and generates a complete MenuDesignSpec
 * using Gemini's structured output capabilities.
 */

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { getMenuDesignSpec } from "./menu-design-presets";
import { menuDesignSchema, type MenuDesignSpec } from "./menu-design-schema";
import type { RestaurantType } from "./schema";

// Use GEMINI_API_KEY env var (not the default GOOGLE_GENERATIVE_AI_API_KEY)
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Generate a complete menu design specification from a vibe description
 *
 * @param vibeDescription - Free-form description like "cozy Italian bistro with candlelit ambiance"
 * @param restaurantName - Optional restaurant name for context
 * @param fallbackType - Optional restaurant type to use if AI fails
 */
export async function generateMenuDesignSpec(
  vibeDescription: string,
  restaurantName?: string,
  fallbackType?: RestaurantType
): Promise<MenuDesignSpec> {
  try {
    const prompt = buildDesignPrompt(vibeDescription, restaurantName);

    const result = await generateObject({
      model: google("gemini-3-flash-preview"),
      schema: menuDesignSchema,
      prompt,
      temperature: 0.7,
    });

    console.log("[generateMenuDesignSpec] Generated spec for:", vibeDescription);
    return result.object;
  } catch (error) {
    console.error("[generateMenuDesignSpec] Error, using fallback:", error);
    // Fallback to preset if AI fails
    return getMenuDesignSpec(fallbackType ?? "casual");
  }
}

/**
 * Build the prompt for generating a menu design spec
 */
function buildDesignPrompt(vibeDescription: string, restaurantName?: string): string {
  return `You are a professional menu designer creating a cohesive visual design specification.

## Restaurant Context
${restaurantName ? `Restaurant Name: "${restaurantName}"` : ""}
Vibe Description: "${vibeDescription}"

## Your Task
Create a complete menu design specification that captures this vibe. The design should be:
- **Cohesive**: All elements (colors, fonts, decorations) work together harmoniously
- **Professional**: Suitable for a real restaurant menu
- **Readable**: High contrast between text and background colors
- **Atmospheric**: Visual elements reinforce the described mood

## Design Principles
1. **Color Palette**: Choose colors that match the vibe. Dark backgrounds need light text. Include an accent color for emphasis.
2. **Typography**: Select fonts that reinforce the mood (elegant serifs for fine dining, clean sans-serifs for casual).
3. **Decorations**: Match the era and style (flourishes for classic, minimal for modern).
4. **Atmosphere**: Describe lighting and mood that matches the vibe.

## Important Rules
- text_primary must contrast strongly with background
- text_shadow should be set for dark/busy backgrounds (e.g., "1px 1px 3px rgba(0,0,0,0.5)")
- All hex colors should follow format "#RRGGBB description" (e.g., "#1a1715 deep charcoal")
- Font descriptions should include style notes (e.g., "Playfair Display, elegant high-contrast serif")

Generate a MenuDesignSpec that perfectly captures: "${vibeDescription}"`;
}

/**
 * Infer a design spec from either vibeDescription (AI) or restaurantType (preset)
 */
export async function inferMenuDesignSpec(
  vibeDescription?: string,
  restaurantName?: string,
  restaurantType?: RestaurantType
): Promise<MenuDesignSpec> {
  // If we have a vibe description, use AI to generate
  if (vibeDescription && vibeDescription.trim().length > 0) {
    return generateMenuDesignSpec(vibeDescription, restaurantName, restaurantType);
  }

  // Otherwise fall back to preset
  return getMenuDesignSpec(restaurantType ?? "casual");
}
