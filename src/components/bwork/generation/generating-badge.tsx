"use client";

import { useAtomValue } from "jotai";
import { Loader2 } from "lucide-react";
import { generatingToolsAtom } from "@/atoms/generation-atoms";
import { cn } from "@/lib/utils";

/**
 * Displays a pulsing badge in the sidebar when tools are generating.
 * Reads from the generatingToolsAtom (fed by GenerationNotifier).
 */
export function GeneratingBadge({ className }: { className?: string }) {
  const generatingTools = useAtomValue(generatingToolsAtom);

  if (generatingTools.length === 0) return null;

  return (
    <span
      className={cn(
        "ml-auto flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary",
        className,
      )}
    >
      <Loader2 className="h-3 w-3 animate-spin" />
      <span className="hidden group-data-[collapsible=icon]:hidden sm:inline">
        {generatingTools.length}
      </span>
    </span>
  );
}
