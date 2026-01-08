/**
 * Menu Generation Library
 * 
 * Re-exports all menu-related modules.
 */

// Schemas and types
export {
    createDefaultMenuInput, createEmptyMenuItem,
    createEmptyMenuSection, menuFormatSchema, menuInputSchema, menuItemSchema,
    menuSectionSchema, restaurantTypeSchema, type MenuFormat, type MenuInput, type MenuItem,
    type MenuSection, type RestaurantType
} from "./schema";

// Style presets (legacy)
export { getAllMenuStylePresets, getMenuStylePreset, MENU_FONT_URLS, MENU_STYLE_PRESETS, type MenuStylePreset } from "./style-presets";

// Design schema and presets
export {
    menuDesignSchema, type MenuDesignSpec
} from "./menu-design-schema";

export { getMenuDesignSpec, MENU_DESIGN_PRESETS } from "./menu-design-presets";

export {
    buildMenuPrompt, buildPhotoIntegrationPrompt, type MenuPromptData, type MenuPromptSection
} from "./build-menu-prompt";

// Note: compileMenuPrompt is server-only (uses fs)
// Import directly: import { compileMenuPrompt } from "@/lib/menu/compile-menu-spec";
