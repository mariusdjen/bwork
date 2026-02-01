"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GenerationProgress } from "./generation-progress";

type GeneratePageClientProps = {
  toolId: string;
  toolName: string;
  toolStatus: string;
};

/**
 * Polls the tool status until it becomes "active" (code saved to DB).
 * This avoids the race condition where onFinish hasn't completed yet
 * when the client finishes consuming the stream.
 */
async function waitForToolActive(
  toolId: string,
  maxAttempts = 20,
  intervalMs = 500,
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`/api/tools/${toolId}/status`);
      if (res.ok) {
        const data = (await res.json()) as { status: string };
        if (data.status === "active") return true;
        if (data.status === "ready" || data.status === "draft") return false; // failed and reset
      }
    } catch {
      // ignore fetch errors, keep polling
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}

export function GeneratePageClient({
  toolId,
  toolName,
  toolStatus,
}: GeneratePageClientProps) {
  const router = useRouter();
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const isAlreadyGenerating = toolStatus === "generating";
  const toastShownRef = useRef(false);

  // M2 fix: when user refreshes during an active generation, poll until complete
  useEffect(() => {
    if (!isAlreadyGenerating) return;

    let cancelled = false;

    async function pollUntilDone() {
      const isActive = await waitForToolActive(toolId, 120, 2000); // up to 4 min
      if (cancelled) return;
      if (isActive) {
        toast.success("Votre outil est pret !");
        setTimeout(() => router.push(`/create/${toolId}/preview`), 1500);
      }
    }

    pollUntilDone();
    return () => { cancelled = true; };
  }, [isAlreadyGenerating, toolId, router]);

  async function handleGenerate() {
    toastShownRef.current = false;
    setHasStarted(true);
    setIsStreaming(true);
    setHasError(false);
    setIsComplete(false);

    try {
      const response = await fetch("/api/generations/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error ??
            "La generation a echoue. Reessayez ou modifiez vos regles.",
        );
      }

      // Consume the stream to ensure the generation completes
      const reader = response.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder();
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            decoder.decode(value, { stream: !done });
          }
        }
      }

      // Wait for the onFinish callback to save code to DB
      // (the stream ends before the server-side DB write completes)
      const isActive = await waitForToolActive(toolId);

      if (!isActive) {
        throw new Error(
          "La sauvegarde du code a echoue. Reessayez la generation.",
        );
      }

      // Generation complete and saved
      setIsStreaming(false);
      setIsComplete(true);

      if (!toastShownRef.current) {
        toastShownRef.current = true;
        toast.success("Votre outil est pret !");
        setTimeout(() => {
          router.push(`/create/${toolId}/preview`);
        }, 1500);
      }
    } catch (err) {
      setIsStreaming(false);
      setHasError(true);
      if (!toastShownRef.current) {
        toastShownRef.current = true;
        toast.error(
          err instanceof Error
            ? err.message
            : "Une erreur inattendue est survenue.",
        );
      }
    }
  }

  function handleRetry() {
    setHasError(false);
    toastShownRef.current = false;
    handleGenerate();
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {isAlreadyGenerating && !hasStarted
            ? "Generation deja en cours"
            : hasStarted && !hasError
              ? "Generation en cours..."
              : hasError
                ? "Echec de la generation"
                : "Generer votre outil"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {isAlreadyGenerating && !hasStarted
            ? `"${toolName}" est en cours de creation. Veuillez patienter.`
            : hasStarted && !hasError
              ? `Creation de "${toolName}" — veuillez patienter.`
              : hasError
                ? "Quelque chose s'est mal passe."
                : `Tout est pret pour creer "${toolName}".`}
        </p>
      </div>

      {/* Already generating — user refreshed during an active generation */}
      {isAlreadyGenerating && !hasStarted && (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            Une generation est deja en cours pour cet outil. Veuillez patienter
            ou revenir plus tard.
          </p>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Retour au tableau de bord
          </Button>
        </div>
      )}

      {/* Generation in progress */}
      {hasStarted && !hasError && (
        <GenerationProgress isStreaming={isStreaming} isComplete={isComplete} />
      )}

      {/* Error state */}
      {hasError && (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-destructive">
            La generation a echoue. Vous pouvez reessayer ou modifier votre
            artefact.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              Modifier l&apos;artefact
            </Button>
            <Button onClick={handleRetry}>Reessayer</Button>
          </div>
        </div>
      )}

      {/* Initial state — ready to generate */}
      {!hasStarted && !isAlreadyGenerating && (
        <Button size="lg" onClick={handleGenerate} className="gap-2">
          <Sparkles className="h-5 w-5" />
          Generer mon outil
        </Button>
      )}
    </div>
  );
}
