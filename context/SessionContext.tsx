"use client";

import { Profile } from "@/types/users";
import { User } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
import { createContext, useState, useContext, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";

type SessionContextType = {
	user: User | null;
	isAuthenticated: boolean;
	loading: boolean;
	profile: Profile | null;
};

const SessionContext = createContext<SessionContextType>({
	user: null,
	isAuthenticated: false,
	loading: true,
	profile: null,
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState(true);
	const pathname = usePathname();

	useEffect(() => {
		async function fetchUserData() {
			setLoading(true);
			try {
				const supabase = createClient();
				const { data: userData, error: userError } =
					await supabase.auth.getUser();

				if (userError || !userData.user) {
					setUser(null);
					setProfile(null);
					return;
				}

				setUser(userData.user);

				const { data: profileData, error: profileError } = await supabase
					.from("users")
					.select("*")
					.eq("id", userData.user.id)
					.single();

				if (profileError) {
					setProfile(null);
					return;
				}

				setProfile(profileData as Profile);
			} catch {
				setUser(null);
				setProfile(null);
			} finally {
				setLoading(false);
			}
		}

		fetchUserData();
	}, [pathname]);

	const isAuthenticated = useMemo(() => !!user, [user]);
	const displayName = useMemo(() => {
		if (profile?.first_name || profile?.last_name) {
			return `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim();
		}
		return user?.email ?? null;
	}, [profile, user]);

	const contextValue = useMemo(
		() => ({ user, isAuthenticated, loading, profile, displayName }),
		[user, isAuthenticated, loading, profile, displayName]
	);

	return (
		<SessionContext.Provider value={contextValue}>
			{children}
		</SessionContext.Provider>
	);
}

export function useSession() {
	return useContext(SessionContext);
}
