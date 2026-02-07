import type { ArtifactBase } from "@/types/artifact";

/**
 * Template "Suivi des demandes" (FR-7.2)
 * Source: PRD Journey 1 (Sophie) — suivi demandes clients
 * Entity: Demandes with status tracking and follow-up dates
 */
export const TEMPLATE_TRACKING: ArtifactBase = {
  useCase: "tracking",
  customDescription: null,
  toolName: "Suivre des demandes",
  toolType: "tracker",
  entities: [
    {
      name: "Demandes",
      fields: [
        { name: "Client", type: "text" },
        { name: "Sujet", type: "text" },
        { name: "Statut", type: "select" },
        { name: "Responsable", type: "text" },
        { name: "Date de relance", type: "date" },
      ],
    },
  ],
  rules: [
    {
      condition: "Le statut passe à 'en attente'",
      action: "Prévoir une relance dans 3 jours",
    },
  ],
};
