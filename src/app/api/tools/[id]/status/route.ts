import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Lightweight endpoint to poll tool status.
 * Used by the generation page to detect when onFinish has saved the code to DB.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  const idResult = z.string().uuid().safeParse(id);
  if (!idResult.success) {
    return Response.json({ error: "Identifiant invalide." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Non authentifie." }, { status: 401 });
  }

  const { data: member } = await supabase
    .from("members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!member) {
    return Response.json({ error: "Aucune organisation." }, { status: 403 });
  }

  const { data: tool } = await supabase
    .from("tools")
    .select("status")
    .eq("id", id)
    .eq("org_id", member.org_id)
    .single();

  if (!tool) {
    return Response.json({ error: "Outil non trouve." }, { status: 404 });
  }

  return Response.json(
    { status: tool.status },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    },
  );
}
