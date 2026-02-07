/**
 * DELETE /api/sandbox/[id]/terminate
 *
 * Terminates a sandbox and cleans up resources.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { terminateSandbox } from "@/lib/sandbox/orchestrator";

export async function DELETE(
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

    // Terminate the sandbox
    await terminateSandbox(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Sandbox terminate error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la terminaison" },
      { status: 500 }
    );
  }
}
