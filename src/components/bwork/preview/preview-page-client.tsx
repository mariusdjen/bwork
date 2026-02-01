"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Maximize2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PreviewFrame } from "./preview-frame";
import { DeployButton } from "@/components/bwork/deploy/deploy-button";
import { reopenArtifact } from "@/actions/tool-actions";

type PreviewPageClientProps = {
  toolId: string;
  toolName: string;
  generatedCode: string | null;
  deployedUrl: string | null;
};

export function PreviewPageClient({
  toolId,
  toolName,
  generatedCode,
  deployedUrl,
}: PreviewPageClientProps) {
  const router = useRouter();
  const [isReopening, setIsReopening] = useState(false);

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

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {toolName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Preview de votre outil genere
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

      <PreviewFrame generatedCode={generatedCode} />

      <div className="flex items-center justify-end gap-3">
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
  );
}
