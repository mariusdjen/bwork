"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type StepDef = {
  label: string;
  href: string;
  status: "done" | "active" | "pending";
};

type GuidanceStepperProps = {
  steps: StepDef[];
};

export function GuidanceStepper({ steps }: GuidanceStepperProps) {
  return (
    <nav
      role="navigation"
      aria-label="Etapes du guidage"
      className="flex w-full items-center justify-center gap-2"
    >
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-2">
          {step.status === "done" ? (
            <Link
              href={step.href}
              className="flex items-center gap-1.5 text-sm font-medium text-primary"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-3.5 w-3.5" />
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </Link>
          ) : step.status === "active" ? (
            <span
              aria-current="step"
              className="flex items-center gap-1.5 text-sm font-bold text-primary"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary text-xs font-bold text-primary">
                {i + 1}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
                {i + 1}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </span>
          )}

          {i < steps.length - 1 && (
            <div
              className={cn(
                "h-px w-8 sm:w-12",
                step.status === "done" ? "bg-primary" : "bg-border",
              )}
            />
          )}
        </div>
      ))}
    </nav>
  );
}
