# Restaurant ambience background template (v3)

v3 extends v2 with deeper background personality, calibrated color/tone controls, and atmosphere/occlusion variables to achieve hyperreal depth and “umami”. Copy the block and fill placeholders.

```
ROLE
You are a restaurant ambience stylist for commercial food photography. Produce a single hyperrealistic restaurant background with cinematic depth and character, suitable for compositing a dish.

OBJECTIVE
Create a layered scene (foreground → midground → background) with a clean central {CLEAR_ZONE_PERCENT}% landing zone, rich but controlled highlights, and environment‑faithful dressing.

AMBIENCE
Family: {AMBIENCE_FAMILY}
Mood: {MOOD}
Palette: primary {PRIMARY_PALETTE}, accents {ACCENT_PALETTE}.
Anchor motif (one signature only): {ANCHOR_MOTIF} (place outside landing zone).

CAMERA & LENS
Focal length: {FOCAL_LENGTH_MM} mm (50/85 recommended).
Aperture: {APERTURE} (e.g., f/2.0–f/2.8) for shallow DOF.
Focus distance: {FOCUS_DISTANCE_CM} cm focused on landing zone.
Background distance: {BACKGROUND_DISTANCE_M} m behind landing zone.
Aspect ratio: {ASPECT_RATIO}. Camera height {CAMERA_HEIGHT_CM} cm, tilt {TILT_DEGREES}°. Rotate tabletop {TABLE_ROTATE_DEG}° for subtle parallax.

LIGHTING
Key: {KEY_DIRECTION} soft key, broad diffusion.
Fill: {FILL_DIRECTION} at −{FILL_EV} EV vs key.
Practicals: {PRACTICALS}; vary bulb sizes/intensities; cluster highlights (rule of thirds), avoid uniform grid.
Color temperature: Practicals {COLOR_TEMP_K} K; Fill {FILL_COLOR_TEMP_K} K (slightly cooler for separation).
Atmospheric bloom: {BLOOM_LEVEL} (subtle) around practicals; faint volumetric cones where plausible.
Shadows: soft, grounded, single‑directional (no multi‑shadow artifacts).

COLOR & TONE (cinematic grade)
Contrast curve: {CONTRAST_PRESET} (gentle filmic S curve).
Black point / white point: {BLACK_POINT} / {WHITE_POINT}.
Warm–cool split: {WARM_COOL_SPLIT} (e.g., warm key vs cooler fill by 500–800K).
Vibrance/sat: {VIBRANCE} (restrained; skin‑safe whites).
Accent pop: {ACCENT_POP_STRATEGY} (e.g., brass/jade micro‑glints; avoid candy colors).

STRUCTURE & LAYERS
- Signature items (environment‑typical, soft focus): {SIGNATURE_ITEMS}. Use 1–3 small cues only.
- Foreground/tabletop (in focus near center only):
  Material: {TABLE_MATERIAL} | Finish: {TABLE_FINISH} | Color: {TABLE_COLOR}
  Pattern scale: {TABLE_PATTERN_SCALE}; seams/grain {TABLE_SEAM_DIRECTION}; unit size {TABLE_UNIT_SIZE}; wear {TABLE_WEAR_LEVEL} (clean).
  Realism: anisotropic sheen aligned to grain; micro‑wipes; soft linear reflection band from practicals. Do not draw circular outlines, coasters, placemats, induction/cooktop rings, or plate imprints.
- Midground (soft focus): {MIDGROUND_FEATURES}. Dressing: {MIDGROUND_DRESSING}. Keep off landing zone; no readable labels.
- Background (very soft): {BACKGROUND_FEATURES}. Dressing: {BACKGROUND_DRESSING}. Straight lines straight; consistent vanishing points.
Depth plan: FG→MG {DIST_FG_TO_MG_M} m, MG→BG {DIST_MG_TO_BG_M} m for parallax.

FOOD & UTENSILS (environment‑appropriate, soft focus only; never in landing zone)
Background food silhouettes: {BACKGROUND_FOOD} (e.g., pastry silhouettes in a patisserie case, bread loaves on a back shelf, coffee cups stacked on an espresso bar).
Utensils/tools silhouettes: {BACKGROUND_TOOLS} (e.g., whisks, ladles, tampers, cutting boards) placed in mid/back layers.
Plants/greenery: {BACKGROUND_PLANTS} (e.g., small potted herbs, trailing plant on a high shelf) for life and color.

ATMOSPHERE & OCCLUSION (optional)
Kind: {ATMOSPHERE_KIND} (none | steam | kitchen haze | fireplace glow | window condensation | rain streaks on glass).
Intensity: {ATMOSPHERE_INTENSITY} (subtle by default).
Tint/direction: {ATMOSPHERE_TINT} from {ATMOSPHERE_DIRECTION}.
Occlusion: contact AO ring {AO_WIDTH_MM} mm and strength {AO_STRENGTH}. Edge micro‑shadows under props (if any; not in landing zone).

REFLECTIONS & GLARE
Table reflections: {REFLECTION_STRENGTH} (low‑medium), subjects {REFLECTION_SUBJECTS}. No harsh specular hotspots; no mirror‑finish.

BOKEH & HIGHLIGHTS
Cluster highlights; vary size/shape slightly toward edges. Keep bokeh off landing zone. No cheesy round bokeh overlays.

COMPOSITION
Reserve the landing zone clear. Allow tasteful peripheral occluders (chair back silhouette, plant shadow, glass partition reflection) at frame edges only. Emphasize {ANCHOR_MOTIF} subtly at rule‑of‑thirds intersection.

NEGATIVE GUIDANCE
No people; no readable text/logos. No menus/brand props/cutlery in the landing zone. No evenly spaced light grids; no repeating texture tiling; no cartoon/CGI look. Do not render circular tabletop marks. Any food/utensil/plant elements must appear only as soft silhouettes in mid/background layers; never sharp or intersecting the landing zone.

OUTPUT
Photorealistic, print‑ready quality; long edge ≈ 2048 px (or system default). Clean, artifact‑free, EXIF‑free; subtle fine grain; restrained highlights.
```

## Quick‑fill examples

### v3 Fine‑dining (warmer tungsten)
```
CLEAR_ZONE_PERCENT: 40
AMBIENCE_FAMILY: warm fine‑dining
MOOD: sophisticated evening
PRIMARY_PALETTE: charcoal, espresso
ACCENT_PALETTE: brushed brass, jade
ANCHOR_MOTIF: jade inlay panel with brass pendant cluster
FOCAL_LENGTH_MM: 85
APERTURE: f/2.0
FOCUS_DISTANCE_CM: 58
BACKGROUND_DISTANCE_M: 4
ASPECT_RATIO: 4:5
CAMERA_HEIGHT_CM: 38
TILT_DEGREES: 8
TABLE_ROTATE_DEG: 6
KEY_DIRECTION: left
FILL_DIRECTION: right
FILL_EV: 1.7
PRACTICALS: brass sconces + small pendants
COLOR_TEMP_K: 4000
FILL_COLOR_TEMP_K: 5000
BLOOM_LEVEL: subtle
CONTRAST_PRESET: filmic‑gentle
BLACK_POINT: 5%
WHITE_POINT: 95%
WARM_COOL_SPLIT: +800K cooler fill
VIBRANCE: medium‑low
ACCENT_POP_STRATEGY: micro‑glints on brass, restrained jade strip
TABLE_MATERIAL: honed black marble
TABLE_FINISH: honed/matte
TABLE_COLOR: deep charcoal/black
TABLE_PATTERN_SCALE: fine veining
TABLE_SEAM_DIRECTION: N/A slab
TABLE_UNIT_SIZE: N/A
TABLE_WEAR_LEVEL: pristine
SIGNATURE_ITEMS: booth back rhythm, paneling
MIDGROUND_FEATURES: upholstered booth + vertical wood panels
MIDGROUND_DRESSING: slim vase on far table, folded linen on another
BACKGROUND_FEATURES: warm pendant clusters, faint window mullions
BACKGROUND_DRESSING: rear ledge with clustered diffused votives (not a perfect line)
DIST_FG_TO_MG_M: 1.2
DIST_MG_TO_BG_M: 2.8
ATMOSPHERE_KIND: kitchen haze
ATMOSPHERE_INTENSITY: very subtle
ATMOSPHERE_TINT: warm amber
ATMOSPHERE_DIRECTION: top‑left
AO_WIDTH_MM: 2
AO_STRENGTH: low
REFLECTION_STRENGTH: low
REFLECTION_SUBJECTS: pendant bands, panel glow
```

### v3 Diner (1950s)
```
CLEAR_ZONE_PERCENT: 45
AMBIENCE_FAMILY: classic American diner
MOOD: bright nostalgic
PRIMARY_PALETTE: warm whites, cherry red, aqua
ACCENT_PALETTE: polished chrome
ANCHOR_MOTIF: checkerboard floor glimpse + chrome counter edge reflection
FOCAL_LENGTH_MM: 50
APERTURE: f/2.8
FOCUS_DISTANCE_CM: 50
BACKGROUND_DISTANCE_M: 2.5
ASPECT_RATIO: 3:2
CAMERA_HEIGHT_CM: 45
TILT_DEGREES: 12
TABLE_ROTATE_DEG: 5
KEY_DIRECTION: right
FILL_DIRECTION: left
FILL_EV: 1.3
PRACTICALS: dome pendants and booth lamps
COLOR_TEMP_K: 5200
FILL_COLOR_TEMP_K: 5600
BLOOM_LEVEL: subtle
CONTRAST_PRESET: filmic‑gentle
BLACK_POINT: 5%
WHITE_POINT: 96%
WARM_COOL_SPLIT: +400K cooler fill
VIBRANCE: medium
ACCENT_POP_STRATEGY: chrome edges micro‑glints
TABLE_MATERIAL: speckled Formica laminate
TABLE_FINISH: satin/matte
TABLE_COLOR: warm white with fine gray speckle
TABLE_PATTERN_SCALE: fine micro‑speckle
TABLE_SEAM_DIRECTION: N/A slab
TABLE_UNIT_SIZE: N/A
TABLE_WEAR_LEVEL: light patina
SIGNATURE_ITEMS: booth back with vinyl piping, aqua tile
MIDGROUND_FEATURES: booth backrest + chrome trim
MIDGROUND_DRESSING: chrome napkin holder silhouette, straw dispenser silhouette
BACKGROUND_FEATURES: pastel aqua tiled wall, blurred stools, neon wash
BACKGROUND_DRESSING: neon color wash + pendant domes; no candles
DIST_FG_TO_MG_M: 1.0
DIST_MG_TO_BG_M: 1.5
ATMOSPHERE_KIND: none
ATMOSPHERE_INTENSITY: none
AO_WIDTH_MM: 2
AO_STRENGTH: low
REFLECTION_STRENGTH: low‑medium
REFLECTION_SUBJECTS: pendant bands, chrome edge
```

### v3 Open kitchen (rustic modern)
```
CLEAR_ZONE_PERCENT: 45
AMBIENCE_FAMILY: open kitchen restaurant
MOOD: warm energetic
PRIMARY_PALETTE: umber, charcoal
ACCENT_PALETTE: copper, oak
ANCHOR_MOTIF: copper pan rack silhouette with warm pendants
FOCAL_LENGTH_MM: 50
APERTURE: f/2.5
FOCUS_DISTANCE_CM: 55
BACKGROUND_DISTANCE_M: 3
ASPECT_RATIO: 3:2
CAMERA_HEIGHT_CM: 42
TILT_DEGREES: 10
TABLE_ROTATE_DEG: 5
KEY_DIRECTION: left
FILL_DIRECTION: front‑right
FILL_EV: 1.4
PRACTICALS: under‑shelf strips and a few warm pendants
COLOR_TEMP_K: 4200
FILL_COLOR_TEMP_K: 4800
BLOOM_LEVEL: subtle
CONTRAST_PRESET: filmic‑gentle
BLACK_POINT: 6%
WHITE_POINT: 95%
WARM_COOL_SPLIT: +600K cooler fill
VIBRANCE: medium‑low
ACCENT_POP_STRATEGY: copper micro‑glints
TABLE_MATERIAL: reclaimed oak planks
TABLE_FINISH: matte
TABLE_COLOR: medium warm brown
TABLE_PATTERN_SCALE: medium grain
TABLE_SEAM_DIRECTION: left→right
TABLE_UNIT_SIZE: 10–12 cm planks
TABLE_WEAR_LEVEL: light patina
SIGNATURE_ITEMS: tiled backsplash, shelves rhythm
MIDGROUND_FEATURES: shelves with cookware silhouettes, tiled backsplash
MIDGROUND_DRESSING: stacked cutting boards, pot silhouette
BACKGROUND_FEATURES: deeper shelves and pendant bokeh
BACKGROUND_DRESSING: under‑shelf strip glow; no candles
DIST_FG_TO_MG_M: 1.3
DIST_MG_TO_BG_M: 1.7
ATMOSPHERE_KIND: steam
ATMOSPHERE_INTENSITY: subtle
ATMOSPHERE_TINT: neutral warm
ATMOSPHERE_DIRECTION: left→right
AO_WIDTH_MM: 3
AO_STRENGTH: low‑medium
REFLECTION_STRENGTH: low
REFLECTION_SUBJECTS: strip‑light band
```

