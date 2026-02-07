/**
 * POST /api/sandbox/provision
 *
 * Creates a new sandbox for a tool generation.
 * Returns the sandbox ID and initial status.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runGenerationPipeline } from "@/lib/sandbox/orchestrator";

export const maxDuration = 300; // 5 minutes max

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { toolId, generationId, code } = body;

    if (!toolId || !generationId || !code) {
      return NextResponse.json(
        { error: "toolId, generationId et code sont requis" },
        { status: 400 }
      );
    }

    // Verify tool ownership
    const { data: tool, error: toolError } = await supabase
      .from("tools")
      .select("id, org_id")
      .eq("id", toolId)
      .single();

    if (toolError || !tool) {
      return NextResponse.json({ error: "Outil non trouve" }, { status: 404 });
    }

    // Check user is member of tool's organization
    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("id")
      .eq("org_id", tool.org_id)
      .eq("user_id", user.id)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { error: "Acces non autorise a cet outil" },
        { status: 403 }
      );
    }

    // Run the generation pipeline
    console.log(`[API] Starting sandbox pipeline for tool ${toolId}`);
    const result = await runGenerationPipeline(toolId, generationId, code);

    return NextResponse.json({
      success: result.success,
      sandboxId: result.sandboxId,
      sandboxUrl: result.sandboxUrl,
      canRetry: result.canRetry,
      error: result.error,
      userMessage: result.userMessage,
    });
  } catch (error) {
    console.error("[API] Sandbox provision error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la creation du sandbox",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
