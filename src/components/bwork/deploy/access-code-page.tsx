"use client";

import { useActionState, useTransition } from "react";
import { Lock, Loader2 } from "lucide-react";
import { validateAccessCode } from "@/actions/deploy-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AccessCodePageProps = {
  slug: string;
  toolName: string;
};

export function AccessCodePage({ slug, toolName }: AccessCodePageProps) {
  const [state, formAction, isActionPending] = useActionState(
    async (_prev: { error?: string; success?: string } | null, formData: FormData) => {
      const code = formData.get("code") as string;
      const result = await validateAccessCode(slug, code);
      if (result?.success) {
        // Reload the page — the server will now find the access cookie
        window.location.reload();
        return result;
      }
      return result;
    },
    null,
  );
  const [isTransitioning, startTransition] = useTransition();
  const isPending = isActionPending || isTransitioning;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            B-WORK
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 text-center">
            <Lock className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <h1 className="text-lg font-semibold text-card-foreground">
              Acces restreint
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Saisissez le code d&apos;acces pour acceder a{" "}
              <span className="font-medium text-foreground">{toolName}</span>.
            </p>
          </div>

          <form
            action={(formData) => {
              startTransition(() => {
                formAction(formData);
              });
            }}
            className="flex flex-col gap-4"
          >
            <Input
              name="code"
              type="password"
              placeholder="Code d'acces"
              required
              minLength={4}
              autoFocus
              disabled={isPending}
            />

            {state?.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              Acceder
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
