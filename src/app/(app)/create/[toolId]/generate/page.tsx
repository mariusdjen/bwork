import { redirect } from "next/navigation";
import { z } from "zod/v4";
import { getUserOrg } from "@/lib/supabase/get-user-org";
import { GeneratePageClient } from "@/components/bwork/generation/generate-page-client";

type GeneratePageProps = {
  params: Promise<{ toolId: string }>;
};

export default async function GeneratePage({ params }: GeneratePageProps) {
  const { toolId } = await params;

  const idResult = z.string().uuid().safeParse(toolId);
  if (!idResult.success) redirect("/dashboard");

  const { user, orgId, supabase } = await getUserOrg();
  if (!user) redirect("/login");
  if (!orgId) redirect("/dashboard");

  const { data: tool } = await supabase
    .from("tools")
    .select("id, name, status, org_id")
    .eq("id", toolId)
    .eq("org_id", orgId)
    .single();

  if (!tool) redirect("/dashboard");

  // Generation already complete — redirect to preview
  if (tool.status === "active") {
    redirect(`/create/${toolId}/preview`);
  }

  // Only allow ready or generating status
  if (tool.status !== "ready" && tool.status !== "generating") {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-[60vh] items-start justify-center pt-6">
      <GeneratePageClient
        toolId={tool.id}
        toolName={tool.name}
        toolStatus={tool.status}
      />
    </main>
  );
}
