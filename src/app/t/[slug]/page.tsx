import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { AccessCodePage } from "@/components/bwork/deploy/access-code-page";
import { ToolRenderer } from "@/components/bwork/deploy/tool-renderer";
import { verifyAccessToken } from "@/lib/deploy/access-token";

type DeployedToolPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function DeployedToolPage({ params }: DeployedToolPageProps) {
  const { slug } = await params;

  const admin = createAdminClient();
  const { data: tool, error } = await admin
    .from("tools")
    .select("id, name, description, status, access_type, access_code_hash, artifact, code_storage_path")
    .eq("deployed_url", slug)
    .single();

  // Tool not found or disabled → 404
  if (error || !tool || tool.status === "disabled") {
    notFound();
  }

  // Public tool → render directly
  if (tool.access_type === "public") {
    return <ToolRenderer tool={tool} />;
  }

  // Restricted tool → check access cookie
  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(`bwork-access-${slug}`);

  if (accessCookie?.value) {
    const isValid = verifyAccessToken(accessCookie.value, slug);
    if (isValid) {
      return <ToolRenderer tool={tool} />;
    }
  }

  // No valid cookie → show access code page
  return <AccessCodePage slug={slug} toolName={tool.name} />;
}
