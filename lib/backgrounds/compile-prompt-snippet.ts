import type { CustomEnvironmentSpec } from "./custom-background-schema";

/**
 * Compiles a CustomEnvironmentSpec into a prose prompt snippet
 * that can be injected into the generation prompt.
 */
export function compilePromptSnippet(spec: CustomEnvironmentSpec): string {
  const lines: string[] = [
    "CUSTOM ENVIRONMENT SPECIFICATION",
    "================================",
    "",
    `AMBIENCE: ${spec.environment.ambience_family}`,
    `MOOD: ${spec.environment.mood}`,
    `SETTING: ${spec.environment.setting} ${spec.environment.venue_type}, ${spec.environment.style} style`,
    "",
    "COLOR PALETTE:",
    `- Primary: ${spec.palette.primary}`,
    `- Accent: ${spec.palette.accent}`,
    `- Temperature: ${spec.palette.warm_cool_bias}, ${spec.palette.vibrance} vibrance`,
    "",
    "TABLE/SURFACE:",
    `- Material: ${spec.surface.material}`,
    `- Finish: ${spec.surface.finish}`,
    `- Color: ${spec.surface.color}`,
    `- Texture: ${spec.surface.texture}`,
    `- Condition: ${spec.surface.wear_level}`,
    "",
    "PROFESSIONAL LIGHTING:",
    `- Key: ${spec.lighting.key_direction}`,
    `- Fill: ${spec.lighting.fill_direction}`,
    `- Color temp: ${spec.lighting.color_temp_k}K`,
    `- Practicals: ${spec.lighting.practicals}`,
    `- Quality: ${spec.lighting.quality}`,
    `- Bloom: ${spec.lighting.bloom_level}`,
    "",
    "MIDGROUND (1-2m behind subject):",
    `- Features: ${spec.midground.features}`,
    `- Dressing: ${spec.midground.dressing}`,
    "",
    "BACKGROUND:",
    `- Features: ${spec.background.features}`,
    `- Dressing: ${spec.background.dressing}`,
    `- Atmosphere: ${spec.background.atmosphere_kind}`,
    `- Anchor motif: ${spec.background.anchor_motif}`,
    "",
    `SIGNATURE ELEMENTS: ${spec.signature.unique_elements.join(", ")}`,
  ];

  if (spec.signature.cultural_markers.length > 0) {
    lines.push(
      `CULTURAL MARKERS: ${spec.signature.cultural_markers.join(", ")}`
    );
  }

  lines.push("");
  lines.push(`EXCLUDE: ${spec.signature.exclude_elements.join(", ")}`);

  return lines.join("\n");
}

/**
 * Creates a human-readable summary of the environment spec for UI display.
 */
export function createHumanSummary(spec: CustomEnvironmentSpec): string[] {
  return [
    `${spec.environment.style} ${spec.environment.venue_type} with ${spec.palette.primary.toLowerCase()} tones`,
    `${spec.surface.material} surface, ${spec.surface.finish} finish`,
    `${spec.lighting.quality} lighting with ${spec.lighting.practicals || "ambient"} sources`,
    `${spec.background.features}`,
    `Signature: ${spec.signature.unique_elements.slice(0, 2).join(", ")}`,
  ].filter(Boolean);
}
