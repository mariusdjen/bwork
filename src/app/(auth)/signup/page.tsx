"use client";

import { Suspense, useActionState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/actions/auth-actions";

function SignupForm() {
  const [state, formAction, pending] = useActionState(signUp, null);
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");
  const isPaidPlan = plan === "pro" || plan === "business";

  useEffect(() => {
    if (isPaidPlan) {
      localStorage.setItem("pendingPlan", plan);
    }
  }, [isPaidPlan, plan]);

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-6 text-center text-xl font-semibold text-card-foreground">
        Creer un compte
      </h2>

      {isPaidPlan && (
        <div className="mb-4 rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
          Vous avez choisi le plan{" "}
          <strong>{plan === "pro" ? "Pro" : "Business"}</strong>. Creez votre
          compte pour continuer.
        </div>
      )}

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="pendingPlan" value={plan || ""} />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Nom
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Votre nom"
          />
          {state?.fieldErrors?.name && (
            <p className="text-sm text-destructive">
              {state.fieldErrors.name[0]}
            </p>
          )}
        </div>

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
            autoComplete="new-password"
            required
            className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Min. 6 caracteres"
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

        {state?.success && (
          <p className="rounded-md bg-primary/10 p-3 text-sm text-primary">
            {state.success}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? "Creation..." : "S'inscrire"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Deja un compte ?{" "}
        <Link
          href={isPaidPlan ? `/login?plan=${plan}` : "/login"}
          className="text-primary underline-offset-4 hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
