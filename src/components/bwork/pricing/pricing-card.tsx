"use client";

import { useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Plan, PlanFeatures } from "@/types/billing";

interface PricingCardProps {
  plan: Plan;
  config: PlanFeatures;
  currentPlan?: Plan | null;
}

export function PricingCard({ plan, config, currentPlan }: PricingCardProps) {
  const [isPending, startTransition] = useTransition();
  const isCurrentPlan = currentPlan === plan;

  function handleSubscribe() {
    if (isCurrentPlan) return;

    if (plan === "free") {
      window.location.href = "/signup";
      return;
    }

    if (plan === "enterprise") {
      window.location.href =
        "mailto:contact@b-work.fr?subject=Demande%20Enterprise";
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        });

        if (response.status === 401) {
          // Not authenticated — redirect to signup with plan preselected
          if (typeof window !== "undefined") {
            localStorage.setItem("pendingPlan", plan);
          }
          window.location.href = `/signup?plan=${plan}`;
          return;
        }

        const data = await response.json();

        if (data.url) {
          window.location.href = data.url;
        } else {
          toast.error(
            data.error ||
              "Erreur lors de la creation de la session de paiement.",
          );
        }
      } catch {
        toast.error("Une erreur est survenue. Reessayez.");
      }
    });
  }

  return (
    <div
      className={`relative flex flex-col rounded-lg border p-6 ${
        config.popular
          ? "border-primary shadow-lg shadow-primary/10"
          : "border-border bg-card"
      }`}
    >
      {config.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
          Populaire
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-semibold text-card-foreground">
          {config.name}
        </h3>
        <div className="mt-2">
          <span className="text-4xl font-bold text-foreground">
            {config.price}
          </span>
          {plan !== "free" && plan !== "enterprise" && (
            <span className="text-muted-foreground">/mois</span>
          )}
        </div>
      </div>

      <ul className="mb-6 flex-1 space-y-3">
        {config.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <Check className="h-5 w-5 shrink-0 text-primary" />
            <span className="text-sm text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={handleSubscribe}
        disabled={isPending || isCurrentPlan}
        className="w-full"
        variant={config.popular ? "default" : "outline"}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isCurrentPlan ? (
          "Plan actuel"
        ) : plan === "free" ? (
          "Commencer gratuitement"
        ) : plan === "enterprise" ? (
          "Nous contacter"
        ) : (
          "S'abonner"
        )}
      </Button>
    </div>
  );
}
