import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { ok: false, error: "not-authenticated" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const toolId = url.pathname.split("/").pop(); // 👈 récupère [id]

    if (!toolId) {
      return NextResponse.json(
        { ok: false, error: "id manquant" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const is_public = body?.is_public === true;

    const { error } = await supabase
      .from("tools")
      .update({ is_public })
      .eq("id", toolId)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "Erreur lors de la mise à jour." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { ok: false, error: "not-authenticated" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const toolId = url.pathname.split("/").pop();

    if (!toolId) {
      return NextResponse.json(
        { ok: false, error: "id manquant" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("tools")
      .delete()
      .eq("id", toolId)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "Erreur lors de la suppression." },
      { status: 500 }
    );
  }
}
