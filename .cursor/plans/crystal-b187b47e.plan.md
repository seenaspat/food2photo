<!-- b187b47e-1ec3-4d21-b38e-0f7041a75a49 a50acab2-b096-428c-ab2e-70d0ad0d0d13 -->
# Crystal Upscaling (2 credits)

### Scope

- Add `/api/upscale` route (Node runtime) that:
  - Authenticates user and rate-limits.
  - Reserves 2 credits (tokens) using the existing ledger (not just 1-credit wrapper).
  - Accepts a multipart `image` file, uploads it to Supabase Storage, generates a short‑lived signed URL, and calls Clarity Upscaler.
  - Streams the upscaled image back (binary), updates balance header, and deletes the temp object.
- Add an “Upscale (2 credits)” button in the Generator V1 preview “Regenerate” area to send the current generated image to the new route and show progress.

### Server — New route: `app/api/upscale/route.ts`

- Pattern: mirror `app/api/variant/route.ts` and `app/api/generate/route.ts` for auth, `isRateLimited`, `logApiRequest`, and headers.
- Credits (2): Use token-level RPCs instead of the 1‑credit wrapper.
  - Reserve before work; finalize with 2 on success, 0 on failure.
- Input: `multipart/form-data` with `image` (Blob from client) and optional `scale_factor` (ignored; fixed to 2).
- Temp hosting: Upload to Supabase Storage bucket `upscale-temp` and generate a signed URL (e.g., 2–5 min TTL). Delete after Clarity fetch completes.
- Clarity call:
```ts
await fetch('https://api-upscale.clarityai.co', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.CLARITY_AI_API_KEY}`,
  },
  body: JSON.stringify({ mode: 'crystal', image: signedUrl, scale_factor: 2 })
});
```

- Response handling: Expect JSON with a result URL (e.g., `result_url`); fetch it and return as binary with `Content-Type`/`Content-Disposition` and `X-Credit-Balance`. If the API returns a different field, adjust mapping accordingly.

### Billing — Extend metering for variable credits

- In `lib/metering.ts`, add token-based helpers:
  - `reserveTokens(client, { userId, requestId, apiRoute, estimatedTokens, model, metadata })` → calls `consume_tokens_if_available`.
  - `finalizeTokens(client, { userId, requestId, actualTokens, model, metadata })` → calls `finalize_token_usage`.
- Use these in `/api/upscale` with `{ estimatedTokens: 2 }` and finalize with `actualTokens: 2` if successful.

### Storage — Temp bucket

- Create Supabase Storage bucket `upscale-temp`.
  - Either public read or private with signed URLs (recommended).
  - Upload object (random key per request), generate signed URL (2–5 minutes), and delete the object after successful upscaling.

### Client — Add Upscale control in preview area

- File: `app/generatorv1/GeneratorV1Client.tsx`.
- Add state `isUpscaling`.
- In the Preview actions row (next to Regenerate/Download), add a button:
  - Label: `Upscale (2 credits)`.
  - Disabled while `isUpscaling || !generatedImageUrl`.
  - On click: fetch Blob from `generatedImageUrl`, send as `image` to `/api/upscale`, update `generatedImageUrl` with the returned Blob URL, and update `creditBalance` from `X-Credit-Balance` header.
  - Reuse the existing busy skeleton by showing when `isUpscaling`.

### Rate limits & errors

- Rate limits: same as `/api/variant` (15/min, 300/hr).
- Errors: mirror existing patterns (401 → login modal, 402 → pricing, 429 alert, 5xx alert with request id). Keep handling minimal and consistent with current code.

### Notes

- Env: `CLARITY_AI_API_KEY` must be set (already set per your note).
- If we later want 4×, we can expose a simple selector and pass `scale_factor`.

### To-dos

- [ ] Add token-based reserve/finalize helpers in lib/metering.ts
- [ ] Create /api/upscale route with 2-credit enforcement and Clarity call
- [ ] Create Supabase storage bucket upscale-temp and enable signed URLs
- [ ] Add Upscale (2 credits) button to preview actions in GeneratorV1Client.tsx
- [ ] Update credit balance from X-Credit-Balance after /api/upscale