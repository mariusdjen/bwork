"use server";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Resolves a set of user IDs to their name + email using the admin client.
 * Fetches only the users whose IDs are in the provided set (paginated).
 * Returns a Map<userId, { name, email }>.
 */
export async function resolveUserMap(
  userIds: Set<string>,
): Promise<Map<string, { name: string; email: string }>> {
  const map = new Map<string, { name: string; email: string }>();
  if (userIds.size === 0) return map;

  const admin = createAdminClient();

  // Paginate through users to avoid loading all users in memory
  let page = 1;
  const perPage = 100;
  let remaining = new Set(userIds);

  while (remaining.size > 0) {
    const { data: authData } = await admin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (!authData?.users || authData.users.length === 0) break;

    for (const u of authData.users) {
      if (remaining.has(u.id)) {
        map.set(u.id, {
          name:
            (u.user_metadata?.name as string) ||
            u.email?.split("@")[0] ||
            "Utilisateur",
          email: u.email || "",
        });
        remaining.delete(u.id);
      }
    }

    // If we found all users or no more pages, stop
    if (remaining.size === 0 || authData.users.length < perPage) break;
    page++;
  }

  return map;
}

/**
 * Looks up a single user by email using the admin client.
 * Returns the user object or null if not found.
 */
export async function findUserByEmail(
  email: string,
): Promise<{ id: string; email: string } | null> {
  const admin = createAdminClient();

  // Paginate to find the user — no filter API available on listUsers
  let page = 1;
  const perPage = 100;
  const normalizedEmail = email.toLowerCase();

  while (true) {
    const { data: authData } = await admin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (!authData?.users || authData.users.length === 0) return null;

    const found = authData.users.find(
      (u) => u.email?.toLowerCase() === normalizedEmail,
    );
    if (found) {
      return { id: found.id, email: found.email || "" };
    }

    if (authData.users.length < perPage) return null;
    page++;
  }
}
