"use client";

/**
 * Sandbox Preview Component
 *
 * Displays the live preview of a sandbox.
 * Shows loading state, error state, or iframe when ready.
 */

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, AlertTriangle, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  activeSandboxAtom,
  sandboxProgressAtom,
  getProgressForStatus,
  type SandboxState,
} from "@/atoms/sandbox-atoms";
import type { SandboxStatus } from "@/types/sandbox";

interface SandboxPreviewProps {
  toolId: string;
  className?: string;
  onReady?: (sandboxUrl: string) => void;
  onError?: (error: string) => void;
}

export function SandboxPreview({
  toolId,
  className = "",
  onReady,
  onError,
}: SandboxPreviewProps) {
  const [sandbox, setSandbox] = useAtom(activeSandboxAtom);
  const [progress, setProgress] = useAtom(sandboxProgressAtom);
  const [isRetrying, setIsRetrying] = useState(false);

  // Subscribe to realtime sandbox updates
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Initial fetch
    const fetchSandbox = async () => {
      const { data } = await supabase
        .from("sandboxes")
        .select("*")
        .eq("tool_id", toolId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        updateSandboxState(data);
      }
    };

    fetchSandbox();

    // Subscribe to changes
    const channel = supabase
      .channel(`sandbox:${toolId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sandboxes",
          filter: `tool_id=eq.${toolId}`,
        },
        (payload) => {
          if (payload.new) {
            updateSandboxState(payload.new as Record<string, unknown>);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [toolId]);

  // Update local state from database record
  const updateSandboxState = (data: Record<string, unknown>) => {
    const status = data.status as SandboxStatus;
    const progressInfo = getProgressForStatus(status);

    setSandbox({
      id: data.id as string,
      toolId: data.tool_id as string,
      status,
      url: data.url as string | null,
      retryCount: data.retry_count as number,
      maxRetries: data.max_retries as number,
      lastError: data.last_error as string | null,
      buildPassed: data.build_passed as boolean | null,
      testsPassed: data.tests_passed as boolean | null,
      healthCheckPassed: data.health_check_passed as boolean | null,
    });

    setProgress({
      step: status,
      percent: progressInfo.percent,
      message: progressInfo.label,
      isRepairing: status === "repairing",
    });

    // Callbacks
    if (status === "ready" && data.url && onReady) {
      onReady(data.url as string);
    }
    if (status === "failed" && data.last_error && onError) {
      onError(data.last_error as string);
    }
  };

  // Handle retry
  const handleRetry = async () => {
    if (!sandbox) return;

    setIsRetrying(true);
    try {
      const response = await fetch(`/api/sandbox/${sandbox.id}/retry`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Retry failed");
      }
    } catch (error) {
      console.error("Retry failed:", error);
      onError?.(error instanceof Error ? error.message : "Retry failed");
    } finally {
      setIsRetrying(false);
    }
  };

  // Loading state
  if (!sandbox || (sandbox.status !== "ready" && sandbox.status !== "failed")) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-muted rounded-lg ${className}`}
      >
        <div className="text-center space-y-4 p-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <div className="space-y-2">
            <p className="text-lg font-medium">{progress?.message || "Chargement..."}</p>
            {progress && (
              <div className="w-64 h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            )}
            {progress?.isRepairing && (
              <p className="text-sm text-muted-foreground">
                Correction automatique en cours...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (sandbox.status === "failed") {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-muted rounded-lg ${className}`}
      >
        <div className="text-center space-y-4 p-8 max-w-md">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
          <div className="space-y-2">
            <p className="text-lg font-medium">Generation echouee</p>
            <p className="text-sm text-muted-foreground">
              {sandbox.lastError ||
                "Une erreur est survenue lors de la generation."}
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              variant="default"
            >
              {isRetrying ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Regenerer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Ready state - show iframe
  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      {sandbox.url && (
        <>
          <iframe
            src={sandbox.url}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-forms allow-same-origin"
            title="Preview"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => window.open(sandbox.url!, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Ouvrir
            </Button>
            <Button size="sm" variant="outline" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Regenerer
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
