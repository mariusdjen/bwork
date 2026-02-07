"use client";

/**
 * Generation Error Component
 *
 * Displays when generation/build fails, with options to:
 * 1. Auto-repair (AI fixes the code)
 * 2. Retry (regenerate from scratch)
 * 3. Modify (go back to guidance)
 *
 * Never shows technical errors - only friendly messages with actions.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Wand2,
  Pencil,
  RefreshCw,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface GenerationErrorProps {
  toolId: string;
  sandboxId?: string;
  error?: string;
  canRetry?: boolean;
  onRepairSuccess?: () => void;
  onRetrySuccess?: () => void;
}

/**
 * Determine error type and if it's auto-repairable
 */
function analyzeError(error?: string): {
  type: "repairable" | "needs-retry" | "needs-modification";
  title: string;
  description: string;
  suggestion?: string;
} {
  if (!error) {
    return {
      type: "needs-retry",
      title: "Oups, quelque chose s'est mal passe",
      description: "Une erreur inattendue est survenue.",
    };
  }

  const lowerError = error.toLowerCase();

  // Repairable errors (syntax, JSX, simple issues)
  if (
    lowerError.includes("unexpected") ||
    lowerError.includes("syntax") ||
    lowerError.includes("adjacent") ||
    lowerError.includes("expected") ||
    lowerError.includes("jsx")
  ) {
    return {
      type: "repairable",
      title: "Petit souci detecte",
      description:
        "Ton outil a une erreur de syntaxe qu'on peut corriger automatiquement.",
    };
  }

  // Missing package/import (repairable)
  if (
    lowerError.includes("module") ||
    lowerError.includes("import") ||
    lowerError.includes("package") ||
    lowerError.includes("not found")
  ) {
    return {
      type: "repairable",
      title: "Dependance manquante",
      description:
        "Il manque une bibliotheque. On peut l'ajouter automatiquement.",
    };
  }

  // Timeout (retry)
  if (lowerError.includes("timeout") || lowerError.includes("timed out")) {
    return {
      type: "needs-retry",
      title: "Generation trop longue",
      description: "Le serveur a mis trop de temps. On peut reessayer.",
    };
  }

  // Sandbox unavailable (not a real error for user)
  if (
    lowerError.includes("sandbox") ||
    lowerError.includes("e2b") ||
    lowerError.includes("unauthorized")
  ) {
    return {
      type: "needs-retry",
      title: "Preview temporairement indisponible",
      description: "L'environnement de test n'est pas disponible.",
      suggestion: "Ton code a ete genere, tu peux quand meme le deployer.",
    };
  }

  // Complex errors (need modification)
  if (
    lowerError.includes("complex") ||
    lowerError.includes("failed after") ||
    lowerError.includes("max retries")
  ) {
    return {
      type: "needs-modification",
      title: "Outil trop complexe",
      description:
        "La generation a rencontre des difficultes avec cette description.",
      suggestion: "Essaie de simplifier ou d'etre plus precis.",
    };
  }

  // Default: try repair first
  return {
    type: "repairable",
    title: "Erreur detectee",
    description: "On peut essayer de corriger automatiquement.",
  };
}

export function GenerationError({
  toolId,
  sandboxId,
  error,
  canRetry = true,
  onRepairSuccess,
  onRetrySuccess,
}: GenerationErrorProps) {
  const router = useRouter();
  const [status, setStatus] = useState<
    "idle" | "repairing" | "retrying" | "success" | "failed"
  >("idle");

  const analysis = analyzeError(error);
  const canRepair = analysis.type === "repairable" && sandboxId;

  async function handleRepair() {
    if (!sandboxId) return;
    if (status === "repairing" || status === "retrying" || status === "success") return;

    setStatus("repairing");

    try {
      const response = await fetch(`/api/sandbox/${sandboxId}/repair`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        toast.success("Corrige! Rechargement...");

        setTimeout(() => {
          if (onRepairSuccess) {
            onRepairSuccess();
          } else {
            router.refresh();
          }
        }, 1500);
      } else {
        setStatus("failed");
        toast.error(
          data.suggestion ||
            "La correction automatique n'a pas fonctionne. Essaie de regenerer."
        );
      }
    } catch (err) {
      console.error("[GenerationError] Repair failed:", err);
      setStatus("failed");
      toast.error("Erreur lors de la correction.");
    }
  }

  async function handleRetry() {
    if (!sandboxId) return;
    if (status === "repairing" || status === "retrying" || status === "success") return;

    setStatus("retrying");

    try {
      const response = await fetch(`/api/sandbox/${sandboxId}/retry`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        toast.success("Regeneration reussie!");

        setTimeout(() => {
          if (onRetrySuccess) {
            onRetrySuccess();
          } else {
            router.refresh();
          }
        }, 1500);
      } else {
        setStatus("failed");
        toast.error(data.userMessage || "Echec de la regeneration.");
      }
    } catch (err) {
      console.error("[GenerationError] Retry failed:", err);
      setStatus("failed");
      toast.error("Erreur lors de la regeneration.");
    }
  }

  function handleModify() {
    router.push(`/create/${toolId}/guidance`);
  }

  const isLoading = status === "repairing" || status === "retrying";

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center">
      {/* Icon */}
      <div
        className={cn(
          "mb-4 flex h-16 w-16 items-center justify-center rounded-full",
          status === "success"
            ? "bg-green-100 dark:bg-green-900/30"
            : "bg-amber-100 dark:bg-amber-900/30"
        )}
      >
        {status === "success" ? (
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        ) : isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : (
          <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        )}
      </div>

      {/* Title */}
      <h3 className="mb-2 text-xl font-semibold text-foreground">
        {status === "success"
          ? "Corrige!"
          : status === "repairing"
          ? "Correction en cours..."
          : status === "retrying"
          ? "Regeneration en cours..."
          : analysis.title}
      </h3>

      {/* Description */}
      <p className="mb-2 max-w-md text-sm text-muted-foreground">
        {status === "success"
          ? "L'erreur a ete corrigee. Ton outil est pret!"
          : isLoading
          ? "Ca ne prendra qu'un instant..."
          : analysis.description}
      </p>

      {/* Suggestion */}
      {analysis.suggestion && !isLoading && status !== "success" && (
        <p className="mb-4 text-sm text-muted-foreground/80">
          💡 {analysis.suggestion}
        </p>
      )}

      {/* Actions */}
      {status === "idle" && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          {/* Primary action: Repair if possible */}
          {canRepair && (
            <Button onClick={handleRepair} className="gap-2">
              <Wand2 className="h-4 w-4" />
              Corriger automatiquement
            </Button>
          )}

          {/* Secondary: Retry */}
          {canRetry && sandboxId && (
            <Button
              variant={canRepair ? "outline" : "default"}
              onClick={handleRetry}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Regenerer
            </Button>
          )}

          {/* Tertiary: Modify */}
          <Button variant="ghost" onClick={handleModify} className="gap-2">
            <Pencil className="h-4 w-4" />
            Modifier ma description
          </Button>
        </div>
      )}

      {/* Failed state - show alternatives */}
      {status === "failed" && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          {canRetry && sandboxId && (
            <Button onClick={handleRetry} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Regenerer completement
            </Button>
          )}
          <Button variant="outline" onClick={handleModify} className="gap-2">
            <Pencil className="h-4 w-4" />
            Modifier ma description
          </Button>
        </div>
      )}

      {/* Tips after failure */}
      {status === "failed" && (
        <div className="mt-6 rounded-lg bg-muted/50 p-4 text-left">
          <p className="mb-2 text-sm font-medium text-foreground">
            💡 Conseils pour reussir:
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Decris ton outil de maniere plus simple</li>
            <li>• Sois precis sur les fonctionnalites voulues</li>
            <li>• Evite les descriptions trop longues ou complexes</li>
          </ul>
        </div>
      )}
    </div>
  );
}
