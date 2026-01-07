"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createHumanSummary } from "@/lib/backgrounds/compile-prompt-snippet";
import type { CustomEnvironmentSpec } from "@/lib/backgrounds/custom-background-schema";
import { Camera, Check, Loader2, Sparkles, X } from "lucide-react";
import { useCallback, useState } from "react";

interface CustomBackgroundCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type Step = "upload" | "analyzing" | "review" | "saving";

export function CustomBackgroundCreator({
  open,
  onOpenChange,
  onSuccess,
}: CustomBackgroundCreatorProps) {
  const [step, setStep] = useState<Step>("upload");
  const [images, setImages] = useState<File[]>([]);
  const [spec, setSpec] = useState<CustomEnvironmentSpec | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStep("upload");
    setImages([]);
    setSpec(null);
    setName("");
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    // Reset after animation
    setTimeout(reset, 200);
  }, [onOpenChange, reset]);

  const handleImageAdd = useCallback((file: File) => {
    setImages((prev) => {
      if (prev.length >= 3) return prev;
      return [...prev, file];
    });
    setError(null);
  }, []);

  const handleImageRemove = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (images.length === 0) {
      setError("Please upload at least one image");
      return;
    }

    setStep("analyzing");
    setError(null);

    try {
      const formData = new FormData();
      images.forEach((img, idx) => {
        formData.append(`image${idx}`, img);
      });

      const res = await fetch("/api/backgrounds/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }

      const data = await res.json();
      setSpec(data.spec);
      setName(data.spec.name_suggestion || "");
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setStep("upload");
    }
  }, [images]);

  const handleSave = useCallback(async () => {
    if (!spec || !name.trim()) {
      setError("Please enter a name");
      return;
    }

    setStep("saving");
    setError(null);

    try {
      const res = await fetch("/api/backgrounds/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          environment_spec: spec,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setStep("review");
    }
  }, [spec, name, onSuccess, handleClose]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            {step === "upload" && "Create Custom Background"}
            {step === "analyzing" && "Analyzing Space..."}
            {step === "review" && "Review Your Background"}
            {step === "saving" && "Saving..."}
          </DialogTitle>
          <DialogDescription>
            {step === "upload" &&
              "Upload 1-3 photos of your space. We'll extract its essence for consistent food photography."}
            {step === "analyzing" &&
              "Our AI is analyzing your space's style, lighting, and atmosphere..."}
            {step === "review" &&
              "Review the detected characteristics and give your background a name."}
            {step === "saving" && "Saving your custom background..."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Step */}
          {step === "upload" && (
            <>
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-lg border-2 border-border overflow-hidden bg-muted"
                  >
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`Space ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleImageRemove(idx)}
                      className="absolute top-1 right-1 p-1.5 rounded-full bg-background/90 hover:bg-background shadow-sm"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {images.length < 3 && (
                  <label className="relative aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 bg-muted/50 hover:bg-muted cursor-pointer transition-colors flex flex-col items-center justify-center gap-1">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageAdd(file);
                          e.target.value = "";
                        }
                      }}
                    />
                    <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-[10px] text-muted-foreground text-center px-1">
                      {images.length === 0 ? "Add photo" : "Add more"}
                    </span>
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                💡 Tip: Include your table surface and some background elements
              </p>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                onClick={handleAnalyze}
                disabled={images.length === 0}
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze Space
              </Button>
            </>
          )}

          {/* Analyzing Step */}
          {step === "analyzing" && (
            <div className="py-8 flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Extracting environment characteristics...
              </p>
            </div>
          )}

          {/* Review Step */}
          {step === "review" && spec && (
            <>
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Detected Characteristics
                </h4>
                <div className="rounded-md border p-3 space-y-1 bg-muted/50">
                  {createHumanSummary(spec).map((line, idx) => (
                    <p key={idx} className="text-sm text-muted-foreground">
                      ✓ {line}
                    </p>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Background Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., My Restaurant Patio"
                  maxLength={50}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button variant="outline" onClick={reset} className="flex-1">
                  Start Over
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!name.trim()}
                  className="flex-1"
                >
                  Save Background
                </Button>
              </div>
            </>
          )}

          {/* Saving Step */}
          {step === "saving" && (
            <div className="py-8 flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Saving your background...
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
