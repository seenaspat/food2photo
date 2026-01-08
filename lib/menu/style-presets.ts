/**
 * Menu Style Presets
 * 
 * Maps restaurant types to visual style configurations.
 * All fonts are Google Fonts with OFL (Open Font License) for commercial use.
 */
import type { RestaurantType } from "./schema";

export interface MenuStylePreset {
  id: RestaurantType;
  label: string;
  icon: string;
  description: string;
  
  // Typography (Google Fonts - OFL licensed)
  headingFont: string;
  bodyFont: string;
  priceFont: string;
  
  // Colors
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  priceColor: string;
  
  // Layout
  layout: "centered" | "two-column" | "single-column";
  textAlign: "center" | "left" | "right";
  
  // Decorative
  borderStyle: "none" | "thin" | "ornate";
  sectionDivider: "line" | "dots" | "ornament" | "whitespace";
  
  // Background generation prompt hints
  backgroundPromptHints: string;
}

/**
 * Available menu style presets
 */
export const MENU_STYLE_PRESETS: MenuStylePreset[] = [
  {
    id: "fine-dining",
    label: "Fine Dining",
    icon: "🍷",
    description: "Elegant serif fonts, dark tones, minimal",
    headingFont: "Playfair Display",
    bodyFont: "Lora",
    priceFont: "Lora",
    backgroundColor: "#1a1a1a",
    textColor: "#f5f0e8",
    accentColor: "#c9a962",
    priceColor: "#c9a962",
    layout: "centered",
    textAlign: "center",
    borderStyle: "thin",
    sectionDivider: "ornament",
    backgroundPromptHints: "dark elegant textured paper, subtle gold foil accents, luxurious restaurant ambience, soft vignette, premium quality",
  },
  {
    id: "cafe",
    label: "Café / Bakery",
    icon: "☕",
    description: "Warm, handwritten feel, pastels",
    headingFont: "Pacifico",
    bodyFont: "Inter",
    priceFont: "Inter",
    backgroundColor: "#fdf6e3",
    textColor: "#4a3728",
    accentColor: "#d4a574",
    priceColor: "#6b5344",
    layout: "single-column",
    textAlign: "left",
    borderStyle: "none",
    sectionDivider: "whitespace",
    backgroundPromptHints: "warm cream paper texture, rustic wood grain edges, soft morning light, cozy cafe atmosphere, organic shapes",
  },
  {
    id: "casual",
    label: "Casual / Bistro",
    icon: "🍔",
    description: "Modern sans-serif, bright, playful",
    headingFont: "Poppins",
    bodyFont: "Inter",
    priceFont: "Inter",
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
    accentColor: "#3b82f6",
    priceColor: "#1f2937",
    layout: "two-column",
    textAlign: "left",
    borderStyle: "none",
    sectionDivider: "line",
    backgroundPromptHints: "clean white background, subtle geometric patterns, modern minimalist, bright and inviting, contemporary restaurant",
  },
  {
    id: "asian",
    label: "Asian Restaurant",
    icon: "🍜",
    description: "Clean, bold accents, balanced",
    headingFont: "Noto Serif",
    bodyFont: "Inter",
    priceFont: "Inter",
    backgroundColor: "#1c1917",
    textColor: "#fafaf9",
    accentColor: "#dc2626",
    priceColor: "#fbbf24",
    layout: "centered",
    textAlign: "center",
    borderStyle: "thin",
    sectionDivider: "line",
    backgroundPromptHints: "dark textured rice paper, subtle red and gold accents, zen minimalist, Asian restaurant elegance, bamboo texture hints",
  },
  {
    id: "bbq",
    label: "BBQ / Grill",
    icon: "🥩",
    description: "Rustic textures, wood tones, bold",
    headingFont: "Archivo Black",
    bodyFont: "Inter",
    priceFont: "Inter",
    backgroundColor: "#292524",
    textColor: "#fef3c7",
    accentColor: "#ea580c",
    priceColor: "#fbbf24",
    layout: "single-column",
    textAlign: "left",
    borderStyle: "none",
    sectionDivider: "line",
    backgroundPromptHints: "dark rustic wood texture, charred edges, smoky atmosphere, Texas BBQ steakhouse, bold and masculine",
  },
  {
    id: "quick-service",
    label: "Quick Service",
    icon: "⚡",
    description: "Clear, functional, high contrast",
    headingFont: "Inter",
    bodyFont: "Inter",
    priceFont: "Inter",
    backgroundColor: "#ffffff",
    textColor: "#111827",
    accentColor: "#ef4444",
    priceColor: "#111827",
    layout: "two-column",
    textAlign: "left",
    borderStyle: "thin",
    sectionDivider: "line",
    backgroundPromptHints: "clean white background, bold color blocks, modern fast casual, high contrast, efficient and clear",
  },
];

/**
 * Get a style preset by restaurant type
 */
export function getMenuStylePreset(type: RestaurantType): MenuStylePreset {
  return MENU_STYLE_PRESETS.find((p) => p.id === type) ?? MENU_STYLE_PRESETS[2]; // Default to casual
}

/**
 * Get all style presets for UI display
 */
export function getAllMenuStylePresets(): MenuStylePreset[] {
  return MENU_STYLE_PRESETS;
}

/**
 * Google Fonts URLs for preloading
 * These fonts are all OFL licensed for commercial use
 */
export const MENU_FONT_URLS = [
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Lora:wght@400;600&display=swap",
  "https://fonts.googleapis.com/css2?family=Pacifico&display=swap",
  "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap",
];
