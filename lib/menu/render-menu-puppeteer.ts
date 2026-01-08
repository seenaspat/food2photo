/**
 * Menu Puppeteer Renderer
 *
 * Renders HTML menu to PNG using headless Chrome.
 * Uses @sparticuz/chromium for serverless compatibility.
 */

import puppeteer from "puppeteer";

// For serverless deployments (Vercel, AWS Lambda)
let chromium: typeof import("@sparticuz/chromium") | null = null;

async function getChromiumArgs(): Promise<{
  executablePath: string | undefined;
  args: string[];
  headless: boolean | "shell";
}> {
  // Check if we're in a serverless environment
  const isServerless = process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL;

  if (isServerless) {
    // Dynamic import for serverless
    if (!chromium) {
      chromium = await import("@sparticuz/chromium");
    }
    return {
      executablePath: await chromium.default.executablePath(),
      args: chromium.default.args,
      headless: "shell" as const, // Serverless requires shell mode
    };
  }

  // Local development - use default Puppeteer Chrome
  return {
    executablePath: undefined,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
  };
}

export interface RenderMenuOptions {
  html: string;
  width?: number;
  height?: number;
}

export interface RenderMenuResult {
  imageBuffer: Buffer | null;
  success: boolean;
  error?: string;
}

/**
 * Render HTML menu to PNG image
 */
export async function renderMenuWithPuppeteer(
  options: RenderMenuOptions
): Promise<RenderMenuResult> {
  const { html, width = 2550, height = 3300 } = options;

  let browser = null;

  try {
    const chromeConfig = await getChromiumArgs();

    browser = await puppeteer.launch({
      executablePath: chromeConfig.executablePath,
      args: chromeConfig.args,
      headless: chromeConfig.headless,
    });

    const page = await browser.newPage();

    // Set viewport to menu dimensions (US Letter at 300 DPI)
    await page.setViewport({ width, height });

    // Load the HTML content
    await page.setContent(html, {
      waitUntil: "networkidle0", // Wait for fonts to load
      timeout: 30000,
    });

    // Wait a bit more to ensure fonts are rendered
    await page.evaluate(() => document.fonts.ready);

    // Take screenshot
    const screenshot = await page.screenshot({
      type: "png",
      fullPage: true,
      omitBackground: false,
    });

    await browser.close();

    return {
      imageBuffer: Buffer.from(screenshot),
      success: true,
    };
  } catch (error) {
    if (browser) {
      await browser.close();
    }

    return {
      imageBuffer: null,
      success: false,
      error: error instanceof Error ? error.message : "Failed to render menu",
    };
  }
}

/**
 * Convert buffer to data URL for API response
 */
export function bufferToDataUrl(buffer: Buffer, mimeType = "image/png"): string {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}
