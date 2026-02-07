"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Maximize2,
  Pencil,
  ExternalLink,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { PreviewFrame } from "./preview-frame";
import { SandboxPreview } from "./sandbox-preview";
import { DeployButton } from "@/components/bwork/deploy/deploy-button";
import { GenerationError } from "@/components/bwork/generation/generation-error";
import { reopenArtifact } from "@/actions/tool-actions";
import type { SandboxStatus } from "@/types/sandbox";

type PreviewPageClientProps = {
  toolId: string;
  toolName: string;
  generatedCode: string | null;
  deployedUrl: string | null;
};

interface SandboxData {
  id: string;
  status: SandboxStatus;
  url: string | null;
  last_error: string | null;
}

export function PreviewPageClient({
  toolId,
  toolName,
  generatedCode,
  deployedUrl,
}: PreviewPageClientProps) {
  const router = useRouter();
  const [isReopening, setIsReopening] = useState(false);
  const [sandbox, setSandbox] = useState<SandboxData | null>(null);
  const [sandboxLoading, setSandboxLoading] = useState(true);
  const [showClientPreview, setShowClientPreview] = useState(false);

  // Fetch sandbox data on mount
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function fetchSandbox() {
      setSandboxLoading(true);
      try {
        const { data, error } = await supabase
          .from("sandboxes")
          .select("id, status, url, last_error")
          .eq("tool_id", toolId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error) {
          // No sandbox found is not an error - just means we use client preview
          if (error.code !== "PGRST116") {
            console.warn("[PreviewPageClient] Sandbox fetch error:", error);
          }
        } else if (data) {
          setSandbox(data as SandboxData);
        }
      } catch (err) {
        console.error("[PreviewPageClient] Unexpected error fetching sandbox:", err);
      } finally {
        setSandboxLoading(false);
      }
    }

    fetchSandbox();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`sandbox-preview:${toolId}`)
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
            setSandbox(payload.new as SandboxData);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [toolId]);

  async function handleModify() {
    setIsReopening(true);
    try {
      const result = await reopenArtifact(toolId);
      if (result?.error) {
        toast.error(result.error);
        setIsReopening(false);
        return;
      }
      router.push(`/create/${toolId}/guidance`);
    } catch {
      toast.error("Une erreur inattendue est survenue.");
      setIsReopening(false);
    }
  }

  function handleRepairSuccess() {
    toast.success("Correction appliquee!");
    router.refresh();
  }

  function handleRetrySuccess() {
    toast.success("Regeneration terminee!");
    router.refresh();
  }

  // Determine what to show
  const hasSandbox = sandbox && sandbox.status === "ready" && sandbox.url;
  const sandboxFailed = sandbox && sandbox.status === "failed";
  const sandboxInProgress =
    sandbox &&
    !["ready", "failed", "terminated"].includes(sandbox.status);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {toolName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasSandbox
              ? "Preview en direct de votre outil"
              : sandboxInProgress
              ? "Preparation de l'environnement..."
              : "Preview de votre outil genere"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Button>
      </div>

      {/* Preview Area */}
      {sandboxLoading ? (
        <div className="flex h-[500px] items-center justify-center rounded-lg border bg-muted">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : sandboxFailed ? (
        <GenerationError
          toolId={toolId}
          sandboxId={sandbox.id}
          error={sandbox.last_error || undefined}
          canRetry={true}
          onRepairSuccess={handleRepairSuccess}
          onRetrySuccess={handleRetrySuccess}
        />
      ) : hasSandbox && !showClientPreview ? (
        <SandboxPreview
          toolId={toolId}
          className="h-[500px] rounded-lg border"
          onReady={(url) => console.log("Sandbox ready:", url)}
          onError={(error) => {
            console.error("Sandbox error:", error);
            // Fall back to client preview on error
            setShowClientPreview(true);
          }}
        />
      ) : sandboxInProgress ? (
        <SandboxPreview
          toolId={toolId}
          className="h-[500px] rounded-lg border"
          onReady={(url) => console.log("Sandbox ready:", url)}
          onError={(error) => {
            console.error("Sandbox error:", error);
            setShowClientPreview(true);
          }}
        />
      ) : (
        // Fallback: client-side preview
        <PreviewFrame generatedCode={generatedCode} />
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Toggle preview type if both available */}
        <div className="flex items-center gap-2">
          {hasSandbox && generatedCode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowClientPreview(!showClientPreview)}
            >
              <RefreshCw className="h-4 w-4" />
              {showClientPreview ? "Voir sandbox live" : "Voir preview local"}
            </Button>
          )}
        </div>

        {/* Right: Main actions */}
        <div className="flex items-center gap-3">
          {/* Direct sandbox link */}
          {hasSandbox && (
            <Button
              variant="outline"
              onClick={() => window.open(sandbox.url!, "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
              Ouvrir le lien direct
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => router.push(`/create/${toolId}/preview/fullscreen`)}
          >
            <Maximize2 className="h-4 w-4" />
            Plein ecran
          </Button>
          <Button
            variant="outline"
            onClick={handleModify}
            disabled={isReopening}
          >
            <Pencil className="h-4 w-4" />
            {isReopening ? "Ouverture..." : "Modifier l'artefact"}
          </Button>
          <DeployButton
            toolId={toolId}
            deployedUrl={deployedUrl}
            accessType="public"
          />
        </div>
      </div>

      {/* Sandbox info */}
      {hasSandbox && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✅ <strong>Sandbox actif:</strong> Votre outil fonctionne dans un
            environnement reel avec toutes ses dependances.
          </p>
          <p className="mt-1 text-xs text-green-600 dark:text-green-400 font-mono truncate">
            {sandbox.url}
          </p>
        </div>
      )}

      {/* Fallback notice */}
      {showClientPreview && hasSandbox && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            ⚠️ <strong>Preview local:</strong> Vous voyez un apercu simplifie.
            Cliquez sur "Voir sandbox live" pour l'environnement complet.
          </p>
        </div>
      )}
    </div>
  );
}
