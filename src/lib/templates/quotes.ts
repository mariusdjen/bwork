import type { ArtifactBase } from "@/types/artifact";

/**
 * Template "Generateur de devis" (FR-7.1)
 * Source: PRD Journey 4 (Karim) + Journey 2 (Sophie)
 * Entities: Devis (header) + Lignes (detail lines)
 */
export const TEMPLATE_QUOTES: ArtifactBase = {
  useCase: "quotes",
  customDescription: null,
  toolName: "Créer des devis",
  toolType: "calculator",
  entities: [
    {
      name: "Devis",
      fields: [
        { name: "Client", type: "text" },
        { name: "Date", type: "date" },
        { name: "Statut", type: "select" },
      ],
    },
    {
      name: "Lignes",
      fields: [
        { name: "Prestation", type: "text" },
        { name: "Quantité", type: "number" },
        { name: "Prix unitaire", type: "currency" },
        { name: "Remise (%)", type: "number" },
      ],
    },
  ],
  rules: [
    {
      condition: "Une ligne est ajoutée au devis",
      action: "Calculer le total : (quantité × prix unitaire) - remise",
    },
    {
      condition: "Le devis est validé par le client",
      action: "Passer le statut à 'Accepté'",
    },
  ],
};
