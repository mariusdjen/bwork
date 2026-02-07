"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ToolSummary } from "@/app/(app)/dashboard/page";
import { ToolCard } from "@/components/bwork/dashboard/tool-card";
import { SearchTools } from "@/components/bwork/dashboard/search-tools";
import { MetricsBar } from "@/components/bwork/dashboard/metrics-bar";

type StatusFilter = ToolSummary["status"] | null;

const VALID_STATUSES: ToolSummary["status"][] = [
  "draft",
  "ready",
  "generating",
  "active",
  "disabled",
];

type ToolListProps = {
  tools: ToolSummary[];
  initialFilter: StatusFilter;
};

export function ToolList({ tools, initialFilter }: ToolListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialFilter);
  const [query, setQuery] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((value: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setQuery(value), 300);
  }, []);

  function handleFilterChange(filter: StatusFilter) {
    setStatusFilter(filter);
    const params = new URLSearchParams(searchParams.toString());
    if (filter) {
      params.set("status", filter);
    } else {
      params.delete("status");
    }
    const qs = params.toString();
    router.replace(qs ? `/dashboard?${qs}` : "/dashboard", { scroll: false });
  }

  // Compute counts on full (unfiltered) list
  const activeCount = tools.filter((t) => t.status === "active").length;
  const generatingCount = tools.filter((t) => t.status === "generating").length;
  const draftCount = tools.filter((t) => t.status === "draft").length;
  const disabledCount = tools.filter((t) => t.status === "disabled").length;

  // Combined filter: status + text search
  const filtered = tools
    .filter((t) => !statusFilter || t.status === statusFilter)
    .filter(
      (t) => !query || t.name.toLowerCase().includes(query.toLowerCase()),
    );

  return (
    <div className="flex flex-col gap-4">
      <MetricsBar
        total={tools.length}
        activeCount={activeCount}
        generatingCount={generatingCount}
        draftCount={draftCount}
        disabledCount={disabledCount}
        activeFilter={statusFilter}
        onFilterChange={handleFilterChange}
      />
      <SearchTools onSearch={handleSearch} />
      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {statusFilter
            ? "Aucun outil avec ce statut."
            : "Aucun outil ne correspond a votre recherche."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
