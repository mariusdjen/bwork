import { GuardResult } from "@/types/guards";
import { createClient } from "@/utils/supabase/server";

export async function getAuth(): Promise<GuardResult> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	return {
		user: user ?? null,
	};
}
