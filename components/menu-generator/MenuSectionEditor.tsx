"use client";

/**
 * MenuSectionEditor
 * 
 * Manages a single menu section with its items.
 * Allows adding/removing items and editing section name.
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    createEmptyMenuItem,
    type MenuItem,
    type MenuSection,
} from "@/lib/menu";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { MenuItemRow } from "./MenuItemRow";

interface MenuSectionEditorProps {
  section: MenuSection;
  index: number;
  onUpdate: (section: MenuSection) => void;
  onRemove: () => void;
  canRemove: boolean;
  className?: string;
}

export function MenuSectionEditor({
  section,
  index,
  onUpdate,
  onRemove,
  canRemove,
  className,
}: MenuSectionEditorProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleNameChange = useCallback(
    (name: string) => {
      onUpdate({ ...section, name });
    },
    [section, onUpdate]
  );

  const handleItemUpdate = useCallback(
    (itemIndex: number, updatedItem: MenuItem) => {
      const newItems = [...section.items];
      newItems[itemIndex] = updatedItem;
      onUpdate({ ...section, items: newItems });
    },
    [section, onUpdate]
  );

  const handleItemRemove = useCallback(
    (itemIndex: number) => {
      const newItems = section.items.filter((_, i) => i !== itemIndex);
      onUpdate({ ...section, items: newItems });
    },
    [section, onUpdate]
  );

  const handleAddItem = useCallback(() => {
    if (section.items.length >= 10) return; // Max items per section
    const newItems = [...section.items, createEmptyMenuItem()];
    onUpdate({ ...section, items: newItems });
  }, [section, onUpdate]);

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card/50 overflow-hidden",
        className
      )}
    >
      {/* Section header */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3">
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="shrink-0 rounded p-1 hover:bg-muted"
          aria-label={isCollapsed ? "Expand section" : "Collapse section"}
        >
          {isCollapsed ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </button>
        <Input
          value={section.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder={`Section ${index + 1} name`}
          className="flex-1 border-0 bg-transparent px-2 font-medium focus-visible:ring-0 focus-visible:ring-offset-0"
          aria-label="Section name"
        />
        <span className="text-xs text-muted-foreground">
          {section.items.length} item{section.items.length !== 1 ? "s" : ""}
        </span>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="shrink-0"
            aria-label="Remove section"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </div>

      {/* Section items */}
      {!isCollapsed && (
        <div className="space-y-3 p-4">
          {section.items.map((item, itemIndex) => (
            <MenuItemRow
              key={item.id}
              item={item}
              index={itemIndex}
              onUpdate={(updated) => handleItemUpdate(itemIndex, updated)}
              onRemove={() => handleItemRemove(itemIndex)}
              canRemove={section.items.length > 1}
            />
          ))}

          {section.items.length < 10 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
