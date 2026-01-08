/**
 * Client-Side Menu Renderer
 *
 * Renders the final menu on a canvas element in the browser.
 * Uses Google Fonts loaded via CSS and composites:
 * 1. AI-generated background
 * 2. Programmatic text overlay
 * 3. Enhanced food images
 */

import type { MenuStylePreset } from "./style-presets";

export interface MenuRenderData {
  restaurantName?: string;
  sections: Array<{
    name: string;
    items: Array<{
      id: string;
      name: string;
      description?: string;
      price?: string;
    }>;
  }>;
  backgroundUrl?: string;
  enhancedImages?: Array<{ itemId: string; url: string }>;
  style: Pick<
    MenuStylePreset,
    | "headingFont"
    | "bodyFont"
    | "priceFont"
    | "backgroundColor"
    | "textColor"
    | "accentColor"
    | "priceColor"
    | "layout"
    | "textAlign"
  >;
}

// Standard menu dimensions at 300 DPI
const MENU_DIMENSIONS = {
  letter: { width: 2550, height: 3300 }, // 8.5" x 11" at 300 DPI
  a4: { width: 2480, height: 3508 }, // 210mm x 297mm at 300 DPI
};

/**
 * Load an image from URL into HTMLImageElement
 */
async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Render a menu to a canvas element
 */
export async function renderMenuToCanvas(
  canvas: HTMLCanvasElement,
  data: MenuRenderData,
  format: "letter" | "a4" = "letter"
): Promise<void> {
  const dims = MENU_DIMENSIONS[format];
  canvas.width = dims.width;
  canvas.height = dims.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  const style = data.style;

  // 1. Draw background
  if (data.backgroundUrl) {
    try {
      const bgImg = await loadImage(data.backgroundUrl);
      ctx.drawImage(bgImg, 0, 0, dims.width, dims.height);
    } catch {
      // Fallback to solid color
      ctx.fillStyle = style.backgroundColor;
      ctx.fillRect(0, 0, dims.width, dims.height);
    }
  } else {
    ctx.fillStyle = style.backgroundColor;
    ctx.fillRect(0, 0, dims.width, dims.height);
  }

  // Create enhanced images map
  const imageMap = new Map(data.enhancedImages?.map((i) => [i.itemId, i.url]) ?? []);

  // Layout constants (scaled for 300 DPI)
  const MARGIN_X = 200;
  const MARGIN_TOP = 300;
  const SECTION_GAP = 150;
  const ITEM_GAP = 80;
  const IMAGE_SIZE = 200;

  let currentY = MARGIN_TOP;

  // 2. Draw restaurant name (if provided)
  if (data.restaurantName) {
    ctx.font = `bold 120px "${style.headingFont}", serif`;
    ctx.fillStyle = style.accentColor;
    ctx.textAlign = style.textAlign === "center" ? "center" : "left";
    const textX = style.textAlign === "center" ? dims.width / 2 : MARGIN_X;
    ctx.fillText(data.restaurantName, textX, currentY);
    currentY += 180;
  }

  // 3. Draw sections
  for (const section of data.sections) {
    // Section name
    ctx.font = `bold 72px "${style.headingFont}", serif`;
    ctx.fillStyle = style.accentColor;
    ctx.textAlign = style.textAlign === "center" ? "center" : "left";
    const sectionX = style.textAlign === "center" ? dims.width / 2 : MARGIN_X;
    ctx.fillText(section.name, sectionX, currentY);
    currentY += 100;

    // Section divider
    ctx.strokeStyle = style.accentColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(MARGIN_X, currentY);
    ctx.lineTo(dims.width - MARGIN_X, currentY);
    ctx.stroke();
    ctx.globalAlpha = 1;
    currentY += 50;

    // Items
    for (const item of section.items) {
      const itemImageUrl = imageMap.get(item.id);
      const hasImage = Boolean(itemImageUrl);
      const itemStartY = currentY;

      // Draw item image (if available)
      if (hasImage && itemImageUrl) {
        try {
          const itemImg = await loadImage(itemImageUrl);
          const imgX = style.layout === "two-column" ? dims.width - MARGIN_X - IMAGE_SIZE : MARGIN_X;
          ctx.drawImage(itemImg, imgX, currentY, IMAGE_SIZE, IMAGE_SIZE);
        } catch {
          // Skip image on error
        }
      }

      // Adjust text position based on image presence and layout
      const textStartX = hasImage && style.layout !== "two-column" ? MARGIN_X + IMAGE_SIZE + 40 : MARGIN_X;
      const textMaxWidth = hasImage ? dims.width - MARGIN_X * 2 - IMAGE_SIZE - 60 : dims.width - MARGIN_X * 2;

      // Item name
      ctx.font = `600 48px "${style.bodyFont}", sans-serif`;
      ctx.fillStyle = style.textColor;
      ctx.textAlign = "left";
      ctx.fillText(item.name, textStartX, currentY + 50, textMaxWidth - 200);

      // Price (aligned right)
      if (item.price) {
        ctx.font = `600 48px "${style.priceFont}", sans-serif`;
        ctx.fillStyle = style.priceColor;
        ctx.textAlign = "right";
        ctx.fillText(item.price, dims.width - MARGIN_X, currentY + 50);
      }

      // Description
      if (item.description) {
        ctx.font = `400 36px "${style.bodyFont}", sans-serif`;
        ctx.fillStyle = style.textColor;
        ctx.globalAlpha = 0.8;
        ctx.textAlign = "left";
        
        // Simple word wrap
        const words = item.description.split(" ");
        let line = "";
        let descY = currentY + 100;
        
        for (const word of words) {
          const testLine = line + word + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > textMaxWidth && line !== "") {
            ctx.fillText(line.trim(), textStartX, descY);
            line = word + " ";
            descY += 45;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line.trim(), textStartX, descY);
        ctx.globalAlpha = 1;
      }

      // Calculate item height
      const itemHeight = Math.max(hasImage ? IMAGE_SIZE : 0, item.description ? 160 : 80);
      currentY = itemStartY + itemHeight + ITEM_GAP;
    }

    currentY += SECTION_GAP;
  }
}

/**
 * Render menu and export as PNG blob
 */
export async function renderMenuToPng(
  data: MenuRenderData,
  format: "letter" | "a4" = "letter"
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  await renderMenuToCanvas(canvas, data, format);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create PNG blob"));
        }
      },
      "image/png",
      1.0
    );
  });
}

/**
 * Render menu and trigger download
 */
export async function downloadMenuAsPng(
  data: MenuRenderData,
  format: "letter" | "a4" = "letter",
  filename = "menu.png"
): Promise<void> {
  const blob = await renderMenuToPng(data, format);
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}
