/**
 * Menu Spec Compiler
 *
 * Compiles a MenuDesignSpec and menu content into a filled prompt template.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import type { MenuDesignSpec } from "./menu-design-schema";

export interface MenuSection {
  name: string;
  items: Array<{
    name: string;
    description?: string;
    price?: string;
  }>;
}

export interface CompileMenuPromptInput {
  restaurantName?: string;
  restaurantType: string;
  sections: MenuSection[];
  designSpec: MenuDesignSpec;
}

/**
 * Format menu sections into readable text - avoid special characters that AI renders literally
 */
function formatMenuSections(sections: MenuSection[]): string {
  return sections
    .map((section) => {
      const items = section.items
        .map((item) => {
          let line = `${item.name}`;
          if (item.price) line += ` ${item.price}`;
          if (item.description) line += ` - ${item.description}`;
          return line;
        })
        .join("\n");
      return `${section.name.toUpperCase()}\n${items}`;
    })
    .join("\n\n");
}

/**
 * Load the menu template from disk
 */
async function loadMenuTemplate(): Promise<string> {
  const templatePath = path.join(process.cwd(), "templates", "menu", "menu-v1.md");
  try {
    return await readFile(templatePath, "utf8");
  } catch {
    throw new Error("Menu template not found at templates/menu/menu-v1.md");
  }
}

/**
 * Compile menu design spec and content into a filled prompt
 */
export async function compileMenuPrompt(input: CompileMenuPromptInput): Promise<string> {
  const { restaurantName, restaurantType, sections, designSpec } = input;
  const spec = designSpec;

  const template = await loadMenuTemplate();

  // Build replacements map
  const replacements: Record<string, string> = {
    // Restaurant
    "{{RESTAURANT_NAME}}": restaurantName || "Menu",
    "{{RESTAURANT_TYPE}}": restaurantType,
    "{{MENU_SECTIONS}}": formatMenuSections(sections),

    // Physical
    "{{PAPER_TYPE}}": spec.physical.paper_type,
    "{{PAPER_COLOR}}": spec.physical.paper_color,
    "{{FINISH}}": spec.physical.finish,
    "{{EDGE_TREATMENT}}": spec.physical.edge_treatment,
    "{{SPECIAL_EFFECTS}}": spec.physical.special_effects.join(", ") || "none",

    // Layout
    "{{LAYOUT_STYLE}}": spec.layout.style,
    "{{WHITESPACE_LEVEL}}": spec.layout.whitespace_level,
    "{{MARGINS}}": `${spec.layout.margins_mm.top}mm top, ${spec.layout.margins_mm.side}mm sides, ${spec.layout.margins_mm.bottom}mm bottom`,
    "{{ITEM_SPACING}}": spec.layout.item_spacing,

    // Typography - Title
    "{{TITLE_FONT}}": spec.typography.title.font,
    "{{TITLE_SIZE}}": spec.typography.title.size,
    "{{TITLE_WEIGHT}}": spec.typography.title.weight,
    "{{TITLE_CASE}}": spec.typography.title.case,
    "{{TITLE_TRACKING}}": spec.typography.title.tracking,

    // Typography - Section
    "{{SECTION_FONT}}": spec.typography.section.font,
    "{{SECTION_SIZE}}": spec.typography.section.size,
    "{{SECTION_TREATMENT}}": spec.typography.section.treatment,

    // Typography - Body
    "{{BODY_FONT}}": spec.typography.body.font,
    "{{ITEM_NAME_SIZE}}": spec.typography.body.item_name_size,
    "{{ITEM_NAME_WEIGHT}}": spec.typography.body.item_name_weight,
    "{{DESC_SIZE}}": spec.typography.body.description_size,
    "{{DESC_STYLE}}": spec.typography.body.description_style,

    // Typography - Price
    "{{PRICE_ALIGNMENT}}": spec.typography.price.alignment,
    "{{PRICE_STYLE}}": spec.typography.price.style,

    // Palette
    "{{BACKGROUND_COLOR}}": spec.palette.background,
    "{{TEXT_PRIMARY}}": spec.palette.text_primary,
    "{{TEXT_SECONDARY}}": spec.palette.text_secondary,
    "{{ACCENT_COLOR}}": spec.palette.accent,
    "{{DIVIDER_COLOR}}": spec.palette.divider,

    // Decorations
    "{{TITLE_TREATMENT}}": spec.decorations.title_treatment,
    "{{SECTION_DIVIDERS}}": spec.decorations.section_dividers,
    "{{CORNER_ELEMENTS}}": spec.decorations.corner_elements,
    "{{BORDER}}": spec.decorations.border,
    "{{BACKGROUND_PATTERN}}": spec.decorations.background_pattern,

    // Atmosphere
    "{{LIGHTING_SUGGESTION}}": spec.atmosphere.lighting_suggestion,
    "{{QUALITY_LEVEL}}": spec.atmosphere.quality_level,
    "{{ERA}}": spec.atmosphere.era,
    "{{OVERALL_MOOD}}": spec.atmosphere.overall_mood,
  };

  // Fill template
  let filled = template;
  for (const [key, value] of Object.entries(replacements)) {
    filled = filled.replaceAll(key, value);
  }

  return filled;
}
