"use server";

import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		if (userError || !user) {
			return NextResponse.json({ ok: false, error: "not-authenticated" }, { status: 401 });
		}

		const body = await req.json();
		const title = body?.title?.toString().trim() || "Outil généré";
		const description = body?.description?.toString().trim() || null;
		const sandbox_url = body?.sandbox_url?.toString().trim();
		const is_public = body?.is_public === true;

		if (!sandbox_url) {
			return NextResponse.json(
				{ ok: false, error: "sandbox_url manquant" },
				{ status: 400 }
			);
		}

		// Si déjà existant pour cet utilisateur et ce lien, ne pas dupliquer
		const { data: existing } = await supabase
			.from("tools")
			.select("id")
			.eq("user_id", user.id)
			.eq("sandbox_url", sandbox_url)
			.limit(1)
			.maybeSingle();
		if (existing) {
			return NextResponse.json({ ok: true, id: existing.id });
		}

		const { error } = await supabase.from("tools").insert({
			user_id: user.id,
			title,
			description,
			sandbox_url,
			is_public,
		});

		if (error) {
			return NextResponse.json(
				{ ok: false, error: error.message },
				{ status: 400 }
			);
		}

		return NextResponse.json({ ok: true });
	} catch (err) {
		return NextResponse.json(
			{
				ok: false,
				error:
					err instanceof Error
						? err.message
						: "Erreur lors de l'enregistrement de l'outil.",
			},
			{ status: 500 }
		);
	}
}

