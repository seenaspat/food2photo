/**
 * Prompt for analyzing user-uploaded space photos to extract environment specifications.
 * The AI will output structured JSON matching CustomEnvironmentSpec.
 */

export const SPACE_ANALYSIS_PROMPT = `
You are a professional food photographer and set designer. Analyze the provided image(s) of a dining space to extract a detailed environment specification.

Your goal is to capture the **ESSENCE** of this space — what makes it unique and recognizable — so it can be consistently recreated as a professional photo backdrop for food photography.

IMPORTANT RULES:
1. LIGHTING: Always describe as "professional food photography lighting" inspired by the space's character, NOT the actual lighting quality in the photo. Enhance it to studio quality.
2. IMPERFECTIONS: Ignore dirt, damage, clutter, poor maintenance — describe the space as if newly renovated and pristine.
3. PEOPLE: Never include people, personal items, or identifiable objects in the specification.
4. ENHANCEMENT: Describe the space at its BEST potential, not its current state. Think of it as extracting a 3D environment that can be replicated consistently.
5. CONSISTENCY: Be specific enough that the space can be recreated identically across multiple food photos.

Output valid JSON matching this EXACT schema:

{
  "name_suggestion": "Short evocative name for this space (2-4 words)",
  
  "environment": {
    "setting": "indoor" | "outdoor" | "mixed",
    "venue_type": "Type of venue (restaurant, cafe, bar, home kitchen, bistro, etc.)",
    "style": "Design style (rustic, modern, industrial, elegant, minimalist, traditional, etc.)",
    "era": "Contemporary, vintage, or classic feel",
    "ambience_family": "One-line description like 'cozy Italian trattoria' or 'sleek rooftop bar'",
    "mood": "Two-word mood descriptor like 'warm intimate' or 'bright minimal'"
  },
  
  "palette": {
    "primary": "Main colors with descriptors (e.g., 'warm terracotta, aged cream')",
    "accent": "Accent materials/colors (e.g., 'brushed brass, olive green')",
    "warm_cool_bias": "warm" | "neutral" | "cool",
    "vibrance": "low" | "medium" | "high"
  },
  
  "surface": {
    "material": "Table/counter material (e.g., 'reclaimed oak planks', 'polished marble')",
    "finish": "Surface finish (e.g., 'oiled matte', 'high gloss', 'satin')",
    "color": "Surface color description (e.g., 'warm honey brown with visible grain')",
    "texture": "Texture detail (e.g., 'visible open grain', 'smooth with subtle veining')",
    "wear_level": "pristine" | "light patina" | "well-worn"
  },
  
  "lighting": {
    "key_direction": "Primary light direction (left, right, window-left, overhead, etc.)",
    "fill_direction": "Fill light direction (opposite of key, or ambient)",
    "color_temp_k": 3800 (number between 2700-6500),
    "practicals": "Visible light sources (e.g., 'warm pendant globes', 'candles on tables', 'none')",
    "quality": "soft diffused" | "directional" | "dramatic",
    "bloom_level": "none" | "subtle" | "medium"
  },
  
  "midground": {
    "features": "Elements 1-2m behind dish (furniture edges, neighboring tables, decor pieces)",
    "dressing": "Props and accessories in midground (e.g., 'wine bottle silhouette, bread basket')"
  },
  
  "background": {
    "features": "Architectural elements (e.g., 'exposed brick wall', 'large windows', 'wooden beams')",
    "dressing": "Decorative elements (e.g., 'copper pans on hooks', 'trailing plants', 'vintage posters')",
    "atmosphere_kind": "Atmospheric effects if any (e.g., 'kitchen steam wisps', 'soft haze', 'none')",
    "anchor_motif": "One signature visual element that anchors the space's identity"
  },
  
  "signature": {
    "unique_elements": ["List of 2-4 things that make this space distinctive"],
    "cultural_markers": ["Cuisine or region-specific details if applicable, empty array if none"],
    "exclude_elements": ["people", "personal items", "clutter", "damage", "pets"]
  }
}

Focus on what a professional photographer would need to recreate this space as a pristine, magazine-quality backdrop for food photography. Be specific and consistent.
`;

/**
 * Validates that the parsed response matches the expected schema structure.
 * Returns null if valid, or an error message if invalid.
 */
export function validateEnvironmentSpec(spec: unknown): string | null {
  if (!spec || typeof spec !== "object") {
    return "Response is not an object";
  }

  const s = spec as Record<string, unknown>;

  // Check required top-level fields
  const requiredFields = [
    "name_suggestion",
    "environment",
    "palette",
    "surface",
    "lighting",
    "midground",
    "background",
    "signature",
  ];

  for (const field of requiredFields) {
    if (!(field in s)) {
      return `Missing required field: ${field}`;
    }
  }

  // Basic type checks for nested objects
  if (typeof s.environment !== "object" || !s.environment) {
    return "environment must be an object";
  }

  if (typeof s.lighting !== "object" || !s.lighting) {
    return "lighting must be an object";
  }

  const lighting = s.lighting as Record<string, unknown>;
  if (typeof lighting.color_temp_k !== "number") {
    return "lighting.color_temp_k must be a number";
  }

  if (typeof s.signature !== "object" || !s.signature) {
    return "signature must be an object";
  }

  const signature = s.signature as Record<string, unknown>;
  if (!Array.isArray(signature.unique_elements)) {
    return "signature.unique_elements must be an array";
  }

  return null;
}
