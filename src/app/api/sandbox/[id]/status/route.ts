/**
 * GET /api/sandbox/[id]/status
 *
 * Returns the current status of a sandbox.
 * Used for polling or initial state fetch.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
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

    // Get sandbox with tool info
    const { data: sandbox, error: sandboxError } = await supabase
      .from("sandboxes")
      .select(
        `
        id,
        tool_id,
        generation_id,
        provider,
        external_id,
        url,
        status,
        retry_count,
        max_retries,
        last_error,
        build_passed,
        tests_passed,
        health_check_passed,
        created_at,
        updated_at,
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

    // Check user has access to the tool's organization
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

    // Return sandbox status (without nested tools object)
    const { tools, ...sandboxData } = sandbox;

    return NextResponse.json(sandboxData, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    });
  } catch (error) {
    console.error("[API] Sandbox status error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recuperation du statut" },
      { status: 500 }
    );
  }
}
