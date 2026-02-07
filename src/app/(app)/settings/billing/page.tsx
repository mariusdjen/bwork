import { redirect } from "next/navigation";
import { getUserOrg } from "@/lib/supabase/get-user-org";
import { BillingSettings } from "@/components/bwork/settings/billing-settings";
import { createClient } from "@/lib/supabase/server";
import { STRIPE_PLANS } from "@/lib/stripe/plans";

async function getUsageData(orgId: string) {
  const supabase = await createClient();

  // Count active tools
  const { count: toolsCount } = await supabase
    .from("tools")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId);

  // Count generations this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: generationsCount } = await supabase
    .from("generations")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId)
    .gte("created_at", startOfMonth.toISOString());

  return {
    toolsActive: toolsCount ?? 0,
    generationsUsed: generationsCount ?? 0,
  };
}

export default async function BillingPage() {
  const { user, orgId, plan } = await getUserOrg();

  if (!user || !orgId) {
    redirect("/login");
  }

  const usageData = await getUsageData(orgId);
  const planConfig = STRIPE_PLANS[plan];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Abonnement</h1>
        <p className="mt-2 text-muted-foreground">
          Gerez votre abonnement et suivez votre utilisation.
        </p>
      </div>

      <BillingSettings
        userId={user.id}
        currentPlan={plan}
        usageData={{
          generationsUsed: usageData.generationsUsed,
          generationsMax: planConfig.limitations.maxRegenerationsPerMonth,
          toolsActive: usageData.toolsActive,
          toolsMax: planConfig.limitations.maxActiveTools,
        }}
      />
    </div>
  );
}
