"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PreviewFrame } from "./preview-frame";

type FullscreenPreviewClientProps = {
  toolId: string;
  toolName: string;
  generatedCode: string | null;
};

/**
 * Full-screen preview that renders the tool as a standalone app.
 * Minimal chrome — just a thin toolbar at the top with back navigation.
 */
export function FullscreenPreviewClient({
  toolId,
  toolName,
  generatedCode,
}: FullscreenPreviewClientProps) {
  const router = useRouter();

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Thin toolbar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-muted/30 px-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/create/${toolId}/preview`)}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <span className="text-sm font-medium text-foreground">
            {toolName}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">B-WORK Preview</span>
      </div>

      {/* Full-height iframe */}
      <div className="flex-1 overflow-hidden">
        <PreviewFrame generatedCode={generatedCode} fullscreen />
      </div>
    </div>
  );
}
