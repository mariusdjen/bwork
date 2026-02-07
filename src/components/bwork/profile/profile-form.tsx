"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateProfile } from "@/actions/profile-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ProfileFormProps = {
  defaultName: string;
};

export function ProfileForm({ defaultName }: ProfileFormProps) {
  const [state, action, isPending] = useActionState(updateProfile, null);

  useEffect(() => {
    if (state?.success) toast.success(state.success);
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-card-foreground">
        Modifier le nom
      </h2>
      <form action={action} className="mt-4 flex flex-col gap-4">
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Nom d&apos;affichage
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            defaultValue={defaultName}
            required
            maxLength={100}
          />
          {state?.fieldErrors?.name && (
            <p className="mt-1 text-sm text-destructive">
              {state.fieldErrors.name[0]}
            </p>
          )}
        </div>
        <Button type="submit" disabled={isPending} className="self-start">
          {isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </form>
    </div>
  );
}
