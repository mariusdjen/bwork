"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSetAtom } from "jotai";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { currentToolAtom } from "@/atoms/tool-atoms";
import { saveArtifactFields } from "@/actions/tool-actions";
import { useDebouncedSave } from "@/hooks/use-debounced-save";
import type { ArtifactBase, Field } from "@/types/artifact";
import { GuidanceStepper } from "./guidance-stepper";
import { EntityFieldsBlock } from "./entity-fields-block";

type EntityWithFields = {
  name: string;
  fields: Field[];
};

type FieldStepClientProps = {
  toolId: string;
  toolName: string;
  artifact: ArtifactBase;
};

export function FieldStepClient({
  toolId,
  toolName,
  artifact,
}: FieldStepClientProps) {
  const setCurrentTool = useSetAtom(currentToolAtom);

  const [entities, setEntities] = useState<EntityWithFields[]>(() =>
    (artifact.entities ?? []).map((e) => ({
      name: e.name,
      fields: e.fields ?? [],
    })),
  );

  // Hydrate Jotai atom on mount
  useEffect(() => {
    setCurrentTool({ id: toolId, name: toolName, artifact });
  }, [toolId, toolName, artifact, setCurrentTool]);

  const saveFn = useCallback(
    async (data: EntityWithFields[]) => {
      return saveArtifactFields(toolId, data);
    },
    [toolId],
  );

  const { save, isSaving, lastError } = useDebouncedSave(saveFn);
  const lastToastedError = useRef<string | null>(null);

  useEffect(() => {
    if (lastError && lastError !== lastToastedError.current) {
      lastToastedError.current = lastError;
      toast.error(lastError);
    }
  }, [lastError]);

  function handleFieldsChange(entityIndex: number, fields: Field[]) {
    const updated = entities.map((e, i) =>
      i === entityIndex ? { ...e, fields } : e,
    );
    setEntities(updated);
    save(updated);
  }

  const allEntitiesHaveFields = entities.every(
    (e) => e.fields.length > 0 && e.fields.every((f) => f.name.trim().length > 0),
  );

  const steps = [
    { label: "Donnees", href: `/create/${toolId}/guidance`, status: "done" as const },
    { label: "Champs", href: `/create/${toolId}/guidance/fields`, status: "active" as const },
    { label: "Regles", href: `/create/${toolId}/guidance/rules`, status: "pending" as const },
    { label: "Resume", href: `/create/${toolId}/guidance/summary`, status: "pending" as const },
  ];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <div className="sticky top-0 z-10 bg-background pb-4 pt-2">
        <GuidanceStepper steps={steps} />
      </div>

      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Definissez vos champs
          </h1>
          <p className="mt-1 text-muted-foreground">
            Quelles informations contient chaque entite ?
          </p>
        </div>

        {entities.map((entity, index) => (
          <EntityFieldsBlock
            key={entity.name}
            entityName={entity.name}
            fields={entity.fields}
            useCase={artifact.useCase}
            customSuggestions={artifact.customSuggestions}
            onFieldsChange={(fields) => handleFieldsChange(index, fields)}
          />
        ))}

        {isSaving && (
          <p className="text-xs text-muted-foreground">Sauvegarde...</p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button asChild variant="ghost">
          <Link href={`/create/${toolId}/guidance`}>Precedent</Link>
        </Button>
        <Button asChild disabled={!allEntitiesHaveFields}>
          <Link href={`/create/${toolId}/guidance/rules`}>Suivant</Link>
        </Button>
      </div>
    </div>
  );
}
