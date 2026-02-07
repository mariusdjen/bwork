"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod/v4";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAccessToken } from "@/lib/deploy/access-token";
import { type ActionState } from "@/lib/actions/shared";

const accessTypeSchema = z.enum(["public", "restricted"]);

const deploySchema = z.object({
  toolId: z.string().uuid(),
  accessType: accessTypeSchema,
  accessCode: z.string().min(4).max(100).optional(),
});

/**
 * Deploys a tool by generating a unique slug and setting access configuration.
 * Returns the shareable link path (/t/{slug}).
 */
export async function deployTool(
  toolId: string,
  accessType: "public" | "restricted",
  accessCode?: string,
): Promise<ActionState & { link?: string }> {
  // Validate inputs
  const parsed = deploySchema.safeParse({ toolId, accessType, accessCode });
  if (!parsed.success) {
    return { error: "Donnees de deploiement invalides." };
  }

  if (accessType === "restricted" && !accessCode) {
    return { error: "Un code d'acces est requis pour un deploiement restreint." };
  }

  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifie." };

  // Get user's org
  const { data: member } = await supabase
    .from("members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();
  if (!member) return { error: "Aucune organisation trouvee." };

  // Verify tool ownership and status
  const { data: tool } = await supabase
    .from("tools")
    .select("id, org_id, status, deployed_url")
    .eq("id", toolId)
    .eq("org_id", member.org_id)
    .single();

  if (!tool) return { error: "Outil non trouve ou non autorise." };

  if (tool.status !== "active") {
    return { error: "Seuls les outils actifs peuvent etre deployes." };
  }

  // Generate unique slug (or reuse existing)
  const slug = tool.deployed_url ?? nanoid(10).toLowerCase();

  // Hash access code if restricted
  let accessCodeHash: string | null = null;
  if (accessType === "restricted" && accessCode) {
    accessCodeHash = await bcrypt.hash(accessCode, 10);
  }

  // Update tool with deployment info
  const { error: updateError } = await supabase
    .from("tools")
    .update({
      deployed_url: slug,
      access_type: accessType as "public" | "restricted",
      access_code_hash: accessCodeHash,
      deployed_at: new Date().toISOString(),
    })
    .eq("id", toolId);

  if (updateError) {
    console.error("[B-WORK:deploy] Failed to deploy tool", updateError);
    return { error: "Impossible de deployer l'outil." };
  }

  const link = `/t/${slug}`;

  console.info("[B-WORK:deploy] Tool deployed", {
    toolId,
    slug,
    accessType,
  });

  revalidatePath("/dashboard");

  return { success: "Outil deploye avec succes !", link };
}

/**
 * Copies the existing deploy link for an already-deployed tool.
 * Returns the link path.
 */
export async function getDeployLink(
  toolId: string,
): Promise<ActionState & { link?: string }> {
  const idResult = z.string().uuid().safeParse(toolId);
  if (!idResult.success) return { error: "Identifiant invalide." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifie." };

  const { data: member } = await supabase
    .from("members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();
  if (!member) return { error: "Aucune organisation trouvee." };

  const { data: tool } = await supabase
    .from("tools")
    .select("deployed_url")
    .eq("id", toolId)
    .eq("org_id", member.org_id)
    .single();

  if (!tool?.deployed_url) return { error: "Outil non deploye." };

  return { success: "Lien recupere.", link: `/t/${tool.deployed_url}` };
}

/**
 * Validates an access code for a restricted deployed tool.
 * If correct, sets an HttpOnly signed cookie granting access for 24h.
 */
export async function validateAccessCode(
  slug: string,
  code: string,
): Promise<ActionState> {
  if (!slug || !code) {
    return { error: "Code d'acces requis." };
  }

  const admin = createAdminClient();
  const { data: tool } = await admin
    .from("tools")
    .select("id, access_type, access_code_hash")
    .eq("deployed_url", slug)
    .single();

  if (!tool) {
    return { error: "Outil non trouve." };
  }

  if (tool.access_type !== "restricted" || !tool.access_code_hash) {
    return { error: "Cet outil n'est pas restreint." };
  }

  const isValid = await bcrypt.compare(code, tool.access_code_hash);
  if (!isValid) {
    console.info("[B-WORK:deploy] Invalid access code attempt", { slug });
    return { error: "Code d'acces incorrect. Reessayez." };
  }

  // Set signed access cookie (24h)
  const token = createAccessToken(slug);
  const cookieStore = await cookies();
  cookieStore.set(`bwork-access-${slug}`, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24h
    path: `/t/${slug}`,
  });

  console.info("[B-WORK:deploy] Access granted for restricted tool", { slug });

  return { success: "Acces accorde." };
}

/**
 * Helper: verify the current user is the tool's creator or an org admin.
 * Returns { authorized, error, userId } for reuse in disable/reactivate.
 */
async function verifyToolOwnership(toolId: string, expectedStatus: string) {
  const idResult = z.string().uuid().safeParse(toolId);
  if (!idResult.success) return { authorized: false, error: "Identifiant invalide." } as const;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { authorized: false, error: "Non authentifie." } as const;

  const { data: member } = await supabase
    .from("members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();
  if (!member) return { authorized: false, error: "Aucune organisation trouvee." } as const;

  const { data: tool } = await supabase
    .from("tools")
    .select("id, org_id, status, created_by, name")
    .eq("id", toolId)
    .eq("org_id", member.org_id)
    .single();

  if (!tool) return { authorized: false, error: "Outil non trouve ou non autorise." } as const;

  if (tool.status !== expectedStatus) {
    return { authorized: false, error: `L'outil n'est pas en status "${expectedStatus}".` } as const;
  }

  // RBAC: creator or admin
  const isCreator = tool.created_by === user.id;
  const isAdmin = member.role === "admin";
  if (!isCreator && !isAdmin) {
    return { authorized: false, error: "Vous n'avez pas la permission de modifier cet outil." } as const;
  }

  return { authorized: true, tool, supabase } as const;
}

/**
 * Disables an active tool. The deployed link becomes inaccessible.
 * Only the creator or an org admin can disable.
 */
export async function disableTool(toolId: string): Promise<ActionState> {
  const check = await verifyToolOwnership(toolId, "active");
  if (!check.authorized) return { error: check.error };

  const { error: updateError } = await check.supabase
    .from("tools")
    .update({ status: "disabled" as const })
    .eq("id", toolId);

  if (updateError) {
    console.error("[B-WORK:deploy] Failed to disable tool", updateError);
    return { error: "Impossible de desactiver l'outil." };
  }

  console.info("[B-WORK:deploy] Tool disabled", { toolId });
  revalidatePath("/dashboard");
  return { success: "Outil desactive." };
}

/**
 * Reactivates a disabled tool back to active status.
 * Only the creator or an org admin can reactivate.
 */
export async function reactivateTool(toolId: string): Promise<ActionState> {
  const check = await verifyToolOwnership(toolId, "disabled");
  if (!check.authorized) return { error: check.error };

  const { error: updateError } = await check.supabase
    .from("tools")
    .update({ status: "active" as const })
    .eq("id", toolId);

  if (updateError) {
    console.error("[B-WORK:deploy] Failed to reactivate tool", updateError);
    return { error: "Impossible de reactiver l'outil." };
  }

  console.info("[B-WORK:deploy] Tool reactivated", { toolId });
  revalidatePath("/dashboard");
  return { success: "Outil reactive." };
}
