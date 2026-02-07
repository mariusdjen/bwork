import { redirect } from "next/navigation";
import { z } from "zod/v4";
import { getUserOrg } from "@/lib/supabase/get-user-org";
import { RuleStepClient } from "@/components/bwork/guidance/rule-step-client";
import type { ArtifactBase } from "@/types/artifact";

type RulesPageProps = {
  params: Promise<{ toolId: string }>;
};

export default async function RulesPage({ params }: RulesPageProps) {
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
    .select("id, name, artifact, org_id")
    .eq("id", toolId)
    .eq("org_id", orgId)
    .single();

  if (!tool) {
    redirect("/dashboard");
  }

  const artifact = tool.artifact as ArtifactBase;

  // Redirect if no entities with fields defined (pre-requisite)
  const hasFields = artifact.entities?.some((e) => e.fields && e.fields.length > 0);
  if (!hasFields) {
    redirect(`/create/${toolId}/guidance/fields`);
  }

  return (
    <main className="flex min-h-[60vh] items-start justify-center pt-6">
      <RuleStepClient
        toolId={tool.id}
        toolName={tool.name}
        artifact={artifact}
      />
    </main>
  );
}
