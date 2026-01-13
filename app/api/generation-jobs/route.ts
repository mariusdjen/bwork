"use server";

import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Crée un job de génération en file d'attente
// Body: { brief: string }
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
		const brief = body?.brief?.toString().trim();
		if (!brief) {
			return NextResponse.json(
				{ ok: false, error: "brief manquant" },
				{ status: 400 }
			);
		}

		const { data, error } = await supabase
			.from("generations")
			.insert({
				user_id: user.id,
				status: "queued",
				title: "Génération en arrière-plan",
				sandbox_url: null,
				error: null,
				brief,
			})
			.select()
			.single();

		if (error) {
			return NextResponse.json(
				{ ok: false, error: error.message },
				{ status: 400 }
			);
		}

		return NextResponse.json({ ok: true, id: data.id });
	} catch (err) {
		return NextResponse.json(
			{
				ok: false,
				error:
					err instanceof Error
						? err.message
						: "Erreur lors de la création du job.",
			},
			{ status: 500 }
		);
	}
}

