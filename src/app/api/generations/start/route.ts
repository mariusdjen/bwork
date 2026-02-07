import { streamText } from "ai";
import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/server";
import {
  getAIModel,
  getAIModelForPlan,
  getAIProviderInfo,
  getModelNameForPlan,
  validateProviderConfig,
} from "@/lib/ai/provider-manager";
import { buildGenerationPrompt, SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { MAX_GENERATIONS_PER_DAY } from "@/lib/constants";
import { checkRegenLimit, getUserPlan } from "@/lib/plans/enforcement";
import { ErrorCode, getErrorMessage } from "@/lib/errors";
import type { ArtifactBase } from "@/types/artifact";
import { runGenerationPipeline } from "@/lib/sandbox/orchestrator";
import { isE2BConfigured, isVercelConfigured } from "@/lib/sandbox/factory";
import {
  preValidateCode,
  translateError,
  getErrorSummary,
  SUCCESS_MESSAGES,
} from "@/lib/validation";

const bodySchema = z.object({
  toolId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    // Parse and validate body
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Identifiant d'outil invalide." },
        { status: 400 },
      );
    }
    const { toolId } = parsed.data;

    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "Non authentifie." }, { status: 401 });
    }

    // Get user's org
    const { data: member } = await supabase
      .from("members")
      .select("org_id")
      .eq("user_id", user.id)
      .single();
    if (!member) {
      return Response.json(
        { error: "Aucune organisation trouvee." },
        { status: 403 },
      );
    }

    // Verify tool ownership and status
    const { data: tool } = await supabase
      .from("tools")
      .select("id, org_id, name, artifact, status")
      .eq("id", toolId)
      .eq("org_id", member.org_id)
      .single();

    if (!tool) {
      return Response.json(
        { error: "Outil non trouve ou non autorise." },
        { status: 404 },
      );
    }

    if (tool.status !== "ready") {
      return Response.json(
        { error: "Cet outil n'est pas pret pour la generation." },
        { status: 400 },
      );
    }

    // Rate limit check
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: orgTools } = await supabase
      .from("tools")
      .select("id")
      .eq("org_id", member.org_id);

    const orgToolIds = orgTools?.map((t) => t.id) ?? [];

    // Skip count query if org has no tools (avoids empty IN clause)
    let generationCount = 0;
    if (orgToolIds.length > 0) {
      const { count } = await supabase
        .from("generations")
        .select("id", { count: "exact", head: true })
        .in("tool_id", orgToolIds)
        .gte("created_at", todayStart.toISOString());
      generationCount = count ?? 0;
    }

    if (generationCount >= MAX_GENERATIONS_PER_DAY) {
      return Response.json(
        {
          error:
            "Vous avez atteint la limite de creations pour aujourd'hui. Revenez demain !",
        },
        { status: 429 },
      );
    }

    // Plan-based regeneration limit check
    const regenCheck = await checkRegenLimit(user.id);
    if (!regenCheck.allowed) {
      return Response.json(
        {
          error: `${getErrorMessage(ErrorCode.PLAN_REGEN_LIMIT)} (${regenCheck.currentCount}/${regenCheck.maxAllowed} ce mois)`,
        },
        { status: 429 },
      );
    }

    // Validate artifact has content
    const artifact = tool.artifact as ArtifactBase | null;
    if (
      !artifact?.entities ||
      artifact.entities.length === 0 ||
      !artifact.entities.some(
        (e: { fields?: unknown[] }) => e.fields && e.fields.length > 0,
      )
    ) {
      return Response.json(
        {
          error:
            "L'artefact doit contenir au moins une entite avec au moins un champ.",
        },
        { status: 400 },
      );
    }

    // Validate provider configuration (API key present)
    const providerCheck = validateProviderConfig();
    if (!providerCheck.valid) {
      return Response.json(
        { error: providerCheck.message },
        { status: 500 },
      );
    }

    // Use plan-based model selection
    const userPlan = await getUserPlan(user.id);
    const planModel = getModelNameForPlan(userPlan);
    const provider = "anthropic";
    const model = planModel;

    // Insert generation record
    const { data: generation, error: genInsertError } = await supabase
      .from("generations")
      .insert({
        tool_id: toolId,
        triggered_by: user.id,
        status: "pending" as const,
        provider,
        model,
      })
      .select("id")
      .single();

    if (genInsertError || !generation) {
      console.error(
        "[B-WORK:generation] Failed to insert generation record",
        genInsertError,
      );
      return Response.json(
        { error: "Impossible de demarrer la generation." },
        { status: 500 },
      );
    }

    // Update tool status to generating
    await supabase
      .from("tools")
      .update({ status: "generating" as const })
      .eq("id", toolId);

    // Update generation status to streaming
    await supabase
      .from("generations")
      .update({ status: "streaming" as const })
      .eq("id", generation.id);

    console.info("[B-WORK:generation] Started", {
      toolId,
      generationId: generation.id,
      provider,
      model,
    });

    const startTime = Date.now();

    // Stream generation
    const result = streamText({
      model: getAIModelForPlan(userPlan),
      system: SYSTEM_PROMPT,
      prompt: buildGenerationPrompt(artifact),
      onFinish: async ({ text, usage, finishReason }) => {
        const durationMs = Date.now() - startTime;

        // Handle stream-level errors (provider failure, content filter, etc.)
        if (finishReason !== "stop" && finishReason !== "tool-calls") {
          console.error("[B-WORK:generation] Stream finished with error", {
            toolId,
            generationId: generation.id,
            finishReason,
            durationMs,
          });
          await supabase
            .from("tools")
            .update({ status: "ready" as const })
            .eq("id", toolId);
          await supabase
            .from("generations")
            .update({
              status: "failed" as const,
              error_message: `Echec de la generation (raison: ${finishReason}).`,
              duration_ms: durationMs,
            })
            .eq("id", generation.id);
          return;
        }

        try {
          // Pre-validate generated code before saving
          console.info("[B-WORK:generation] Running pre-validation...", { toolId });
          const preValidation = preValidateCode(text);

          // Use fixed code if available, otherwise original
          const finalCode = preValidation.fixedCode || text;

          // Log pre-validation results
          if (preValidation.errors.length > 0) {
            const summary = getErrorSummary(preValidation.errors);
            console.info("[B-WORK:generation] Pre-validation issues found", {
              toolId,
              errorCount: preValidation.errors.length,
              canAutoFix: preValidation.canAutoFix,
              summary: summary.mainMessage,
            });

            if (preValidation.fixedCode) {
              console.info("[B-WORK:generation] Auto-fix applied", {
                toolId,
                message: SUCCESS_MESSAGES.autoFixed,
              });
            }
          } else {
            console.info("[B-WORK:generation] Pre-validation passed", {
              toolId,
              stats: preValidation.stats,
            });
          }

          // Save generated code (fixed version if available)
          const { error: saveError } = await supabase
            .from("tools")
            .update({
              code_storage_path: finalCode,
            })
            .eq("id", toolId);

          if (saveError) {
            console.error("[B-WORK:generation] Failed to save code:", saveError);
            throw new Error(`Failed to save code: ${saveError.message}`);
          }

          // Check if sandbox is configured
          const sandboxConfigured = isE2BConfigured() || isVercelConfigured();

          if (sandboxConfigured) {
            // Run sandbox pipeline for validation and repair
            console.info("[B-WORK:generation] Starting sandbox pipeline...", {
              toolId,
              generationId: generation.id,
            });

            const pipelineResult = await runGenerationPipeline(
              toolId,
              generation.id,
              finalCode
            );

            if (pipelineResult.success) {
              // Sandbox validation passed
              const { error: toolUpdateError } = await supabase
                .from("tools")
                .update({ status: "active" as const })
                .eq("id", toolId);

              if (toolUpdateError) {
                console.error("[B-WORK:generation] Failed to update tool status:", toolUpdateError);
              }

              const { error: genUpdateError } = await supabase
                .from("generations")
                .update({
                  status: "complete" as const,
                  tokens_used: (usage?.totalTokens ?? null) as number | null,
                  duration_ms: durationMs,
                })
                .eq("id", generation.id);

              if (genUpdateError) {
                console.error("[B-WORK:generation] Failed to update generation:", genUpdateError);
              }

              console.info("[B-WORK:generation] Complete with sandbox validation", {
                toolId,
                generationId: generation.id,
                sandboxId: pipelineResult.sandboxId,
                sandboxUrl: pipelineResult.sandboxUrl,
                durationMs,
              });
            } else {
              // Sandbox validation failed - but code was generated successfully
              // Mark as active so user can still see their code
              const { error: toolUpdateError } = await supabase
                .from("tools")
                .update({ status: "active" as const })
                .eq("id", toolId);

              if (toolUpdateError) {
                console.error("[B-WORK:generation] Failed to update tool status:", toolUpdateError);
              }

              const { error: genUpdateError } = await supabase
                .from("generations")
                .update({
                  status: "complete" as const,
                  tokens_used: (usage?.totalTokens ?? null) as number | null,
                  duration_ms: durationMs,
                  // Store sandbox error for debugging but don't block
                  error_message: `Preview indisponible: ${pipelineResult.error || "Sandbox non configure"}`,
                })
                .eq("id", generation.id);

              if (genUpdateError) {
                console.error("[B-WORK:generation] Failed to update generation:", genUpdateError);
              }

              console.warn("[B-WORK:generation] Sandbox validation failed (code still saved)", {
                toolId,
                generationId: generation.id,
                error: pipelineResult.error,
              });
            }
          } else {
            // No sandbox configured - use legacy behavior (mark as active directly)
            const { error: toolUpdateError } = await supabase
              .from("tools")
              .update({ status: "active" as const })
              .eq("id", toolId);

            if (toolUpdateError) {
              console.error("[B-WORK:generation] Failed to update tool status:", toolUpdateError);
            }

            const { error: genUpdateError } = await supabase
              .from("generations")
              .update({
                status: "complete" as const,
                tokens_used: (usage?.totalTokens ?? null) as number | null,
                duration_ms: durationMs,
              })
              .eq("id", generation.id);

            if (genUpdateError) {
              console.error("[B-WORK:generation] Failed to update generation:", genUpdateError);
            }

            console.info("[B-WORK:generation] Complete (no sandbox)", {
              toolId,
              generationId: generation.id,
              durationMs,
              tokensUsed: usage?.totalTokens,
            });
          }
        } catch (err) {
          console.error(
            "[B-WORK:generation] Failed to save completion",
            err,
          );
          // Attempt to mark as failed
          await supabase
            .from("tools")
            .update({ status: "ready" as const })
            .eq("id", toolId);
          await supabase
            .from("generations")
            .update({
              status: "failed" as const,
              error_message: "Echec de la sauvegarde du code genere.",
              duration_ms: durationMs,
            })
            .eq("id", generation.id);
        }
      },
    });

    return result.toTextStreamResponse({
      headers: {
        "X-Generation-Id": generation.id,
      },
    });
  } catch (err) {
    console.error("[B-WORK:generation] Unexpected error", err);
    return Response.json(
      { error: "Une erreur inattendue est survenue." },
      { status: 500 },
    );
  }
}
