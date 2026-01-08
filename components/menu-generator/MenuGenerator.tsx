"use client";

/**
 * MenuGenerator
 * 
 * Main menu generator component orchestrating the full flow:
 * 1. Restaurant type selection
 * 2. Menu items input with sections
 * 3. Generation with progress
 * 4. Preview and download
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Plus, Sparkles, Zap } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useCallback } from "react";
import { useMenuForm } from "./hooks/useMenuForm";
import { useMenuGeneration } from "./hooks/useMenuGeneration";
import { MenuGenerationProgress } from "./MenuGenerationProgress";
import { MenuPreview } from "./MenuPreview";
import { MenuSectionEditor } from "./MenuSectionEditor";
import { RestaurantTypePicker } from "./RestaurantTypePicker";

interface MenuGeneratorProps {
  userCredits?: number;
  onCreditsInsufficient?: () => void;
  className?: string;
}

export function MenuGenerator({
  userCredits = Infinity,
  onCreditsInsufficient,
  className,
}: MenuGeneratorProps) {
  const form = useMenuForm();
  const generation = useMenuGeneration();

  const handleGenerate = useCallback(async () => {
    // Validate form
    if (!form.validate()) {
      return;
    }

    // Check credits
    if (form.totalCredits > userCredits) {
      onCreditsInsufficient?.();
      return;
    }

    // Start generation
    await generation.generate(form.data);
  }, [form, generation, userCredits, onCreditsInsufficient]);

  const handleReset = useCallback(() => {
    generation.reset();
  }, [generation]);

  const canAddSection = form.data.sections.length < 3;
  const hasInsufficientCredits = form.totalCredits > userCredits;
  const showPreview = generation.result?.success === true;

  // Show preview after successful generation
  if (showPreview && generation.result) {
    return (
      <MenuPreview
        result={generation.result}
        onReset={handleReset}
        className={className}
      />
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Create Your Menu</h2>
        <p className="text-muted-foreground">
          Design a professional menu in minutes with AI-powered generation.
        </p>
      </div>

      {/* Style Selection - Tabs for Custom vs Preset */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => form.setVibeDescription(form.data.vibeDescription || " ")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              !form.data.restaurantType
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            ✨ Custom Description
          </button>
          <button
            type="button"
            onClick={() => form.setRestaurantType(form.data.restaurantType || "casual")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              form.data.restaurantType
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            📋 Choose Preset
          </button>
        </div>

        {/* Custom Description Mode */}
        {!form.data.restaurantType && (
          <div className="space-y-2">
            <label htmlFor="vibe-description" className="text-sm font-medium">
              Describe Your Restaurant's Vibe
            </label>
            <textarea
              id="vibe-description"
              value={form.data.vibeDescription ?? ""}
              onChange={(e) => form.setVibeDescription(e.target.value)}
              placeholder="e.g., Cozy neighborhood Italian trattoria with warm Tuscan colors and candlelit ambiance"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              AI will create a unique design based on your description
            </p>
          </div>
        )}

        {/* Preset Mode */}
        {form.data.restaurantType && (
          <RestaurantTypePicker
            value={form.data.restaurantType}
            onValueChange={form.setRestaurantType}
          />
        )}
      </div>

      {/* Restaurant name (optional) */}
      <div className="space-y-2">
        <label htmlFor="restaurant-name" className="text-sm font-medium">
          Restaurant Name <span className="text-muted-foreground">(optional)</span>
        </label>
        <Input
          id="restaurant-name"
          value={form.data.restaurantName ?? ""}
          onChange={(e) => form.setRestaurantName(e.target.value)}
          placeholder="e.g., The Golden Fork"
          className="max-w-md"
        />
      </div>

      {/* Menu sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Menu Items</h3>
          {canAddSection && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={form.addSection}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Section
            </Button>
          )}
        </div>

        {form.data.sections.map((section, sectionIndex) => (
          <MenuSectionEditor
            key={section.id}
            section={section}
            index={sectionIndex}
            onUpdate={(updated) => form.updateSection(sectionIndex, updated)}
            onRemove={() => form.removeSection(sectionIndex)}
            canRemove={form.data.sections.length > 1}
          />
        ))}
      </div>

      {/* Credit summary and generate button */}
      <div className="sticky bottom-0 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 -mx-4 px-4 py-4 sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>
                <span className="font-semibold">{form.totalCredits}</span> credits required
              </span>
            </div>
            {form.itemsWithImages > 0 && (
              <span className="text-muted-foreground">
                (menu + photo integration)
              </span>
            )}
          </div>

          <Button
            onClick={handleGenerate}
            disabled={
              !form.isValid ||
              generation.isGenerating ||
              hasInsufficientCredits
            }
            size="lg"
            className="w-full sm:w-auto"
          >
            {generation.isGenerating ? (
              <>Generating...</>
            ) : hasInsufficientCredits ? (
              <>Insufficient Credits</>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Menu
              </>
            )}
          </Button>
        </div>

        {hasInsufficientCredits && (
          <p className="mt-2 text-sm text-destructive">
            You need {form.totalCredits} credits but only have {userCredits}.
            Please purchase more credits to continue.
          </p>
        )}
      </div>

      {/* Generation progress overlay */}
      <AnimatePresence>
        {(generation.isGenerating || generation.progress.step === "error") && (
          <MenuGenerationProgress 
            progress={generation.progress} 
            onDismiss={generation.reset}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

