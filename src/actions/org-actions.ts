"use server";

import { revalidatePath } from "next/cache";
import { getUserOrg } from "@/lib/supabase/get-user-org";
import { findUserByEmail } from "@/lib/supabase/resolve-user-map";

type OrgActionResult = { success?: string; error?: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Helper: verify the current user is an org admin.
 */
async function verifyAdmin() {
  const { user, orgId, role, supabase } = await getUserOrg();
  if (!user || !orgId) return { authorized: false, error: "Non authentifié." } as const;
  if (role !== "admin") return { authorized: false, error: "Accès réservé aux administrateurs." } as const;
  return { authorized: true, user, orgId, supabase } as const;
}

/**
 * Updates the visibility (access_type) of a tool.
 * Only an org admin can change visibility.
 */
export async function updateToolVisibility(
  toolId: string,
  accessType: "public" | "restricted",
): Promise<OrgActionResult> {
  if (!UUID_RE.test(toolId)) return { error: "Identifiant outil invalide." };

  const check = await verifyAdmin();
  if (!check.authorized) return { error: check.error };

  // Verify tool belongs to this org
  const { data: tool } = await check.supabase
    .from("tools")
    .select("id")
    .eq("id", toolId)
    .eq("org_id", check.orgId)
    .single();

  if (!tool) return { error: "Outil non trouvé ou non autorisé." };

  const { error } = await check.supabase
    .from("tools")
    .update({ access_type: accessType })
    .eq("id", toolId)
    .eq("org_id", check.orgId);

  if (error) {
    console.error("[B-WORK:org] Failed to update tool visibility", error);
    return { error: "Erreur lors de la mise à jour." };
  }

  console.info("[B-WORK:org] Tool visibility updated", { toolId, accessType });
  revalidatePath("/org");
  return {
    success: `Visibilité mise à jour : ${accessType === "public" ? "Public" : "Restreint"}`,
  };
}

/**
 * Invites a member by email. The user must already have a B-WORK account.
 * Creates a members row with the given role.
 */
export async function inviteMember(
  email: string,
  memberRole: "admin" | "collaborateur",
): Promise<OrgActionResult> {
  const check = await verifyAdmin();
  if (!check.authorized) return { error: check.error };

  if (!email || !email.includes("@")) {
    return { error: "Email invalide." };
  }

  if (memberRole !== "admin" && memberRole !== "collaborateur") {
    return { error: "Rôle invalide." };
  }

  // Lookup user by email via paginated admin helper (avoids loading all users)
  const targetUser = await findUserByEmail(email);

  if (!targetUser) {
    // Generic message to prevent user enumeration
    return { error: "Impossible d'inviter cet utilisateur. Vérifiez l'email ou demandez-lui de créer un compte." };
  }

  // Check if already a member
  const { data: existing } = await check.supabase
    .from("members")
    .select("id")
    .eq("user_id", targetUser.id)
    .eq("org_id", check.orgId)
    .maybeSingle();

  if (existing) {
    return { error: "Ce membre fait déjà partie de l'organisation." };
  }

  // Insert member — RLS policy members_insert_admin allows admin to insert
  const { error } = await check.supabase.from("members").insert({
    user_id: targetUser.id,
    org_id: check.orgId,
    role: memberRole,
    joined_at: new Date().toISOString(),
  });

  if (error) {
    console.error("[B-WORK:org] Failed to invite member", error);
    return { error: "Impossible d'inviter ce membre." };
  }

  console.info("[B-WORK:org] Member invited", { email, role: memberRole });
  revalidatePath("/org");
  return { success: `Invitation envoyée à ${email}` };
}

/**
 * Updates a member's role. Admin cannot change their own role.
 */
export async function updateMemberRole(
  memberId: string,
  newRole: "admin" | "collaborateur",
): Promise<OrgActionResult> {
  if (!UUID_RE.test(memberId)) return { error: "Identifiant membre invalide." };

  const check = await verifyAdmin();
  if (!check.authorized) return { error: check.error };

  if (newRole !== "admin" && newRole !== "collaborateur") {
    return { error: "Rôle invalide." };
  }

  // Fetch target member
  const { data: target } = await check.supabase
    .from("members")
    .select("id, user_id, org_id")
    .eq("id", memberId)
    .eq("org_id", check.orgId)
    .single();

  if (!target) return { error: "Membre non trouvé." };

  // Self-modification prevention
  if (target.user_id === check.user.id) {
    return { error: "Vous ne pouvez pas modifier votre propre rôle." };
  }

  const { error } = await check.supabase
    .from("members")
    .update({ role: newRole })
    .eq("id", memberId)
    .eq("org_id", check.orgId);

  if (error) {
    console.error("[B-WORK:org] Failed to update member role", error);
    return { error: "Impossible de modifier le rôle." };
  }

  console.info("[B-WORK:org] Member role updated", { memberId, newRole });
  revalidatePath("/org");
  return { success: `Rôle mis à jour : ${newRole === "admin" ? "Admin" : "Collaborateur"}` };
}

/**
 * Removes a member from the organization. Admin cannot remove themselves.
 */
export async function removeMember(memberId: string): Promise<OrgActionResult> {
  if (!UUID_RE.test(memberId)) return { error: "Identifiant membre invalide." };

  const check = await verifyAdmin();
  if (!check.authorized) return { error: check.error };

  // Fetch target member
  const { data: target } = await check.supabase
    .from("members")
    .select("id, user_id, org_id")
    .eq("id", memberId)
    .eq("org_id", check.orgId)
    .single();

  if (!target) return { error: "Membre non trouvé." };

  // Self-removal prevention
  if (target.user_id === check.user.id) {
    return { error: "Vous ne pouvez pas vous retirer de l'organisation." };
  }

  const { error } = await check.supabase
    .from("members")
    .delete()
    .eq("id", memberId)
    .eq("org_id", check.orgId);

  if (error) {
    console.error("[B-WORK:org] Failed to remove member", error);
    return { error: "Impossible de retirer ce membre." };
  }

  console.info("[B-WORK:org] Member removed", { memberId });
  revalidatePath("/org");
  return { success: "Membre retiré de l'organisation." };
}
