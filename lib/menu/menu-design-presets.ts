/**
 * Menu Design Presets
 *
 * Complete design specifications for each restaurant type.
 * Based on professional menu design research.
 * 
 * TYPOGRAPHY SCALE (1.6x Ratio):
 * - Description: 14pt
 * - Item Name: 18pt
 * - Section: 28pt
 * - Title: 48pt+
 */

import type { MenuDesignSpec } from "./menu-design-schema";
import type { RestaurantType } from "./schema";

/**
 * Fine Dining - Michelin-starred elegance
 */
const FINE_DINING_SPEC: MenuDesignSpec = {
  physical: {
    paper_type: "heavy-linen",
    paper_color: "#1a1715 deep charcoal with subtle woven texture",
    finish: "matte",
    edge_treatment: "clean-cut",
    special_effects: ["foil-title"],
  },
  layout: {
    style: "single-column-centered",
    golden_zone: "center",
    whitespace_level: "generous",
    margins_mm: { top: 30, side: 35, bottom: 25 },
    item_spacing: "spacious",
  },
  typography: {
    title: {
      font: "Playfair Display, elegant high-contrast serif with graceful curves",
      size: "60pt",
      weight: "regular",
      case: "title-case",
      tracking: "wide",
    },
    section: {
      font: "Cormorant Garamond, refined classical serif",
      size: "28pt",
      weight: "medium",
      treatment: "small-caps",
    },
    body: {
      font: "Lora, warm readable serif with excellent x-height",
      item_name_size: "18pt",
      item_name_weight: "medium",
      description_size: "14pt",
      description_style: "italic",
      line_height: "1.8",
    },
    price: {
      alignment: "right-aligned",
      style: "accent-color",
      format: "$XX.XX",
    },
  },
  palette: {
    background: "#1a1715 deep charcoal with subtle warmth",
    text_primary: "#f5f0e8 warm ivory cream",
    text_secondary: "#a09890 soft champagne for descriptions",
    accent: "#c9a962 antique gold",
    divider: "#3d3835 subtle bronze",
    text_shadow: "1px 1px 3px rgba(0,0,0,0.6)", // High contrast shadow
  },
  decorations: {
    title_treatment: "underline-flourish",
    section_dividers: "flourish",
    corner_elements: "ornate-flourish",
    border: "partial-accents",
    background_pattern: "subtle damask weave at 3% opacity",
  },
  image_style: {
    shape: "rounded-full",
    border: "thin gold ring with soft glow",
    size: "medium-80px",
    placement: "above-centered",
    treatment: "soft-vignette",
  },
  atmosphere: {
    lighting_suggestion: "warm candlelit ambiance, soft shadows on textured paper",
    quality_level: "michelin-starred",
    era: "timeless-classic",
    overall_mood: "intimate sophisticated evening, hushed luxury",
  },
};

/**
 * Cafe / Bakery - Warm and welcoming
 */
const CAFE_SPEC: MenuDesignSpec = {
  physical: {
    paper_type: "kraft",
    paper_color: "#f5ebe0 warm cream with natural flecks",
    finish: "uncoated",
    edge_treatment: "rounded-corners",
    special_effects: ["none"],
  },
  layout: {
    style: "single-column-left",
    golden_zone: "none",
    whitespace_level: "moderate",
    margins_mm: { top: 20, side: 25, bottom: 20 },
    item_spacing: "comfortable",
  },
  typography: {
    title: {
      font: "Pacifico, friendly hand-written script with personality",
      size: "54pt",
      weight: "regular",
      case: "title-case",
      tracking: "normal",
    },
    section: {
      font: "Poppins, friendly rounded sans-serif",
      size: "26pt",
      weight: "medium",
      treatment: "bold",
    },
    body: {
      font: "Inter, clean modern sans-serif",
      item_name_size: "18pt",
      item_name_weight: "semibold",
      description_size: "14pt",
      description_style: "regular",
      line_height: "1.6",
    },
    price: {
      alignment: "inline-after-name",
      style: "muted",
      format: "$XX.XX",
    },
  },
  palette: {
    background: "#fdf6e3 warm cream parchment", // Light background, no shadow needed
    text_primary: "#4a3728 rich espresso brown",
    text_secondary: "#6b5344 warm coffee",
    accent: "#d4a574 caramel honey",
    divider: "#d4c4b0 soft latte",
  },
  decorations: {
    title_treatment: "none",
    section_dividers: "whitespace-only",
    corner_elements: "none",
    border: "none",
    background_pattern: "subtle coffee-stain watercolor edges",
  },
  image_style: {
    shape: "rounded-lg",
    border: "soft warm shadow",
    size: "medium-80px",
    placement: "left-of-text",
    treatment: "natural",
  },
  atmosphere: {
    lighting_suggestion: "bright morning light, cozy window-side warmth",
    quality_level: "artisan-cafe",
    era: "contemporary-minimal",
    overall_mood: "friendly welcoming morning, fresh-baked comfort",
  },
};

/**
 * Casual / Bistro - Modern and approachable
 */
const CASUAL_SPEC: MenuDesignSpec = {
  physical: {
    paper_type: "smooth-cardstock",
    paper_color: "#ffffff clean white",
    finish: "matte",
    edge_treatment: "clean-cut",
    special_effects: ["none"],
  },
  layout: {
    style: "two-column",
    golden_zone: "top-right",
    whitespace_level: "moderate",
    margins_mm: { top: 20, side: 20, bottom: 15 },
    item_spacing: "comfortable",
  },
  typography: {
    title: {
      font: "Poppins, bold geometric sans-serif",
      size: "48pt",
      weight: "bold",
      case: "title-case",
      tracking: "tight",
    },
    section: {
      font: "Poppins, clean sans-serif",
      size: "24pt",
      weight: "bold",
      treatment: "uppercase-spaced",
    },
    body: {
      font: "Inter, highly readable sans-serif",
      item_name_size: "16pt",
      item_name_weight: "semibold",
      description_size: "13pt",
      description_style: "regular",
      line_height: "1.5",
    },
    price: {
      alignment: "right-aligned",
      style: "bold",
      format: "$XX.XX",
    },
  },
  palette: {
    background: "#ffffff clean white",
    text_primary: "#1f2937 near-black slate",
    text_secondary: "#6b7280 neutral gray",
    accent: "#3b82f6 vibrant blue",
    divider: "#e5e7eb light gray",
  },
  decorations: {
    title_treatment: "simple-underline",
    section_dividers: "thin-line",
    corner_elements: "none",
    border: "none",
    background_pattern: "none",
  },
  image_style: {
    shape: "rounded-lg",
    border: "subtle shadow",
    size: "medium-80px",
    placement: "left-of-text",
    treatment: "high-contrast",
  },
  atmosphere: {
    lighting_suggestion: "bright daylight, clean and inviting",
    quality_level: "cozy-neighborhood",
    era: "contemporary-minimal",
    overall_mood: "casual friendly gathering, good vibes",
  },
};

/**
 * Asian Restaurant - Refined balance
 */
const ASIAN_SPEC: MenuDesignSpec = {
  physical: {
    paper_type: "textured-matte",
    paper_color: "#1c1917 deep ink black",
    finish: "matte",
    edge_treatment: "clean-cut",
    special_effects: ["foil-title"],
  },
  layout: {
    style: "single-column-centered",
    golden_zone: "center",
    whitespace_level: "generous",
    margins_mm: { top: 30, side: 30, bottom: 25 },
    item_spacing: "spacious",
  },
  typography: {
    title: {
      font: "Noto Serif, balanced classical serif with Asian sensibility",
      size: "54pt",
      weight: "bold",
      case: "title-case",
      tracking: "wide",
    },
    section: {
      font: "Noto Sans, clean balanced sans-serif",
      size: "28pt",
      weight: "medium",
      treatment: "uppercase-spaced",
    },
    body: {
      font: "Inter, clean modern sans-serif",
      item_name_size: "18pt",
      item_name_weight: "medium",
      description_size: "14pt",
      description_style: "regular",
      line_height: "1.7",
    },
    price: {
      alignment: "right-aligned",
      style: "accent-color",
      format: "$XX.XX",
    },
  },
  palette: {
    background: "#1c1917 deep ink with rice paper texture",
    text_primary: "#fafaf9 pure white",
    text_secondary: "#a8a29e warm stone gray",
    accent: "#dc2626 auspicious red",
    divider: "#44403c charcoal",
    text_shadow: "1px 1px 4px rgba(0,0,0,0.8)", // Strong contrast for dark background
  },
  decorations: {
    title_treatment: "simple-underline",
    section_dividers: "ornament",
    corner_elements: "simple-line",
    border: "partial-accents",
    background_pattern: "subtle bamboo or wave motif at 5% opacity",
  },
  image_style: {
    shape: "rounded-lg",
    border: "thin red accent line",
    size: "medium-80px",
    placement: "above-centered",
    treatment: "natural",
  },
  atmosphere: {
    lighting_suggestion: "warm lantern glow, dramatic contrast",
    quality_level: "upscale-bistro",
    era: "contemporary-minimal",
    overall_mood: "zen elegance, balanced harmony",
  },
};

/**
 * BBQ / Grill - Bold and rustic
 */
const BBQ_SPEC: MenuDesignSpec = {
  physical: {
    paper_type: "kraft",
    paper_color: "#292524 charred wood dark",
    finish: "uncoated",
    edge_treatment: "deckle-edge",
    special_effects: ["letterpress"],
  },
  layout: {
    style: "single-column-left",
    golden_zone: "none",
    whitespace_level: "moderate",
    margins_mm: { top: 25, side: 25, bottom: 20 },
    item_spacing: "comfortable",
  },
  typography: {
    title: {
      font: "Archivo Black, bold condensed slab with authority",
      size: "64pt",
      weight: "bold",
      case: "uppercase",
      tracking: "tight",
    },
    section: {
      font: "Oswald, tall condensed sans-serif",
      size: "36pt",
      weight: "bold",
      treatment: "uppercase-spaced",
    },
    body: {
      font: "Inter, clean readable sans-serif",
      item_name_size: "20pt",
      item_name_weight: "semibold",
      description_size: "15pt",
      description_style: "regular",
      line_height: "1.5",
    },
    price: {
      alignment: "right-aligned",
      style: "accent-color",
      format: "$XX.XX",
    },
  },
  palette: {
    background: "#292524 charred wood with smoke texture",
    text_primary: "#fef3c7 aged parchment cream",
    text_secondary: "#d6d3d1 pale ash",
    accent: "#ea580c flame orange",
    divider: "#57534e smoke gray",
    text_shadow: "1px 1px 3px rgba(0,0,0,0.7)", // Shadow for readability on wood
  },
  decorations: {
    title_treatment: "none",
    section_dividers: "thin-line",
    corner_elements: "none",
    border: "none",
    background_pattern: "subtle wood grain and char marks",
  },
  image_style: {
    shape: "rectangular",
    border: "none",
    size: "large-120px",
    placement: "above-centered",
    treatment: "high-contrast",
  },
  atmosphere: {
    lighting_suggestion: "warm fire glow, smoky atmosphere",
    quality_level: "cozy-neighborhood",
    era: "rustic-farmhouse",
    overall_mood: "bold hearty gathering, Texas smokehouse authenticity",
  },
};

/**
 * Quick Service - Clear and efficient
 */
const QUICK_SERVICE_SPEC: MenuDesignSpec = {
  physical: {
    paper_type: "smooth-cardstock",
    paper_color: "#ffffff bright white",
    finish: "subtle-gloss",
    edge_treatment: "clean-cut",
    special_effects: ["none"],
  },
  layout: {
    style: "two-column",
    golden_zone: "top-right",
    whitespace_level: "compact",
    margins_mm: { top: 15, side: 15, bottom: 15 },
    item_spacing: "tight",
  },
  typography: {
    title: {
      font: "Inter, clean modern sans-serif",
      size: "48pt",
      weight: "bold",
      case: "uppercase",
      tracking: "tight",
    },
    section: {
      font: "Inter, modern sans-serif",
      size: "26pt",
      weight: "bold",
      treatment: "uppercase-spaced",
    },
    body: {
      font: "Inter, highly readable sans-serif",
      item_name_size: "18pt",
      item_name_weight: "semibold",
      description_size: "14pt",
      description_style: "regular",
      line_height: "1.4",
    },
    price: {
      alignment: "right-aligned",
      style: "bold",
      format: "$XX.XX",
    },
  },
  palette: {
    background: "#ffffff clean white",
    text_primary: "#111827 deep black",
    text_secondary: "#6b7280 medium gray",
    accent: "#ef4444 bold red",
    divider: "#d1d5db light gray",
  },
  decorations: {
    title_treatment: "none",
    section_dividers: "thin-line",
    corner_elements: "none",
    border: "top-bottom-only",
    background_pattern: "none",
  },
  image_style: {
    shape: "rounded-lg",
    border: "none",
    size: "medium-80px",
    placement: "left-of-text",
    treatment: "high-contrast",
  },
  atmosphere: {
    lighting_suggestion: "bright even lighting, clear visibility",
    quality_level: "fast-casual",
    era: "contemporary-minimal",
    overall_mood: "quick efficient service, clear value",
  },
};

/**
 * Map of restaurant type to design specification
 */
export const MENU_DESIGN_PRESETS: Record<RestaurantType, MenuDesignSpec> = {
  "fine-dining": FINE_DINING_SPEC,
  "cafe": CAFE_SPEC,
  "casual": CASUAL_SPEC,
  "asian": ASIAN_SPEC,
  "bbq": BBQ_SPEC,
  "quick-service": QUICK_SERVICE_SPEC,
};

/**
 * Get design specification for a restaurant type
 */
export function getMenuDesignSpec(type: RestaurantType): MenuDesignSpec {
  return MENU_DESIGN_PRESETS[type] ?? MENU_DESIGN_PRESETS["casual"];
}
