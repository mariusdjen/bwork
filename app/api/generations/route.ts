"use server";

import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const supabase = await createClient();
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		if (userError || !user) {
			return NextResponse.json({ ok: false, error: "not-authenticated" }, { status: 401 });
		}

		const { data, error } = await supabase
			.from("generations")
			.select("*")
			.eq("user_id", user.id)
			.order("created_at", { ascending: false })
			.limit(20);

		if (error) {
			return NextResponse.json(
				{ ok: false, error: error.message },
				{ status: 400 }
			);
		}

		return NextResponse.json({ ok: true, generations: data || [] });
	} catch (err) {
		return NextResponse.json(
			{
				ok: false,
				error:
					err instanceof Error
						? err.message
						: "Erreur lors de la lecture des générations.",
			},
			{ status: 500 }
		);
	}
}

// Upsert-like endpoint to track background generations by sandbox_id
// Body: { sandbox_id: string; status: "queued" | "running" | "done" | "failed"; sandbox_url?: string; title?: string; error?: string }
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
		const sandbox_id = body?.sandbox_id?.toString().trim();
		const status = body?.status?.toString().trim();

		if (!sandbox_id || !status) {
			return NextResponse.json(
				{ ok: false, error: "sandbox_id ou status manquant" },
				{ status: 400 }
			);
		}

		const title = body?.title?.toString().trim() || "Génération en arrière-plan";
		const sandbox_url = body?.sandbox_url?.toString().trim() || null;
		const errorMsg = body?.error?.toString().trim() || null;

		const { data, error } = await supabase
			.from("generations")
			.upsert(
				{
					sandbox_id,
					status,
					sandbox_url,
					title,
					error: errorMsg,
					user_id: user.id,
				},
				{ onConflict: "sandbox_id" }
			)
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
						: "Erreur lors de la mise à jour de la génération.",
			},
			{ status: 500 }
		);
	}
}

