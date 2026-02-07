"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSetAtom } from "jotai";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { currentToolAtom } from "@/atoms/tool-atoms";
import { saveArtifactRules } from "@/actions/tool-actions";
import { useDebouncedSave } from "@/hooks/use-debounced-save";
import { MAX_RULES_PER_ARTIFACT } from "@/lib/constants";
import type { ArtifactBase, Rule } from "@/types/artifact";
import { GuidanceStepper } from "./guidance-stepper";
import { RuleRow } from "./rule-row";

import { GENERIC_SUGGESTIONS } from "@/lib/guidance/custom-suggestions";

const RULE_SUGGESTIONS: Record<string, { condition: string; action: string }[]> = {
  tracking: [
    { condition: "le statut passe a 'en attente'", action: "une relance est prevue dans 3 jours" },
    { condition: "la priorite est 'urgente'", action: "le responsable est notifie" },
  ],
  quotes: [
    { condition: "le total depasse 1000€", action: "une remise de 10% est appliquee" },
    { condition: "le devis est accepte", action: "une facture est generee" },
  ],
  forms: [
    { condition: "la date limite est passee", action: "le formulaire est verrouille" },
    { condition: "un champ obligatoire est vide", action: "le formulaire ne peut pas etre soumis" },
  ],
};

type RuleStepClientProps = {
  toolId: string;
  toolName: string;
  artifact: ArtifactBase;
};

export function RuleStepClient({
  toolId,
  toolName,
  artifact,
}: RuleStepClientProps) {
  const setCurrentTool = useSetAtom(currentToolAtom);

  const [rules, setRules] = useState<Rule[]>(() =>
    (artifact.rules ?? []).map((r) => ({
      condition: r.condition ?? "",
      action: r.action ?? "",
    })),
  );

  // Hydrate Jotai atom on mount
  useEffect(() => {
    setCurrentTool({ id: toolId, name: toolName, artifact });
  }, [toolId, toolName, artifact, setCurrentTool]);

  const saveFn = useCallback(
    async (data: Rule[]) => {
      return saveArtifactRules(toolId, data);
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

  function saveCompleteRules(allRules: Rule[]) {
    const complete = allRules.filter(
      (r) => r.condition.trim().length > 0 && r.action.trim().length > 0,
    );
    save(complete);
  }

  function addRule(condition: string = "", action: string = "") {
    if (rules.length >= MAX_RULES_PER_ARTIFACT) return;
    const updated = [...rules, { condition, action }];
    setRules(updated);
    saveCompleteRules(updated);
  }

  function removeRule(index: number) {
    const updated = rules.filter((_, i) => i !== index);
    setRules(updated);
    saveCompleteRules(updated);
  }

  function updateCondition(index: number, condition: string) {
    const updated = rules.map((r, i) => (i === index ? { ...r, condition } : r));
    setRules(updated);
    saveCompleteRules(updated);
  }

  function updateAction(index: number, action: string) {
    const updated = rules.map((r, i) => (i === index ? { ...r, action } : r));
    setRules(updated);
    saveCompleteRules(updated);
  }

  // Rules are optional, but if any rule exists, both fields must be non-empty
  const canProceed =
    rules.length === 0 ||
    rules.every((r) => r.condition.trim().length > 0 && r.action.trim().length > 0);

  const canAdd = rules.length < MAX_RULES_PER_ARTIFACT;

  const allSuggestions =
    artifact.useCase === "custom" && artifact.customSuggestions
      ? artifact.customSuggestions.rules
      : (RULE_SUGGESTIONS[artifact.useCase] ?? GENERIC_SUGGESTIONS.rules);
  const suggestions = allSuggestions.filter(
    (s) =>
      !rules.some(
        (r) =>
          r.condition.toLowerCase() === s.condition.toLowerCase() &&
          r.action.toLowerCase() === s.action.toLowerCase(),
      ),
  );

  const steps = [
    { label: "Donnees", href: `/create/${toolId}/guidance`, status: "done" as const },
    { label: "Champs", href: `/create/${toolId}/guidance/fields`, status: "done" as const },
    { label: "Regles", href: `/create/${toolId}/guidance/rules`, status: "active" as const },
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
            Definissez vos regles
          </h1>
          <p className="mt-1 text-muted-foreground">
            Quelles conditions declenchent quelles actions ?
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Les regles sont optionnelles. Vous pouvez passer a l'etape suivante.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {rules.map((rule, index) => (
            <RuleRow
              key={index}
              rule={rule}
              onChangeCondition={(c) => updateCondition(index, c)}
              onChangeAction={(a) => updateAction(index, a)}
              onRemove={() => removeRule(index)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => addRule()}
          disabled={!canAdd}
          className="self-start rounded-md border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Ajouter une regle
        </button>

        {suggestions.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-muted-foreground">Exemples :</p>
            <div className="flex flex-col gap-2">
              {suggestions.map((s) => (
                <button
                  key={`${s.condition}-${s.action}`}
                  type="button"
                  onClick={() => addRule(s.condition, s.action)}
                  disabled={!canAdd}
                  className="rounded-lg border border-border bg-muted px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="font-medium">Quand</span> {s.condition},{" "}
                  <span className="font-medium">alors</span> {s.action}
                </button>
              ))}
            </div>
          </div>
        )}

        {isSaving && (
          <p className="text-xs text-muted-foreground">Sauvegarde...</p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button asChild variant="ghost">
          <Link href={`/create/${toolId}/guidance/fields`}>Precedent</Link>
        </Button>
        {canProceed ? (
          <Button asChild>
            <Link href={`/create/${toolId}/guidance/summary`}>Suivant</Link>
          </Button>
        ) : (
          <Button disabled>Suivant</Button>
        )}
      </div>
    </div>
  );
}
