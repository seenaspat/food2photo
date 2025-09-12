### Backgrounds Modularization — Implementation TODO

- **Objective**: Replace hardcoded background lists with a typed, manifest-driven catalog that supports multiple families (v3 ambience, v4 top‑down, future categories) and builds the correct prompt/background wiring automatically.
- **Outcome**: Scalable background picker, unified `bgRef` identifier, modular prompt builder, and future-proof background families.

### Deliverables
- **Catalog & Types**: Typed schema for families and items; manifest loader.
- **Prompt Builder**: Family-aware environment block + style profile deltas (ambience/top‑down).
- **API**: `POST /api/generate` accepts `bgRef`; `GET /api/backgrounds` lists items.
- **UI**: Server-driven `BackgroundPicker` replacing hardcoded arrays; tabs for families.
- **DX**: Script to auto-build the manifest from files; docs.

### Tasks
- [x] Define background types and family schema in `lib/backgrounds/types.ts`.
- [x] Implement catalog loader/resolver in `lib/backgrounds/catalog.server.ts`.
- [x] Add initial manifest at `public/backgrounds/manifest.json` (hand-authored v1).
- [x] Create generator script `scripts/build-background-catalog` to scan `public/backgrounds/v3-003` and `public/backgrounds/v4-003` and rebuild manifest.
- [x] Wire v4 top‑down using `templates/backgrounds-v4.md` + `templates/varsv4/*`.
- [x] Implement prompt builder in `lib/generation/prompt.ts` (`buildEnvSpec`, `buildCompositionPrompt`).
- [x] Extend `app/api/generate/route.ts` to accept `bgRef` and map legacy `bgPreset` → `bgRef`.
- [x] Add read‑only `app/api/backgrounds/route.ts` to list catalog items (filter/paginate).
- [x] Add “Top view” tab in `app/generatorv1/page.tsx` using catalog (keep ambience UI unchanged).
- [ ] Convert `app/generatorv1/page.tsx` to server-driven catalog props (avoid client fetch) while keeping current UI.
- [x] Replace hardcoded v3 arrays with catalog data (preserve current look/feel).
- [x] Support “Upload” mode overriding `bgRef` with user image for Image B.
- [x] Inject family template+vars into the composition template (v3, v4).
- [ ] Add light analytics hooks for background family/item selection (env‑gated).
- [ ] Add unit tests for resolver and prompt builder; type-check route changes.
- [ ] Document `bgRef` format and manifest process in `README.md`.

### Acceptance Criteria
- **No hardcoded arrays** in `app/generatorv1/page.tsx`.
- **v3 ambience** items use `backgrounds-v3.md` + `templates/varsv3/*.json` via manifest.
- **v4 top‑down** items use `backgrounds-v4.md` + `templates/varsv4/*` via manifest.
- **Back-compat**: `bgPreset` still works, mapped to `bgRef`.
- **UI**: Family tabs + gallery render from catalog; Upload works; None works.
- **Types**: No `any`, strict types for server utilities and route handler inputs/outputs.

### Open Questions
- Should top‑down constrain lens options (e.g., prefer 35mm/50mm) or adjust prompts only?
- Do we need search/tag filtering in the picker v1, or defer to vNext?
- Are future “AR templates” another family using `image_b` or a different integration?

### Notes / Best Practices
- Prefer Server Components or a typed API to load catalog data (avoid `useEffect` fetching).
- Keep templates versioned (e.g., `backgrounds-v3.md`, `backgrounds-v4.md`).
- Unify background selection via `bgRef` (e.g., `v3-ambience:ramen-shop`, `v4-topdown:<filename>`).
- Manifest is now auto-built from `public/backgrounds/v3-003` and `public/backgrounds/v4-003` via `npm run build:bg-manifest`.
