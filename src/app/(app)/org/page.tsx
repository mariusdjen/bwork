import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import { getUserOrg } from "@/lib/supabase/get-user-org";
import { resolveUserMap } from "@/lib/supabase/resolve-user-map";
import { OrgToolList } from "@/components/bwork/org/org-tool-list";
import { MemberList } from "@/components/bwork/org/member-list";
import { InviteForm } from "@/components/bwork/org/invite-form";

export type OrgToolSummary = {
  id: string;
  name: string;
  description: string | null;
  status: "draft" | "ready" | "generating" | "active" | "disabled";
  created_at: string;
  created_by: string;
  deployed_url: string | null;
  access_type: "public" | "restricted";
  creator_name: string;
};

export type OrgMember = {
  id: string;
  user_id: string;
  role: "admin" | "collaborateur";
  invited_at: string;
  joined_at: string | null;
  name: string;
  email: string;
};

export default async function OrgPage() {
  const { user, orgId, orgName, role, supabase } = await getUserOrg();

  if (!user) {
    redirect("/login");
  }

  if (!orgId) {
    redirect("/dashboard");
  }

  // Only admins can access the org dashboard
  if (role !== "admin") {
    console.info("[B-WORK:org] Non-admin user redirected", user.id);
    redirect("/dashboard");
  }

  // Fetch all tools in the org
  const { data: rawTools } = await supabase
    .from("tools")
    .select("id, name, description, status, created_at, created_by, deployed_url, access_type")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  // Fetch all members in the org
  const { data: rawMembers } = await supabase
    .from("members")
    .select("id, user_id, role, invited_at, joined_at")
    .eq("org_id", orgId)
    .order("joined_at", { ascending: false });

  // Resolve user names/emails via shared paginated helper
  const userIds = new Set<string>();
  for (const t of rawTools ?? []) userIds.add(t.created_by);
  for (const m of rawMembers ?? []) userIds.add(m.user_id);

  const userMap = await resolveUserMap(userIds);

  // Build typed tool list with creator names
  const tools: OrgToolSummary[] = (rawTools ?? []).map((t) => ({
    ...t,
    creator_name: userMap.get(t.created_by)?.name ?? "Inconnu",
  }));

  // Build typed member list with names/emails
  const members: OrgMember[] = (rawMembers ?? []).map((m) => ({
    id: m.id,
    user_id: m.user_id,
    role: m.role as "admin" | "collaborateur",
    invited_at: m.invited_at,
    joined_at: m.joined_at,
    name: userMap.get(m.user_id)?.name ?? "Inconnu",
    email: userMap.get(m.user_id)?.email ?? "",
  }));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Building2 className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Organisation</h1>
          {orgName && (
            <p className="text-sm text-muted-foreground">{orgName}</p>
          )}
        </div>
      </div>

      {/* Section: Outils */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">
          Outils de l&apos;organisation ({tools.length})
        </h2>
        <OrgToolList tools={tools} />
      </section>

      {/* Section: Membres */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Membres ({members.length})
          </h2>
          <InviteForm />
        </div>
        <MemberList members={members} currentUserId={user.id} />
      </section>
    </div>
  );
}
