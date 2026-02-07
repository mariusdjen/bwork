"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PlanOnboardingModal } from "./plan-onboarding-modal";
import { WelcomeOnboardingModal } from "./welcome-onboarding-modal";
import { PricingModal } from "@/components/bwork/billing/pricing-modal";
import type { Plan } from "@/types/billing";

const ONBOARDING_DISMISSED_KEY = "bwork_onboarding_dismissed";

interface OnboardingCheckProps {
  toolCount?: number;
  currentPlan?: Plan;
}

export function OnboardingCheck({
  toolCount = 0,
  currentPlan = "free",
}: OnboardingCheckProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pendingPlan, setPendingPlan] = useState<"pro" | "business" | null>(
    null,
  );
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);

  useEffect(() => {
    // 1. Check for plan upgrade flow (takes priority)
    const planFromUrl = searchParams.get("plan");
    const planFromStorage =
      typeof window !== "undefined"
        ? localStorage.getItem("pendingPlan")
        : null;

    const plan = planFromUrl || planFromStorage;

    if (plan === "pro" || plan === "business") {
      setPendingPlan(plan);
      setPlanModalOpen(true);
      return;
    }

    // 2. Check for first-time user onboarding
    if (toolCount === 0) {
      const dismissed = localStorage.getItem(ONBOARDING_DISMISSED_KEY);
      if (!dismissed) {
        setWelcomeOpen(true);
      }
    }
  }, [searchParams, toolCount]);

  function handlePlanClose() {
    setPlanModalOpen(false);

    if (typeof window !== "undefined") {
      localStorage.removeItem("pendingPlan");
    }

    const url = new URL(window.location.href);
    if (url.searchParams.has("plan")) {
      url.searchParams.delete("plan");
      const newPath = url.pathname + (url.search || "");
      router.replace(newPath, { scroll: false });
    }
  }

  function handleWelcomeClose() {
    setWelcomeOpen(false);
    localStorage.setItem(ONBOARDING_DISMISSED_KEY, "true");
  }

  function handleWelcomeCreate() {
    setWelcomeOpen(false);
    localStorage.setItem(ONBOARDING_DISMISSED_KEY, "true");
    router.push("/create/start");
  }

  function handleChangePlan() {
    setWelcomeOpen(false);
    localStorage.setItem(ONBOARDING_DISMISSED_KEY, "true");
    setPricingOpen(true);
  }

  return (
    <>
      {pendingPlan && (
        <PlanOnboardingModal
          plan={pendingPlan}
          open={planModalOpen}
          onClose={handlePlanClose}
        />
      )}
      <WelcomeOnboardingModal
        open={welcomeOpen}
        onClose={handleWelcomeClose}
        onCreate={handleWelcomeCreate}
        onChangePlan={handleChangePlan}
        currentPlan={currentPlan}
      />
      <PricingModal
        open={pricingOpen}
        onClose={() => setPricingOpen(false)}
        currentPlan={currentPlan}
      />
    </>
  );
}
