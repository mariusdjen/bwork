import { redirect } from "next/navigation";
import { z } from "zod/v4";
import { getUserOrg } from "@/lib/supabase/get-user-org";
import { PreviewPageClient } from "@/components/bwork/preview/preview-page-client";

type PreviewPageProps = {
  params: Promise<{ toolId: string }>;
};

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { toolId } = await params;

  const idResult = z.string().uuid().safeParse(toolId);
  if (!idResult.success) redirect("/dashboard");

  const { user, orgId, supabase } = await getUserOrg();
  if (!user) redirect("/login");
  if (!orgId) redirect("/dashboard");

  const { data: tool } = await supabase
    .from("tools")
    .select("id, name, status, org_id, code_storage_path, deployed_url")
    .eq("id", toolId)
    .eq("org_id", orgId)
    .single();

  if (!tool) redirect("/dashboard");

  // Only show preview for active tools (generation complete)
  if (tool.status !== "active") {
    redirect(`/create/${toolId}/generate`);
  }

  return (
    <main className="flex min-h-[60vh] flex-col items-center gap-6 px-4 pt-6">
      <PreviewPageClient
        toolId={tool.id}
        toolName={tool.name}
        generatedCode={tool.code_storage_path}
        deployedUrl={tool.deployed_url}
      />
    </main>
  );
}
