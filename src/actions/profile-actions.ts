"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validations/auth";
import { type ActionState, toFieldErrors } from "@/lib/actions/shared";

export async function updateProfile(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = { name: (formData.get("name") as string) ?? "" };

  const result = profileSchema.safeParse(raw);
  if (!result.success) {
    return { fieldErrors: toFieldErrors(result.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: { name: result.data.name },
  });

  if (error) {
    return { error: "Impossible de mettre a jour le profil." };
  }

  revalidatePath("/", "layout");
  return { success: "Profil mis a jour." };
}
