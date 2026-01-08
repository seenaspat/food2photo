/**
 * Menu Generation Schemas
 * 
 * Zod 4 schemas for validating menu input data.
 * Used for both client-side form validation and server-side API validation.
 */
import { z } from "zod/v4";

/**
 * Single menu item with optional image
 */
export const menuItemSchema = z.object({
  id: z.uuid(),
  name: z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(1, "Item name required").max(80, "Name max 80 characters")),
  description: z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().max(200, "Description max 200 characters"))
    .optional()
    .or(z.literal("")),
  price: z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().regex(/^(\$?\d+(\.\d{2})?)?$/, "Invalid price (e.g., $12.00)"))
    .optional()
    .or(z.literal("")),
  // Client-side: File object for upload
  imageFile: z.instanceof(File).optional(),
  // After upload: URL for preview/rendering
  imageUrl: z.string().url().optional(),
});

/**
 * Menu section (e.g., "Appetizers", "Mains")
 */
export const menuSectionSchema = z.object({
  id: z.uuid(),
  name: z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(1, "Section name required").max(40, "Section name max 40 characters")),
  items: z
    .array(menuItemSchema)
    .min(1, "At least one item required")
    .max(15, "Maximum 15 items per section"),
});

/**
 * Restaurant type enum - maps to style presets
 */
export const restaurantTypeSchema = z.enum([
  "fine-dining",
  "cafe",
  "casual",
  "asian",
  "bbq",
  "quick-service",
]);

/**
 * Menu format/size options
 */
export const menuFormatSchema = z.enum(["letter", "a4"]);

/**
 * Complete menu input for generation
 */
export const menuInputSchema = z.object({
  restaurantName: z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().max(60, "Restaurant name max 60 characters"))
    .optional(),
  // Free-form description of restaurant vibe/style for AI to interpret
  vibeDescription: z
    .string()
    .transform((s) => s.trim())
    .pipe(
      z.string()
        .min(10, "Describe your vibe in at least 10 characters")
        .max(200, "Vibe description max 200 characters")
    )
    .optional(),
  // Legacy: still supported as fallback if no vibeDescription
  restaurantType: restaurantTypeSchema.optional(),
  sections: z
    .array(menuSectionSchema)
    .min(1, "At least one section required")
    .max(5, "Maximum 5 sections")
    .refine(
      (sections) => sections.reduce((sum, s) => sum + s.items.length, 0) <= 14,
      "Maximum 14 items total (menu has limited space)"
    ),
  format: menuFormatSchema.default("letter"),
});

// Type exports
export type MenuItem = z.infer<typeof menuItemSchema>;
export type MenuSection = z.infer<typeof menuSectionSchema>;
export type RestaurantType = z.infer<typeof restaurantTypeSchema>;
export type MenuFormat = z.infer<typeof menuFormatSchema>;
export type MenuInput = z.infer<typeof menuInputSchema>;

/**
 * Helper to create a new empty menu item
 */
export function createEmptyMenuItem(): MenuItem {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "", // Use empty string for controlled inputs
    price: "", // Use empty string for controlled inputs
    imageFile: undefined,
    imageUrl: undefined,
  };
}

/**
 * Helper to create a new empty menu section
 */
export function createEmptyMenuSection(name = ""): MenuSection {
  return {
    id: crypto.randomUUID(),
    name,
    items: [createEmptyMenuItem()],
  };
}

/**
 * Helper to create a default menu input
 */
export function createDefaultMenuInput(): MenuInput {
  return {
    restaurantName: undefined,
    vibeDescription: undefined,  // AI will generate design from this
    restaurantType: undefined,   // Only used as fallback
    sections: [createEmptyMenuSection("Menu")],
    format: "letter",
  };
}
