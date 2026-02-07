import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Plan } from "@/types/billing";

/**
 * Cached per-request helper that fetches the authenticated user, their org_id, and plan.
 * Uses React.cache() so multiple Server Components in the same request
 * (e.g., layout + page) share a single Supabase round-trip.
 */
export const getUserOrg = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, orgId: null, plan: "free" as Plan, supabase };
  }

  // Fetch member + profile in parallel
  const [memberResult, profileResult] = await Promise.all([
    supabase
      .from("members")
      .select("org_id, role, organizations(id, name, slug)")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("profiles")
      .select("plan, tools_active_count")
      .eq("id", user.id)
      .single(),
  ]);

  const { data: member } = memberResult;
  const { data: profile } = profileResult;

  const org = member?.organizations as unknown as
    | { id: string; name: string; slug: string }
    | null;

  return {
    user,
    orgId: member?.org_id ?? null,
    orgName: org?.name ?? null,
    role: member?.role ?? null,
    plan: (profile?.plan as Plan) ?? "free",
    toolsActiveCount: profile?.tools_active_count ?? 0,
    supabase,
  };
});
