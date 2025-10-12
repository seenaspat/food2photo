export interface QualityPolicy {
  start: number;
  floor: number;
  step: number;
}

export interface PrepareImageOptions {
  budgetBytes: number;
  preferredMimes: readonly ["image/webp", "image/jpeg"] | readonly string[];
  longEdge: number;
  fallbackLongEdges: readonly number[]; // tried if budget not met at longEdge
  quality: {
    webp: QualityPolicy;
    jpeg: QualityPolicy;
  };
  alphaBackground: string; // used to flatten transparent images
  heicPolicy: "promptOnUnsupported" | "none";
}

const DEFAULTS: PrepareImageOptions = {
  budgetBytes: 2 * 1024 * 1024, // 2 MB
  preferredMimes: ["image/webp", "image/jpeg"],
  longEdge: 1280,
  fallbackLongEdges: [1152, 1024],
  quality: {
    webp: { start: 0.82, floor: 0.65, step: 0.05 },
    jpeg: { start: 0.85, floor: 0.75, step: 0.05 },
  },
  alphaBackground: "#ffffff",
  heicPolicy: "promptOnUnsupported",
};

function clampQuality(q: number): number {
  if (Number.isNaN(q)) return 0.8;
  if (q < 0) return 0;
  if (q > 1) return 1;
  return q;
}

function getExtForMime(mime: string): string {
  if (mime === "image/webp") return "webp";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  return "bin";
}

function replaceExtension(filename: string, newExt: string): string {
  const idx = filename.lastIndexOf(".");
  const base = idx > 0 ? filename.slice(0, idx) : filename;
  return `${base}.${newExt}`;
}

async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    // Attempt to ensure the image is fully decoded
    try {
      // Not all browsers implement decode, but when available it helps
      await (img as HTMLImageElement & { decode?: () => Promise<void> }).decode?.();
    } catch {}
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function computeTargetSize(srcW: number, srcH: number, targetLongEdge: number): { width: number; height: number } {
  const long = Math.max(srcW, srcH);
  if (long <= targetLongEdge) return { width: srcW, height: srcH };
  const scale = targetLongEdge / long;
  return { width: Math.round(srcW * scale), height: Math.round(srcH * scale) };
}

function parseCssColorToRgb(color: string): { r: number; g: number; b: number } {
  // Very small parser for hex colors (#rgb / #rrggbb)
  const c = color.trim();
  if (/^#([0-9a-fA-F]{3})$/.test(c)) {
    const r = parseInt(c[1] + c[1], 16);
    const g = parseInt(c[2] + c[2], 16);
    const b = parseInt(c[3] + c[3], 16);
    return { r, g, b };
  }
  if (/^#([0-9a-fA-F]{6})$/.test(c)) {
    const r = parseInt(c.slice(1, 3), 16);
    const g = parseInt(c.slice(3, 5), 16);
    const b = parseInt(c.slice(5, 7), 16);
    return { r, g, b };
  }
  // Fallback to white
  return { r: 255, g: 255, b: 255 };
}

async function canvasEncode(
  img: HTMLImageElement,
  dims: { width: number; height: number },
  mime: string,
  quality?: number,
  alphaBackground?: string
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(dims.width));
  canvas.height = Math.max(1, Math.floor(dims.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  if (alphaBackground) {
    const { r, g, b } = parseCssColorToRgb(alphaBackground);
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  // Draw image scaled to fit canvas
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const q = typeof quality === "number" ? clampQuality(quality) : undefined;
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Encoding failed"))), mime, q);
  });
  return blob;
}

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

export async function prepareImageForUpload(file: File, opts?: Partial<PrepareImageOptions>): Promise<File> {
  const options: PrepareImageOptions = { ...DEFAULTS, ...(opts || {}) };

  if (!isImageFile(file)) return file;

  // HEIC handling policy
  if (file.type === "image/heic" && options.heicPolicy === "promptOnUnsupported") {
    // Some browsers (e.g., Chrome) cannot decode HEIC natively; attempt decode and if it fails, throw
    try {
      await loadImageFromFile(file);
    } catch {
      throw new Error("HEIC is not supported on this browser. Please upload a JPEG or PNG.");
    }
  }

  // Decode to get intrinsic dimensions
  const img = await loadImageFromFile(file);
  const srcW = img.naturalWidth || (img as any).width || 0;
  const srcH = img.naturalHeight || (img as any).height || 0;
  if (srcW <= 0 || srcH <= 0) return file;

  // Early return if image is already within budget, dimensions at/below target, and in preferred format
  const long = Math.max(srcW, srcH);
  const preferredSet = new Set(options.preferredMimes);
  if (file.size <= options.budgetBytes && long <= options.longEdge && preferredSet.has(file.type)) {
    return file;
  }

  // Build list of target long edges (without upscaling)
  const longEdges: number[] = [options.longEdge, ...options.fallbackLongEdges]
    .filter((edge) => edge > 0)
    .filter((edge, idx, arr) => arr.indexOf(edge) === idx) // dedupe
    .filter((edge) => Math.max(srcW, srcH) >= edge);
  if (longEdges.length === 0) longEdges.push(Math.max(srcW, srcH));

  // Track best (smallest) blob in case we cannot hit budget
  let best: { blob: Blob; mime: string; width: number; height: number } | null = null;

  const tryMimeList = options.preferredMimes as readonly string[];

  for (const targetLong of longEdges) {
    const dims = computeTargetSize(srcW, srcH, targetLong);
    for (const mime of tryMimeList) {
      const qPolicy: QualityPolicy | undefined = mime === "image/webp" ? options.quality.webp : mime === "image/jpeg" ? options.quality.jpeg : undefined;
      if (!qPolicy) continue;
      for (let q = qPolicy.start; q >= qPolicy.floor - 1e-6; q -= qPolicy.step) {
        const blob = await canvasEncode(img, dims, mime, q, options.alphaBackground);
        // Some browsers may ignore unsupported mime and return a different type
        if (blob.type !== mime) {
          continue;
        }
        if (!best || blob.size < best.blob.size) best = { blob, mime, width: dims.width, height: dims.height };
        if (blob.size <= options.budgetBytes) {
          const ext = getExtForMime(mime);
          const name = replaceExtension(file.name, ext);
          return new File([blob], name, { type: mime });
        }
      }
    }
  }

  // If we reached here, return the smallest we produced, or original as last resort
  if (best) {
    const ext = getExtForMime(best.mime);
    const name = replaceExtension(file.name, ext);
    return new File([best.blob], name, { type: best.mime });
  }
  return file;
}


