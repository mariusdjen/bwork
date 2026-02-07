"use client";

import { AlertCircle } from "lucide-react";

interface ToolLimitIndicatorProps {
  currentCount: number;
  maxAllowed: number | null;
}

export function ToolLimitIndicator({
  currentCount,
  maxAllowed,
}: ToolLimitIndicatorProps) {
  if (maxAllowed === null) {
    return (
      <div className="text-sm text-muted-foreground">
        Outils actifs : {currentCount} (illimite)
      </div>
    );
  }

  const percentage = (currentCount / maxAllowed) * 100;
  const isNearLimit = percentage >= 80;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Outils actifs : {currentCount} / {maxAllowed}
        </span>
        {isNearLimit && (
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs">Limite proche</span>
          </div>
        )}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full transition-all ${
            isNearLimit ? "bg-amber-500" : "bg-primary"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
