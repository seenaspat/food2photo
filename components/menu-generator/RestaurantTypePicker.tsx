"use client";

/**
 * RestaurantTypePicker
 * 
 * Visual card selector for restaurant type.
 * Each card shows an icon, label, and brief style description.
 */

import { Card, CardContent } from "@/components/ui/card";
import { getAllMenuStylePresets, type RestaurantType } from "@/lib/menu";
import { cn } from "@/lib/utils";

interface RestaurantTypePickerProps {
  value: RestaurantType;
  onValueChange: (type: RestaurantType) => void;
  className?: string;
}

export function RestaurantTypePicker({
  value,
  onValueChange,
  className,
}: RestaurantTypePickerProps) {
  const presets = getAllMenuStylePresets();

  return (
    <div className={cn("space-y-3", className)}>
      <label className="text-sm font-medium">
        What kind of restaurant is this menu for?
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onValueChange(preset.id)}
            className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
          >
            <Card
              className={cn(
                "h-full transition-all hover:border-primary/50",
                value === preset.id
                  ? "border-primary ring-2 ring-primary ring-offset-2"
                  : "border-border"
              )}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl" role="img" aria-label={preset.label}>
                    {preset.icon}
                  </span>
                  <span className="font-medium text-sm">{preset.label}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {preset.description}
                </p>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
