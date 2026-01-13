"use server";

import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Process the next queued generation job.
// PLACEHOLDER: simule la génération puis marque done avec un lien fictif.
// À remplacer par la vraie logique sandbox/génération quand dispo.
export async function POST() {
	try {
		const supabase = await createClient();
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		if (userError || !user) {
			return NextResponse.json({ ok: false, error: "not-authenticated" }, { status: 401 });
		}

		// Récupérer un job en attente
		const { data: job, error: fetchErr } = await supabase
			.from("generations")
			.select("*")
			.eq("user_id", user.id)
			.eq("status", "queued")
			.order("created_at", { ascending: true })
			.limit(1)
			.single();

		if (fetchErr || !job) {
			return NextResponse.json({ ok: true, message: "Aucun job en attente" });
		}

		// Marquer running
		await supabase
			.from("generations")
			.update({ status: "running" })
			.eq("id", job.id);

		// TODO: Remplacer par la vraie logique sandbox + récupération du lien final
		// Simulation : on génère un lien fictif (mieux vaut unique)
		const sandboxUrl = `https://example-sandbox.com/tool/${job.id}`;

		// Sauver l'outil (anti-doublon via contrainte unique recommandée en base)
		await supabase
			.from("tools")
			.insert({
				user_id: user.id,
				title: job.title || "Outil généré (background)",
				description: job.brief || null,
				sandbox_url: sandboxUrl,
				is_public: false,
			})
			.select()
			.single();

		// Marquer done
		await supabase
			.from("generations")
			.update({ status: "done", sandbox_url: sandboxUrl })
			.eq("id", job.id);

		return NextResponse.json({ ok: true, id: job.id, sandbox_url: sandboxUrl });
	} catch (err) {
		return NextResponse.json(
			{
				ok: false,
				error:
					err instanceof Error
						? err.message
						: "Erreur lors du traitement du job.",
			},
			{ status: 500 }
		);
	}
}

