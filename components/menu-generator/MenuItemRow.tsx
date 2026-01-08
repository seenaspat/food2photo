"use client";

/**
 * MenuItemRow
 * 
 * Single menu item row with inline image upload.
 * Compact layout with name, price, description, and thumbnail.
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { MenuItem } from "@/lib/menu";
import { cn } from "@/lib/utils";
import { ImagePlus, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface MenuItemRowProps {
  item: MenuItem;
  index: number;
  onUpdate: (item: MenuItem) => void;
  onRemove: () => void;
  canRemove: boolean;
  className?: string;
}

export function MenuItemRow({
  item,
  index,
  onUpdate,
  onRemove,
  canRemove,
  className,
}: MenuItemRowProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(item.imageUrl ?? null);

  // Update preview when imageFile changes
  useEffect(() => {
    if (item.imageFile) {
      const url = URL.createObjectURL(item.imageFile);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (item.imageUrl) {
      setImagePreview(item.imageUrl);
    } else {
      setImagePreview(null);
    }
  }, [item.imageFile, item.imageUrl]);

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onUpdate({ ...item, imageFile: file });
      }
      e.target.value = "";
    },
    [item, onUpdate]
  );

  const handleRemoveImage = useCallback(() => {
    onUpdate({ ...item, imageFile: undefined, imageUrl: undefined });
  }, [item, onUpdate]);

  const handleFieldChange = useCallback(
    (field: keyof MenuItem, value: string) => {
      // Keep empty strings for controlled inputs, only convert to undefined for optional fields on submit
      onUpdate({ ...item, [field]: value });
    },
    [item, onUpdate]
  );

  return (
    <div
      className={cn(
        "group relative rounded-lg border border-border bg-card p-3 transition-colors hover:border-border/80",
        className
      )}
    >
      <div className="flex gap-3">
        {/* Image thumbnail / upload */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative flex h-20 w-20 items-center justify-center rounded-md border-2 border-dashed transition-colors",
              imagePreview
                ? "border-transparent"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt={item.name || "Menu item"}
                fill
                className="rounded-md object-cover"
                sizes="80px"
                unoptimized
              />
            ) : (
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <ImagePlus className="h-5 w-5" />
                <span className="text-[10px]">Add image</span>
              </div>
            )}
          </button>
          {imagePreview && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageSelect}
            className="sr-only"
            aria-label={`Upload image for item ${index + 1}`}
          />
        </div>

        {/* Fields */}
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <Input
              value={item.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              placeholder="Item name"
              className="flex-1"
              aria-label="Item name"
            />
            <Input
              value={item.price ?? ""}
              onChange={(e) => handleFieldChange("price", e.target.value)}
              placeholder="$0.00"
              className="w-24"
              aria-label="Price"
            />
          </div>
          <Textarea
            value={item.description ?? ""}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            placeholder="Description (optional)"
            className="min-h-[40px] resize-none text-sm"
            rows={1}
            aria-label="Description"
          />
        </div>

        {/* Remove button */}
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="shrink-0 self-start opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </div>
    </div>
  );
}
