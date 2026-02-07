"use client";

import { Check, Wand2, ArrowRight } from "lucide-react";
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
import type { Plan } from "@/types/billing";

interface WelcomeOnboardingModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: () => void;
  onChangePlan: () => void;
  currentPlan?: Plan;
}

export function WelcomeOnboardingModal({
  open,
  onClose,
  onCreate,
  onChangePlan,
  currentPlan = "free",
}: WelcomeOnboardingModalProps) {
  const planConfig = STRIPE_PLANS[currentPlan];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 sm:mx-0">
            <Wand2 className="size-6 text-primary" />
          </div>
          <DialogTitle>Bienvenue sur B-WORK !</DialogTitle>
          <DialogDescription>
            Votre plan actuel :{" "}
            <span className="font-semibold text-foreground">
              {planConfig.name}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-2">
          <p className="text-sm font-medium text-foreground">
            Inclus dans votre plan :
          </p>
          <ul className="space-y-2">
            {planConfig.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <span className="text-sm text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={onCreate} className="w-full">
            <Wand2 className="size-4" />
            Creer mon premier outil
          </Button>
          <Button
            onClick={onChangePlan}
            variant="outline"
            className="w-full"
          >
            <ArrowRight className="size-4" />
            Changer de plan
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            Plus tard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
