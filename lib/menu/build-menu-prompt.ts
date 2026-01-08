/**
 * Menu Prompt Builder
 *
 * Builds detailed prompts for AI-native menu generation.
 * Generates complete menus with text, layout, and design in a single pass.
 */

import type { MenuStylePreset } from "./style-presets";

export interface MenuPromptSection {
  name: string;
  items: Array<{
    name: string;
    description?: string;
    price?: string;
    hasImage?: boolean;
  }>;
}

export interface MenuPromptData {
  restaurantName?: string;
  restaurantType: string;
  sections: MenuPromptSection[];
  style: MenuStylePreset;
  format: "letter" | "a4";
  includeImagePlaceholders?: boolean;
}

/**
 * Format menu sections into readable text for the prompt
 */
function formatSections(sections: MenuPromptSection[]): string {
  return sections
    .map((section) => {
      const items = section.items
        .map((item) => {
          let line = `  • ${item.name}`;
          if (item.price) line += ` — ${item.price}`;
          if (item.description) line += `\n    ${item.description}`;
          return line;
        })
        .join("\n");
      return `### ${section.name}\n${items}`;
    })
    .join("\n\n");
}

/**
 * Get layout-specific instructions
 */
function getLayoutInstructions(style: MenuStylePreset): string {
  switch (style.layout) {
    case "centered":
      return "Center all text horizontally. Create a balanced, symmetrical layout.";
    case "two-column":
      return "Use a two-column layout for menu items. Section headers span full width.";
    case "single-column":
      return "Use a single column layout with items flowing top to bottom.";
    default:
      return "Create a balanced, readable layout.";
  }
}

/**
 * Get typography instructions based on fonts
 */
function getTypographyInstructions(style: MenuStylePreset): string {
  const instructions = [
    `Heading font style: ${style.headingFont} (elegant ${style.headingFont.includes("Serif") || style.headingFont.includes("Playfair") ? "serif" : "sans-serif"})`,
    `Body font style: ${style.bodyFont} (clean, readable)`,
    `All text must be sharp, perfectly legible, and correctly spelled`,
    `Restaurant name should be prominent and styled as the main title`,
    `Section headers should be clearly distinguished from item names`,
    `Prices should be clearly visible and aligned consistently`,
  ];
  return instructions.join("\n");
}

/**
 * Build the complete menu generation prompt
 */
export function buildMenuPrompt(data: MenuPromptData): string {
  const { restaurantName, sections, style, format, includeImagePlaceholders } = data;

  const aspectRatio = format === "letter" ? "8.5:11 (US Letter)" : "210:297 (A4)";

  const prompt = `
Generate a complete, print-ready restaurant menu image.

## Restaurant
${restaurantName ? `Name: "${restaurantName}"` : "No restaurant name - create an elegant header area"}
Type: ${style.label}
Ambiance: ${style.description}

## Menu Content
${formatSections(sections)}

## Design Specifications

### Colors
- Background: ${style.backgroundColor} (or textured variation)
- Primary text: ${style.textColor}
- Accent/headings: ${style.accentColor}
- Prices: ${style.priceColor}

### Typography
${getTypographyInstructions(style)}

### Layout
- Format: ${aspectRatio} portrait orientation
- ${getLayoutInstructions(style)}
- Generous margins for print trimming
- Clear visual hierarchy: title → sections → items → descriptions → prices

### Style & Atmosphere
${style.backgroundPromptHints}

### Critical Requirements
1. ALL text must be perfectly spelled and legible
2. Create a cohesive, professional design (NOT a collage)
3. Background, typography, and decorative elements should harmonize
4. ${includeImagePlaceholders ? "Include elegant placeholder areas for food photos (decorative frames or subtle shapes)" : "No food photo placeholders needed"}
5. Suitable for professional printing at 300 DPI
6. The menu should look like it was designed by a professional graphic designer

Generate only the menu image. No additional text or explanation.
`.trim();

  return prompt;
}

/**
 * Build a prompt for integrating food photos into an existing menu
 */
export function buildPhotoIntegrationPrompt(
  itemNames: string[],
  options?: { lightingStyle?: string }
): string {
  const { lightingStyle = "soft, natural" } = options ?? {};

  return `
Edit this menu image to integrate the provided food photographs.

## Task
Seamlessly blend the food photos into the menu design at their corresponding item locations.

## Food Photos to Place
${itemNames.map((name, i) => `${i + 1}. "${name}"`).join("\n")}

## Integration Requirements
1. Match the menu's existing lighting and color temperature
2. Add subtle shadows beneath photos for depth
3. Frame photos elegantly (rounded corners, soft edges, or decorative borders matching the menu style)
4. Maintain all existing text exactly as shown
5. Photos should look naturally integrated, not pasted on
6. Use ${lightingStyle} lighting treatment on photos

## Critical
- DO NOT alter any text content
- DO NOT change the overall menu layout
- Photos should enhance the menu, not overpower it

Generate only the edited menu image.
`.trim();
}
