import { User } from "@supabase/supabase-js";

export type GuardResult = {
	user: User | null;
};
