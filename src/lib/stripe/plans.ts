import type { Plan, PlanFeatures } from "@/types/billing";

export const STRIPE_PLANS: Record<Plan, PlanFeatures> = {
  free: {
    name: "Gratuit",
    price: "0\u20AC",
    priceId: null,
    features: [
      "3 outils actifs maximum",
      "5 regenerations par mois",
      "50 appels proxy par jour",
      "Modele IA : Haiku (rapide)",
      "Deploiement public",
    ],
    limitations: {
      maxActiveTools: 3,
      maxRegenerationsPerMonth: 5,
      maxProxyCallsPerDay: 50,
    },
    aiModel: "Claude 3 Haiku",
  },
  pro: {
    name: "Pro",
    price: "29\u20AC",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ?? null,
    features: [
      "20 outils actifs",
      "50 regenerations par mois",
      "500 appels proxy par jour",
      "Modele IA : Sonnet (avance)",
      "Support prioritaire",
    ],
    limitations: {
      maxActiveTools: 20,
      maxRegenerationsPerMonth: 50,
      maxProxyCallsPerDay: 500,
    },
    aiModel: "Claude Sonnet 4",
    popular: true,
  },
  business: {
    name: "Business",
    price: "79\u20AC",
    priceId: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID ?? null,
    features: [
      "Outils illimites",
      "Regenerations illimitees",
      "Appels proxy illimites",
      "Modele IA : Sonnet (avance)",
      "Support dedie",
      "SLA garanti",
    ],
    limitations: {
      maxActiveTools: null,
      maxRegenerationsPerMonth: null,
      maxProxyCallsPerDay: null,
    },
    aiModel: "Claude Sonnet 4",
  },
  enterprise: {
    name: "Enterprise",
    price: "Sur devis",
    priceId: null,
    features: [
      "Tout de Business +",
      "Modele IA : Opus (premium)",
      "Onboarding personnalise",
      "Infrastructure dediee",
      "Contrat personnalise",
    ],
    limitations: {
      maxActiveTools: null,
      maxRegenerationsPerMonth: null,
      maxProxyCallsPerDay: null,
    },
    aiModel: "Claude Opus 4",
  },
};

export function getPlanFeatures(plan: Plan): PlanFeatures {
  return STRIPE_PLANS[plan];
}
