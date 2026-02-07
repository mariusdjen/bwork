"use client";

/**
 * Usage Card Component
 *
 * Displays current usage statistics with progress bars.
 * Shows warnings when approaching limits.
 */

import { AlertTriangle, TrendingUp, Zap, Box, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface UsageItem {
  label: string;
  current: number;
  max: number | null; // null = unlimited
  icon: React.ReactNode;
  unit?: string;
}

interface UsageCardProps {
  items: UsageItem[];
  title?: string;
}

export function UsageCard({ items, title = "Utilisation ce mois" }: UsageCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <div className="space-y-5">
        {items.map((item, index) => (
          <UsageItem key={index} item={item} />
        ))}
      </div>
    </div>
  );
}

function UsageItem({ item }: { item: UsageItem }) {
  const { label, current, max, icon, unit = "" } = item;

  // Calculate percentage (capped at 100%)
  const percentage = max ? Math.min((current / max) * 100, 100) : 0;
  const isUnlimited = max === null;
  const isWarning = !isUnlimited && percentage >= 80;
  const isExceeded = !isUnlimited && current >= max;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {isWarning && !isExceeded && (
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          )}
          {isExceeded && (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          )}
          <span
            className={cn(
              "text-sm font-semibold",
              isExceeded ? "text-destructive" : isWarning ? "text-amber-500" : "text-foreground"
            )}
          >
            {current}{unit}
            {!isUnlimited && (
              <span className="text-muted-foreground font-normal">
                {" "}/ {max}{unit}
              </span>
            )}
            {isUnlimited && (
              <span className="text-muted-foreground font-normal"> (illimite)</span>
            )}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      {!isUnlimited && (
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500 rounded-full",
              isExceeded
                ? "bg-destructive"
                : isWarning
                ? "bg-amber-500"
                : "bg-primary"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      {/* Warning Message */}
      {isExceeded && (
        <p className="text-xs text-destructive mt-1">
          Limite atteinte ! Passez a un plan superieur.
        </p>
      )}
      {isWarning && !isExceeded && (
        <p className="text-xs text-amber-500 mt-1">
          Attention: {Math.round(percentage)}% utilise
        </p>
      )}
    </div>
  );
}

/**
 * Props for loading usage data
 */
export interface UsageData {
  generationsUsed: number;
  generationsMax: number | null;
  toolsActive: number;
  toolsMax: number | null;
}

export function buildUsageItems(data: UsageData): UsageItem[] {
  return [
    {
      label: "Generations ce mois",
      current: data.generationsUsed,
      max: data.generationsMax,
      icon: <RefreshCw className="h-4 w-4" />,
    },
    {
      label: "Outils actifs",
      current: data.toolsActive,
      max: data.toolsMax,
      icon: <Box className="h-4 w-4" />,
    },
  ];
}
