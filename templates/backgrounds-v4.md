# Top‑down food background template (v4)

v4 targets overhead (90°) compositions. It controls surface, prop layout, lighting falloff, and micro‑details for plate/bowl arrangements. Copy this block and fill placeholders.

```
ROLE
You are a top‑down food photography stylist. Produce a single hyperrealistic overhead background for compositing food from above.

OBJECTIVE
Create a coherent surface + prop field seen at 90°. Reserve a clean central landing zone that is INVISIBLE (no drawn outline, no plate/board/tray/overlay, no gradient patch, no box or bracket, no text/percent labels). Never render numbers/percentages to indicate its size. It is only an empty region with no props, crumbs, or marks.

CAMERA & GEOMETRY (overhead)
View: 90° top‑down. Focal length: {FOCAL_LENGTH_MM} mm equivalent. Aperture: {APERTURE}. Focus plane: flat across frame. Lens geometry: minimal distortion; lines remain straight. Aspect ratio: {ASPECT_RATIO}. Pixel density target (for downstream upscaling): {TARGET_LONG_EDGE_PX} long edge.

SURFACE
Base: {SURFACE_BASE} (wood | marble | slate | concrete | tile | linen | paper | metal).
Color: {SURFACE_COLOR}.
Grain/vein direction: {GRAIN_DIRECTION} (left→right | top→bottom | diagonal).
Seam/grid: {SEAM_STYLE} (none | plank seams | tile grout) with spacing {SEAM_SPACING_MM} mm and thickness {SEAM_THICKNESS_MM} mm.
Finish: {SURFACE_FINISH} (matte | honed | satin). Micro‑texture: {MICRO_TEXTURE} (e.g., fine pores, linen weave).
Wear: {WEAR_LEVEL} (pristine | light patina only). Dirt/smudges: FORBIDDEN. Stains/splatters allowed: {STAIN_POLICY} (none | subtle accent only, outside landing zone). No ring outlines, no repeated decal patterns, no procedural tiling seams.

LIGHTING (overhead look)
Key direction bias: {KEY_DIRECTION} (top | left | right | bottom). Softness: {KEY_SOFTNESS} (very soft / soft / medium). Falloff/vignette: {VIGNETTE_LEVEL}. Polarization/glare control: {GLARE_POLICY} (suppress glare, preserve gentle specular band). Color temp: {COLOR_TEMP_K} K; Fill {FILL_COLOR_TEMP_K} K at −{FILL_EV} EV.
Shadow style: {SHADOW_STYLE} (soft contact shadows, minimal cast shadow length; avoid ring-like halos).

COLOR & TONE
Contrast curve: {CONTRAST_PRESET}. Black/white points: {BLACK_POINT}/{WHITE_POINT}. Palette: primary {PRIMARY_PALETTE}, accents {ACCENT_PALETTE}. Vibrance: {VIBRANCE}. Accent pop strategy: {ACCENT_POP_STRATEGY}.

PROP FIELD (all top‑down, off the landing zone)
Layout grid: {PROP_GRID} (radial ring | rule‑of‑thirds corners | scattered | diagonal sweep | perimeter band).
Prop density: {PROP_DENSITY} (sparse | medium | rich), average prop size {PROP_SIZE_MM} mm.
Textiles: {TEXTILES} (e.g., linen napkin at corner) with fold direction {TEXTILE_FOLD_DIR}.
Boards/plates: {BOARDS_PLATES} (e.g., paddle board on side, small saucer at top‑left).
Utensils: {UTENSILS} (orientation angles; no overlap into landing zone).
Herbs/crumbs/seeds: {SCATTER_POLICY} (type and density), keep clear radius {CLEAR_RADIUS_MM} mm from landing zone edge. No radial or circular scatters that imply a traced plate. No repeating pepper “spray” patterns.
Liquids/powders: {LIQUIDS_POWDERS} (drizzles, spice piles) — subtle and not glossy.
Bowl/dip fill: {BOWL_FILL_LEVEL} (e.g., 85–95% fill; liquid surface flat with subtle meniscus; no visible bottom).
Spill/drip: {DRIP_POLICY} (e.g., one small tear‑drop near bowl rim, consistent with key direction).

HUMAN DESIGN INTENT
Center negative space target: generous invisible center (do not show any value/percent/label); do not place any object centered to suggest a frame. Allowed objects: {ALLOWED_OBJECTS}. Forbidden objects: {FORBIDDEN_OBJECTS} (e.g., abstract blobs, icons, stickers, UI frames). Placement rules: {PLACEMENT_RULES} (e.g., “props hug the perimeter band; center stays empty”).

BACKGROUND FOOD & TOOLS (silhouettes, soft focus)
Food silhouettes: {BACKGROUND_FOOD} (bowls, bread ends, sliced fruit) placed per {PROP_GRID} and outside landing zone.
Tool silhouettes: {BACKGROUND_TOOLS} (peeler, ladle, chopsticks, grinder) placed at edges.
Plants/greenery: {BACKGROUND_PLANTS} (sprigs, evergreen, microgreens) for life/color.

ATMOSPHERE & OCCLUSION
AO contact gradient width {AO_WIDTH_MM} mm and strength {AO_STRENGTH} at prop contacts (use a smooth gradient, not a circular halo/ring). Micro‑dust/fiber: {DUST_LEVEL}. Steam/haze (rare in overhead): {ATMOSPHERE_KIND}/{ATMOSPHERE_INTENSITY}.

MATERIAL INTERACTION & STACKING (physics)
Stack order (top→down): {STACK_ORDER} (e.g., knife > fruit slices > flakes > surface). Objects must occlude seams/grain beneath; no seam lines should pass through objects.
Object thickness: {OBJECT_THICKNESS_MM} mm for key elements (e.g., kiwi 4 mm, mango 8 mm). Edge micro‑shadow width {EDGE_SHADOW_MM} mm.
Translucency policy: {TRANSLUCENCY_POLICY} (e.g., soft subsurface for citrus/kiwi; minimal color bleed {COLOR_BLEED_LEVEL}).
Liquid physics: viscosity {LIQUID_VISCOSITY} (honey/juice/oil), max spread diameter {LIQUID_SPREAD_MM} mm, edge bead {EDGE_BEAD_MM} mm, tear‑drop drips aligned with key direction; liquid sits level with subtle meniscus.
Scatter occlusion: {SCATTER_OCCLUSION_POLICY} (some flakes/seeds half‑overlapping edges; not all isolated; no sticker effect).

REFLECTIONS & SPECULARS
Reflection level: {REFLECTION_STRENGTH} (low for matte). If present, specular band must be narrow and physically plausible, aligned to key direction only. No rectangular softbox reflections, no horizontal/vertical light bars across the frame, no borders.

COMPOSITION RULES
Keep landing zone clean and invisible. Do NOT place any item centered to imply the landing zone (no cutting board, tray, plate, glass/acrylic rectangle, chalk circle, rounded square). Maintain {EDGE_CLEAR_MM} mm clear margin from frame edges for major props. Avoid tangents: no prop touching the inferred boundary of the landing zone.

NEGATIVE GUIDANCE
No people, no readable text/logos/numbers/percent labels. Never visualize the landing zone with any box, outline, annotation, or label. No heavy perspective skew (stay 90°). No circular rings or chalk‑like outlines in/around the landing zone. No translucent/opaque overlays (glass/acrylic), no rounded‑rectangle or plate/tray shapes in the center. No UI frames, borders, measurement lines, center guides, or compositional grids drawn into the image. No dirt, greasy smears, or procedural tiling artifacts on wood. No overdone vignette or HDR look. Avoid cloned knots or repeating grain; wood must be natural and clean. Do not place hard mid‑frame seams/creases unless explicitly specified in {SEAM_STYLE}.

REALISM SAFEGUARDS
- Shadows: single key direction; soft contact only; no duplicate or cross‑direction shadows; no halo rings.
- Materials: surfaces continuous; seams/grout only per {SEAM_STYLE}; grout width constant; no internal borders or inset frames.
- Props: every prop must be a real object (textile, board, utensil, herb). Never invent graphic shapes.
- Utensils: lie flat, no float/penetration; realistic rest/contact (e.g., chopsticks on a rest). Light 5–20° angle permissible; not perfectly orthogonal unless intentional.
- Liquids: level to camera (top‑down); subtle meniscus only; drips are physically plausible tear‑drops with soft AO; no outline rings or vector splines.
- Scale & occlusion: seeds/grains/cutlery sized realistically; overlap creates proper occlusion and AO; no hovering.
 - Seams/creases: avoid perfectly centered seams/creases. Place planks/tile grout off the midlines (offset/jittered), unless the preset explicitly requests a centered seam.

OUTPUT
Photorealistic overhead background. Long edge intention {TARGET_LONG_EDGE_PX}. Clean, artifact‑free; subtle fine grain permitted.
```

## Quick‑fill presets (top‑down)

Include in vars JSON under templates/varsv4/ and run with the v4 batch script.

