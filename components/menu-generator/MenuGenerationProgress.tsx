"use client";

/**
 * MenuGenerationProgress
 * 
 * Overlay shown during menu generation with animated progress.
 * Shows step-by-step progress with visual indicators.
 */

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import type { GenerationProgress, GenerationStep } from "./hooks/useMenuGeneration";

const STEPS: Array<{ step: GenerationStep; label: string }> = [
  { step: "validating", label: "Validating input" },
  { step: "reserving_credits", label: "Reserving credits" },
  { step: "generating_menu", label: "Designing menu" },
  { step: "integrating_photos", label: "Integrating photos" },
  { step: "finalizing", label: "Finalizing" },
];

interface MenuGenerationProgressProps {
  progress: GenerationProgress;
  onDismiss?: () => void;
  className?: string;
}

export function MenuGenerationProgress({
  progress,
  onDismiss,
  className,
}: MenuGenerationProgressProps) {
  const currentStepIndex = STEPS.findIndex((s) => s.step === progress.step);
  const isError = progress.step === "error";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
      >
        {/* Error State */}
        {isError ? (
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Generation Failed</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              {progress.error || "An unknown error occurred. Please try again."}
            </p>
            <Button onClick={onDismiss} variant="outline">
              Dismiss
            </Button>
          </div>
        ) : (
          <>
            {/* Skeleton preview */}
            <div className="mb-6 aspect-[8.5/11] w-full overflow-hidden rounded-lg border border-border bg-muted/30">
              <div className="flex h-full flex-col items-center justify-center gap-2 p-4">
                <motion.div
                  className="h-4 w-3/4 rounded bg-muted"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div
                  className="h-3 w-1/2 rounded bg-muted"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                />
                <div className="mt-4 space-y-2 w-full">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="flex gap-2"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                    >
                      <div className="h-8 w-8 rounded bg-muted shrink-0" />
                      <div className="flex-1 space-y-1">
                        <div className="h-3 w-3/4 rounded bg-muted" />
                        <div className="h-2 w-1/2 rounded bg-muted" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">Generating your menu...</span>
                <span className="text-muted-foreground">{Math.round(progress.progress)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.progress}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Step list */}
            <div className="space-y-2">
              {STEPS.map((step, index) => {
                const isComplete = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div
                    key={step.step}
                    className={cn(
                      "flex items-center gap-3 text-sm",
                      isComplete && "text-muted-foreground",
                      isCurrent && "font-medium text-foreground",
                      !isComplete && !isCurrent && "text-muted-foreground/50"
                    )}
                  >
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                      {isComplete ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : isCurrent ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                      )}
                    </div>
                    <span>{step.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Current message */}
            {progress.message && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                {progress.message}
              </p>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
