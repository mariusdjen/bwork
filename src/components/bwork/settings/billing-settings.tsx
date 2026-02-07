"use client";

/**
 * Billing Settings Component
 *
 * Complete billing management interface with:
 * - Current plan overview
 * - Usage statistics
 * - Plan comparison for upgrade/downgrade
 * - Subscription management
 */

import { useEffect, useState, useTransition } from "react";
import {
  Loader2,
  CreditCard,
  Zap,
  Calendar,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { STRIPE_PLANS } from "@/lib/stripe/plans";
import { PlanBadge } from "@/components/bwork/billing/plan-badge";
import { UsageCard, buildUsageItems, type UsageData } from "@/components/bwork/billing/usage-card";
import { PlanComparison } from "@/components/bwork/billing/plan-comparison";
import type { Plan } from "@/types/billing";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface BillingSettingsProps {
  userId: string;
  currentPlan: Plan;
  usageData: UsageData;
}

export function BillingSettings({
  userId,
  currentPlan,
  usageData,
}: BillingSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const [subscription, setSubscription] = useState<{
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    status: string;
  } | null>(null);

  useEffect(() => {
    async function loadSubscription() {
      const supabase = createClient();
      const { data } = await supabase
        .from("subscriptions")
        .select("current_period_end, cancel_at_period_end, status")
        .eq("user_id", userId)
        .eq("status", "active")
        .single();

      if (data) {
        setSubscription({
          currentPeriodEnd: data.current_period_end,
          cancelAtPeriodEnd: data.cancel_at_period_end,
          status: data.status,
        });
      }
    }

    if (currentPlan !== "free") {
      loadSubscription();
    }
  }, [userId, currentPlan]);

  function handleManageBilling() {
    startTransition(async () => {
      try {
        const response = await fetch("/api/stripe/portal", {
          method: "POST",
        });

        const data = await response.json();

        if (data.url) {
          window.location.href = data.url;
        } else {
          toast.error(
            data.error || "Impossible d'acceder au portail de facturation."
          );
        }
      } catch {
        toast.error("Une erreur est survenue. Reessayez.");
      }
    });
  }

  const planConfig = STRIPE_PLANS[currentPlan];
  const usageItems = buildUsageItems(usageData);

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header with gradient */}
        <div
          className={cn(
            "p-6 bg-gradient-to-br",
            currentPlan === "free" && "from-muted/50 to-muted",
            currentPlan === "pro" && "from-amber-500/10 to-amber-600/5",
            currentPlan === "business" && "from-violet-500/10 to-violet-600/5",
            currentPlan === "enterprise" && "from-emerald-500/10 to-emerald-600/5"
          )}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Plan actuel</p>
              <div className="flex items-center gap-3">
                <PlanBadge plan={currentPlan} size="lg" />
                <span className="text-3xl font-bold text-foreground">
                  {planConfig.price}
                  {currentPlan !== "free" && currentPlan !== "enterprise" && (
                    <span className="text-sm font-normal text-muted-foreground">
                      /mois
                    </span>
                  )}
                </span>
              </div>
            </div>

            {currentPlan !== "free" && currentPlan !== "enterprise" && (
              <Button
                onClick={handleManageBilling}
                disabled={isPending}
                variant="outline"
                className="shrink-0"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Gerer la facturation
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Subscription Status */}
        <div className="p-6 border-t border-border/50">
          {subscription ? (
            <div className="flex items-center gap-3">
              {subscription.cancelAtPeriodEnd ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Abonnement annule
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Acces jusqu&apos;au{" "}
                      {new Date(subscription.currentPeriodEnd!).toLocaleDateString(
                        "fr-FR",
                        { day: "numeric", month: "long", year: "numeric" }
                      )}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Abonnement actif
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Prochain renouvellement le{" "}
                      {new Date(subscription.currentPeriodEnd!).toLocaleDateString(
                        "fr-FR",
                        { day: "numeric", month: "long", year: "numeric" }
                      )}
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : currentPlan === "free" ? (
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Plan gratuit</p>
                <p className="text-xs text-muted-foreground">
                  Passez a un plan superieur pour debloquer plus de fonctionnalites
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Informations de facturation non disponibles
              </p>
            </div>
          )}

          {/* Features list */}
          <div className="mt-6 pt-6 border-t border-border/50">
            <h4 className="text-sm font-medium text-foreground mb-3">
              Inclus dans votre plan
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {planConfig.features.map((feature, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <Zap className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      <UsageCard items={usageItems} />

      {/* Plan Comparison */}
      <PlanComparison currentPlan={currentPlan} />
    </div>
  );
}
