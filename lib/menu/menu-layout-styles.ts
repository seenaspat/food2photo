/**
 * Menu Layout Styles
 *
 * Modular CSS style system for menu layouts.
 * Evolved with professional design standards (spacing, alignment, contrast).
 */

import { z } from "zod";

/**
 * Layout Style Schema
 */
export const menuLayoutStyleSchema = z.object({
  // Page layout
  layout: z.enum(["centered", "left-aligned", "two-column"]).default("centered"),
  
  // Price treatment
  priceStyle: z.enum(["right-aligned", "dot-leaders", "inline", "below", "accent-color"]).default("dot-leaders"),
  
  // Section dividers
  sectionDivider: z.enum(["none", "line", "ornament", "dots", "flourish", "whitespace-only"]).default("line"),
  
  // Image treatment
  imageStyle: z.enum(["rounded", "circle", "sharp", "polaroid", "none"]).default("rounded"),
  
  // Title treatment
  titleStyle: z.enum(["simple", "underlined", "flourish", "boxed", "none"]).default("underlined"),
  
  // Footer
  showFooter: z.boolean().default(true),
});

export type MenuLayoutStyle = z.infer<typeof menuLayoutStyleSchema>;

/**
 * Get default layout style for a restaurant type
 */
export function getLayoutStyleForType(restaurantType: string): MenuLayoutStyle {
  const styles: Record<string, MenuLayoutStyle> = {
    "fine-dining": {
      layout: "centered",
      priceStyle: "dot-leaders",
      sectionDivider: "flourish",
      imageStyle: "none",  // Fine dining rarely shows food photos
      titleStyle: "flourish",
      showFooter: true,
    },
    "cafe": {
      layout: "left-aligned",
      priceStyle: "inline",
      sectionDivider: "line",
      imageStyle: "polaroid",
      titleStyle: "simple",
      showFooter: true,
    },
    "casual": {
      layout: "two-column",
      priceStyle: "accent-color", // Bold price
      sectionDivider: "line",
      imageStyle: "rounded",
      titleStyle: "underlined",
      showFooter: true,
    },
    "asian": {
      layout: "centered",
      priceStyle: "dot-leaders",
      sectionDivider: "ornament",
      imageStyle: "sharp",
      titleStyle: "boxed",
      showFooter: true,
    },
    "bbq": {
      layout: "left-aligned",
      priceStyle: "accent-color",
      sectionDivider: "dots",
      imageStyle: "rounded",
      titleStyle: "underlined",
      showFooter: true,
    },
    "quick-service": {
      layout: "two-column",
      priceStyle: "inline",
      sectionDivider: "none",
      imageStyle: "rounded",
      titleStyle: "simple",
      showFooter: false,
    },
  };
  
  return styles[restaurantType] || styles["casual"];
}

/**
 * Generate CSS for the layout type
 */
export function getLayoutCSS(style: MenuLayoutStyle): string {
  const layouts: Record<typeof style.layout, string> = {
    "centered": `
      .menu-container { text-align: center; }
      .section { align-items: center; }
      .section-items { width: 85%; margin: 0 auto; }
      .item { justify-content: center; }
    `,
    "left-aligned": `
      .menu-container { text-align: left; }
      .section-items { width: 90%; }
    `,
    "two-column": `
      .section-items {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 60px 100px; /* Increased gap for readability */
      }
    `,
  };
  return layouts[style.layout];
}

/**
 * Generate CSS for price treatment
 */
export function getPriceCSS(style: MenuLayoutStyle): string {
  // Common flex behavior is set in build-menu-html.ts (.item-header)
  
  const priceStyles: Record<string, string> = {
    "right-aligned": `
      .item-header {
        justify-content: space-between;
      }
    `,
    "accent-color": `
      .item-header {
        justify-content: space-between;
      }
      .item-price {
        font-weight: 700;
      }
    `,
    "dot-leaders": `
      .item-header {
        align-items: baseline; /* Ensure text aligns on baseline */
      }
      .item-name {
        flex-shrink: 0; /* Let name take its space */
        padding-right: 10px;
      }
      .item-name::after {
        content: "";
        flex: 1; /* Grow to fill space */
        order: 2; /* Place after name */
        border-bottom: 2px dotted currentColor;
        opacity: 0.4;
        margin: 0 10px;
        align-self: flex-end; /* Align to bottom */
        margin-bottom: 8px; /* Lift off baseline slightly */
        display: inline-block;
        width: 100%; /* Ensure it tries to take width */
      }
      /* 
         Fix: dot leaders are tricky in flexbox. 
         Alternative robust approach:
         Use a spacer element between name and price.
         But we only generate HTML for name and price.
         So we'll use a pseudo-element on a spacer if we can inject one, 
         or just make the item-header a grid.
         
         Let's stick to flexbox with a flexible spacer. 
         Wait, we can't inject a spacer without changing build-menu-html.
         
         Let's try: .item-header { display: grid; grid-template-columns: auto 1fr auto; }
         intermediate is the line.
      */
      
      .item-header {
        display: grid !important; 
        grid-template-columns: auto 1fr auto;
        gap: 10px;
        align-items: baseline;
      }
      
      .item-header::after {
        content: "";
        display: block;
        border-bottom: 3px dotted currentColor;
        opacity: 0.3;
        align-self: center;
        width: 100%;
        transform: translateY(-4px); /* Vertical adjustment */
      }
      
      .item-price {
        order: 3;
      }
    `,
    "inline": `
      .item-header { display: block; }
      .item-name { display: inline; }
      .item-price { display: inline; margin-left: 20px; font-weight: 600; }
    `,
    "below": `
      .item-header { flex-direction: column; align-items: flex-start; }
      .item-price { margin-top: 8px; font-size: 0.9em; }
    `,
  };
  
  return priceStyles[style.priceStyle] || priceStyles["right-aligned"];
}

/**
 * Generate CSS for section dividers
 */
export function getSectionDividerCSS(style: MenuLayoutStyle, accentColor: string): string {
  const dividers: Record<string, string> = {
    "none": "",
    "whitespace-only": "",
    "line": `
      .section-header::after {
        content: "";
        display: block;
        width: 100%;
        height: 2px;
        background: ${accentColor};
        opacity: 0.3;
        margin-top: 25px;
      }
    `,
    "ornament": `
      .section-header::after {
        content: "◆";
        display: block;
        text-align: center;
        color: ${accentColor};
        opacity: 0.6;
        margin-top: 25px;
        font-size: 16px;
        letter-spacing: 20px;
      }
    `,
    "dots": `
      .section-header::after {
        content: "• • •";
        display: block;
        text-align: center;
        color: ${accentColor};
        opacity: 0.5;
        margin-top: 25px;
        letter-spacing: 15px;
        font-size: 24px;
      }
    `,
    "flourish": `
      .section-header::after {
        content: "— ❧ —";
        display: block;
        text-align: center;
        color: ${accentColor};
        opacity: 0.5;
        margin-top: 25px;
        font-size: 28px;
        font-family: "Playfair Display", serif;
      }
    `,
  };
  return dividers[style.sectionDivider] || dividers["line"];
}

/**
 * Generate CSS for image treatment
 */
export function getImageCSS(style: MenuLayoutStyle): string {
  const images: Record<string, string> = {
    "rounded": `
      .item-image {
        border-radius: 16px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.2);
      }
    `,
    "circle": `
      .item-image {
        border-radius: 50%;
        box-shadow: 0 8px 25px rgba(0,0,0,0.2);
      }
    `,
    "sharp": `
      .item-image {
        border-radius: 0;
        border: 4px solid currentColor;
      }
    `,
    "polaroid": `
      .item-image {
        border-radius: 2px;
        padding: 12px;
        background: white;
        box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        transform: rotate(-2deg);
      }
    `,
    "none": `
      .item-image { display: none; }
    `,
  };
  return images[style.imageStyle] || images["rounded"];
}

/**
 * Generate CSS for title treatment
 */
export function getTitleCSS(style: MenuLayoutStyle, accentColor: string): string {
  const titles: Record<string, string> = {
    "none": "",
    "simple": "",
    "underlined": `
      .restaurant-name::after {
        content: "";
        display: block;
        width: 140px;
        height: 4px;
        background: ${accentColor};
        margin: 35px auto 0;
        opacity: 0.8;
      }
    `,
    "flourish": `
      .restaurant-name::before,
      .restaurant-name::after {
        content: "❦";
        display: inline-block;
        margin: 0 40px;
        opacity: 0.6;
        font-size: 0.6em;
        vertical-align: middle;
      }
    `,
    "boxed": `
      .restaurant-name {
        border: 4px solid ${accentColor};
        padding: 30px 60px;
        display: inline-block;
      }
    `,
  };
  return titles[style.titleStyle] || titles["simple"];
}

/**
 * Compose all modular CSS into a single stylesheet
 */
export function composeMenuCSS(style: MenuLayoutStyle, accentColor: string): string {
  return [
    getLayoutCSS(style),
    getPriceCSS(style),
    getSectionDividerCSS(style, accentColor),
    getImageCSS(style),
    getTitleCSS(style, accentColor),
  ].join("\n");
}
