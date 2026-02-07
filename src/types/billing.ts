import type { Plan } from "./database";

export type { Plan };

export interface PlanFeatures {
  name: string;
  price: string;
  priceId: string | null; // null for free & enterprise
  features: string[];
  limitations: {
    maxActiveTools: number | null;
    maxRegenerationsPerMonth: number | null;
    maxProxyCallsPerDay: number | null;
  };
  aiModel: string;
  popular?: boolean;
}

export interface PlanLimits {
  plan: Plan;
  maxActiveTools: number | null;
  maxRegenerationsPerMonth: number | null;
  maxProxyCallsPerDay: number | null;
  aiModel: string;
  canDeploy: boolean;
  badgeRequired: boolean;
}

export interface SubscriptionDetails {
  plan: Plan;
  status: "active" | "past_due" | "canceled" | "trialing";
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}
