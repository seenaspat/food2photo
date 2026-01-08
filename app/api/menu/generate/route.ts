/**
 * Menu Generation API Route (Hybrid)
 *
 * POST /api/menu/generate
 *
 * Hybrid menu generation:
 * 1. AI generates styled background (no text)
 * 2. HTML/CSS template is compiled with menu data
 * 3. Puppeteer renders HTML over background to PNG
 */

import { prepareImageForApi } from "@/lib/genai/image-generation";
import type { RestaurantType } from "@/lib/menu";
import { buildMenuHtml } from "@/lib/menu/build-menu-html";
import { generateMenuBackground } from "@/lib/menu/generate-background";
import { inferMenuDesignSpec } from "@/lib/menu/generate-design-spec";
import { bufferToDataUrl, renderMenuWithPuppeteer } from "@/lib/menu/render-menu-puppeteer";
import { finalizeCredit, getCreditBalance, reserveCredit } from "@/lib/metering";
import { createClient } from "@/lib/supabase/server";

// Helper to send SSE events
function sendEvent(
  controller: ReadableStreamDefaultController<Uint8Array>,
  data: Record<string, unknown>
) {
  const encoder = new TextEncoder();
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
}

// Menu data structure from FormData
interface MenuFormData {
  restaurantName?: string;
  vibeDescription?: string;  // NEW: free-form style description
  restaurantType?: string;   // Optional fallback
  format: string;
  sections: Array<{
    id: string;
    name: string;
    items: Array<{
      id: string;
      name: string;
      description?: string;
      price?: string;
      hasImage: boolean;
    }>;
  }>;
}

export async function POST(req: Request) {
  // Create streaming response
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        // 1. Authenticate user
        const supabase = await createClient();
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          sendEvent(controller, { step: "error", error: "Authentication required" });
          controller.close();
          return;
        }

        sendEvent(controller, { step: "validating", progress: 5 });

        // 2. Parse FormData
        const formData = await req.formData();
        const menuDataRaw = formData.get("menuData");

        if (!menuDataRaw || typeof menuDataRaw !== "string") {
          sendEvent(controller, { step: "error", error: "Invalid menu data" });
          controller.close();
          return;
        }

        let menuData: MenuFormData;
        try {
          menuData = JSON.parse(menuDataRaw);
        } catch {
          sendEvent(controller, { step: "error", error: "Invalid JSON in menu data" });
          controller.close();
          return;
        }

        // 3. Generate design specification from vibe (AI-driven)
        sendEvent(controller, {
          step: "designing",
          progress: 10,
          message: "Creating your menu design...",
        });

        const restaurantType = (menuData.restaurantType || "casual") as RestaurantType;
        const designSpec = await inferMenuDesignSpec(
          menuData.vibeDescription,
          menuData.restaurantName,
          restaurantType
        );

        // 4. Collect user food images
        const itemImages: Map<string, string> = new Map(); // itemId -> dataUrl

        for (const [key, value] of formData.entries()) {
          if (key.startsWith("image_") && value instanceof File) {
            const itemId = key.replace("image_", "");
            try {
              const buffer = Buffer.from(await value.arrayBuffer());
              const imageDataUrl = await prepareImageForApi(buffer);
              itemImages.set(itemId, imageDataUrl);
            } catch (imgError) {
              console.error(`Failed to process image for item ${itemId}:`, imgError);
            }
          }
        }

        // Hybrid approach: only 1 credit (background generation only)
        const totalCredits = 1;

        sendEvent(controller, { step: "reserving_credits", progress: 10 });

        // 5. Check credit balance
        const balance = await getCreditBalance(supabase, user.id);
        if (balance < totalCredits) {
          sendEvent(controller, {
            step: "error",
            error: `Insufficient credits. Need ${totalCredits}, have ${balance}`,
          });
          controller.close();
          return;
        }

        // 6. Reserve credit
        const creditRequestId = crypto.randomUUID();
        const reserved = await reserveCredit(supabase, {
          userId: user.id,
          requestId: creditRequestId,
          apiRoute: "/api/menu/generate",
          model: "gemini-3-pro-image-preview",
          metadata: { step: "background-generation" },
        });

        if (!reserved) {
          sendEvent(controller, { step: "error", error: "Failed to reserve credit" });
          controller.close();
          return;
        }

        try {
          // 7. Generate background with AI
          sendEvent(controller, {
            step: "generating_background",
            progress: 20,
            message: "Creating menu background...",
          });

          const bgResult = await generateMenuBackground({ designSpec });

          if (!bgResult.success || !bgResult.imageDataUrl) {
            throw new Error(bgResult.error || "Failed to generate background");
          }

          sendEvent(controller, {
            step: "composing_layout",
            progress: 50,
            message: "Composing menu layout...",
          });

          // 8. Build sections with images
          const sectionsWithImages = menuData.sections.map((section) => ({
            name: section.name,
            items: section.items.map((item) => ({
              name: item.name,
              description: item.description,
              price: item.price,
              imageUrl: itemImages.get(item.id),
            })),
          }));

          // DEBUG: Log sections data
          console.log("[MenuGenerate] Sections count:", sectionsWithImages.length);
          sectionsWithImages.forEach((s, i) => {
            console.log(`[MenuGenerate] Section ${i}: "${s.name}" has ${s.items.length} items`);
            s.items.forEach((item, j) => {
              console.log(`[MenuGenerate]   Item ${j}: "${item.name}" price="${item.price}" hasImage=${!!item.imageUrl}`);
            });
          });

          // 9. Build HTML (inline, type-safe)
          const menuHtml = buildMenuHtml({
            restaurantName: menuData.restaurantName || "Menu",
            restaurantType: restaurantType,
            sections: sectionsWithImages,
            designSpec,
            backgroundUrl: bgResult.imageDataUrl,
          });

          sendEvent(controller, {
            step: "rendering",
            progress: 70,
            message: "Rendering final menu...",
          });

          // 10. Render with Puppeteer
          const renderResult = await renderMenuWithPuppeteer({ html: menuHtml });

          if (!renderResult.success || !renderResult.imageBuffer) {
            throw new Error(renderResult.error || "Failed to render menu");
          }

          const finalMenuUrl = bufferToDataUrl(renderResult.imageBuffer);

          sendEvent(controller, { step: "finalizing", progress: 90 });

          // 11. Prepare result
          const result = {
            menuImageUrl: finalMenuUrl,
            style: {
              headingFont: designSpec.typography.title.font,
              bodyFont: designSpec.typography.body.font,
              backgroundColor: designSpec.palette.background,
              textColor: designSpec.palette.text_primary,
              accentColor: designSpec.palette.accent,
            },
          };

          sendEvent(controller, {
            step: "complete",
            progress: 100,
            data: result,
          });

          // Finalize credit as successful
          await finalizeCredit(supabase, {
            userId: user.id,
            requestId: creditRequestId,
            success: true,
          });
        } catch (genError) {
          // Refund credit on generation error
          await finalizeCredit(supabase, {
            userId: user.id,
            requestId: creditRequestId,
            success: false,
          });

          console.error("Menu generation error:", genError);
          sendEvent(controller, {
            step: "error",
            error: genError instanceof Error ? genError.message : "Generation failed",
          });
        }
      } catch (error) {
        console.error("Menu API error:", error);
        sendEvent(controller, {
          step: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
