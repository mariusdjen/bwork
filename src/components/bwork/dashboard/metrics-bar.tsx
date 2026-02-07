"use client";

import { cn } from "@/lib/utils";
import type { ToolSummary } from "@/app/(app)/dashboard/page";

type StatusFilter = ToolSummary["status"] | null;

type MetricsBarProps = {
  total: number;
  activeCount: number;
  generatingCount: number;
  draftCount: number;
  disabledCount: number;
  activeFilter: StatusFilter;
  onFilterChange: (filter: StatusFilter) => void;
};

export function MetricsBar({
  total,
  activeCount,
  generatingCount,
  draftCount,
  disabledCount,
  activeFilter,
  onFilterChange,
}: MetricsBarProps) {
  const counters: { key: StatusFilter; label: string; count: number; countClass: string }[] = [
    { key: null, label: "Total outils", count: total, countClass: "text-card-foreground" },
    { key: "active", label: "Actifs", count: activeCount, countClass: "text-primary" },
    { key: "generating", label: "En generation", count: generatingCount, countClass: "text-amber-500" },
    { key: "draft", label: "Brouillons", count: draftCount, countClass: "text-muted-foreground" },
    ...(disabledCount > 0
      ? [{ key: "disabled" as StatusFilter, label: "Desactives", count: disabledCount, countClass: "text-destructive" }]
      : []),
  ];

  function handleClick(key: StatusFilter) {
    onFilterChange(activeFilter === key ? null : key);
  }

  return (
    <div className="flex flex-wrap gap-3">
      {counters.map((c) => (
        <button
          key={c.key ?? "all"}
          type="button"
          onClick={() => handleClick(c.key)}
          className={cn(
            "rounded-md border px-3 py-1.5 transition-colors",
            activeFilter === c.key
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-primary/50",
          )}
        >
          <span className="text-xs text-muted-foreground">{c.label}</span>
          <span className={cn("ml-2 text-sm font-semibold", c.countClass)}>
            {c.count}
          </span>
        </button>
      ))}
    </div>
  );
}
