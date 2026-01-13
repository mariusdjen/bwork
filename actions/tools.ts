"use server";

import { createClient } from "@/utils/supabase/server";
import type { Tool } from "@/types/tools";

export async function getUserTools() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { user: null, tools: [] as Tool[], error: "not-authenticated" };
	}

	const { data, error } = await supabase
		.from("tools")
		.select("*")
		.eq("user_id", user.id)
		.order("created_at", { ascending: false });

	return {
		user,
		tools: (data as Tool[]) ?? [],
		error: error?.message ?? null,
	};
}

export async function saveUserTool(input: {
	title: string;
	description?: string | null;
	sandbox_url: string;
}) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { ok: false, error: "not-authenticated" };
	}

	const { error } = await supabase.from("tools").insert({
		user_id: user.id,
		title: input.title,
		description: input.description ?? null,
		sandbox_url: input.sandbox_url,
	});

	if (error) {
		return { ok: false, error: error.message };
	}

	return { ok: true };
}

