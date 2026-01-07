/**
 * Schema for custom environment specifications extracted from user-uploaded space photos.
 * Matches the varsv3 template structure for consistency.
 */

export interface CustomEnvironmentSpec {
  // === IDENTITY ===
  /** Short evocative name for this space, e.g., "Cozy Italian Trattoria" */
  name_suggestion: string;

  // === SPACE CLASSIFICATION ===
  environment: {
    /** indoor, outdoor, or mixed */
    setting: "indoor" | "outdoor" | "mixed";
    /** Type of venue: restaurant, cafe, bar, home kitchen, etc. */
    venue_type: string;
    /** Design style: rustic, modern, industrial, elegant, etc. */
    style: string;
    /** Feel: contemporary, vintage, classic */
    era: string;
    /** One-line description like "cozy Italian trattoria" (matches AMBIENCE_FAMILY in varsv3) */
    ambience_family: string;
    /** Two-word mood like "warm intimate" (matches MOOD in varsv3) */
    mood: string;
  };

  // === COLOR PALETTE ===
  palette: {
    /** Main colors with descriptors, like PRIMARY_PALETTE */
    primary: string;
    /** Accent materials/colors, like ACCENT_PALETTE */
    accent: string;
    /** Overall temperature bias */
    warm_cool_bias: "warm" | "neutral" | "cool";
    /** Color intensity */
    vibrance: "low" | "medium" | "high";
  };

  // === TABLE/SURFACE (Primary subject placement area) ===
  surface: {
    /** Material, like TABLE_MATERIAL */
    material: string;
    /** Finish, like TABLE_FINISH */
    finish: string;
    /** Color description, like TABLE_COLOR */
    color: string;
    /** Texture detail, like TABLE_PATTERN_SCALE */
    texture: string;
    /** Condition level */
    wear_level: "pristine" | "light patina" | "well-worn";
  };

  // === LIGHTING (Always enhanced to professional) ===
  lighting: {
    /** Primary light direction, like KEY_DIRECTION */
    key_direction: string;
    /** Fill light direction, like FILL_DIRECTION */
    fill_direction: string;
    /** Color temperature in Kelvin, like COLOR_TEMP_K */
    color_temp_k: number;
    /** Visible light sources, like PRACTICALS */
    practicals: string;
    /** Light quality */
    quality: "soft diffused" | "directional" | "dramatic";
    /** Bloom effect level */
    bloom_level: "none" | "subtle" | "medium";
  };

  // === MIDGROUND ELEMENTS ===
  midground: {
    /** Elements 1-2m behind dish, like MIDGROUND_FEATURES */
    features: string;
    /** Props and accessories, like MIDGROUND_DRESSING */
    dressing: string;
  };

  // === BACKGROUND ELEMENTS ===
  background: {
    /** Architectural elements, like BACKGROUND_FEATURES */
    features: string;
    /** Decorative elements, like BACKGROUND_DRESSING */
    dressing: string;
    /** Atmospheric effects, like ATMOSPHERE_KIND */
    atmosphere_kind: string;
    /** Signature visual element, like ANCHOR_MOTIF */
    anchor_motif: string;
  };

  // === SIGNATURE ELEMENTS (What makes this place unique) ===
  signature: {
    /** 2-4 distinctive elements */
    unique_elements: string[];
    /** Cuisine or region-specific details */
    cultural_markers: string[];
    /** Things to exclude: people, clutter, damage */
    exclude_elements: string[];
  };
}

/**
 * Stored custom background record (database model)
 */
export interface CustomBackgroundRecord {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  environment_spec: CustomEnvironmentSpec;
  prompt_snippet: string;
}

/**
 * Lite version for listings (without full spec)
 */
export interface CustomBackgroundLite {
  id: string;
  name: string;
  created_at: string;
}
