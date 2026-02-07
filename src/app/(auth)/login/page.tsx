"use client";

import { Suspense, useActionState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/actions/auth-actions";

function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, null);
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");
  const authError = searchParams.get("error");
  const isPaidPlan = plan === "pro" || plan === "business";

  // Build redirectTo so the plan param survives login
  const redirectTo = isPaidPlan ? `/dashboard?plan=${plan}` : "";

  useEffect(() => {
    if (isPaidPlan) {
      localStorage.setItem("pendingPlan", plan);
    }
  }, [isPaidPlan, plan]);

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-6 text-center text-xl font-semibold text-card-foreground">
        Se connecter
      </h2>

      {isPaidPlan && (
        <div className="mb-4 rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
          Vous avez choisi le plan{" "}
          <strong>{plan === "pro" ? "Pro" : "Business"}</strong>. Connectez-vous
          pour continuer.
        </div>
      )}

      {authError === "auth" && (
        <p className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          Erreur d&apos;authentification. Veuillez reessayer.
        </p>
      )}

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-sm font-medium text-foreground"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="vous@exemple.com"
          />
          {state?.fieldErrors?.email && (
            <p className="text-sm text-destructive">
              {state.fieldErrors.email[0]}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="••••••"
          />
          {state?.fieldErrors?.password && (
            <p className="text-sm text-destructive">
              {state.fieldErrors.password[0]}
            </p>
          )}
        </div>

        {state?.error && (
          <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link
          href={isPaidPlan ? `/signup?plan=${plan}` : "/signup"}
          className="text-primary underline-offset-4 hover:underline"
        >
          S&apos;inscrire
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
