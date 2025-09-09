# Restaurant ambience background template (v2)

Copy this whole block and fill the placeholders. It is designed to produce warm, layered restaurant scenes with real depth, practical lights, and midground detail while keeping a clean landing zone for food compositing.

```
ROLE
You are a restaurant ambience stylist for commercial food photography. Produce a single hyperrealistic restaurant background with a convincing sense of place.

OBJECTIVE
Create a professionally designed tabletop + environment with layered depth (foreground → midground → background). Keep the central {CLEAR_ZONE_PERCENT}% of the frame clean (the "landing zone").

SCENE FAMILY
{AMBIENCE_FAMILY} (e.g., warm fine‑dining, Parisian bistro, cozy trattoria, modern izakaya, cocktail bar, cafe at dusk).
Mood: {MOOD} (e.g., warm sophisticated evening / cozy intimate / airy daylight).
Palette: primary {PRIMARY_PALETTE}, accents {ACCENT_PALETTE}; true neutrals and skin‑safe whites.

CAMERA & LENS (depth cues)
Focal length: {FOCAL_LENGTH_MM} mm equivalent (50/85 recommended for compression).
Aperture: {APERTURE} (e.g., f/2.0–f/2.8) for cinematic shallow DOF.
Focus distance: {FOCUS_DISTANCE_CM} cm from camera (on landing zone).
Background distance: {BACKGROUND_DISTANCE_M} m behind landing zone to create separation.
Aspect ratio: {ASPECT_RATIO} (1:1 | 4:5 | 3:2). Camera height {CAMERA_HEIGHT_CM} cm, tilt {TILT_DEGREES}°. Rotate tabletop by {TABLE_ROTATE_DEG}° for subtle parallax.

LIGHTING (warmth & shape)
Key: {KEY_DIRECTION} soft key with broad diffusion.
Fill: {FILL_DIRECTION} gentle fill at −{FILL_EV} EV (e.g., 1.3–1.8 EV below key).
Practicals: include {PRACTICALS} (e.g., pendant lamps/bulkheads/sconces) in background. VARY bulb intensities and sizes; cluster highlights (rule of thirds), avoid evenly spaced grid.
Color temperature: {COLOR_TEMP_K} K for practicals; fill slightly cooler at {FILL_COLOR_TEMP_K} K to separate warmth.
Atmosphere: subtle bloom/halation around practicals and a faint volumetric haze cone near lights.
Shadows: soft, grounded, physically plausible; no multiple hard shadows.

LAYERS (what creates the restaurant vibe)
- Ambience anchor (one clear signature element only): {ANCHOR_MOTIF} (e.g., checkerboard floor glimpse, brass pendant cluster, jade lacquer inlay, bar back shelf silhouette). Use exactly one anchor to avoid clutter; place it outside the landing zone.
- Foreground/tabletop (in focus only near center):
  Material: {TABLE_MATERIAL} | Finish: {TABLE_FINISH} | Color: {TABLE_COLOR}
  Pattern scale: {TABLE_PATTERN_SCALE}; seams/grain direction {TABLE_SEAM_DIRECTION}; unit size {TABLE_UNIT_SIZE}; wear level {TABLE_WEAR_LEVEL} (clean, no grime).
  Realism: anisotropic sheen aligned to grain; micro‑scratches and wipe marks; subtle linear pendant reflection band across the surface. Do not draw circular outlines, coasters, placemats, burner/induction rings, or plate shadow imprints.
- Midground (soft focus):
  {MIDGROUND_FEATURES} (e.g., booth back, bar back with shelves, drapery, wood paneling, window mullions). Keep outside the landing zone. Add restrained, environment‑appropriate dressing: {MIDGROUND_DRESSING}. Avoid: {FORBIDDEN_DRESSING}. No readable labels; keep scale and placement realistic and off the landing zone.
- Background (very soft focus/bokeh):
  {BACKGROUND_FEATURES} (e.g., warm pendant lights, blurred tables/chairs, city window glow). Straight lines stay straight; vanishing points consistent. Add environment‑specific accents: {BACKGROUND_DRESSING}. Do not add candles or votives unless explicitly specified in {BACKGROUND_DRESSING}.

COLOR & GRADE
Filmic contrast S‑curve; rich blacks with detail; restrained highlights; subtle grain to avoid plastic CG look. Avoid sickly color casts.

COMPOSITION
Reserve the central landing zone clear. Allow tasteful peripheral occluders: edge‑of‑frame chair back silhouette, plant shadow, or soft glass partition reflection. Cluster small background highlights into groups (rule of thirds) for visual warmth; avoid evenly spaced, sterile lighting. Align panel/booth vanishing lines toward the landing zone.
Emphasize the single {ANCHOR_MOTIF} as a subtle focal cue (rule of thirds), never intersecting the landing zone.

NEGATIVE GUIDANCE
No people or readable text/logos. No menus, brand marks, cutlery or plates in the landing zone. No cheesy round bokeh over the landing zone, no harsh specular hotspots, no repeating texture tiling, no cartoon/CGI look. Do not place candles/votives unless {BACKGROUND_DRESSING} allows them for this ambience. Do not render circular marks on the tabletop (no coaster rings, placemat outlines, induction/cooktop rings, or plate imprints) — keep the landing zone clean and unmarked.

OUTPUT
Photorealistic, print‑ready quality. Long edge ≈ 2048 px (or system default). Clean, artifact‑free, EXIF‑free. Subtle fine grain; filmic S‑curve; rich blacks with detail; restrained highlights.
```

## Quick‑fill examples

### Warm fine‑dining (tungsten)
```
CLEAR_ZONE_PERCENT: 40
AMBIENCE_FAMILY: warm fine‑dining
MOOD: sophisticated evening
PRIMARY_PALETTE: charcoal, espresso
ACCENT_PALETTE: brushed brass, jade
FOCAL_LENGTH_MM: 85
APERTURE: f/2.2
FOCUS_DISTANCE_CM: 55
BACKGROUND_DISTANCE_M: 3.5
ASPECT_RATIO: 4:5
CAMERA_HEIGHT_CM: 38
TILT_DEGREES: 8
KEY_DIRECTION: left
FILL_DIRECTION: right
PRACTICALS: two brass sconces and a pendant cluster in the background
COLOR_TEMP_K: 4000
TABLE_MATERIAL: honed black marble slab with subtle warm gold veining
TABLE_FINISH: honed/matte
TABLE_COLOR: deep charcoal/black
TABLE_PATTERN_SCALE: fine veining
TABLE_SEAM_DIRECTION: N/A slab
TABLE_UNIT_SIZE: N/A
TABLE_WEAR_LEVEL: pristine
MIDGROUND_FEATURES: wood panel wall with vertical rhythm and soft drapery fold
BACKGROUND_FEATURES: warm pendant bokeh and faint window mullions
MIDGROUND_DRESSING: single stem in slim vase on far corner table; folded linen on distant table edge
BACKGROUND_DRESSING: slim rear ledge with clustered diffused votives (not a perfect line), brass sconces and small pendant cluster
FORBIDDEN_DRESSING: neon signage, ketchup bottles, brand‑like props
```

### Cozy bistro (evening)
```
CLEAR_ZONE_PERCENT: 45
AMBIENCE_FAMILY: Parisian bistro
MOOD: intimate and inviting
PRIMARY_PALETTE: cream, warm gray
ACCENT_PALETTE: burgundy, aged brass
FOCAL_LENGTH_MM: 50
APERTURE: f/2.8
FOCUS_DISTANCE_CM: 50
BACKGROUND_DISTANCE_M: 2.5
ASPECT_RATIO: 3:2
CAMERA_HEIGHT_CM: 44
TILT_DEGREES: 12
KEY_DIRECTION: right
FILL_DIRECTION: left
PRACTICALS: small pendant lights and candle‑like glow in background only
COLOR_TEMP_K: 4400
TABLE_MATERIAL: honed white marble
TABLE_FINISH: honed/matte
TABLE_COLOR: white with fine gray veining
TABLE_PATTERN_SCALE: fine
TABLE_SEAM_DIRECTION: N/A slab
TABLE_UNIT_SIZE: N/A
TABLE_WEAR_LEVEL: light patina
MIDGROUND_FEATURES: booth backrest and wood molding
BACKGROUND_FEATURES: blurred tables/chairs, pendant bokeh
MIDGROUND_DRESSING: carafe silhouette and a bud vase at a far table
BACKGROUND_DRESSING: small candle clusters on a rear ledge (not evenly spaced)
FORBIDDEN_DRESSING: neon signage, industrial ducting
```

### Open kitchen (rustic modern)
```
CLEAR_ZONE_PERCENT: 45
AMBIENCE_FAMILY: open kitchen restaurant
MOOD: warm energetic
PRIMARY_PALETTE: umber, charcoal
ACCENT_PALETTE: copper, oak
FOCAL_LENGTH_MM: 50
APERTURE: f/2.5
FOCUS_DISTANCE_CM: 55
BACKGROUND_DISTANCE_M: 3
ASPECT_RATIO: 3:2
CAMERA_HEIGHT_CM: 42
TILT_DEGREES: 10
KEY_DIRECTION: left
FILL_DIRECTION: front‑right
PRACTICALS: under‑shelf strips and a few warm pendants far back
COLOR_TEMP_K: 4200
TABLE_MATERIAL: reclaimed oak planks
TABLE_FINISH: matte
TABLE_COLOR: medium warm brown
TABLE_PATTERN_SCALE: medium grain
TABLE_SEAM_DIRECTION: left→right
TABLE_UNIT_SIZE: 10–12 cm planks
TABLE_WEAR_LEVEL: light patina
MIDGROUND_FEATURES: blurred shelves with cookware silhouettes, tiled backsplash
BACKGROUND_FEATURES: deeper shelves and pendants with warm bokeh
MIDGROUND_DRESSING: stacked cutting boards and a pot silhouette on a back counter
BACKGROUND_DRESSING: under‑shelf strip glow and pendant cluster; no candles
FORBIDDEN_DRESSING: neon signage, votive rows
```


