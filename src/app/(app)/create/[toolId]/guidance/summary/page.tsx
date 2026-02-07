import { redirect } from "next/navigation";
import { z } from "zod/v4";
import { getUserOrg } from "@/lib/supabase/get-user-org";
import { SummaryStepClient } from "@/components/bwork/guidance/summary-step-client";
import type { ArtifactBase } from "@/types/artifact";

type SummaryPageProps = {
  params: Promise<{ toolId: string }>;
};

export default async function SummaryPage({ params }: SummaryPageProps) {
  const { toolId } = await params;

  const idResult = z.string().uuid().safeParse(toolId);
  if (!idResult.success) {
    redirect("/dashboard");
  }

  const { user, orgId, supabase } = await getUserOrg();

  if (!user) redirect("/login");
  if (!orgId) redirect("/dashboard");

  const { data: tool } = await supabase
    .from("tools")
    .select("id, name, artifact, org_id, code_storage_path")
    .eq("id", toolId)
    .eq("org_id", orgId)
    .single();

  if (!tool) {
    redirect("/dashboard");
  }

  const artifact = tool.artifact as ArtifactBase;

  // Redirect if no entities defined (pre-requisite)
  if (!artifact.entities || artifact.entities.length === 0) {
    redirect(`/create/${toolId}/guidance`);
  }

  return (
    <main className="flex min-h-[60vh] items-start justify-center pt-6">
      <SummaryStepClient
        toolId={tool.id}
        toolName={tool.name}
        artifact={artifact}
        hasExistingCode={!!tool.code_storage_path}
      />
    </main>
  );
}
