"use server";

import { createClient } from "@/utils/supabase/server";

export async function getUserGenerations() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { user: null, generations: [], error: "not-authenticated" } as const;
	}

	const { data, error } = await supabase
		.from("generations")
		.select("*")
		.eq("user_id", user.id)
		.order("created_at", { ascending: false })
		.limit(20);

	return {
		user,
		generations: data ?? [],
		error: error?.message ?? null,
	} as const;
}

