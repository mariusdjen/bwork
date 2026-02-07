import { redirect } from "next/navigation";
import { getUserOrg } from "@/lib/supabase/get-user-org";
import { GuidancePageClient } from "@/components/bwork/guidance/guidance-page-client";
import type { ArtifactBase } from "@/types/artifact";

type GuidancePageProps = {
  params: Promise<{ toolId: string }>;
};

export default async function GuidancePage({ params }: GuidancePageProps) {
  const { toolId } = await params;
  const { user, orgId, supabase } = await getUserOrg();

  if (!user) redirect("/login");
  if (!orgId) redirect("/dashboard");

  const { data: tool } = await supabase
    .from("tools")
    .select("id, name, artifact, org_id, status")
    .eq("id", toolId)
    .eq("org_id", orgId)
    .single();

  if (!tool) {
    redirect("/dashboard");
  }

  // If tool is already generated, redirect to preview
  if (tool.status === "active" || tool.status === "generating") {
    redirect(`/create/${toolId}/preview`);
  }

  const artifact = (tool.artifact as Partial<ArtifactBase>) || {};

  return (
    <main className="h-full">
      <GuidancePageClient
        toolId={tool.id}
        toolName={tool.name}
        artifact={artifact}
      />
    </main>
  );
}
