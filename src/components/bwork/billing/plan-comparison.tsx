"use client";

/**
 * Plan Comparison Component
 *
 * Shows all available plans with a clear comparison.
 * Allows upgrading/downgrading from the billing page.
 */

import { useState, useTransition } from "react";
import { Check, Loader2, Sparkles, Crown, Building2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { STRIPE_PLANS } from "@/lib/stripe/plans";
import type { Plan } from "@/types/billing";

interface PlanComparisonProps {
  currentPlan: Plan;
}

const PLAN_ORDER: Plan[] = ["free", "pro", "business", "enterprise"];

const PLAN_ICONS: Record<Plan, React.ReactNode> = {
  free: <Rocket className="h-5 w-5" />,
  pro: <Sparkles className="h-5 w-5" />,
  business: <Crown className="h-5 w-5" />,
  enterprise: <Building2 className="h-5 w-5" />,
};

export function PlanComparison({ currentPlan }: PlanComparisonProps) {
  const [isPending, startTransition] = useTransition();
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null);

  const handleSelectPlan = (plan: Plan) => {
    if (plan === currentPlan) return;
    if (plan === "enterprise") {
      window.location.href = "mailto:contact@b-work.fr?subject=Demande Enterprise";
      return;
    }
    if (plan === "free") {
      // Downgrade to free - redirect to Stripe portal
      handleManageBilling();
      return;
    }

    setPendingPlan(plan);
    startTransition(async () => {
      try {
        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        });

        const data = await response.json();

        if (data.upgraded) {
          toast.success("Plan mis a jour avec succes ! Les changements sont effectifs immediatement.");
          window.location.reload();
        } else if (data.url) {
          window.location.href = data.url;
        } else {
          toast.error(data.error || "Impossible de lancer le paiement.");
        }
      } catch {
        toast.error("Une erreur est survenue. Reessayez.");
      } finally {
        setPendingPlan(null);
      }
    });
  };

  const handleManageBilling = () => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/stripe/portal", {
          method: "POST",
        });

        const data = await response.json();

        if (data.url) {
          window.location.href = data.url;
        } else {
          toast.error(data.error || "Impossible d'acceder au portail.");
        }
      } catch {
        toast.error("Une erreur est survenue. Reessayez.");
      }
    });
  };

  const currentPlanIndex = PLAN_ORDER.indexOf(currentPlan);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Changer de plan
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        Comparez les plans et choisissez celui qui vous convient.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLAN_ORDER.map((plan) => {
          const config = STRIPE_PLANS[plan];
          const isCurrentPlan = plan === currentPlan;
          const planIndex = PLAN_ORDER.indexOf(plan);
          const isUpgrade = planIndex > currentPlanIndex;
          const isDowngrade = planIndex < currentPlanIndex;
          const isPopular = plan === "pro";
          const isLoading = isPending && pendingPlan === plan;

          return (
            <div
              key={plan}
              className={cn(
                "relative rounded-lg border p-4 transition-all",
                isCurrentPlan
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50",
                isPopular && !isCurrentPlan && "border-amber-500/50"
              )}
            >
              {/* Popular Badge */}
              {isPopular && !isCurrentPlan && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <span className="bg-amber-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    Populaire
                  </span>
                </div>
              )}

              {/* Current Badge */}
              {isCurrentPlan && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                    Actuel
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="flex items-center gap-2 mb-3 mt-1">
                <span className={cn(
                  "p-1.5 rounded-lg",
                  isCurrentPlan ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {PLAN_ICONS[plan]}
                </span>
                <div>
                  <h4 className="font-semibold text-foreground capitalize">
                    {config.name}
                  </h4>
                  <p className="text-lg font-bold text-foreground">
                    {config.price}
                    {plan !== "free" && plan !== "enterprise" && (
                      <span className="text-xs font-normal text-muted-foreground">/mois</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Key Limits */}
              <ul className="space-y-1.5 mb-4 text-xs">
                <li className="flex items-center gap-1.5 text-muted-foreground">
                  <Check className="h-3 w-3 text-primary" />
                  {config.limitations.maxActiveTools === null
                    ? "Outils illimites"
                    : `${config.limitations.maxActiveTools} outils`}
                </li>
                <li className="flex items-center gap-1.5 text-muted-foreground">
                  <Check className="h-3 w-3 text-primary" />
                  {config.limitations.maxRegenerationsPerMonth === null
                    ? "Generations illimitees"
                    : `${config.limitations.maxRegenerationsPerMonth} generations/mois`}
                </li>
              </ul>

              {/* Action Button */}
              {isCurrentPlan ? (
                <Button variant="outline" size="sm" className="w-full" disabled>
                  Plan actuel
                </Button>
              ) : (
                <Button
                  variant={isUpgrade ? "default" : "outline"}
                  size="sm"
                  className="w-full"
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isPending}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isUpgrade ? (
                    "Passer a ce plan"
                  ) : isDowngrade ? (
                    "Downgrader"
                  ) : (
                    "Selectionner"
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
