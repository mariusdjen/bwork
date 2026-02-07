import type { CustomSuggestions } from "@/types/artifact";

export type { CustomSuggestions };

export const GENERIC_SUGGESTIONS: CustomSuggestions = {
  entities: ["Donnees", "Elements", "Enregistrements"],
  fields: ["Nom", "Description", "Statut", "Date"],
  rules: [
    { condition: "la condition est remplie", action: "l'action est declenchee" },
  ],
};
