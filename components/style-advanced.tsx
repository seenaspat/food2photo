"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { AdvancedOverrides, AspectRatio, Lens } from "@/lib/presets/purpose-presets";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

const ASPECT_OPTIONS: AspectRatio[] = ["1:1", "4:5", "9:16", "16:9", "3:2"];
const LENS_OPTIONS: Lens[] = ["35mm", "50mm", "85mm/macro"];

interface StyleAdvancedProps {
  /** Default values from the selected purpose preset */
  defaults: {
    aspectRatio: AspectRatio;
    lens: Lens;
    preservePlate: boolean;
  };
  /** User overrides (undefined = use default) */
  overrides: AdvancedOverrides;
  /** Callback when overrides change */
  onOverridesChange: (overrides: AdvancedOverrides) => void;
  className?: string;
}

export function StyleAdvanced({
  defaults,
  overrides,
  onOverridesChange,
  className,
}: StyleAdvancedProps) {
  const [isOpen, setIsOpen] = useState(false);

  const effectiveAspect = overrides.aspectRatio ?? defaults.aspectRatio;
  const effectiveLens = overrides.lens ?? defaults.lens;
  const effectivePlate = overrides.preservePlate ?? defaults.preservePlate;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        Advanced options
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">
              Aspect Ratio
            </label>
            <Select
              value={effectiveAspect}
              onValueChange={(v) =>
                onOverridesChange({
                  ...overrides,
                  aspectRatio: v as AspectRatio,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASPECT_OPTIONS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Lens Look</label>
            <Select
              value={effectiveLens}
              onValueChange={(v) =>
                onOverridesChange({ ...overrides, lens: v as Lens })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LENS_OPTIONS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="preservePlateAdvanced"
            checked={effectivePlate}
            onCheckedChange={(checked) =>
              onOverridesChange({
                ...overrides,
                preservePlate: Boolean(checked),
              })
            }
          />
          <label
            htmlFor="preservePlateAdvanced"
            className="text-sm cursor-pointer"
          >
            Keep original plate/vessel
          </label>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
