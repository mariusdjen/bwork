import { atom } from "jotai";
import type { Database } from "@/types/database";

// Hydration: These atoms are populated by client components that receive
// server-fetched data via props (e.g., from (app)/layout.tsx).
// Hydration will be added when client components need reactive session state.

type User = {
  id: string;
  email?: string;
  user_metadata?: { name?: string };
};

type Organization = Database["public"]["Tables"]["organizations"]["Row"];

export const userAtom = atom<User | null>(null);
export const orgAtom = atom<Organization | null>(null);
