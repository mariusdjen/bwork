"use client";

import { PricingCard } from "./pricing-card";
import { STRIPE_PLANS } from "@/lib/stripe/plans";
import type { Plan } from "@/types/billing";

interface PricingGridProps {
  currentPlan?: Plan | null;
}

export function PricingGrid({ currentPlan }: PricingGridProps) {
  const plans: Plan[] = ["free", "pro", "business", "enterprise"];

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
      {plans.map((plan) => (
        <PricingCard
          key={plan}
          plan={plan}
          config={STRIPE_PLANS[plan]}
          currentPlan={currentPlan}
        />
      ))}
    </div>
  );
}
