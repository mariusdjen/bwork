"use client";

/**
 * GuidancePageClient Component
 *
 * Client wrapper for the hybrid guidance chat page.
 * Handles the full-page layout with chat and preview.
 */

import { GuidanceChat } from "./chat";
import type { ArtifactBase } from "@/types/artifact";

interface GuidancePageClientProps {
  toolId: string;
  toolName: string;
  artifact: Partial<ArtifactBase>;
}

export function GuidancePageClient({
  toolId,
  toolName,
  artifact,
}: GuidancePageClientProps) {
  // Prepare initial artifact with any existing data
  const initialArtifact: Partial<ArtifactBase> = {
    ...artifact,
    toolName: artifact.toolName || toolName,
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 border-b px-4 py-3 flex items-center justify-between bg-background">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            Creer ton outil
          </h1>
          <p className="text-sm text-muted-foreground">
            Decris ce que tu veux, je te guide
          </p>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 min-h-0">
        <GuidanceChat toolId={toolId} initialArtifact={initialArtifact} />
      </div>
    </div>
  );
}
