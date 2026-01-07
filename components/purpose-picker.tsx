"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PURPOSE_PRESETS } from "@/lib/presets/purpose-presets";
import type { LucideIcon } from "lucide-react";
import {
    AtSign,
    Briefcase,
    Clapperboard,
    FileText,
    Play,
    Smartphone,
    Square,
    UtensilsCrossed,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Square,
  Smartphone,
  Clapperboard,
  Play,
  AtSign,
  Briefcase,
  FileText,
  UtensilsCrossed,
};

interface PurposePickerProps {
  value: string;
  onValueChange: (purposeId: string) => void;
  className?: string;
}

export function PurposePicker({
  value,
  onValueChange,
  className,
}: PurposePickerProps) {
  return (
    <div className={className}>
      <label className="text-sm font-medium mb-2 block">
        What's this photo for?
      </label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select purpose" />
        </SelectTrigger>
        <SelectContent>
          {PURPOSE_PRESETS.map((preset) => {
            const Icon = ICON_MAP[preset.icon];
            return (
              <SelectItem key={preset.id} value={preset.id}>
                <div className="flex items-center gap-2">
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{preset.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
