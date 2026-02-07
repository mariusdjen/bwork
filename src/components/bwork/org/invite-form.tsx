"use client";

import { useState, useTransition } from "react";
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { inviteMember } from "@/actions/org-actions";
import { TOAST_DURATION_MS } from "@/lib/constants";

export function InviteForm() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "collaborateur">("collaborateur");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Veuillez saisir un email valide.");
      return;
    }

    startTransition(async () => {
      const result = await inviteMember(email, role);
      if (result.success) {
        toast.success(result.success, { duration: TOAST_DURATION_MS });
        setEmail("");
        setRole("collaborateur");
        setOpen(false);
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <UserPlus className="h-4 w-4" />
          Inviter un membre
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Inviter un membre</DialogTitle>
            <DialogDescription>
              L&apos;utilisateur doit déjà avoir un compte B-WORK.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-col gap-4">
            <div>
              <label
                htmlFor="invite-email"
                className="mb-1.5 block text-sm font-medium"
              >
                Email
              </label>
              <input
                id="invite-email"
                type="email"
                required
                placeholder="collègue@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isPending}
              />
            </div>

            <div>
              <label
                htmlFor="invite-role"
                className="mb-1.5 block text-sm font-medium"
              >
                Rôle
              </label>
              <select
                id="invite-role"
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as "admin" | "collaborateur")
                }
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary [&>option]:bg-background [&>option]:text-foreground"
                disabled={isPending}
              >
                <option value="collaborateur">Collaborateur</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Envoyer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
