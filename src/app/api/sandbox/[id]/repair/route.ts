/**
 * POST /api/sandbox/[id]/repair
 *
 * Attempts to repair a failed sandbox using AI repair.
 * Lighter than retry - just fixes the existing code.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSandboxWithFallback } from "@/lib/sandbox/factory";
import { applyAIRepair, isAIRepairAvailable } from "@/lib/sandbox/repair/ai-repairer";

export const maxDuration = 120; // 2 minutes max

/**
 * Map error message to sandbox ErrorCategory
 */
function mapToErrorCategory(
  error: string
): "syntax-error" | "missing-package" | "missing-import" | "runtime-error" | "unknown" {
  const lower = error.toLowerCase();
  if (
    lower.includes("unexpected") ||
    lower.includes("syntax") ||
    lower.includes("expected")
  ) {
    return "syntax-error";
  }
  if (
    lower.includes("module not found") ||
    lower.includes("cannot find module")
  ) {
    return "missing-package";
  }
  if (lower.includes("is not defined") || lower.includes("import")) {
    return "missing-import";
  }
  if (lower.includes("runtime") || lower.includes("typeerror")) {
    return "runtime-error";
  }
  return "unknown";
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sandboxId } = await params;
    const supabase = await createClient();
    const admin = createAdminClient();

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
        status,
        last_error,
        error_history,
        tools!inner (
          id,
          org_id,
          code_storage_path
        )
      `
      )
      .eq("id", sandboxId)
      .single();

    if (sandboxError || !sandbox) {
      return NextResponse.json(
        { error: "Sandbox non trouve" },
        { status: 404 }
      );
    }

    // Check user has access
    const tool = sandbox.tools as unknown as {
      id: string;
      org_id: string;
      code_storage_path: string | null;
    };

    const { data: member } = await supabase
      .from("members")
      .select("id")
      .eq("org_id", tool.org_id)
      .eq("user_id", user.id)
      .single();

    if (!member) {
      return NextResponse.json(
        { error: "Acces non autorise" },
        { status: 403 }
      );
    }

    // Check if sandbox can be repaired
    if (sandbox.status !== "failed") {
      return NextResponse.json(
        { error: "Seuls les sandboxes en echec peuvent etre repares" },
        { status: 400 }
      );
    }

    // Check if we have code to repair
    const currentCode = tool.code_storage_path;
    if (!currentCode) {
      return NextResponse.json(
        { error: "Aucun code a reparer" },
        { status: 400 }
      );
    }

    // Check if AI repair is available
    if (!isAIRepairAvailable()) {
      return NextResponse.json(
        { error: "Reparation AI non disponible", canRetry: true },
        { status: 503 }
      );
    }

    console.log(`[API:repair] Starting AI repair for sandbox ${sandboxId}`);

    // Update status to repairing
    await admin
      .from("sandboxes")
      .update({ status: "repairing" })
      .eq("id", sandboxId);

    // Get error info for AI context
    const lastError = sandbox.last_error || "Unknown error";
    const errorCategory = mapToErrorCategory(lastError);

    // Create a new sandbox provider for repair
    let provider;
    try {
      provider = await createSandboxWithFallback();
    } catch (providerError) {
      console.error("[API:repair] Failed to create sandbox provider:", providerError);

      // Update status back to failed
      await admin
        .from("sandboxes")
        .update({ status: "failed" })
        .eq("id", sandboxId);

      return NextResponse.json({
        success: false,
        error: "Impossible de creer l'environnement de test",
        canRetry: true,
      });
    }

    try {
      // Setup sandbox
      await provider.setupViteApp();
      await provider.writeFile("src/App.jsx", currentCode);

      // Apply AI repair
      const repairResult = await applyAIRepair(provider, [
        {
          type: errorCategory,
          message: lastError,
          file: "src/App.jsx",
          fixable: "ai",
        },
      ]);

      if (repairResult.success && repairResult.repairedCode) {
        // Save the repaired code
        await admin
          .from("tools")
          .update({ code_storage_path: repairResult.repairedCode })
          .eq("id", tool.id);

        // Get sandbox URL (may be null)
        const sandboxUrl = provider.getSandboxUrl();

        // Update sandbox status
        await admin
          .from("sandboxes")
          .update({
            status: "ready",
            url: sandboxUrl || null,
            last_error: null,
          })
          .eq("id", sandboxId);

        // Also update tool status
        await admin
          .from("tools")
          .update({ status: "active" })
          .eq("id", tool.id);

        console.log(`[API:repair] Repair successful for sandbox ${sandboxId}`);

        return NextResponse.json({
          success: true,
          sandboxUrl: sandboxUrl || undefined,
          message: "Code repare avec succes!",
        });
      } else {
        // Repair failed
        await admin
          .from("sandboxes")
          .update({
            status: "failed",
            last_error: "Reparation automatique echouee",
          })
          .eq("id", sandboxId);

        return NextResponse.json({
          success: false,
          error: "La reparation automatique n'a pas fonctionne",
          canRetry: true,
          suggestion: "Essayez de modifier votre description et de regenerer.",
        });
      }
    } finally {
      // Cleanup provider
      try {
        await provider.terminate();
      } catch (e) {
        console.error("[API:repair] Failed to terminate provider:", e);
      }
    }
  } catch (error) {
    console.error("[API:repair] Repair error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la reparation",
        details: error instanceof Error ? error.message : "Unknown error",
        canRetry: true,
      },
      { status: 500 }
    );
  }
}
