// actions/authHelpers.ts
"use server";
import { Profile } from "@/types/users";
import { createClient } from "@/utils/supabase/server";

export async function getSupabaseAndUser() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();


	return { supabase, user: user ?? null } as const;
}

export async function getUser() {
	const { supabase, user } = await getSupabaseAndUser();
	if (supabase && user) {
		const { data } = await supabase
			.from("users")
			.select("*")
			.eq("id", user.id)
			.single();
		const profile = data as Profile | null;
		
		return { user, profile } as const;
	}

	return { user, profile: null } as const;
}
