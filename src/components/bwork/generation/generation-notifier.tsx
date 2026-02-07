"use client";

import { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useRealtimeTools } from "@/hooks/use-realtime-tools";
import { generatingToolsAtom } from "@/atoms/generation-atoms";
import { TOAST_GENERATION_DURATION_MS } from "@/lib/constants";
import type { ToolStatusChange } from "@/hooks/use-realtime-tools";

type GenerationNotifierProps = {
  orgId: string;
  initialGenerating: { id: string; name: string }[];
};

/**
 * Listens for Supabase Realtime tool status changes across the app.
 * Shows toast notifications when a generation completes or fails.
 * Maintains the generatingToolsAtom for sidebar badge display.
 *
 * Mounted once in the (app) layout — active on all authenticated pages.
 */
export function GenerationNotifier({
  orgId,
  initialGenerating,
}: GenerationNotifierProps) {
  const router = useRouter();
  const [generatingTools, setGeneratingTools] = useAtom(generatingToolsAtom);

  // Keep a synchronous ref so Realtime callbacks always read the latest value
  // (avoids stale closure when multiple status changes arrive between renders)
  const generatingToolsRef = useRef(generatingTools);
  generatingToolsRef.current = generatingTools;

  // Hydrate atom with initial server data on mount
  useEffect(() => {
    setGeneratingTools(initialGenerating);
  }, [initialGenerating, setGeneratingTools]);

  function handleStatusChange({ toolId, toolName, newStatus }: ToolStatusChange) {
    const wasGenerating = generatingToolsRef.current.some((t) => t.id === toolId);

    if (newStatus === "active" && wasGenerating) {
      // Generation completed successfully
      console.info("[B-WORK:generation] Tool generation complete", {
        toolId,
        toolName,
      });
      toast.success(`Votre outil "${toolName}" est pret !`, {
        duration: TOAST_GENERATION_DURATION_MS,
        action: {
          label: "Voir",
          onClick: () => router.push("/dashboard"),
        },
      });
      setGeneratingTools((prev) => prev.filter((t) => t.id !== toolId));
    } else if (newStatus === "ready" && wasGenerating) {
      // Generation failed — tool reverted to ready
      console.error("[B-WORK:generation] Tool generation failed", {
        toolId,
        toolName,
      });
      toast.error(
        `La creation de "${toolName}" a echoue. Vous pouvez reessayer.`,
        { duration: TOAST_GENERATION_DURATION_MS },
      );
      setGeneratingTools((prev) => prev.filter((t) => t.id !== toolId));
    } else if (newStatus === "generating") {
      // New generation started (could be from another tab/session)
      setGeneratingTools((prev) => {
        if (prev.some((t) => t.id === toolId)) return prev;
        return [...prev, { id: toolId, name: toolName }];
      });
    }
  }

  useRealtimeTools(orgId, handleStatusChange);

  return null;
}
