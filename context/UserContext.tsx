"use client";

import { createClient } from "@/utils/supabase/client";
import { getUser } from "@/actions/authHelpers";
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/users";

// -------------------------------
// TYPES
// -------------------------------
interface SessionContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
}

// -------------------------------
// CONTEXT
// -------------------------------
const SessionContext = createContext<SessionContextType>({
  user: null,
  profile: null,
  loading: true,
  isAuthenticated: false,
});

// -------------------------------
// PROVIDER COMBINÉ
// -------------------------------
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // 1) Fetch initial data (user + profile)
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { user: fetchedUser, profile } = await getUser();
        setUser(fetchedUser ?? null);
        setProfile(profile);
      } catch (e) {
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // 2) Live Listener (login/logout en temps réel)
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const authUser = session?.user ?? null;
        setUser(authUser);

        // Si l'utilisateur existe → recharger son profil
        if (authUser) {
          const { profile } = await getUser();
          setProfile(profile);
        } else {
          setProfile(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const isAuthenticated = useMemo(() => !!user, [user]);

  const value = useMemo(
    () => ({ user, profile, loading, isAuthenticated }),
    [user, profile, loading, isAuthenticated]
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

// -------------------------------
// HOOK
// -------------------------------
export function useUser() {
  return useContext(SessionContext);
}
