"use client";

import type { Rule } from "@/types/artifact";

type RuleRowProps = {
  rule: Rule;
  onChangeCondition: (condition: string) => void;
  onChangeAction: (action: string) => void;
  onRemove: () => void;
};

export function RuleRow({
  rule,
  onChangeCondition,
  onChangeAction,
  onRemove,
}: RuleRowProps) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-border p-3">
      <div className="flex flex-1 flex-col gap-2">
        <p className="text-sm text-foreground">
          <span className="font-medium">Quand </span>
          <input
            type="text"
            value={rule.condition}
            onChange={(e) => onChangeCondition(e.target.value)}
            placeholder="ex: le statut passe a 'en attente'"
            maxLength={200}
            aria-label="Condition de la regle"
            className="inline-block w-full border-b-2 border-primary bg-muted/50 px-2 py-0.5 text-sm font-semibold text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground focus:bg-muted"
          />
        </p>
        <p className="text-sm text-foreground">
          <span className="font-medium">Alors </span>
          <input
            type="text"
            value={rule.action}
            onChange={(e) => onChangeAction(e.target.value)}
            placeholder="ex: une relance est prevue dans 3 jours"
            maxLength={200}
            aria-label="Action de la regle"
            className="inline-block w-full border-b-2 border-primary bg-muted/50 px-2 py-0.5 text-sm font-semibold text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground focus:bg-muted"
          />
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Supprimer la regle"
        className="mt-1 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
