"use client";

import { FIELD_TYPES, type Field, type FieldType } from "@/types/artifact";

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Texte",
  number: "Nombre",
  date: "Date",
  select: "Liste",
  checkbox: "Case a cocher",
  // New field types
  file: "Fichier",
  image: "Image",
  email: "Email",
  url: "URL",
  textarea: "Zone de texte",
  color: "Couleur",
  range: "Curseur",
  phone: "Telephone",
  currency: "Montant",
};

type FieldRowProps = {
  field: Field;
  onChangeName: (name: string) => void;
  onChangeType: (type: FieldType) => void;
  onRemove: () => void;
};

export function FieldRow({
  field,
  onChangeName,
  onChangeType,
  onRemove,
}: FieldRowProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={field.name}
        onChange={(e) => onChangeName(e.target.value)}
        placeholder="Nom du champ"
        maxLength={100}
        aria-label="Nom du champ"
        className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
      />
      <select
        value={field.type}
        onChange={(e) => onChangeType(e.target.value as FieldType)}
        aria-label="Type du champ"
        className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      >
        {FIELD_TYPES.map((t) => (
          <option key={t} value={t}>
            {FIELD_TYPE_LABELS[t]}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Supprimer le champ"
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
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
