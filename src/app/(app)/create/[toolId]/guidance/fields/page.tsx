import { redirect } from "next/navigation";
import { z } from "zod/v4";
import { getUserOrg } from "@/lib/supabase/get-user-org";
import { FieldStepClient } from "@/components/bwork/guidance/field-step-client";
import type { ArtifactBase } from "@/types/artifact";

type FieldsPageProps = {
  params: Promise<{ toolId: string }>;
};

export default async function FieldsPage({ params }: FieldsPageProps) {
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

  // Redirect if no entities defined (pre-requisite)
  if (!artifact.entities || artifact.entities.length === 0) {
    redirect(`/create/${toolId}/guidance`);
  }

  return (
    <main className="flex min-h-[60vh] items-start justify-center pt-6">
      <FieldStepClient
        toolId={tool.id}
        toolName={tool.name}
        artifact={artifact}
      />
    </main>
  );
}
