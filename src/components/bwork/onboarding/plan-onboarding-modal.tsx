"use client";

import { useTransition } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { STRIPE_PLANS } from "@/lib/stripe/plans";
import { toast } from "sonner";

interface PlanOnboardingModalProps {
  plan: "pro" | "business";
  open: boolean;
  onClose: () => void;
}

export function PlanOnboardingModal({
  plan,
  open,
  onClose,
}: PlanOnboardingModalProps) {
  const [isPending, startTransition] = useTransition();
  const config = STRIPE_PLANS[plan];

  function handleSubscribe() {
    startTransition(async () => {
      try {
        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        });

        const data = await response.json();

        if (data.url) {
          window.location.href = data.url;
        } else {
          toast.error(
            data.error || "Erreur lors de la creation de la session de paiement.",
          );
        }
      } catch {
        toast.error("Une erreur est survenue. Reessayez.");
      }
    });
  }

  function handleContinueFree() {
    onClose();
    toast.success(
      "Vous etes sur le plan Gratuit. Vous pouvez upgrader a tout moment.",
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleContinueFree()}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 sm:mx-0">
            <Sparkles className="size-6 text-primary" />
          </div>
          <DialogTitle>Bienvenue sur B-WORK !</DialogTitle>
          <DialogDescription>
            Vous avez choisi le plan{" "}
            <strong className="text-foreground">{config.name}</strong> a{" "}
            <strong className="text-foreground">{config.price}/mois</strong>.
            Voici ce qui est inclus :
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 py-2">
          {config.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleSubscribe}
            disabled={isPending}
            className="w-full"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Redirection vers le paiement...
              </>
            ) : (
              `Souscrire au plan ${config.name} — ${config.price}/mois`
            )}
          </Button>
          <Button
            onClick={handleContinueFree}
            disabled={isPending}
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            Continuer avec le plan gratuit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
