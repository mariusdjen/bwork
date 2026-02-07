import type { ArtifactBase } from "@/types/artifact";

/**
 * Template "Formulaire de collecte" (FR-7.3)
 * Source: PRD — "Formulaire interne basique"
 * Entity: Reponses with basic contact fields
 */
export const TEMPLATE_FORMS: ArtifactBase = {
  useCase: "forms",
  customDescription: null,
  toolName: "Collecter des infos",
  toolType: "form",
  entities: [
    {
      name: "Réponses",
      fields: [
        { name: "Nom", type: "text" },
        { name: "Email", type: "email" },
        { name: "Message", type: "textarea" },
        { name: "Date de soumission", type: "date" },
      ],
    },
  ],
  rules: [],
};
