import { cn } from "@/lib/utils";
import type { Plan } from "@/types/billing";

const PLAN_STYLES: Record<Plan, string> = {
  free: "bg-muted text-muted-foreground border-border",
  pro: "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400",
  business:
    "bg-violet-500/10 text-violet-600 border-violet-500/30 dark:text-violet-400",
  enterprise:
    "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400",
};

const PLAN_LABELS: Record<Plan, string> = {
  free: "Gratuit",
  pro: "Pro",
  business: "Business",
  enterprise: "Enterprise",
};

interface PlanBadgeProps {
  plan: Plan;
  size?: "sm" | "md" | "lg";
}

export function PlanBadge({ plan, size = "md" }: PlanBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        PLAN_STYLES[plan],
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-xs",
        size === "lg" && "px-4 py-1.5 text-sm"
      )}
    >
      {PLAN_LABELS[plan]}
    </span>
  );
}
