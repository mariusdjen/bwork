"use client";

import { useState, useActionState, useEffect, useRef, useTransition } from "react";
import { Sparkles, Wand2, FileText, ClipboardList, FormInput, PenLine } from "lucide-react";
import { toast } from "sonner";
import { createToolDraft } from "@/actions/tool-actions";
import { CustomDescriptionInput, type CustomDescriptionInputRef } from "./custom-description-input";

const TEMPLATES = [
  {
    useCase: "quotes",
    title: "Creer des devis",
    description: "Generez des devis avec lignes, prix et calculs automatiques.",
    icon: FileText,
  },
  {
    useCase: "tracking",
    title: "Suivre des demandes",
    description: "Suivez vos demandes clients avec statuts et relances.",
    icon: ClipboardList,
  },
  {
    useCase: "forms",
    title: "Collecter des infos",
    description: "Creez un formulaire pour collecter des reponses.",
    icon: FormInput,
  },
] as const;

const EXAMPLES = [
  "Gerer les contacts de mes clients",
  "Suivre mes projets et taches",
  "Tracker mes depenses",
  "Planifier les conges de mon equipe",
];

export function StartScreenClient() {
  const [state, formAction, isActionPending] = useActionState(createToolDraft, null);
  const [isTransitioning, startTransition] = useTransition();
  const isPending = isActionPending || isTransitioning;
  const lastToastedState = useRef(state);
  const inputRef = useRef<CustomDescriptionInputRef>(null);
  const [showCustom, setShowCustom] = useState(false);

  function handleTemplateClick(useCase: string) {
    if (isPending) return;
    const fd = new FormData();
    fd.append("useCase", useCase);
    startTransition(() => {
      formAction(fd);
    });
  }

  function handleCustomSubmit(description: string) {
    if (isPending) return;
    const fd = new FormData();
    fd.append("useCase", "custom");
    fd.append("customDescription", description);
    startTransition(() => {
      formAction(fd);
    });
  }

  function handleExampleClick(example: string) {
    inputRef.current?.setValue(example);
  }

  useEffect(() => {
    if (state?.error && state !== lastToastedState.current) {
      lastToastedState.current = state;
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-8">
      {/* Icon */}
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <Wand2 className="h-8 w-8 text-primary" />
      </div>

      {/* Title */}
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Quel outil veux-tu creer ?
        </h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Choisis un modele pour demarrer rapidement, ou decris ton besoin sur mesure.
        </p>
      </div>

      {/* Template Cards */}
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
        {TEMPLATES.map((tpl) => {
          const Icon = tpl.icon;
          return (
            <button
              key={tpl.useCase}
              onClick={() => handleTemplateClick(tpl.useCase)}
              disabled={isPending}
              className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {tpl.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {tpl.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Separator */}
      <div className="flex w-full items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">ou</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Custom Option */}
      {!showCustom ? (
        <button
          onClick={() => setShowCustom(true)}
          disabled={isPending}
          className="flex w-full items-center gap-3 rounded-xl border border-dashed border-border p-5 text-left transition-all hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <PenLine className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Autre chose</h3>
            <p className="text-xs text-muted-foreground">
              Decris ton besoin et l'IA te guidera pas a pas.
            </p>
          </div>
        </button>
      ) : (
        <div className="w-full space-y-4">
          <CustomDescriptionInput
            ref={inputRef}
            onSubmit={handleCustomSubmit}
            isPending={isPending}
          />
          {/* Examples */}
          <div>
            <p className="text-xs text-muted-foreground text-center mb-3">
              Exemples de descriptions
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  onClick={() => handleExampleClick(example)}
                  disabled={isPending}
                  className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Badge */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="h-3 w-3" />
        <span>Guide par l'IA pour s'adapter a tes besoins</span>
      </div>
    </div>
  );
}
