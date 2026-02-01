import { redirect } from "next/navigation";
import { z } from "zod/v4";
import { getUserOrg } from "@/lib/supabase/get-user-org";
import { FullscreenPreviewClient } from "@/components/bwork/preview/fullscreen-preview-client";

type FullscreenPreviewPageProps = {
  params: Promise<{ toolId: string }>;
};

export default async function FullscreenPreviewPage({
  params,
}: FullscreenPreviewPageProps) {
  const { toolId } = await params;

  const idResult = z.string().uuid().safeParse(toolId);
  if (!idResult.success) redirect("/dashboard");

  const { user, orgId, supabase } = await getUserOrg();
  if (!user) redirect("/login");
  if (!orgId) redirect("/dashboard");

  const { data: tool } = await supabase
    .from("tools")
    .select("id, name, status, org_id, code_storage_path")
    .eq("id", toolId)
    .eq("org_id", orgId)
    .single();

  if (!tool) redirect("/dashboard");

  if (tool.status !== "active") {
    redirect(`/create/${toolId}/generate`);
  }

  return (
    <FullscreenPreviewClient
      toolId={tool.id}
      toolName={tool.name}
      generatedCode={tool.code_storage_path}
    />
  );
}
