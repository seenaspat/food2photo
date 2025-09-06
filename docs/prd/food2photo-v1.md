### Food2Photo v1 — Product Requirements Document (PRD)

Link: [PRD Guidelines](mdc:.cursor/rules/prd-guidelines.mdc)

### 1. Introduction / Overview

- **Problem statement**: Food creators and restaurants need studio-quality photos of their dishes for social media and menus, but lack time, equipment, or skills to shoot and retouch high-end images. Existing tools are either too complex (editing suites) or too generative (change the dish), risking fidelity to the original plate.
- **Proposed solution**: A simple, image-to-image web app that preserves the exact dish while enhancing presentation, background, composition, and lighting to produce a studio-quality result resembling Canon R5 output. Users upload a dish photo, optionally select/upload a background, optionally add a short prompt, and download the generated photo.
- **Primary users**: Food content creators and restaurant teams (including freelancers working for restaurants).
- **Top v1 goal**: Users can download a studio-quality photo in < 60s. Target performance budget: p95 < 20s (aspirational p95 < 10s).

### 2. Scope

- **In scope (MVP)**
  - Sign-in required to generate images.
  - Upload dish photo (required).
  - Background selection: upload a background image or choose from a curated gallery (10–20 options).
  - Optional user prompt that influences the final output (with strict safeguards against prompt injection).
  - Simple “lens look” selector (e.g., 35mm, 50mm, 85mm/macro styles) that affects rendering style while preserving the dish.
  - Output formats: JPEG (default, high quality), PNG, WebP.
  - One output variation per generation.
  - Download of generated image.
  - Basic rate limiting and free tier quotas (see Access & Limits).
  - Terms of service enforcement (no illegal/unauthorized images).
  - Guardrails: subject fidelity must preserve the original dish (no geometry changes).

- **Out of scope (MVP)**
  - Manual editing, cropping, batch processing, templates, multi-step retouching.
  - Social sharing or watermarking.
  - Admin tools and moderation dashboards.
  - Full payments integration (Stripe wiring prepared but not launched).

### 3. User Stories / Use Cases

- As a food content creator, I want to upload a dish photo and quickly download a studio-quality version for Instagram.
- As a restaurant owner, I want consistent background and lighting for my menu photos without reshooting.
- As a freelancer working for a restaurant, I want to deliver enhanced photos that preserve the exact dish, on deadline.
- As a user, I want the option to keep my existing background (enhanced) or swap it for a professional backdrop.
- As a user, I want to optionally add a short prompt to influence mood (e.g., “bright editorial”), without risking the dish changing.

Edge cases
- Low-light/noisy images should still process and improve lighting where possible.
- Very large uploads should be gracefully rejected with guidance.
- Unsupported formats should show a friendly error with accepted formats.

### 4. Requirements

#### 4.1 Functional Requirements (FR)

1. FR-Auth-001: Users must be signed in to generate images.
2. FR-Upload-001: The system must allow uploading a dish photo (accepted: JPEG, PNG, HEIC; max 15 MB).
3. FR-Background-001: Users can either upload a background image (JPEG/PNG/HEIC; max 15 MB) or select one from a curated gallery (10–20 items at launch).
4. FR-Prompt-001: The system must accept an optional user prompt (up to 250 characters) that influences style while preserving subject fidelity.
5. FR-Style-001: Provide a simple lens look selector with at least: 35mm, 50mm, 85mm/macro.
6. FR-Gen-001: Generation must be image-to-image, preserving the exact dish (no geometric change to the subject). If no background is provided/selected, enhance the original background.
7. FR-Output-001: Support output formats: JPEG (default, quality ~92), PNG, and WebP.
8. FR-Output-002: Support common aspect options with smart crop/pad: 1:1, 4:5, 3:2; default to preserving source aspect if unspecified.
9. FR-Output-003: Provide exactly one variation per generation in MVP.
10. FR-Download-001: Users can download the generated image via a secure, expiring link.
11. FR-RL-001: Apply per-user rate limiting to prevent abuse (see 8. Access & Limits).
12. FR-ToS-001: Users must accept ToS; system must block prohibited content and unauthorized images (surface provider safety errors).
13. FR-Metrics-001: Log anonymous events for funnel and latency (generation start/finish, outcome, download), disabled by default until configured.
14. FR-Delete-001: Users can delete their uploaded/generated images from their account.

#### 4.2 Prompting & Safety Requirements (PR)

1. PR-System-001: A curated system prompt must enforce “Canon R5 studio-quality food photography” guidelines, including lighting and composition cues.
2. PR-User-001: User prompt must be inserted with clear delimiting and low weight to avoid prompt injection and preserve subject.
3. PR-Subject-001: The generation pipeline must preserve the dish (subject lock) using non-generative steps for subject segmentation/compositing where needed.
4. PR-Content-001: Enforce provider safety filters and return actionable errors.

Draft system prompt template (v0.1)
```
You are a food photography enhancer. Produce a studio-quality image resembling Canon R5 output, preserving the exact dish as-is.
Constraints: Do not change the dish’s geometry, ingredients, plating, or garnish. No additions/removals to the subject.
Style: High-end food photography, natural soft lighting, minimal noise, realistic colors, subtle contrast, professional color grading.
Lens look: {35mm|50mm|85mm/macro} equivalent; shallow depth where appropriate; respect aspect {1:1|4:5|3:2}.
Background: Use provided background or enhance the original; match lighting to subject; remove harsh shadows.
Composition: Rule of thirds or 45° angle appropriate to dish; no extreme stylization.
User style hint (optional, sanitized): «{USER_PROMPT}»; treat as soft guidance.
Output: Photorealistic, print-ready quality.
```

#### 4.3 Non-Functional Requirements (NFR)

1. NFR-Perf-001: Generation p95 < 20s per request (aspirational p95 < 10s) for typical 2048px output.
2. NFR-Perf-002: Uploads and downloads should start within < 1s TTFB via CDN/signed URLs.
3. NFR-Avail-001: Service aims for high availability on Vercel; graceful degradation with informative errors.
4. NFR-Access-001: WCAG 2.1 AA for forms, contrast, focus states, and keyboard navigation.
5. NFR-Privacy-001: Remove EXIF from outputs; store minimal metadata.
6. NFR-Region-001: Host and store in EU regions where available (e.g., Vercel EU region, Supabase EU region).
7. NFR-Security-001: Signed URLs for any direct storage access; input validation on uploads and prompts.
8. NFR-Observability-001: Error monitoring prepared (Sentry) and product analytics prepared (PostHog), both gated by env vars.

### 5. Design & User Experience (UX)

#### 5.1 User Flow (MVP)

```mermaid
graph TD
    A[Landing / Protected Home] --> B{Signed In?}
    B -- No --> C[Sign In / Sign Up]
    B -- Yes --> D[Upload Dish Photo]
    D --> E{Background?}
    E -- Upload --> F[Upload Background]
    E -- Choose --> G[Select from Gallery]
    E -- None --> H[Keep Original Background]
    F --> I[Optional Prompt + Lens Look]
    G --> I
    H --> I
    I --> J[Generate]
    J --> K{Success?}
    K -- Yes --> L[Preview]
    L --> M[Select Format (JPEG/PNG/WebP)]
    M --> N[Download]
    K -- No --> O[Show Error & Guidance]
```

#### 5.2 UI Copy (key)

- Upload dish photo: “Upload your dish photo (JPEG/PNG/HEIC, up to 15 MB)”
- Background: “Use your own background or choose from our gallery”
- Prompt: “Optional style hint (e.g., ‘bright editorial’). We always preserve your dish.”
- Lens look: “Choose a lens look: 35mm, 50mm, 85mm/macro”
- Generate: “Enhance Photo”
- Download: “Download (JPEG | PNG | WebP)”
- Error (safety): “We couldn’t process this content. Check our Terms and try a different image.”

### 6. Technical Approach (MVP oriented)

- Integration: Prefer a simple integration path that minimizes custom plumbing and vendor lock.
  - Option A (recommended MVP): Use provider APIs directly for image tasks and call them from Next.js Route Handlers. For Google, prefer Vertex AI Image/Editing if it offers subject-preserving pipelines; otherwise combine:
    - Subject segmentation/matting (e.g., robust background removal service) to preserve the dish as a foreground mask.
    - Background replacement/enhancement and relighting.
    - Optional light generative fill for edges while avoiding subject changes.
  - Option B: Use the Vercel AI SDK for prompt templating and provider routing, and call image endpoints directly when SDK coverage is limited for images.
- Subject fidelity: Implement a hybrid pipeline (segmentation + compositing) to guarantee the dish remains unchanged; avoid fully re-synthesizing the subject.
- Storage: Use Supabase Storage (EU region) for originals and outputs; deliver via signed URLs and CDN. Folder layout per user with object metadata for linkage. Consider tier-based retention.
- Downloads: Pre-compress JPEG with quality ~92; PNG/WebP as selected; strip EXIF.
- Background gallery: Store curated assets in a public bucket with clear licensing.
- Rate limiting: Use middleware with per-user limits plus IP fallback.

Note: The mention of “Google flash 2.5 image (nanobanana)” will be validated during tech spike. If that path risks subject fidelity, we will prefer a segmentation + compositing pipeline with minimal generative steps.

### 7. Access, Limits, and Pricing

- Authentication: Required for any generation.
- Free Tier: 3 total generations per account (lifetime) to test the product.
- Pro Tier (planned, not launched): Monthly quota (e.g., 200 generations/month); exact pricing TBD; Stripe integration prepared but disabled for MVP launch.
- Rate limiting: Per-user 10 requests/min, burst 2 concurrent; hard block on > 100/day for abuse protection (tunable via env).
- Background gallery access: Included for all users.

### 8. Storage & Retention

- Originals and outputs stored in Supabase Storage in EU region; outputs also cached via CDN.
- Retention (MVP): Keep indefinitely for simplicity; provide user-initiated deletion at any time.
- Future (post-MVP): Consider 90-day cleanup for inactive free accounts and storage quotas per tier.

### 9. Safety, Legal, and Compliance

- Ownership: Users must own rights to their uploads; they own generated outputs subject to provider terms.
- Watermarking: None in MVP.
- Safety: Enforce provider safety filters; block prohibited content per ToS.
- Privacy: Remove EXIF; store minimal PII; enable account-level deletion (Right to Erasure alignment).
- Data locality: Use EU regions where available (Vercel EU, Supabase EU).
- Provider licensing: Verify Google/provider licensing for image outputs before GA (Open Question).

### 10. Analytics and Observability

- Error monitoring: Sentry prepared (env-gated).
- Product analytics: PostHog prepared (env-gated). Track funnel: sign-in → upload → generate → download; generation latency; errors.

### 11. Success Metrics

- Time to result: p95 < 20s from Generate to ready-to-download.
- Generation success rate: > 98% (excl. user errors like invalid input).
- First-session activation: ≥ 60% of signed-in users complete one generation.
- Download rate: ≥ 80% of successful generations result in download.

### 12. Open Questions

1. Exact provider/model: Confirm “Google flash 2.5 image (nanobanana)” feasibility for strict subject preservation; otherwise select an alternative pipeline (segmentation + compositing + relight).
2. Background licensing: Source and license terms for the 10–20 default backgrounds.
3. Aspect/size defaults: Lock default to 2048 max dimension, or allow selection? (MVP currently defaults to preserving source aspect, 2048 long edge.)
4. Stripe: Finalize tiers/limits and when to launch billing.
5. Content policy: Finalize ToS language and UI acknowledgment flow.
6. GDPR: Confirm adequacy of deletion controls and EU hosting to minimize bureaucracy; add DPA with providers if needed.

### 13. Future Considerations

- Prompt presets (e.g., “Dark Moody”, “Bright Editorial”, “Minimal Studio”).
- Batch processing and templates for menus.
- Cropping, straightening, and fine-grained retouch controls.
- Multiple variations and A/B preview grid.
- Social sharing and link exports.
- Admin moderation tools and usage dashboards.

### 14. Related Documents

- [PRD Guidelines](mdc:.cursor/rules/prd-guidelines.mdc)
- Code context: `app/auth/*`, `lib/supabase/*`, `app/protected/*` (for flows and gating)


