import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { GenerationNotifier } from "@/components/bwork/generation/generation-notifier";
import { getUserOrg } from "@/lib/supabase/get-user-org";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let { user, orgId, orgName, role, supabase } = await getUserOrg();

  // Not authenticated → login
  if (!user) {
    redirect("/login");
  }

  // Authenticated but no org → auto-provision organization + member via admin client
  if (!orgId) {
    const admin = createAdminClient();
    const name =
      (user.user_metadata?.name as string) || user.email?.split("@")[0] || "user";
    const slugBase =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "org";
    const uniqueSuffix = crypto.randomUUID().slice(0, 8);
    const newOrgId = crypto.randomUUID();
    const newOrgName = `Org de ${name}`;
    const newOrgSlug = `${slugBase}-${uniqueSuffix}`;

    // Try rpc function first (handles trigger disable/enable)
    let provisioned = false;
    const { error: rpcError } = await admin.rpc("provision_user_org", {
      p_user_id: user.id,
      p_org_id: newOrgId,
      p_org_name: newOrgName,
      p_org_slug: newOrgSlug,
    });

    if (!rpcError) {
      provisioned = true;
    } else {
      console.warn("[B-WORK:layout] rpc provision failed, trying direct insert", rpcError.message);

      // Fallback: direct inserts via admin (service role bypasses RLS)
      const { error: orgErr } = await admin
        .from("organizations")
        .insert({ id: newOrgId, name: newOrgName, slug: newOrgSlug });

      if (!orgErr) {
        // Check if trigger created the member (it might fail with null auth.uid)
        const { data: existing } = await admin
          .from("members")
          .select("id")
          .eq("user_id", user.id)
          .eq("org_id", newOrgId)
          .maybeSingle();

        if (!existing) {
          await admin.from("members").insert({
            user_id: user.id,
            org_id: newOrgId,
            role: "admin" as const,
            joined_at: new Date().toISOString(),
          });
        }
        provisioned = true;
      } else {
        console.error("[B-WORK:layout] Direct org insert failed", orgErr.message);
      }
    }

    if (provisioned) {
      orgId = newOrgId;
      orgName = newOrgName;
      console.info("[B-WORK:layout] Auto-provisioned org for user", user.id, newOrgId);
    }
    // If provisioning failed entirely, we continue with orgId=null — no redirect loop
  }

  const userName = (user.user_metadata?.name as string) || "Utilisateur";
  const userEmail = user.email || "";

  // Fetch tools currently generating for this org (hydration)
  let initialGenerating: { id: string; name: string }[] = [];
  if (orgId) {
    const { data: generatingTools, error: generatingError } = await supabase
      .from("tools")
      .select("id, name")
      .eq("org_id", orgId)
      .eq("status", "generating");

    if (generatingError) {
      console.error("[B-WORK:layout] Failed to fetch generating tools", generatingError);
    }

    initialGenerating = (generatingTools ?? []).map((t) => ({
      id: t.id,
      name: t.name,
    }));
  }

  // Read sidebar cookie for default state
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar role={role} />
      <SidebarInset>
        <Header userName={userName} userEmail={userEmail} orgName={orgName ?? null} />
        <div className="p-4 md:px-6 lg:px-8">{children}</div>
      </SidebarInset>
      {orgId && (
        <GenerationNotifier orgId={orgId} initialGenerating={initialGenerating} />
      )}
    </SidebarProvider>
  );
}
