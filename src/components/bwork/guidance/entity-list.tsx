"use client";

import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_ENTITIES_PER_ARTIFACT } from "@/lib/constants";
import type { Entity } from "@/types/artifact";

type EntityListProps = {
  entities: Entity[];
  onRemove: (index: number) => void;
  onAdd: () => void;
  canAdd: boolean;
};

export function EntityList({ entities, onRemove, onAdd, canAdd }: EntityListProps) {
  if (entities.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-muted-foreground">
        Entites definies ({entities.length}/{MAX_ENTITIES_PER_ARTIFACT})
      </h3>

      <ul className="flex flex-col gap-2">
        {entities.map((entity, i) => (
          <li
            key={`${entity.name}-${i}`}
            className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-2"
          >
            <span className="font-medium text-card-foreground">{entity.name}</span>
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="text-muted-foreground transition-colors hover:text-destructive"
              aria-label={`Supprimer ${entity.name}`}
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      {canAdd && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          className="self-start"
        >
          <Plus className="mr-1 h-4 w-4" />
          Ajouter une entite
        </Button>
      )}
    </div>
  );
}
