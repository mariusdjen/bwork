"use client";

import { useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Database, FileText, GitBranch, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { currentToolAtom } from "@/atoms/tool-atoms";
import { finalizeArtifact } from "@/actions/tool-actions";
import type { ArtifactBase } from "@/types/artifact";
import { GuidanceStepper } from "./guidance-stepper";
import { SummaryCard } from "./summary-card";

type SummaryStepClientProps = {
  toolId: string;
  toolName: string;
  artifact: ArtifactBase;
  hasExistingCode?: boolean;
};

export function SummaryStepClient({
  toolId,
  toolName,
  artifact,
  hasExistingCode = false,
}: SummaryStepClientProps) {
  const setCurrentTool = useSetAtom(currentToolAtom);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hydrate Jotai atom on mount
  useEffect(() => {
    setCurrentTool({ id: toolId, name: toolName, artifact });
  }, [toolId, toolName, artifact, setCurrentTool]);

  const entityNames = (artifact.entities ?? []).map((e) => e.name);
  const totalFields = (artifact.entities ?? []).reduce(
    (sum, e) => sum + e.fields.length,
    0,
  );
  const totalRules = (artifact.rules ?? []).length;

  const dataDescription =
    entityNames.length > 0
      ? `${entityNames.length} entite${entityNames.length > 1 ? "s" : ""} : ${entityNames.join(", ")}`
      : "Aucune entite definie";

  const fieldsDescription =
    totalFields > 0
      ? `${totalFields} champ${totalFields > 1 ? "s" : ""} defini${totalFields > 1 ? "s" : ""} au total`
      : "Aucun champ defini";

  const rulesDescription =
    totalRules > 0
      ? `${totalRules} regle${totalRules > 1 ? "s" : ""} metier definie${totalRules > 1 ? "s" : ""}`
      : "Aucune regle definie (optionnel)";

  async function handleFinalize() {
    setIsSubmitting(true);
    try {
      const result = await finalizeArtifact(toolId);
      if (result?.error) {
        toast.error(result.error);
        setIsSubmitting(false);
        return;
      }
      toast.success(result?.success ?? "Votre outil est pret pour la generation !");
      router.push(`/create/${toolId}/generate`);
    } catch {
      toast.error("Une erreur inattendue est survenue.");
      setIsSubmitting(false);
    }
  }

  const steps = [
    { label: "Donnees", href: `/create/${toolId}/guidance`, status: "done" as const },
    { label: "Champs", href: `/create/${toolId}/guidance/fields`, status: "done" as const },
    { label: "Regles", href: `/create/${toolId}/guidance/rules`, status: "done" as const },
    { label: "Resume", href: `/create/${toolId}/guidance/summary`, status: "active" as const },
  ];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <div className="sticky top-0 z-10 bg-background pb-4 pt-2">
        <GuidanceStepper steps={steps} />
      </div>

      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Resume de votre outil
          </h1>
          <p className="mt-1 text-muted-foreground">
            Verifiez que tout est correct avant de lancer la generation.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SummaryCard
            icon={Database}
            title="Vos donnees"
            description={dataDescription}
            href={`/create/${toolId}/guidance`}
          />
          <SummaryCard
            icon={FileText}
            title="Vos champs"
            description={fieldsDescription}
            href={`/create/${toolId}/guidance/fields`}
          />
          <SummaryCard
            icon={GitBranch}
            title="Vos regles"
            description={rulesDescription}
            href={`/create/${toolId}/guidance/rules`}
          />
          <SummaryCard
            icon={Lock}
            title="Acces et permissions"
            description="Configuration des acces (bientot disponible)"
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button asChild variant="ghost">
          <Link href={`/create/${toolId}/guidance/rules`}>Precedent</Link>
        </Button>
        <Button onClick={handleFinalize} disabled={isSubmitting}>
          {isSubmitting ? "Finalisation..." : hasExistingCode ? "Regenerer mon outil" : "Generer mon outil"}
        </Button>
      </div>
    </div>
  );
}
