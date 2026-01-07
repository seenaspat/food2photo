/**
 * Purpose-based presets for image generation.
 * Maps user intent (platform/use case) to technical camera settings.
 */

export type AspectRatio = "1:1" | "4:5" | "9:16" | "16:9" | "3:2";
export type Lens = "35mm" | "50mm" | "85mm/macro";

export interface PurposePreset {
  id: string;
  label: string;
  icon: string; // Lucide icon name
  aspectRatio: AspectRatio;
  lens: Lens;
  preservePlate: boolean;
}

export const PURPOSE_PRESETS: PurposePreset[] = [
  {
    id: "instagram-post",
    label: "Instagram Post",
    icon: "Square",
    aspectRatio: "1:1",
    lens: "50mm",
    preservePlate: true,
  },
  {
    id: "instagram-story",
    label: "Instagram Story / Reel",
    icon: "Smartphone",
    aspectRatio: "9:16",
    lens: "35mm",
    preservePlate: true,
  },
  {
    id: "tiktok",
    label: "TikTok",
    icon: "Clapperboard",
    aspectRatio: "9:16",
    lens: "35mm",
    preservePlate: true,
  },
  {
    id: "youtube",
    label: "YouTube Thumbnail",
    icon: "Play",
    aspectRatio: "16:9",
    lens: "50mm",
    preservePlate: true,
  },
  {
    id: "x-twitter",
    label: "X / Twitter",
    icon: "AtSign",
    aspectRatio: "16:9",
    lens: "50mm",
    preservePlate: true,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: "Briefcase",
    aspectRatio: "16:9",
    lens: "50mm",
    preservePlate: true,
  },
  {
    id: "blog",
    label: "Blog / Website",
    icon: "FileText",
    aspectRatio: "3:2",
    lens: "85mm/macro",
    preservePlate: true,
  },
  {
    id: "menu",
    label: "Menu",
    icon: "UtensilsCrossed",
    aspectRatio: "3:2",
    lens: "85mm/macro",
    preservePlate: true,
  },
];

/**
 * Get a purpose preset by ID, falling back to instagram-post if not found.
 */
export function getPurposePreset(id: string): PurposePreset {
  return PURPOSE_PRESETS.find((p) => p.id === id) ?? PURPOSE_PRESETS[0];
}

/**
 * Type for advanced overrides that can partially override a preset's settings.
 */
export interface AdvancedOverrides {
  aspectRatio?: AspectRatio;
  lens?: Lens;
  preservePlate?: boolean;
}

/**
 * Compute effective settings by merging preset defaults with user overrides.
 */
export function computeEffectiveSettings(
  preset: PurposePreset,
  overrides: AdvancedOverrides
): { aspectRatio: AspectRatio; lens: Lens; preservePlate: boolean } {
  return {
    aspectRatio: overrides.aspectRatio ?? preset.aspectRatio,
    lens: overrides.lens ?? preset.lens,
    preservePlate: overrides.preservePlate ?? preset.preservePlate,
  };
}
