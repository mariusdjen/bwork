/**
 * POST /api/sandbox/[id]/retry
 *
 * Retries a failed sandbox generation.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { retrySandbox } from "@/lib/sandbox/orchestrator";

export const maxDuration = 300; // 5 minutes max

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    // Get sandbox and verify ownership
    const { data: sandbox, error: sandboxError } = await supabase
      .from("sandboxes")
      .select(
        `
        id,
        tool_id,
        status,
        tools!inner (
          org_id
        )
      `
      )
      .eq("id", id)
      .single();

    if (sandboxError || !sandbox) {
      return NextResponse.json(
        { error: "Sandbox non trouve" },
        { status: 404 }
      );
    }

    // Check user has access
    const tool = sandbox.tools as unknown as { org_id: string };
    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("id")
      .eq("org_id", tool.org_id)
      .eq("user_id", user.id)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { error: "Acces non autorise" },
        { status: 403 }
      );
    }

    // Check sandbox can be retried
    if (sandbox.status !== "failed") {
      return NextResponse.json(
        { error: "Seuls les sandboxes en echec peuvent etre relances" },
        { status: 400 }
      );
    }

    // Retry the sandbox
    console.log(`[API] Retrying sandbox ${id}`);
    const result = await retrySandbox(id);

    return NextResponse.json({
      success: result.success,
      sandboxId: result.sandboxId,
      sandboxUrl: result.sandboxUrl,
      canRetry: result.canRetry,
      error: result.error,
      userMessage: result.userMessage,
    });
  } catch (error) {
    console.error("[API] Sandbox retry error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors du retry",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
