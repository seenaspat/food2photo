"use client";

/**
 * MenuPreview
 *
 * Displays the AI-generated menu with download option.
 * No more canvas compositing needed - the AI generates the complete menu.
 */

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Download, Loader2, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import type { GenerationResult } from "./hooks/useMenuGeneration";

interface MenuPreviewProps {
  result: GenerationResult;
  onReset: () => void;
  className?: string;
}

export function MenuPreview({
  result,
  onReset,
  className,
}: MenuPreviewProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!result.menuImageUrl) return;

    setIsDownloading(true);

    try {
      // Convert data URL to blob
      const response = await fetch(result.menuImageUrl);
      const blob = await response.blob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `menu-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download menu:", err);
    } finally {
      setIsDownloading(false);
    }
  }, [result.menuImageUrl]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Preview header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your Menu is Ready!</h2>
          <p className="text-muted-foreground">
            AI-generated menu design ready for download.
          </p>
        </div>
        <Button variant="outline" onClick={onReset}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Create New
        </Button>
      </div>

      {/* Menu preview */}
      <div className="relative mx-auto max-w-2xl">
        <div className="aspect-[3/4] w-full overflow-hidden rounded-lg border border-border bg-muted/30 shadow-lg">
          {result.menuImageUrl ? (
            <div className="relative h-full w-full">
              <Image
                src={result.menuImageUrl}
                alt="Generated menu"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      {/* Download button */}
      <div className="flex justify-center gap-4">
        <Button
          size="lg"
          onClick={handleDownload}
          disabled={isDownloading || !result.menuImageUrl}
        >
          {isDownloading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download Menu
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
