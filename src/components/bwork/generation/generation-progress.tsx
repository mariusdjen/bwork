"use client";

/**
 * Generation Progress Component
 *
 * Shows user-friendly progress during tool generation.
 * Messages are designed to be non-technical and reassuring.
 */

import { useEffect, useState } from "react";
import { Check, Loader2, Sparkles, Wand2, Palette, Cog, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

const GENERATION_STEPS = [
  {
    label: "Generation du code...",
    sublabel: "L'IA cree ton outil",
    targetPercent: 20,
    icon: Wand2,
  },
  {
    label: "Verification de la structure...",
    sublabel: "On s'assure que tout est correct",
    targetPercent: 40,
    icon: Cog,
  },
  {
    label: "Optimisation...",
    sublabel: "On peaufine le code",
    targetPercent: 60,
    icon: Sparkles,
  },
  {
    label: "Preparation de l'interface...",
    sublabel: "Mise en forme de ton outil",
    targetPercent: 80,
    icon: Palette,
  },
  {
    label: "Finalisation...",
    sublabel: "Derniers ajustements",
    targetPercent: 95,
    icon: Rocket,
  },
];

const STEP_DURATIONS_MS = [3000, 4000, 5000, 4000, 4000];

type GenerationProgressProps = {
  isStreaming: boolean;
  isComplete: boolean;
  statusMessage?: string;
};

export function GenerationProgress({
  isStreaming,
  isComplete,
  statusMessage,
}: GenerationProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (!isStreaming && !isComplete) {
      setCurrentStep(0);
      setPercent(0);
      return;
    }

    if (isComplete) {
      setCurrentStep(GENERATION_STEPS.length);
      setPercent(100);
      return;
    }

    // Advance steps based on time
    let stepIndex = 0;
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += 200;

      // Calculate cumulative time for current step
      let cumulative = 0;
      for (let i = 0; i <= stepIndex; i++) {
        cumulative += STEP_DURATIONS_MS[i];
      }

      if (elapsed >= cumulative && stepIndex < GENERATION_STEPS.length - 1) {
        stepIndex++;
        setCurrentStep(stepIndex);
      }

      // Interpolate percent within current step
      const stepStart =
        stepIndex === 0
          ? 0
          : STEP_DURATIONS_MS.slice(0, stepIndex).reduce((a, b) => a + b, 0);
      const stepDuration = STEP_DURATIONS_MS[stepIndex];
      const stepElapsed = elapsed - stepStart;
      const stepProgress = Math.min(stepElapsed / stepDuration, 1);

      const prevPercent =
        stepIndex === 0 ? 0 : GENERATION_STEPS[stepIndex - 1].targetPercent;
      const nextPercent = GENERATION_STEPS[stepIndex].targetPercent;
      const interpolated =
        prevPercent + (nextPercent - prevPercent) * stepProgress;

      // Cap at 95% until actually complete
      setPercent(Math.min(Math.round(interpolated), 95));
    }, 200);

    return () => clearInterval(interval);
  }, [isStreaming, isComplete]);

  const currentStepData = GENERATION_STEPS[Math.min(currentStep, GENERATION_STEPS.length - 1)];

  return (
    <div
      className="flex w-full max-w-md flex-col gap-6"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-live="polite"
      aria-label="Progression de la generation"
    >
      {/* Main status */}
      <div className="text-center">
        <div className="mb-3 flex justify-center">
          {isComplete ? (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-6 w-6" />
            </div>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              {currentStepData && <currentStepData.icon className="h-6 w-6 animate-pulse" />}
            </div>
          )}
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          {isComplete ? "Ton outil est pret! 🎉" : currentStepData?.label}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {isComplete
            ? "Tu peux maintenant le tester"
            : statusMessage || currentStepData?.sublabel}
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              isComplete ? "bg-green-500" : "bg-primary"
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-center text-sm font-medium text-muted-foreground">
          {percent}%
        </p>
      </div>

      {/* Step indicators (compact) */}
      <div className="flex justify-center gap-2">
        {GENERATION_STEPS.map((step, index) => {
          const isDone = isComplete || index < currentStep;
          const isCurrent = !isComplete && index === currentStep;

          return (
            <div
              key={index}
              className={cn(
                "h-2 w-2 rounded-full transition-all",
                isDone && "bg-primary",
                isCurrent && "bg-primary animate-pulse scale-125",
                !isDone && !isCurrent && "bg-muted"
              )}
              title={step.label}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * Compact version for inline use
 */
export function GenerationProgressCompact({
  percent,
  label,
}: {
  percent: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}
