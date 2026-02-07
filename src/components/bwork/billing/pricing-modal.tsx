"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PlanComparison } from "./plan-comparison";
import type { Plan } from "@/types/billing";

interface PricingModalProps {
  open: boolean;
  onClose: () => void;
  currentPlan: Plan;
}

export function PricingModal({ open, onClose, currentPlan }: PricingModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choisissez votre plan</DialogTitle>
          <DialogDescription>
            Comparez les plans et passez a celui qui vous convient.
          </DialogDescription>
        </DialogHeader>
        <PlanComparison currentPlan={currentPlan} />
      </DialogContent>
    </Dialog>
  );
}
