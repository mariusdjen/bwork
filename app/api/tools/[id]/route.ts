"use server";

import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(
	_req: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		if (userError || !user) {
			return NextResponse.json({ ok: false, error: "not-authenticated" }, { status: 401 });
		}

		const toolId = params.id;
		if (!toolId) {
			return NextResponse.json({ ok: false, error: "id manquant" }, { status: 400 });
		}

		const { error } = await supabase
			.from("tools")
			.delete()
			.eq("id", toolId)
			.eq("user_id", user.id);

		if (error) {
			return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
		}

		return NextResponse.json({ ok: true });
	} catch (err) {
		return NextResponse.json(
			{
				ok: false,
				error:
					err instanceof Error
						? err.message
						: "Erreur lors de la suppression de l'outil.",
			},
			{ status: 500 }
		);
	}
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		if (userError || !user) {
			return NextResponse.json({ ok: false, error: "not-authenticated" }, { status: 401 });
		}

		const toolId = params.id;
		if (!toolId) {
			return NextResponse.json({ ok: false, error: "id manquant" }, { status: 400 });
		}

		const body = await req.json();
		const is_public = body?.is_public === true;

		const { error } = await supabase
			.from("tools")
			.update({ is_public })
			.eq("id", toolId)
			.eq("user_id", user.id);

		if (error) {
			return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
		}

		return NextResponse.json({ ok: true });
	} catch (err) {
		return NextResponse.json(
			{
				ok: false,
				error:
					err instanceof Error
						? err.message
						: "Erreur lors de la mise à jour de l'outil.",
			},
			{ status: 500 }
		);
	}
}


