"use client";

/**
 * useMenuGeneration Hook
 * 
 * Handles menu generation API calls with streaming progress updates.
 * Implements atomic credit handling and error recovery.
 */

import type { MenuInput } from "@/lib/menu";
import { useCallback, useState } from "react";

export type GenerationStep =
  | "idle"
  | "validating"
  | "reserving_credits"
  | "generating_menu"
  | "integrating_photos"
  | "finalizing"
  | "complete"
  | "error";

export interface GenerationProgress {
  step: GenerationStep;
  progress: number; // 0-100
  message?: string;
  error?: string;
}

export interface GenerationResult {
  success: boolean;
  /** AI-generated menu image URL (data URL) */
  menuImageUrl?: string;
  style?: {
    headingFont: string;
    bodyFont: string;
    backgroundColor: string;
    textColor: string;
    accentColor: string;
  };
  error?: string;
}

interface UseMenuGenerationReturn {
  // State
  isGenerating: boolean;
  progress: GenerationProgress;
  result: GenerationResult | null;

  // Actions
  generate: (data: MenuInput) => Promise<GenerationResult>;
  reset: () => void;
}

export function useMenuGeneration(): UseMenuGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress>({
    step: "idle",
    progress: 0,
  });
  const [result, setResult] = useState<GenerationResult | null>(null);

  const generate = useCallback(async (data: MenuInput): Promise<GenerationResult> => {
    setIsGenerating(true);
    setResult(null);
    setProgress({ step: "validating", progress: 5 });

    try {
      // Build FormData with menu data and images
      const formData = new FormData();
      formData.append("menuData", JSON.stringify({
        restaurantName: data.restaurantName,
        vibeDescription: data.vibeDescription,  // NEW: AI-driven design
        restaurantType: data.restaurantType,
        format: data.format,
        sections: data.sections.map((s) => ({
          id: s.id,
          name: s.name,
          items: s.items.map((i) => ({
            id: i.id,
            name: i.name,
            description: i.description,
            price: i.price,
            hasImage: Boolean(i.imageFile),
          })),
        })),
      }));

      // Append images with their item IDs
      for (const section of data.sections) {
        for (const item of section.items) {
          if (item.imageFile) {
            formData.append(`image_${item.id}`, item.imageFile);
          }
        }
      }

      setProgress({ step: "reserving_credits", progress: 10 });

      // Make streaming request
      const response = await fetch("/api/menu/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Generation failed: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response stream");
      }

      const decoder = new TextDecoder();
      let finalResult: GenerationResult = { success: false };
      let buffer = ""; // Accumulate incomplete chunks

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // SSE events are separated by double newlines
        const events = buffer.split("\n\n");
        // Last element may be incomplete, keep it in the buffer
        buffer = events.pop() || "";

        for (const eventBlock of events) {
          const lines = eventBlock.split("\n").filter(Boolean);
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const event = JSON.parse(line.slice(6));
                
                switch (event.step) {
                  case "generating_menu":
                    setProgress({
                      step: "generating_menu",
                      progress: event.progress ?? 20,
                      message: event.message ?? "Creating your menu design...",
                    });
                    break;
                  case "integrating_photos":
                    setProgress({
                      step: "integrating_photos",
                      progress: event.progress ?? 60,
                      message: event.message ?? "Blending your food photos...",
                    });
                    break;
                  case "finalizing":
                    setProgress({
                      step: "finalizing",
                      progress: event.progress ?? 90,
                      message: "Finalizing menu...",
                    });
                    break;
                  case "complete":
                    setProgress({ step: "complete", progress: 100, message: "Done!" });
                    finalResult = {
                      success: true,
                      menuImageUrl: event.data?.menuImageUrl,
                      style: event.data?.style,
                    };
                    break;
                  case "error":
                    throw new Error(event.error || "Generation failed");
                }
              } catch (parseErr) {
                // Only warn if it's not a JSON parse error (those may be incomplete chunks)
                if (!(parseErr instanceof SyntaxError)) {
                  console.warn("Failed to parse SSE event:", line, parseErr);
                }
              }
            }
          }
        }
      }

      setResult(finalResult);
      setIsGenerating(false);
      return finalResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("[useMenuGeneration] Error:", errorMessage, err);
      const errorResult: GenerationResult = { success: false, error: errorMessage };
      setProgress({ step: "error", progress: 0, error: errorMessage });
      setResult(errorResult);
      // Don't set isGenerating to false here - let the user see the error
      // They can dismiss via reset()
      return errorResult;
    }
  }, []);

  const reset = useCallback(() => {
    setIsGenerating(false);
    setProgress({ step: "idle", progress: 0 });
    setResult(null);
  }, []);

  return {
    isGenerating,
    progress,
    result,
    generate,
    reset,
  };
}
