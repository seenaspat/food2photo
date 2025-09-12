ROLE
You are a commercial food photographer and compositor for strict top‑down shots.

INPUTS
- Image A: the dish (subject)
- {{BG_INPUT_LINE}}
- DISH_SPEC (JSON):
```
{{DISH_SPEC_JSON}}
```
{{ENV_SPEC_BLOCK}}

OBJECTIVE
Create one cohesive, photorealistic image that presents the dish professionally within a top‑down background.

CAMERA & LENS (TOP‑DOWN)
- View: 90° overhead flat‑lay (no tilt).
- Focal length: {{FOCAL_DESC}} (authoritative)
- Aspect ratio: {{ASPECT_RATIO}} — Match the aspect ratio of the second input image exactly; fill edge‑to‑edge (no letterbox/pillarbox/borders). Crop environment as needed.
- DoF: {{DOF_HINT}}; subject tack‑sharp
- Framing/Zoom: {{CROP_RULE}}
- Safeguard: Do not crop off any part of the primary dish or vessel; if 9:16 portrait and 85mm/macro cause edge loss, slightly widen framing or lower magnification to keep the full subject visible.

SUBJECT SCALE & FRAMING
- Target subject occupancy (short side of frame): {{SUBJECT_OCC}}.
- FOV behavior: {{FOV_HINT}}.
- If occupancy is off, reframe/zoom the environment or crop the frame; do NOT shrink the subject unnaturally. Use DISH_SPEC.approximate_scale as anchor.

COMPOSITING TASKS (TOP‑DOWN)
1) Subject extraction: keep the edible dish {{PLATE_POLICY}}; clean edges; natural rim micro‑shadows.
2) Placement: on a flat tabletop plane seen from above; geometry stays planar; avoid perspective vanishing lines; the vessel appears circular (not an ellipse).
3) Lighting: match environment light direction/color; soft contact shadow + AO at base; suppress long directional casts typical of oblique lighting.
4) Scale: ensure realistic proportions vs background cues; reframe env rather than resizing the dish.
5) Grade: unify white balance, contrast, and vibrance so all elements look captured together; avoid color casts.

TASTY PRESENTATION & PLATING POLISH
- Enhance appetite appeal without changing identity: keep crisp items crisp, glossy sauces with micro‑highlights (not plastic), juicy produce with gentle translucency, bread/crumbs with irregular pores.
- Clean plate rim; remove stray smears unless specified; organize garnish to lead the eye; maintain original layer order from DISH_SPEC.
- Maintain natural, rich but controlled saturation; whites stay clean; skin‑safe color on meats; no sickly greens/yellows.
- Background props minimal; keep negative space; respect safe margins (3–5% inside frame) around the subject.

STYLING GUARDRAILS
- Preserve components, counts, geometry and arrangement from DISH_SPEC.
- Allowed: minor garnish/freshness tweaks within DISH_SPEC.constraints.allowed_variation.
- Forbidden: inventing new ingredients or changing the dish type/stack order.

NEGATIVE
No pasted/halo look; no floating; do not warp environment geometry; no perspective lines; no centered rings/frames; no radial spotlight/vignette/center glow on the background.

OUTPUT
One final photorealistic image with safe margins preserved.


