/**
 * Menu HTML Builder
 *
 * Builds complete HTML string for menu rendering.
 * All HTML/CSS is generated inline - no external template files.
 * This approach is more robust and type-safe.
 */

import type { MenuDesignSpec } from "./menu-design-schema";
import { composeMenuCSS, getLayoutStyleForType, type MenuLayoutStyle } from "./menu-layout-styles";

// ============================================================================
// Types
// ============================================================================

export interface MenuItem {
  name: string;
  description?: string;
  price?: string;
  imageUrl?: string;
}

export interface MenuSection {
  name: string;
  items: MenuItem[];
}

export interface BuildMenuHtmlInput {
  restaurantName: string;
  restaurantType: string;
  sections: MenuSection[];
  designSpec: MenuDesignSpec;
  backgroundUrl: string;
}

// ============================================================================
// Style Helpers
// ============================================================================

function extractFontFamily(fontDesc: string): string {
  const match = fontDesc.match(/^([^,]+)/);
  return match ? `'${match[1].trim()}'` : "'Playfair Display'";
}

function ptToPx(ptSize: string): string {
  const pt = parseInt(ptSize.replace("pt", ""), 10) || 16;
  return `${Math.round(pt * 3)}px`;
}

function scaleImageSize(sizeSpec: string): number {
  const sizes: Record<string, number> = {
    "thumbnail-40px": 120,
    "small-60px": 180,
    "medium-80px": 240,
    "large-120px": 360,
  };
  return sizes[sizeSpec] || 200;
}

function fontWeightToCss(weight: string): string {
  const weights: Record<string, string> = {
    light: "300", regular: "400", medium: "500", semibold: "600", bold: "700",
  };
  return weights[weight] || "400";
}

function textCaseToCss(textCase: string): string {
  return textCase === "uppercase" ? "uppercase" : textCase === "lowercase" ? "lowercase" : "none";
}

function trackingToCss(tracking: string): string {
  const trackings: Record<string, string> = {
    tight: "-0.02em", normal: "0", wide: "0.05em", "very-wide": "0.1em",
  };
  return trackings[tracking] || "0";
}

function extractColor(colorDesc: string): string {
  // Extract hex color from description like "#1a1715 deep charcoal"
  const match = colorDesc.match(/#[0-9a-fA-F]{6}/);
  return match ? match[0] : colorDesc.split(" ")[0];
}

// ============================================================================
// HTML Builders
// ============================================================================

function buildItemHtml(item: MenuItem, hasImages: boolean, imageSize: number, layoutStyle: MenuLayoutStyle): string {
  const showImage = layoutStyle.imageStyle !== "none";
  
  const imageHtml = item.imageUrl && showImage
    ? `<img class="item-image" src="${item.imageUrl}" alt="${item.name}" />`
    : hasImages && showImage
      ? `<div class="item-image" style="visibility: hidden;"></div>`
      : "";

  const descHtml = item.description
    ? `<p class="item-description">${item.description}</p>`
    : "";

  const priceHtml = item.price
    ? `<span class="item-price">${item.price}</span>`
    : "";

  return `
    <div class="item">
      ${imageHtml}
      <div class="item-content">
        <div class="item-header">
          <span class="item-name">${item.name}</span>
          ${priceHtml}
        </div>
        ${descHtml}
      </div>
    </div>`;
}

function buildSectionsHtml(sections: MenuSection[], imageSize: number, layoutStyle: MenuLayoutStyle): string {
  const hasImages = sections.some(s => s.items.some(i => i.imageUrl));

  return sections.map(section => `
    <section class="section">
      <h2 class="section-header">${section.name}</h2>
      <div class="section-items">
        ${section.items.map(item => buildItemHtml(item, hasImages, imageSize, layoutStyle)).join("")}
      </div>
    </section>
  `).join("");
}

function buildFooterHtml(showFooter: boolean, accentColor: string): string {
  if (!showFooter) return "";
  return `
    <div class="footer-divider" style="background: ${accentColor};"></div>
    <div class="footer-divider" style="background: ${accentColor};"></div>
  `;
}

// ============================================================================
// Main Builder
// ============================================================================

export function buildMenuHtml(input: BuildMenuHtmlInput): string {
  const { restaurantName, restaurantType, sections, designSpec, backgroundUrl } = input;
  const spec = designSpec;
  const layoutStyle = getLayoutStyleForType(restaurantType);

  // Extract all style values
  const titleFont = extractFontFamily(spec.typography.title.font);
  const titleSize = ptToPx(spec.typography.title.size);
  const titleWeight = fontWeightToCss(spec.typography.title.weight);
  const titleCase = textCaseToCss(spec.typography.title.case);
  const titleTracking = trackingToCss(spec.typography.title.tracking);

  const sectionFont = extractFontFamily(spec.typography.section.font);
  const sectionSize = ptToPx(spec.typography.section.size);
  const sectionWeight = fontWeightToCss(spec.typography.section.weight);

  const bodyFont = extractFontFamily(spec.typography.body.font);
  const itemNameSize = ptToPx(spec.typography.body.item_name_size);
  const itemNameWeight = fontWeightToCss(spec.typography.body.item_name_weight);
  const descSize = ptToPx(spec.typography.body.description_size);
  const descStyle = spec.typography.body.description_style === "italic" ? "italic" : "normal";
  const lineHeight = spec.typography.body.line_height || "1.6";
  const textShadow = spec.palette.text_shadow || "none";

  const textPrimary = extractColor(spec.palette.text_primary);
  const textSecondary = extractColor(spec.palette.text_secondary);
  const accentColor = extractColor(spec.palette.accent);

  const imageSize = scaleImageSize(spec.image_style.size);
  const hasImages = sections.some(s => s.items.some(i => i.imageUrl)) && layoutStyle.imageStyle !== "none";
  const itemGrid = hasImages ? `${imageSize}px 1fr` : "1fr";

  // Compose modular CSS from layout style
  const modularCSS = composeMenuCSS(layoutStyle, accentColor);

  // Build complete HTML
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=2550, height=3300">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600&family=Lora:ital,wght@0,400;0,500;1,400&family=Oswald:wght@400;500;600&family=Pacifico&family=Playfair+Display:wght@400;500;600&family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      width: 2550px;
      height: 3300px;
      background-image: url('${backgroundUrl}');
      background-size: cover;
      background-position: center;
      font-family: ${bodyFont}, serif;
      color: ${textPrimary};
      text-shadow: ${textShadow};
      overflow: hidden;
    }

    .menu-container {
      width: 100%;
      height: 100%;
      padding: 12% 14%; /* Generous margins to avoid corner decorations */
      display: flex;
      flex-direction: column;
    }

    .header {
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding-bottom: 80px;
    }

    .restaurant-name {
      font-family: ${titleFont}, serif;
      font-size: ${titleSize};
      font-weight: ${titleWeight};
      color: ${accentColor};
      text-transform: ${titleCase};
      letter-spacing: ${titleTracking};
      line-height: 1.2;
    }

    .body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 100px; /* Increased section gap */
      padding-top: 20px;
    }

    .section {
      display: flex;
      flex-direction: column;
      gap: 60px;
    }

    .section-header {
      font-family: ${sectionFont}, sans-serif;
      font-size: ${sectionSize};
      font-weight: ${sectionWeight};
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: ${layoutStyle.titleStyle === "boxed" ? textPrimary : accentColor}; /* Accent color for headers */
    }

    .section-items {
      display: flex;
      flex-direction: column;
      gap: 60px; /* Increased item spacing */
    }

    .item {
      display: grid;
      grid-template-columns: ${itemGrid};
      gap: 40px;
      align-items: start;
    }

    .item-image {
      width: ${imageSize}px;
      height: ${imageSize}px;
      max-width: ${imageSize}px;
      max-height: ${imageSize}px;
      object-fit: cover;
      flex-shrink: 0;
    }

    .item-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
      flex: 1;
    }

    .item-header {
      display: flex;
      align-items: baseline;
      gap: 20px;
      width: 100%;
    }

    .item-name {
      font-size: ${itemNameSize};
      font-weight: ${itemNameWeight};
      color: ${textPrimary};
    }

    .item-price {
      font-size: ${itemNameSize};
      font-weight: 500;
      color: ${layoutStyle.priceStyle === "accent-color" ? accentColor : textPrimary};
      white-space: nowrap;
    }

    .item-description {
      font-size: ${descSize};
      font-style: ${descStyle};
      color: ${textSecondary};
      line-height: ${lineHeight};
      max-width: 850px;
    }

    .footer {
      flex: 0 0 auto;
      display: flex;
      justify-content: center;
      align-items: center;
      padding-top: 60px;
      color: ${textSecondary};
      font-size: 28px;
      letter-spacing: 0.1em;
    }

    .footer-divider {
      width: 60px;
      height: 2px;
      opacity: 0.4;
      margin: 0 30px;
    }

    /* Modular layout styles */
    ${modularCSS}
  </style>
</head>
<body>
  <div class="menu-container">
    <header class="header">
      <h1 class="restaurant-name">${restaurantName || "Menu"}</h1>
    </header>
    <main class="body">
      ${buildSectionsHtml(sections, imageSize, layoutStyle)}
    </main>
    <footer class="footer">
      ${buildFooterHtml(layoutStyle.showFooter, accentColor)}
    </footer>
  </div>
</body>
</html>`;
}
