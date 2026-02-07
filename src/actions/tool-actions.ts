"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { type ActionState } from "@/lib/actions/shared";
import { ErrorCode, getErrorMessage } from "@/lib/errors";
import { checkToolLimit } from "@/lib/plans/enforcement";
import { z } from "zod/v4";
import { entitySchema, fieldSchema, ruleSchema, type FieldType } from "@/types/artifact";
import { MAX_ENTITIES_PER_ARTIFACT, MAX_FIELDS_PER_ENTITY, MAX_RULES_PER_ARTIFACT } from "@/lib/constants";
import { TEMPLATES } from "@/lib/templates";

const VALID_USE_CASES = ["tracking", "quotes", "forms"] as const;

const useCaseLabels: Record<string, string> = {
  tracking: "Suivre des demandes",
  quotes: "Créer des devis",
  forms: "Collecter des infos",
};

const createToolSchema = z
  .object({
    useCase: z.string(),
    customDescription: z.string().max(500).nullable().optional(),
  })
  .refine(
    (data) =>
      VALID_USE_CASES.includes(data.useCase as (typeof VALID_USE_CASES)[number]) ||
      (data.useCase === "custom" &&
        data.customDescription &&
        data.customDescription.length >= 3),
    {
      message: "Choisissez un cas d'usage ou decrivez votre besoin (min 3 caracteres).",
    },
  );

export async function createToolDraft(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const useCase = (formData.get("useCase") as string) ?? "";
  const customDescription = (formData.get("customDescription") as string) || null;

  const result = createToolSchema.safeParse({ useCase, customDescription });
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Donnees invalides." };
  }

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

  // Check plan tool limit before creating
  const limitCheck = await checkToolLimit(user.id);
  if (!limitCheck.allowed) {
    return {
      error: `${getErrorMessage(ErrorCode.PLAN_TOOL_LIMIT)} (${limitCheck.currentCount}/${limitCheck.maxAllowed})`,
    };
  }

  // Use pre-configured template artifact if available, otherwise empty artifact
  const template = TEMPLATES[useCase];

  const toolName = template
    ? template.toolName
    : useCase === "custom"
      ? (customDescription ?? "").slice(0, 50) || "Nouvel outil"
      : useCaseLabels[useCase] ?? "Nouvel outil";

  const artifact = template
    ? {
        ...structuredClone(template),
        customDescription: null as string | null,
      }
    : {
        useCase: useCase === "custom" ? "custom" : useCase,
        customDescription,
        toolName,
        entities: [] as { name: string; fields: { name: string; type: "text" | "number" | "date" | "select" | "checkbox" }[] }[],
        rules: [] as { condition: string; action: string }[],
      };

  const { data: tool, error } = await supabase
    .from("tools")
    .insert({
      org_id: member.org_id,
      created_by: user.id,
      name: toolName,
      description:
        useCase === "custom"
          ? (customDescription ?? "Outil personnalise")
          : `Outil de type: ${useCaseLabels[useCase] ?? useCase}`,
      status: "draft" as const,
      artifact,
    })
    .select("id")
    .single();

  if (error || !tool) {
    return { error: "Impossible de creer l'outil." };
  }

  redirect(`/create/${tool.id}/guidance`);
}

const saveEntitiesSchema = z
  .array(entitySchema)
  .min(0)
  .max(MAX_ENTITIES_PER_ARTIFACT);

export async function saveArtifactEntities(
  toolId: string,
  entities: { name: string; fields?: { name: string; type: FieldType }[] }[],
): Promise<ActionState> {
  const idResult = z.string().uuid().safeParse(toolId);
  if (!idResult.success) {
    return { error: "Identifiant d'outil invalide." };
  }

  const result = saveEntitiesSchema.safeParse(entities);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Entites invalides." };
  }

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

  // Verify tool ownership
  const { data: tool } = await supabase
    .from("tools")
    .select("id, org_id, artifact")
    .eq("id", toolId)
    .eq("org_id", member.org_id)
    .single();

  if (!tool) return { error: "Outil non trouve ou non autorise." };

  const currentArtifact = (tool.artifact as Record<string, unknown>) ?? {};
  const updatedArtifact = { ...currentArtifact, entities: result.data };

  const { error } = await supabase
    .from("tools")
    .update({ artifact: updatedArtifact })
    .eq("id", toolId);

  if (error) {
    return { error: "Impossible de sauvegarder les entites." };
  }

  return { success: "Entites sauvegardees." };
}

const entityWithFieldsSchema = z.object({
  name: z.string().min(1).max(50),
  fields: z.array(fieldSchema).max(MAX_FIELDS_PER_ENTITY),
});

const saveFieldsSchema = z
  .array(entityWithFieldsSchema)
  .min(0)
  .max(MAX_ENTITIES_PER_ARTIFACT);

export async function saveArtifactFields(
  toolId: string,
  entities: { name: string; fields: { name: string; type: FieldType }[] }[],
): Promise<ActionState> {
  const idResult = z.string().uuid().safeParse(toolId);
  if (!idResult.success) {
    return { error: "Identifiant d'outil invalide." };
  }

  const result = saveFieldsSchema.safeParse(entities);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Champs invalides." };
  }

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
    .select("id, org_id, artifact")
    .eq("id", toolId)
    .eq("org_id", member.org_id)
    .single();

  if (!tool) return { error: "Outil non trouve ou non autorise." };

  const currentArtifact = (tool.artifact as Record<string, unknown>) ?? {};
  const updatedArtifact = { ...currentArtifact, entities: result.data };

  const { error } = await supabase
    .from("tools")
    .update({ artifact: updatedArtifact })
    .eq("id", toolId);

  if (error) {
    return { error: "Impossible de sauvegarder les champs." };
  }

  return { success: "Champs sauvegardes." };
}

const saveRulesSchema = z
  .array(ruleSchema)
  .min(0)
  .max(MAX_RULES_PER_ARTIFACT);

export async function saveArtifactRules(
  toolId: string,
  rules: { condition: string; action: string }[],
): Promise<ActionState> {
  const idResult = z.string().uuid().safeParse(toolId);
  if (!idResult.success) {
    return { error: "Identifiant d'outil invalide." };
  }

  const result = saveRulesSchema.safeParse(rules);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Regles invalides." };
  }

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
    .select("id, org_id, artifact")
    .eq("id", toolId)
    .eq("org_id", member.org_id)
    .single();

  if (!tool) return { error: "Outil non trouve ou non autorise." };

  const currentArtifact = (tool.artifact as Record<string, unknown>) ?? {};
  const updatedArtifact = { ...currentArtifact, rules: result.data };

  const { error } = await supabase
    .from("tools")
    .update({ artifact: updatedArtifact })
    .eq("id", toolId);

  if (error) {
    return { error: "Impossible de sauvegarder les regles." };
  }

  return { success: "Regles sauvegardees." };
}

export async function finalizeArtifact(
  toolId: string,
): Promise<ActionState> {
  const idResult = z.string().uuid().safeParse(toolId);
  if (!idResult.success) {
    return { error: "Identifiant d'outil invalide." };
  }

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
    .select("id, org_id, artifact, status")
    .eq("id", toolId)
    .eq("org_id", member.org_id)
    .single();

  if (!tool) return { error: "Outil non trouve ou non autorise." };

  if (tool.status !== "draft") {
    return { error: "Cet outil a deja ete finalise." };
  }

  // Validate artifact has at least 1 entity with at least 1 field
  const artifact = tool.artifact as Record<string, unknown> | null;
  const entities = (artifact?.entities ?? []) as { name?: string; fields?: unknown[] }[];
  const hasEntityWithField = entities.some(
    (e) => e.fields && e.fields.length > 0,
  );

  if (!hasEntityWithField) {
    return { error: "L'artefact doit contenir au moins une entite avec au moins un champ." };
  }

  const { error } = await supabase
    .from("tools")
    .update({ status: "ready" })
    .eq("id", toolId);

  if (error) {
    console.error("[B-WORK:finalize] Failed to update tool status", { toolId, error });
    return { error: "Impossible de finaliser l'outil." };
  }

  return { success: "Votre outil est pret pour la generation !" };
}

export async function reopenArtifact(
  toolId: string,
): Promise<ActionState> {
  const idResult = z.string().uuid().safeParse(toolId);
  if (!idResult.success) {
    return { error: "Identifiant d'outil invalide." };
  }

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
    .select("id, org_id, status")
    .eq("id", toolId)
    .eq("org_id", member.org_id)
    .single();

  if (!tool) return { error: "Outil non trouve ou non autorise." };

  if (tool.status !== "active") {
    return { error: "Seul un outil actif peut etre rouvert pour modification." };
  }

  // Set status back to draft — code_storage_path is preserved intentionally
  const { error } = await supabase
    .from("tools")
    .update({ status: "draft" })
    .eq("id", toolId);

  if (error) {
    return { error: "Impossible de rouvrir l'outil." };
  }

  revalidatePath(`/create/${toolId}/preview`);

  console.info(`[B-WORK:regeneration] Tool ${toolId} reopened for modification`);

  return { success: "Artefact rouvert pour modification." };
}
