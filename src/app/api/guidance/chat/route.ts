/**
 * Guidance Chat API
 *
 * Handles conversational guidance for tool creation.
 * Returns structured responses with options and artifact updates.
 */

import { generateText } from "ai";
import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/server";
import { getAIModel, validateProviderConfig } from "@/lib/ai/provider-manager";
import {
  GUIDANCE_SYSTEM_PROMPT,
  buildGuidanceContext,
  parseGuidanceResponse,
  mergeArtifactUpdate,
} from "@/lib/guidance/prompts";
import type { GuidancePhase } from "@/types/guidance";
import type { ArtifactBase } from "@/types/artifact";

const requestSchema = z.object({
  toolId: z.string().uuid(),
  message: z.string().max(1000),
  selectedOptions: z.array(z.string()).optional(),
  currentArtifact: z.object({}).passthrough(), // Partial<ArtifactBase>
  currentPhase: z.enum(["welcome", "discovering", "refining", "confirming", "complete"]),
  messageHistory: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
});

export async function POST(request: Request) {
  try {
    // Parse and validate body
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { success: false, error: "Donnees invalides." },
        { status: 400 }
      );
    }

    const {
      toolId,
      message,
      selectedOptions,
      currentArtifact,
      currentPhase,
      messageHistory,
    } = parsed.data;

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

    // Get user's org and verify tool ownership
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

    const { data: tool } = await supabase
      .from("tools")
      .select("id, org_id, status")
      .eq("id", toolId)
      .eq("org_id", member.org_id)
      .single();

    if (!tool) {
      return Response.json(
        { success: false, error: "Outil non trouve." },
        { status: 404 }
      );
    }

    // Validate provider configuration
    const providerCheck = validateProviderConfig();
    if (!providerCheck.valid) {
      return Response.json(
        { success: false, error: providerCheck.message },
        { status: 500 }
      );
    }

    // Build context for AI
    const userContext = buildGuidanceContext({
      currentMessage: message,
      selectedOptions,
      currentArtifact: currentArtifact as Partial<ArtifactBase>,
      currentPhase: currentPhase as GuidancePhase,
      messageHistory,
    });

    // Call AI
    const startTime = Date.now();
    const result = await generateText({
      model: getAIModel(),
      system: GUIDANCE_SYSTEM_PROMPT,
      prompt: userContext,
      maxOutputTokens: 1500,
      temperature: 0.7,
    });

    const durationMs = Date.now() - startTime;

    // Parse AI response
    const parseResult = parseGuidanceResponse(result.text);

    if (!parseResult.success || !parseResult.data) {
      console.error("[B-WORK:guidance] Failed to parse AI response:", result.text);
      return Response.json(
        {
          success: false,
          error: "Erreur lors de l'analyse de la reponse IA.",
        },
        { status: 500 }
      );
    }

    const aiResponse = parseResult.data;

    // Merge artifact updates
    const updatedArtifact = mergeArtifactUpdate(
      currentArtifact as Partial<ArtifactBase>,
      aiResponse.artifactUpdate
    );

    // Save updated artifact to database
    if (aiResponse.artifactUpdate) {
      const { error: updateError } = await supabase
        .from("tools")
        .update({
          artifact: updatedArtifact,
          name: updatedArtifact.toolName || tool.id,
        })
        .eq("id", toolId);

      if (updateError) {
        console.error("[B-WORK:guidance] Failed to save artifact:", updateError);
        // Continue anyway - don't fail the whole request
      }
    }

    console.info("[B-WORK:guidance] Response generated", {
      toolId,
      phase: currentPhase,
      nextPhase: aiResponse.nextPhase,
      durationMs,
      tokensUsed: result.usage?.totalTokens,
    });

    return Response.json({
      success: true,
      data: {
        message: aiResponse.message,
        question: aiResponse.question
          ? {
              type: aiResponse.question.type,
              text: aiResponse.question.text,
              options: aiResponse.question.options,
              allowCustom: aiResponse.question.allowCustom,
            }
          : undefined,
        artifactUpdate: updatedArtifact,
        contextUpdate: aiResponse.contextUpdate,
        nextPhase: aiResponse.nextPhase,
        readyToConfirm: aiResponse.readyToConfirm,
      },
    });
  } catch (err) {
    console.error("[B-WORK:guidance] Unexpected error:", err);
    return Response.json(
      { success: false, error: "Une erreur inattendue est survenue." },
      { status: 500 }
    );
  }
}
