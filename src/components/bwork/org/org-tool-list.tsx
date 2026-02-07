"use client";

import type { OrgToolSummary } from "@/app/(app)/org/page";
import { OrgToolCard } from "@/components/bwork/org/org-tool-card";

type OrgToolListProps = {
  tools: OrgToolSummary[];
};

export function OrgToolList({ tools }: OrgToolListProps) {
  if (tools.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Aucun outil dans l&apos;organisation.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <OrgToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
