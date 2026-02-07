import { Suspense } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { getUserOrg } from "@/lib/supabase/get-user-org";
import { Button } from "@/components/ui/button";
import { ToolList } from "@/components/bwork/dashboard/tool-list";
import { EmptyDashboard } from "@/components/bwork/dashboard/empty-dashboard";
import { OnboardingCheck } from "@/components/bwork/onboarding/onboarding-check";

/** Projected fields sent to client — excludes sensitive/heavy data */
export type ToolSummary = {
  id: string;
  name: string;
  description: string | null;
  status: "draft" | "ready" | "generating" | "active" | "disabled";
  created_at: string;
  created_by: string;
  deployed_url: string | null;
  access_type: "public" | "restricted";
};

const VALID_STATUSES: ToolSummary["status"][] = [
  "draft",
  "ready",
  "generating",
  "active",
  "disabled",
];

type DashboardPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { user, orgId, plan, supabase } = await getUserOrg();

  // Auth is handled by the (app) layout — if we reach here without user, redirect.
  if (!user) {
    redirect("/login");
  }

  // If orgId is null, the layout's auto-provision may not have persisted in the
  // React.cache() yet. Show empty dashboard instead of redirecting (avoids loop).
  let toolList: ToolSummary[] = [];
  if (orgId) {
    const { data: tools } = await supabase
      .from("tools")
      .select("id, name, description, status, created_at, created_by, deployed_url, access_type")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    toolList = (tools as ToolSummary[]) ?? [];
  }

  // Read ?status= query param for initial filter
  const params = await searchParams;
  const statusParam = params.status;
  const initialFilter =
    statusParam && VALID_STATUSES.includes(statusParam as ToolSummary["status"])
      ? (statusParam as ToolSummary["status"])
      : null;

  return (
    <div className="flex flex-col gap-6">
      <Suspense>
        <OnboardingCheck toolCount={toolList.length} currentPlan={plan} />
      </Suspense>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Button asChild>
          <Link href="/create/start">
            <PlusCircle className="h-4 w-4" />
            Creer un outil
          </Link>
        </Button>
      </div>

      {toolList.length === 0 ? (
        <EmptyDashboard />
      ) : (
        <ToolList tools={toolList} initialFilter={initialFilter} />
      )}
    </div>
  );
}
