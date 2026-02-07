"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSetAtom } from "jotai";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { currentToolAtom } from "@/atoms/tool-atoms";
import { saveArtifactEntities } from "@/actions/tool-actions";
import { generateGuidanceSuggestions } from "@/actions/suggestion-actions";
import { useDebouncedSave } from "@/hooks/use-debounced-save";
import { MAX_ENTITIES_PER_ARTIFACT } from "@/lib/constants";
import { GENERIC_SUGGESTIONS } from "@/lib/guidance/custom-suggestions";
import type { ArtifactBase, Entity } from "@/types/artifact";
import { Skeleton } from "@/components/ui/skeleton";
import { GuidanceStepper } from "./guidance-stepper";
import { FillInBlank } from "./fill-in-blank";
import { EntityList } from "./entity-list";

const SUGGESTIONS: Record<string, string[]> = {
  tracking: ["Demandes", "Tickets", "Interventions", "Incidents"],
  quotes: ["Devis", "Clients", "Produits", "Prestations"],
  forms: ["Formulaires", "Reponses", "Contacts", "Inscriptions"],
};

type EntityStepClientProps = {
  toolId: string;
  toolName: string;
  artifact: ArtifactBase;
};

export function EntityStepClient({
  toolId,
  toolName,
  artifact,
}: EntityStepClientProps) {
  const setCurrentTool = useSetAtom(currentToolAtom);
  const [entities, setEntities] = useState<Entity[]>(artifact.entities ?? []);
  const [inputValue, setInputValue] = useState("");
  const fillInBlankRef = useRef<HTMLInputElement>(null);

  // Hydrate Jotai atom on mount
  useEffect(() => {
    setCurrentTool({ id: toolId, name: toolName, artifact });
  }, [toolId, toolName, artifact, setCurrentTool]);

  // AI-generated suggestions for custom descriptions
  const [aiEntitySuggestions, setAiEntitySuggestions] = useState<string[]>(
    artifact.customSuggestions?.entities ?? [],
  );
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const suggestionsRequested = useRef(false);

  useEffect(() => {
    if (
      artifact.useCase === "custom" &&
      artifact.customDescription &&
      !artifact.customSuggestions &&
      !suggestionsRequested.current
    ) {
      suggestionsRequested.current = true;
      setIsLoadingSuggestions(true);
      generateGuidanceSuggestions(toolId, artifact.customDescription)
        .then((result) => {
          if (result.suggestions && result.suggestions.entities.length > 0) {
            const aiEntities = result.suggestions.entities;
            setAiEntitySuggestions(aiEntities);

            // Auto-add the first suggestion as entity and prefill input with the second
            if (entities.length === 0) {
              const first = { name: aiEntities[0], fields: [] };
              setEntities([first]);
              save([first]);
              if (aiEntities.length > 1) {
                setInputValue(aiEntities[1]);
              }
            }
          }
        })
        .finally(() => setIsLoadingSuggestions(false));
    }
  }, [toolId, artifact.useCase, artifact.customDescription, artifact.customSuggestions]);

  const saveFn = useCallback(
    async (data: Entity[]) => {
      return saveArtifactEntities(toolId, data);
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

  function addEntity(name: string) {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 50) return;
    if (entities.length >= MAX_ENTITIES_PER_ARTIFACT) return;
    if (entities.some((e) => e.name.toLowerCase() === trimmed.toLowerCase())) return;

    const updated = [...entities, { name: trimmed, fields: [] }];
    setEntities(updated);
    setInputValue("");
    save(updated);
  }

  function removeEntity(index: number) {
    const updated = entities.filter((_, i) => i !== index);
    setEntities(updated);
    save(updated);
  }

  function handleInputSubmit() {
    if (inputValue.trim()) {
      addEntity(inputValue);
    }
  }

  const suggestions =
    artifact.useCase === "custom"
      ? aiEntitySuggestions.length > 0
        ? aiEntitySuggestions
        : GENERIC_SUGGESTIONS.entities
      : (SUGGESTIONS[artifact.useCase] ?? GENERIC_SUGGESTIONS.entities);
  const availableSuggestions = suggestions.filter(
    (s) => !entities.some((e) => e.name.toLowerCase() === s.toLowerCase()),
  );

  const steps = [
    { label: "Donnees", href: `/create/${toolId}/guidance`, status: "active" as const },
    { label: "Champs", href: `/create/${toolId}/guidance/fields`, status: "pending" as const },
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
            Definissez vos donnees
          </h1>
          <p className="mt-1 text-muted-foreground">
            Quelles sont les entites que votre outil va gerer ?
          </p>
        </div>

        {isLoadingSuggestions ? (
          <div className="flex flex-col gap-5 rounded-lg border border-border bg-muted/30 p-6">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <p className="text-sm font-medium text-foreground">
                Analyse de votre besoin en cours...
              </p>
            </div>
            {artifact.customDescription && (
              <p className="text-sm italic text-muted-foreground">
                &laquo; {artifact.customDescription} &raquo;
              </p>
            )}
            <div className="flex flex-col gap-3">
              <p className="text-xs text-muted-foreground">
                Preparation de suggestions personnalisees
              </p>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-32 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-28 rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          <FillInBlank
            ref={fillInBlankRef}
            prefix="Je veux gerer des"
            placeholder="ex: Demandes, Clients..."
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleInputSubmit}
            suggestions={availableSuggestions}
            onSuggestionClick={(s) => addEntity(s)}
          />
        )}

        {inputValue.trim() && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleInputSubmit}
            className="self-start"
          >
            Ajouter "{inputValue.trim()}"
          </Button>
        )}

        <EntityList
          entities={entities}
          onRemove={removeEntity}
          onAdd={() => fillInBlankRef.current?.focus()}
          canAdd={entities.length < MAX_ENTITIES_PER_ARTIFACT}
        />

        {isSaving && (
          <p className="text-xs text-muted-foreground">Sauvegarde...</p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button asChild variant="ghost">
          <Link href="/create/start">Precedent</Link>
        </Button>
        <Button asChild disabled={entities.length === 0}>
          <Link href={`/create/${toolId}/guidance/fields`}>Suivant</Link>
        </Button>
      </div>
    </div>
  );
}
