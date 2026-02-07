"use client";

import { type Field, type FieldType, type CustomSuggestions } from "@/types/artifact";
import { MAX_FIELDS_PER_ENTITY } from "@/lib/constants";
import { GENERIC_SUGGESTIONS } from "@/lib/guidance/custom-suggestions";
import { FieldRow } from "./field-row";

const FIELD_SUGGESTIONS: Record<string, string[]> = {
  tracking: ["Titre", "Description", "Statut", "Priorite", "Date de creation", "Responsable"],
  quotes: ["Client", "Montant", "Date", "Statut", "Conditions"],
  forms: ["Titre", "Description", "Date limite", "Obligatoire"],
};

type EntityFieldsBlockProps = {
  entityName: string;
  fields: Field[];
  useCase: string;
  customSuggestions?: CustomSuggestions | null;
  onFieldsChange: (fields: Field[]) => void;
};

export function EntityFieldsBlock({
  entityName,
  fields,
  useCase,
  customSuggestions,
  onFieldsChange,
}: EntityFieldsBlockProps) {
  const suggestions =
    useCase === "custom" && customSuggestions
      ? customSuggestions.fields
      : (FIELD_SUGGESTIONS[useCase] ?? GENERIC_SUGGESTIONS.fields);
  const availableSuggestions = suggestions.filter(
    (s) => !fields.some((f) => f.name.toLowerCase() === s.toLowerCase()),
  );
  const canAdd = fields.length < MAX_FIELDS_PER_ENTITY;

  function addField(name: string = "", type: FieldType = "text") {
    if (!canAdd) return;
    onFieldsChange([...fields, { name, type }]);
  }

  function removeField(index: number) {
    onFieldsChange(fields.filter((_, i) => i !== index));
  }

  function updateFieldName(index: number, name: string) {
    const updated = fields.map((f, i) => (i === index ? { ...f, name } : f));
    onFieldsChange(updated);
  }

  function updateFieldType(index: number, type: FieldType) {
    const updated = fields.map((f, i) => (i === index ? { ...f, type } : f));
    onFieldsChange(updated);
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
      <p className="text-lg text-foreground">
        <span>Chaque </span>
        <span className="font-semibold text-primary">{entityName}</span>
        <span> contient :</span>
      </p>

      <div className="flex flex-col gap-2">
        {fields.map((field, index) => (
          <FieldRow
            key={index}
            field={field}
            onChangeName={(name) => updateFieldName(index, name)}
            onChangeType={(type) => updateFieldType(index, type)}
            onRemove={() => removeField(index)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => addField()}
        disabled={!canAdd}
        className="self-start rounded-md border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        + Ajouter un champ
      </button>

      {availableSuggestions.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-muted-foreground">Suggestions :</p>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addField(s, "text")}
                disabled={!canAdd}
                className="rounded-full border border-border bg-muted px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
