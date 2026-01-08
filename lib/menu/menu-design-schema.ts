/**
 * Menu Design Schema
 *
 * Zod schema defining exact design parameters for AI-generated menus.
 * Based on professional menu design research.
 */

import { z } from "zod/v4";

/**
 * Physical paper/material appearance
 */
export const physicalAppearanceSchema = z.object({
  paper_type: z.enum(["heavy-linen", "smooth-cardstock", "kraft", "textured-matte", "handmade-cotton"]),
  paper_color: z.string(), // "#f8f6f0 warm ivory"
  finish: z.enum(["matte", "soft-touch", "subtle-gloss", "uncoated"]),
  edge_treatment: z.enum(["clean-cut", "deckle-edge", "rounded-corners"]),
  special_effects: z.array(z.enum(["foil-title", "embossed-logo", "spot-uv", "letterpress", "none"])),
});

/**
 * Layout grid and spacing
 */
export const layoutSchema = z.object({
  style: z.enum(["single-column-centered", "single-column-left", "two-column", "editorial"]),
  golden_zone: z.enum(["center", "top-right", "none"]),
  whitespace_level: z.enum(["generous", "moderate", "compact"]),
  margins_mm: z.object({
    top: z.number(),
    side: z.number(),
    bottom: z.number(),
  }),
  item_spacing: z.enum(["spacious", "comfortable", "tight"]),
});

/**
 * Typography specifications
 */
export const typographySchema = z.object({
  title: z.object({
    font: z.string(), // "Playfair Display, elegant serif with swash alternates"
    size: z.string(),
    weight: z.enum(["light", "regular", "medium", "bold"]),
    case: z.enum(["title-case", "uppercase", "small-caps", "lowercase"]),
    tracking: z.enum(["tight", "normal", "wide", "very-wide"]),
  }),
  section: z.object({
    font: z.string(),
    size: z.string(),
    weight: z.enum(["light", "regular", "medium", "bold"]),
    treatment: z.enum(["uppercase-spaced", "small-caps", "bold", "elegant-script"]),
  }),
  body: z.object({
    font: z.string(),
    item_name_size: z.string(),
    item_name_weight: z.string(),
    description_size: z.string(),
    description_style: z.enum(["regular", "italic"]),
    line_height: z.string().default("1.6"),
  }),
  price: z.object({
    alignment: z.enum(["right-aligned", "inline-after-name", "below"]),
    style: z.enum(["accent-color", "muted", "bold"]),
    format: z.string(),
  }),
});

/**
 * Color palette with hex + description
 */
export const paletteSchema = z.object({
  background: z.string(),      // "#1a1715 deep charcoal with subtle grain"
  text_primary: z.string(),    // "#f5f0e8 warm ivory"
  text_secondary: z.string(),  // "#a09890 soft taupe for descriptions"
  accent: z.string(),          // "#c9a962 antique gold for highlights"
  divider: z.string(),         // "#3d3835 subtle separator lines"
  text_shadow: z.string().optional(), // New field for text contrast
});

/**
 * Decorative design elements
 */
export const decorationsSchema = z.object({
  title_treatment: z.enum(["underline-flourish", "simple-underline", "framed", "none"]),
  section_dividers: z.enum(["thin-line", "double-line", "flourish", "ornament", "whitespace-only"]),
  corner_elements: z.enum(["ornate-flourish", "art-deco", "simple-line", "vine-motif", "none"]),
  border: z.enum(["full-frame", "partial-accents", "top-bottom-only", "none"]),
  background_pattern: z.string(), // "subtle damask at 3% opacity" or "none"
});

/**
 * Image integration style (for user-provided photos)
 */
export const imageStyleSchema = z.object({
  shape: z.enum(["rectangular", "rounded-lg", "rounded-full", "organic-blob", "polaroid"]),
  border: z.string(), // "2px gold ring", "soft shadow", "none"  
  size: z.enum(["thumbnail-40px", "small-60px", "medium-80px", "large-120px"]),
  placement: z.enum(["left-of-text", "right-of-text", "above-centered"]),
  treatment: z.enum(["natural", "sepia-tint", "high-contrast", "soft-vignette"]),
});

/**
 * Atmosphere and mood
 */
export const atmosphereSchema = z.object({
  lighting_suggestion: z.string(), // "warm candlelit, soft shadows on paper"
  quality_level: z.enum(["michelin-starred", "upscale-bistro", "artisan-cafe", "cozy-neighborhood", "fast-casual"]),
  era: z.enum(["timeless-classic", "art-deco-1920s", "mid-century-modern", "contemporary-minimal", "rustic-farmhouse", "industrial-chic"]),
  overall_mood: z.string(), // "intimate sophisticated evening"
});

/**
 * Complete menu design specification
 */
export const menuDesignSchema = z.object({
  physical: physicalAppearanceSchema,
  layout: layoutSchema,
  typography: typographySchema,
  palette: paletteSchema,
  decorations: decorationsSchema,
  image_style: imageStyleSchema,
  atmosphere: atmosphereSchema,
});

export type PhysicalAppearance = z.infer<typeof physicalAppearanceSchema>;
export type Layout = z.infer<typeof layoutSchema>;
export type Typography = z.infer<typeof typographySchema>;
export type Palette = z.infer<typeof paletteSchema>;
export type Decorations = z.infer<typeof decorationsSchema>;
export type ImageStyle = z.infer<typeof imageStyleSchema>;
export type Atmosphere = z.infer<typeof atmosphereSchema>;
export type MenuDesignSpec = z.infer<typeof menuDesignSchema>;
