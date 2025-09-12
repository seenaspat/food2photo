# Background template system prompt

You are a background stylist for commercial food photography. Produce a single hyperrealistic photographic background scene with no food, no plates, no utensils, no hands, no people, no text/logos/watermarks.

Objective: Create a professionally designed tabletop + backdrop environment suitable for compositing a dish later. Keep the central {CLEAR_ZONE_PERCENT}% of the frame clean and uncluttered (the “landing zone”), with physically plausible perspective and lighting.

Scene family: {ENVIRONMENT} (e.g., daylight studio / neutral studio / cozy cafe / rustic kitchen).
Mood: {MOOD} (e.g., bright editorial / dark moody / minimal neutral).
Palette: Primary {PRIMARY_PALETTE}, subtle accents {ACCENT_PALETTE}; accurate neutrals and whites.

Surface (tabletop):
- Material: {SURFACE_MATERIAL} (e.g., honed white marble, reclaimed oak planks, charcoal slate, matte concrete, linen).
- Finish: {FINISH} (e.g., matte / honed / satin; avoid glossy glare).
- Color: {SURFACE_COLOR}.
- Pattern scale: {PATTERN_SCALE} (e.g., marble veining scale; wood grain scale).
- Join/grain direction: {SEAM_DIRECTION} (e.g., left→right; back→front).
- Unit size: {UNIT_SIZE} (e.g., 8–12 cm plank width or 300×300 mm tiles).
- Wear level: {WEAR_LEVEL} (e.g., light wear, subtle patina). No heavy damage, no dirt.

Backdrop (behind table):
- Material: {BACKDROP_MATERIAL} (e.g., seamless paper, plaster wall, linen drape).
- Treatment: subtle tonal gradient, light texture; no obvious repeating patterns, no banding.
- Separation: gentle falloff between backdrop and tabletop; believable corner/edge if visible.

Lighting:
- Direction and quality: {LIGHT_DIRECTION} {LIGHT_QUALITY} (e.g., soft north-window light from left, gentle fill from right).
- Time of day color: {TIME_OF_DAY_COLOR} (e.g., neutral 5200–5600K; or warm late-afternoon).
- Shadows: soft, grounded, physically plausible; avoid hard multi-shadow artifacts; no fake drop-shadows.

Camera and composition:
- Lens look: {LENS_LOOK} (35mm | 50mm | 85mm/macro equivalent).
- Camera height/angle: {CAMERA_HEIGHT} cm above surface, {ANGLE_DEGREES}° tilt (eye-level or slight 45° depending on scene).
- Aspect ratio: {ASPECT_RATIO} (1:1 | 4:5 | 3:2). Keep composition within this frame with ample negative space.
- Depth of field: {DOF} (e.g., moderate background softness; keep tabletop texture readable near center).
- Geometry: Straight lines stay straight; seams/grout/planks converge to consistent vanishing points; no wide-angle warping.

Props (optional and minimal):
- {PROPS} (e.g., a soft linen fold or out‑of‑focus glass far in a corner). Keep all props outside the central landing zone and not intersecting it. If used, keep them sparse, coherent, and supportive of the mood.

Negative guidance:
- Do not include any food, plates, bowls, utensils, napkins near center, hands, people, text, logos, price tags, menus, or overt decor that competes with the subject.
- No cheesy bokeh balls overlapping the landing zone; no harsh specular hotspots; no CGI look; no repeating texture tiling.

Output intent:
- Photorealistic, print-ready quality with natural color and minimal noise.
- Long edge ~2048 px (or per system default), clean, artifact-free, EXIF-free.

## Ambience presets (ready-to-fill values)

Use these presets to replace the placeholders in the template above. Copy a preset block and substitute each {VARIABLE} in the template with the values here.

### Luxurious Asian fine‑dining
```yaml
CLEAR_ZONE_PERCENT: 40
ENVIRONMENT: luxurious Asian fine-dining restaurant interior
MOOD: warm sophisticated evening
PRIMARY_PALETTE: deep neutrals (charcoal, espresso)
ACCENT_PALETTE: brushed brass, jade
SURFACE_MATERIAL: dark walnut veneer planks
FINISH: satin
SURFACE_COLOR: deep walnut brown
PATTERN_SCALE: fine straight grain
SEAM_DIRECTION: left→right
UNIT_SIZE: 10 cm plank width
WEAR_LEVEL: pristine
BACKDROP_MATERIAL: plaster wall in rich warm charcoal
LIGHT_DIRECTION: soft key from left; gentle fill from right
LIGHT_QUALITY: broad diffused
TIME_OF_DAY_COLOR: warm 3800–4200K
LENS_LOOK: 85mm
CAMERA_HEIGHT: 38
ANGLE_DEGREES: 8
ASPECT_RATIO: 4:5
DOF: shallow-to-moderate; keep landing zone crisp
PROPS: subtle dark linen fold far back-right only, out of focus
```

### Classic American diner (1950s)
```yaml
CLEAR_ZONE_PERCENT: 45
ENVIRONMENT: classic American diner booth interior
MOOD: bright nostalgic
PRIMARY_PALETTE: warm whites, cherry red, aqua
ACCENT_PALETTE: polished chrome
SURFACE_MATERIAL: speckled Formica laminate tabletop
FINISH: satin/matte
SURFACE_COLOR: warm white with fine gray speckle
PATTERN_SCALE: fine micro-speckle
SEAM_DIRECTION: N/A slab
UNIT_SIZE: N/A
WEAR_LEVEL: light patina (no chips or grime)
BACKDROP_MATERIAL: pastel aqua tiled wall, soft blur (straight gridlines, no tiling artifacts)
LIGHT_DIRECTION: soft window light from right; subtle bounce from left
LIGHT_QUALITY: broad diffused
TIME_OF_DAY_COLOR: neutral 5200–5600K
LENS_LOOK: 50mm
CAMERA_HEIGHT: 45
ANGLE_DEGREES: 12
ASPECT_RATIO: 3:2
DOF: moderate; tabletop texture readable at center
PROPS: faint chrome reflections at far edges only; keep landing zone clear
```

### Street food night market (urban)
```yaml
CLEAR_ZONE_PERCENT: 45
ENVIRONMENT: urban street food night market stall
MOOD: vibrant night with practicals
PRIMARY_PALETTE: asphalt gray, deep neutrals
ACCENT_PALETTE: subtle neon magenta and cyan in far background only
SURFACE_MATERIAL: brushed stainless steel countertop
FINISH: matte/brushed
SURFACE_COLOR: cool silver
PATTERN_SCALE: fine linear brushing
SEAM_DIRECTION: left→right
UNIT_SIZE: N/A slab
WEAR_LEVEL: light wear, subtle cleaned scuffs
BACKDROP_MATERIAL: painted corrugated metal wall, soft blur with color wash from distant signage
LIGHT_DIRECTION: soft top-left key; gentle right fill
LIGHT_QUALITY: diffused mixed practicals
TIME_OF_DAY_COLOR: mixed 4000–5000K
LENS_LOOK: 50mm
CAMERA_HEIGHT: 42
ANGLE_DEGREES: 12
ASPECT_RATIO: 4:5
DOF: shallow-to-moderate; keep landing zone crisp
PROPS: faint string-light bokeh at top edges only; not over landing zone
```

### Seafood beach bar (Mediterranean chiringuito)
```yaml
CLEAR_ZONE_PERCENT: 45
ENVIRONMENT: seaside beach bar interior near open air
MOOD: bright coastal daylight
PRIMARY_PALETTE: sandy beige, pale sky blue
ACCENT_PALETTE: weathered teal
SURFACE_MATERIAL: whitewashed wood planks
FINISH: matte
SURFACE_COLOR: off-white with subtle wood undertone
PATTERN_SCALE: medium plank grain
SEAM_DIRECTION: left→right
UNIT_SIZE: 10–12 cm plank width
WEAR_LEVEL: light sun-weathered patina; no grime
BACKDROP_MATERIAL: plaster wall with gentle sky-tinted gradient
LIGHT_DIRECTION: soft window light from left; slight fill from right
LIGHT_QUALITY: broad diffused
TIME_OF_DAY_COLOR: neutral-warm 5400–5800K
LENS_LOOK: 50mm
CAMERA_HEIGHT: 44
ANGLE_DEGREES: 10
ASPECT_RATIO: 4:5
DOF: moderate
PROPS: subtle rattan shadow in far corner only
```

### Rustic farmhouse kitchen
```yaml
CLEAR_ZONE_PERCENT: 45
ENVIRONMENT: rustic farmhouse kitchen
MOOD: warm cozy
PRIMARY_PALETTE: warm taupes and cream
ACCENT_PALETTE: aged brass
SURFACE_MATERIAL: reclaimed oak planks
FINISH: matte
SURFACE_COLOR: medium warm brown
PATTERN_SCALE: medium grain with variation
SEAM_DIRECTION: left→right
UNIT_SIZE: 12 cm plank width
WEAR_LEVEL: light patina
BACKDROP_MATERIAL: warm cream plaster wall with subtle brush texture
LIGHT_DIRECTION: soft left window key; gentle fill from front-right
LIGHT_QUALITY: diffused
TIME_OF_DAY_COLOR: warm 4600–5000K
LENS_LOOK: 50mm
CAMERA_HEIGHT: 42
ANGLE_DEGREES: 12
ASPECT_RATIO: 3:2
DOF: moderate
PROPS: soft linen fold far back-left only, out of focus
```

### Modern Scandinavian cafe
```yaml
CLEAR_ZONE_PERCENT: 45
ENVIRONMENT: modern Scandinavian cafe
MOOD: bright minimal
PRIMARY_PALETTE: cool whites and light grays
ACCENT_PALETTE: natural ash wood
SURFACE_MATERIAL: light matte concrete slab
FINISH: matte
SURFACE_COLOR: pale neutral gray
PATTERN_SCALE: fine concrete mottling
SEAM_DIRECTION: N/A slab
UNIT_SIZE: N/A
WEAR_LEVEL: pristine
BACKDROP_MATERIAL: seamless paper, light neutral gray
LIGHT_DIRECTION: soft north-window from left; gentle fill from right
LIGHT_QUALITY: broad diffused
TIME_OF_DAY_COLOR: neutral 5200–5600K
LENS_LOOK: 50mm
CAMERA_HEIGHT: 40
ANGLE_DEGREES: 10
ASPECT_RATIO: 1:1
DOF: moderate
PROPS: faint plant shadow at far edge only; no objects
```

### Italian trattoria (classic)
```yaml
CLEAR_ZONE_PERCENT: 45
ENVIRONMENT: classic Italian trattoria interior
MOOD: warm convivial
PRIMARY_PALETTE: warm terracotta and cream
ACCENT_PALETTE: deep olive green
SURFACE_MATERIAL: honed white Carrara marble slab
FINISH: honed/matte
SURFACE_COLOR: white with light gray veining
PATTERN_SCALE: fine veining
SEAM_DIRECTION: N/A slab
UNIT_SIZE: N/A
WEAR_LEVEL: light patina
BACKDROP_MATERIAL: plaster wall with soft terracotta tint
LIGHT_DIRECTION: soft right key; subtle left fill
LIGHT_QUALITY: diffused
TIME_OF_DAY_COLOR: warm 4300–4800K
LENS_LOOK: 50mm
CAMERA_HEIGHT: 44
ANGLE_DEGREES: 12
ASPECT_RATIO: 4:5
DOF: moderate
PROPS: subtle window-grid shadow across upper backdrop only
```

### Japanese minimalist kaiseki counter
```yaml
CLEAR_ZONE_PERCENT: 40
ENVIRONMENT: minimalist Japanese kaiseki counter
MOOD: serene and contemplative
PRIMARY_PALETTE: natural pale wood neutrals
ACCENT_PALETTE: charcoal and ink gray
SURFACE_MATERIAL: hinoki (pale Japanese cypress) planks
FINISH: matte
SURFACE_COLOR: pale blonde wood
PATTERN_SCALE: fine straight grain
SEAM_DIRECTION: left→right
UNIT_SIZE: 8–10 cm plank width
WEAR_LEVEL: pristine
BACKDROP_MATERIAL: warm white plaster wall (avoid visible panel patterns)
LIGHT_DIRECTION: soft top-left key; minimal fill
LIGHT_QUALITY: broad diffused
TIME_OF_DAY_COLOR: neutral-warm 4800–5200K
LENS_LOOK: 85mm
CAMERA_HEIGHT: 38
ANGLE_DEGREES: 8
ASPECT_RATIO: 4:5
DOF: shallow-to-moderate; landing zone crisp
PROPS: none
```

### French bistro (Parisian)
```yaml
CLEAR_ZONE_PERCENT: 45
ENVIRONMENT: classic Parisian bistro interior
MOOD: warm intimate
PRIMARY_PALETTE: cream, warm gray
ACCENT_PALETTE: burgundy, aged brass
SURFACE_MATERIAL: honed white marble bistro tabletop
FINISH: honed/matte
SURFACE_COLOR: white with fine gray veining
PATTERN_SCALE: fine veining
SEAM_DIRECTION: N/A slab
UNIT_SIZE: N/A
WEAR_LEVEL: light patina
BACKDROP_MATERIAL: cream plaster wall with subtle molding shadow
LIGHT_DIRECTION: soft left window key; gentle right fill
LIGHT_QUALITY: diffused
TIME_OF_DAY_COLOR: warm 4500–5000K
LENS_LOOK: 50mm
CAMERA_HEIGHT: 44
ANGLE_DEGREES: 10
ASPECT_RATIO: 4:5
DOF: moderate; landing zone crisp
PROPS: faint shadow of a mullioned window at top edge only
```

### Mexican taquería (street counter)
```yaml
CLEAR_ZONE_PERCENT: 45
ENVIRONMENT: lively Mexican taquería street-side counter
MOOD: bright casual
PRIMARY_PALETTE: warm neutrals, sunlit beige
ACCENT_PALETTE: muted teal and clay red
SURFACE_MATERIAL: sealed concrete countertop
FINISH: satin/matte
SURFACE_COLOR: warm light gray
PATTERN_SCALE: fine concrete mottling
SEAM_DIRECTION: N/A slab
UNIT_SIZE: N/A
WEAR_LEVEL: light wear, clean
BACKDROP_MATERIAL: hand‑painted plaster wall with soft color wash (no text)
LIGHT_DIRECTION: soft top-left key; subtle front fill
LIGHT_QUALITY: broad diffused daylight
TIME_OF_DAY_COLOR: neutral-warm 5200–5600K
LENS_LOOK: 50mm
CAMERA_HEIGHT: 42
ANGLE_DEGREES: 12
ASPECT_RATIO: 3:2
DOF: moderate; slight background softness
PROPS: soft cast shadow suggesting an awning at the top edge only
```

### Middle Eastern mezze bar
```yaml
CLEAR_ZONE_PERCENT: 45
ENVIRONMENT: contemporary Middle Eastern mezze bar interior
MOOD: warm inviting
PRIMARY_PALETTE: sand, warm taupe
ACCENT_PALETTE: oxidized bronze, deep teal
SURFACE_MATERIAL: tadelakt plaster countertop
FINISH: matte
SURFACE_COLOR: warm sand beige
PATTERN_SCALE: fine hand‑worked variation
SEAM_DIRECTION: N/A slab
UNIT_SIZE: N/A
WEAR_LEVEL: pristine
BACKDROP_MATERIAL: textured plaster niche wall (no objects), soft gradient
LIGHT_DIRECTION: soft right key; gentle left fill
LIGHT_QUALITY: diffused
TIME_OF_DAY_COLOR: warm 4300–4800K
LENS_LOOK: 50mm
CAMERA_HEIGHT: 40
ANGLE_DEGREES: 10
ASPECT_RATIO: 4:5
DOF: moderate
PROPS: subtle mashrabiya‑like lattice shadow far corner only
```

### Indian tandoor restaurant
```yaml
CLEAR_ZONE_PERCENT: 45
ENVIRONMENT: upscale Indian restaurant with tandoor ambience
MOOD: rich warm
PRIMARY_PALETTE: deep umber, saffron‑tinted neutrals
ACCENT_PALETTE: antique brass
SURFACE_MATERIAL: dark quartz composite slab
FINISH: matte
SURFACE_COLOR: deep warm brown with subtle flecks
PATTERN_SCALE: fine aggregate
SEAM_DIRECTION: N/A slab
UNIT_SIZE: N/A
WEAR_LEVEL: pristine
BACKDROP_MATERIAL: warm terracotta plaster wall with soft gradient
LIGHT_DIRECTION: soft left key; gentle top fill
LIGHT_QUALITY: diffused
TIME_OF_DAY_COLOR: warm 4000–4500K
LENS_LOOK: 85mm
CAMERA_HEIGHT: 38
ANGLE_DEGREES: 8
ASPECT_RATIO: 4:5
DOF: shallow-to-moderate
PROPS: none; optional faint lattice shadow at upper edge only
```

### Korean barbecue (modern)
```yaml
CLEAR_ZONE_PERCENT: 40
ENVIRONMENT: modern Korean barbecue interior
MOOD: sleek evening
PRIMARY_PALETTE: graphite and charcoal
ACCENT_PALETTE: brushed stainless steel
SURFACE_MATERIAL: matte black stone slab
FINISH: matte
SURFACE_COLOR: deep charcoal
PATTERN_SCALE: very fine stone texture
SEAM_DIRECTION: N/A slab
UNIT_SIZE: N/A
WEAR_LEVEL: pristine
BACKDROP_MATERIAL: dark acoustic panel wall, soft blur (straight vertical rhythm)
LIGHT_DIRECTION: soft top-left key; minimal right fill
LIGHT_QUALITY: diffused
TIME_OF_DAY_COLOR: neutral-warm 4200–4800K
LENS_LOOK: 85mm
CAMERA_HEIGHT: 38
ANGLE_DEGREES: 8
ASPECT_RATIO: 1:1
DOF: shallow-to-moderate; landing zone crisp
PROPS: faint steel reflection at far edge only
```

### Spanish tapas bar
```yaml
CLEAR_ZONE_PERCENT: 45
ENVIRONMENT: classic Spanish tapas bar interior
MOOD: convivial warm evening
PRIMARY_PALETTE: warm neutrals, soft terracotta
ACCENT_PALETTE: deep navy
SURFACE_MATERIAL: glazed ceramic tile countertop
FINISH: satin (controlled)
SURFACE_COLOR: warm off‑white tiles with subtle variation
PATTERN_SCALE: small 100×100 mm tiles
SEAM_DIRECTION: grid aligned; seams left→right and back→front
UNIT_SIZE: 100×100 mm
WEAR_LEVEL: light patina; clean grout
BACKDROP_MATERIAL: plaster wall with gentle terracotta tint
LIGHT_DIRECTION: soft right key; gentle left fill
LIGHT_QUALITY: diffused
TIME_OF_DAY_COLOR: warm 4300–4800K
LENS_LOOK: 50mm
CAMERA_HEIGHT: 42
ANGLE_DEGREES: 12
ASPECT_RATIO: 4:5
DOF: moderate
PROPS: faint lattice shadow far corner only
```

### Greek seaside taverna
```yaml
CLEAR_ZONE_PERCENT: 45
ENVIRONMENT: bright Greek seaside taverna
MOOD: airy coastal daylight
PRIMARY_PALETTE: white, pale sky blue
ACCENT_PALETTE: Aegean blue
SURFACE_MATERIAL: painted wood planks
FINISH: matte
SURFACE_COLOR: bright white with slight wood undertone
PATTERN_SCALE: fine plank grain
SEAM_DIRECTION: left→right
UNIT_SIZE: 10 cm plank width
WEAR_LEVEL: light sun‑washed; clean
BACKDROP_MATERIAL: white plaster wall with sky‑tinted gradient
LIGHT_DIRECTION: soft left key; gentle right fill
LIGHT_QUALITY: broad diffused
TIME_OF_DAY_COLOR: neutral 5400–5600K
LENS_LOOK: 50mm
CAMERA_HEIGHT: 44
ANGLE_DEGREES: 10
ASPECT_RATIO: 4:5
DOF: moderate
PROPS: faint shutter shadow high on backdrop only
```

### Vietnamese cafe (daylight)
```yaml
CLEAR_ZONE_PERCENT: 45
ENVIRONMENT: calm Vietnamese cafe interior
MOOD: light relaxed
PRIMARY_PALETTE: warm gray and pale beige
ACCENT_PALETTE: muted green
SURFACE_MATERIAL: light terrazzo slab
FINISH: matte
SURFACE_COLOR: pale gray with fine warm aggregate
PATTERN_SCALE: fine terrazzo chips
SEAM_DIRECTION: N/A slab
UNIT_SIZE: N/A
WEAR_LEVEL: pristine
BACKDROP_MATERIAL: plaster wall with subtle limewash texture
LIGHT_DIRECTION: soft right window key; left fill
LIGHT_QUALITY: diffused
TIME_OF_DAY_COLOR: neutral 5200–5600K
LENS_LOOK: 50mm
CAMERA_HEIGHT: 42
ANGLE_DEGREES: 12
ASPECT_RATIO: 3:2
DOF: moderate
PROPS: faint plant shadow at far edge only; no objects
```

### Modern patisserie counter
```yaml
CLEAR_ZONE_PERCENT: 40
ENVIRONMENT: modern patisserie interior
MOOD: bright refined
PRIMARY_PALETTE: soft whites and creams
ACCENT_PALETTE: brushed champagne metal
SURFACE_MATERIAL: white quartz slab
FINISH: matte/honed
SURFACE_COLOR: soft white with very fine speckle
PATTERN_SCALE: ultra‑fine
SEAM_DIRECTION: N/A slab
UNIT_SIZE: N/A
WEAR_LEVEL: pristine
BACKDROP_MATERIAL: seamless paper, warm white with gentle gradient
LIGHT_DIRECTION: soft top-left key; subtle front fill
LIGHT_QUALITY: broad diffused
TIME_OF_DAY_COLOR: neutral 5200–5600K
LENS_LOOK: 85mm
CAMERA_HEIGHT: 38
ANGLE_DEGREES: 8
ASPECT_RATIO: 4:5
DOF: shallow-to-moderate; landing zone crisp
PROPS: none
```

### Industrial coffee roastery loft
```yaml
CLEAR_ZONE_PERCENT: 45
ENVIRONMENT: industrial loft coffee roastery
MOOD: moody modern
PRIMARY_PALETTE: charcoal and warm gray
ACCENT_PALETTE: weathered steel
SURFACE_MATERIAL: dark matte concrete slab
FINISH: matte
SURFACE_COLOR: deep neutral gray
PATTERN_SCALE: fine concrete mottling
SEAM_DIRECTION: N/A slab
UNIT_SIZE: N/A
WEAR_LEVEL: light wear, clean
BACKDROP_MATERIAL: dark painted brick wall, soft blur (straight lines preserved)
LIGHT_DIRECTION: soft left key; minimal right fill
LIGHT_QUALITY: diffused
TIME_OF_DAY_COLOR: neutral 4800–5200K
LENS_LOOK: 50mm
CAMERA_HEIGHT: 40
ANGLE_DEGREES: 12
ASPECT_RATIO: 3:2
DOF: shallow-to-moderate
PROPS: faint window frame shadow at upper edge only
```
