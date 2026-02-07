import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Plan } from "@/types/billing";

/**
 * Get the current plan for a user from their profile.
 */
export async function getUserPlan(userId: string): Promise<Plan> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();

  return (profile?.plan as Plan) ?? "free";
}

/**
 * Check if a user can create more tools (based on their plan's active tool limit).
 */
export async function checkToolLimit(userId: string): Promise<{
  allowed: boolean;
  currentCount: number;
  maxAllowed: number | null;
}> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, tools_active_count")
    .eq("id", userId)
    .single();

  if (!profile) {
    return { allowed: false, currentCount: 0, maxAllowed: 3 };
  }

  const admin = createAdminClient();
  const { data: limits } = await admin
    .from("plan_limits")
    .select("max_active_tools")
    .eq("plan", profile.plan)
    .single();

  const maxAllowed = limits?.max_active_tools ?? 3;
  const currentCount = profile.tools_active_count ?? 0;

  // null means unlimited
  if (maxAllowed === null || limits?.max_active_tools === null) {
    return { allowed: true, currentCount, maxAllowed: null };
  }

  return {
    allowed: currentCount < maxAllowed,
    currentCount,
    maxAllowed,
  };
}

/**
 * Check if a user can regenerate (based on their plan's monthly regeneration limit).
 */
export async function checkRegenLimit(userId: string): Promise<{
  allowed: boolean;
  currentCount: number;
  maxAllowed: number | null;
}> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const plan = await getUserPlan(userId);

  const { data: limits } = await admin
    .from("plan_limits")
    .select("max_regenerations_per_month")
    .eq("plan", plan)
    .single();

  // null means unlimited
  if (!limits || limits.max_regenerations_per_month === null) {
    return { allowed: true, currentCount: 0, maxAllowed: null };
  }

  const maxAllowed = limits.max_regenerations_per_month;

  // Count generations this calendar month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("generations")
    .select("id", { count: "exact", head: true })
    .eq("triggered_by", userId)
    .gte("created_at", monthStart.toISOString());

  const currentCount = count ?? 0;

  return {
    allowed: currentCount < maxAllowed,
    currentCount,
    maxAllowed,
  };
}

/**
 * Get the AI model string to use for a given plan.
 */
export function getAiModelForPlan(plan: Plan): string {
  const modelMap: Record<Plan, string> = {
    free: "claude-3-haiku-20240307",
    pro: "claude-sonnet-4-20250514",
    business: "claude-sonnet-4-20250514",
    enterprise: "claude-opus-4-20250514",
  };

  return modelMap[plan];
}

/**
 * Check if a plan allows tool deployment.
 */
export async function canDeploy(plan: Plan): Promise<boolean> {
  const admin = createAdminClient();
  const { data: limits } = await admin
    .from("plan_limits")
    .select("can_deploy")
    .eq("plan", plan)
    .single();

  return limits?.can_deploy ?? false; // fail-closed: deny if unknown
}
