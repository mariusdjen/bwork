/**
 * Finalize Guidance API
 *
 * Finalizes the artifact and marks the tool as ready for generation.
 * Called when user completes the guidance chat and clicks "Generate".
 */

import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/server";
import type { ArtifactBase } from "@/types/artifact";

const requestSchema = z.object({
  toolId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    // Parse and validate body
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { success: false, error: "Identifiant d'outil invalide." },
        { status: 400 }
      );
    }

    const { toolId } = parsed.data;

    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        { success: false, error: "Non authentifie." },
        { status: 401 }
      );
    }

    // Get user's org
    const { data: member } = await supabase
      .from("members")
      .select("org_id")
      .eq("user_id", user.id)
      .single();

    if (!member) {
      return Response.json(
        { success: false, error: "Aucune organisation trouvee." },
        { status: 403 }
      );
    }

    // Verify tool ownership and get current state
    const { data: tool } = await supabase
      .from("tools")
      .select("id, org_id, artifact, status, name")
      .eq("id", toolId)
      .eq("org_id", member.org_id)
      .single();

    if (!tool) {
      return Response.json(
        { success: false, error: "Outil non trouve." },
        { status: 404 }
      );
    }

    // If already ready or active, just return success
    if (tool.status === "ready" || tool.status === "active") {
      return Response.json({
        success: true,
        message: "Outil deja pret pour la generation.",
      });
    }

    // Validate artifact has at least 1 entity with at least 1 field
    const artifact = tool.artifact as Partial<ArtifactBase> | null;
    const entities = artifact?.entities || [];
    const hasEntityWithField = entities.some(
      (e) => e.fields && e.fields.length > 0
    );

    if (!hasEntityWithField) {
      return Response.json(
        {
          success: false,
          error: "L'artefact doit contenir au moins une entite avec au moins un champ.",
        },
        { status: 400 }
      );
    }

    // Update tool name from artifact if set
    const toolName = artifact?.toolName || tool.name;

    // Update status to ready
    const { error: updateError } = await supabase
      .from("tools")
      .update({
        status: "ready",
        name: toolName,
      })
      .eq("id", toolId);

    if (updateError) {
      console.error("[B-WORK:guidance] Failed to finalize tool:", updateError);
      return Response.json(
        { success: false, error: "Impossible de finaliser l'outil." },
        { status: 500 }
      );
    }

    console.info("[B-WORK:guidance] Tool finalized", { toolId, toolName });

    return Response.json({
      success: true,
      message: "Outil pret pour la generation!",
    });
  } catch (err) {
    console.error("[B-WORK:guidance] Unexpected error:", err);
    return Response.json(
      { success: false, error: "Une erreur inattendue est survenue." },
      { status: 500 }
    );
  }
}
