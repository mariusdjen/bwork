"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signupSchema, loginSchema } from "@/lib/validations/auth";
import { ErrorCode, getErrorMessage } from "@/lib/errors";
import { type ActionState, toFieldErrors } from "@/lib/actions/shared";

function safeRedirectPath(value: string | null, fallback: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  return value;
}

export async function signUp(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    name: formData.get("name") as string,
  };

  const result = signupSchema.safeParse(raw);
  if (!result.success) {
    return { fieldErrors: toFieldErrors(result.error) };
  }

  const { email, password, name } = result.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "Un compte existe deja avec cet email." };
    }
    return { error: getErrorMessage(ErrorCode.AUTH_INVALID_CREDENTIALS) };
  }

  // If email confirmation is required, session will be null
  if (!data.session) {
    return {
      success:
        "Compte cree ! Verifiez votre email pour confirmer votre inscription.",
    };
  }

  // Create organization automatically for the new user
  if (data.user) {
    const slugBase =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "org";

    const uniqueSuffix = crypto.randomUUID().slice(0, 8);

    const { error: orgError } = await supabase.from("organizations").insert({
      name: `Org de ${name}`,
      slug: `${slugBase}-${uniqueSuffix}`,
    });

    if (orgError) {
      console.error("[B-WORK:auth] Failed to create organization:", orgError.message);
      return {
        error:
          "Votre compte a ete cree mais l'organisation n'a pas pu etre creee. Reconnectez-vous.",
      };
    }
  }

  // Preserve pending plan selection through redirect
  const pendingPlan = formData.get("pendingPlan") as string;
  const isPaidPlan = pendingPlan === "pro" || pendingPlan === "business";
  redirect(isPaidPlan ? `/dashboard?plan=${pendingPlan}` : "/dashboard");
}

export async function signIn(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const result = loginSchema.safeParse(raw);
  if (!result.success) {
    return { fieldErrors: toFieldErrors(result.error) };
  }

  const { email, password } = result.data;
  const redirectTo = safeRedirectPath(
    formData.get("redirectTo") as string,
    "/dashboard"
  );

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes("Email not confirmed")) {
      return { error: getErrorMessage(ErrorCode.AUTH_EMAIL_NOT_CONFIRMED) };
    }
    return { error: getErrorMessage(ErrorCode.AUTH_INVALID_CREDENTIALS) };
  }

  redirect(redirectTo);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
