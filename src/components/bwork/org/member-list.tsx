"use client";

import { useState, useTransition } from "react";
import { Mail, Loader2, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { updateMemberRole, removeMember } from "@/actions/org-actions";
import { TOAST_DURATION_MS } from "@/lib/constants";
import type { OrgMember } from "@/app/(app)/org/page";
import { RoleBadge } from "@/components/bwork/org/role-badge";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Invitation en attente";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type MemberCardProps = {
  member: OrgMember;
  isCurrentUser: boolean;
};

function MemberCard({ member, isCurrentUser }: MemberCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  function handleRoleChange(newRole: "admin" | "collaborateur") {
    if (newRole === member.role) return;
    startTransition(async () => {
      const result = await updateMemberRole(member.id, newRole);
      if (result.success) {
        toast.success(result.success, { duration: TOAST_DURATION_MS });
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removeMember(member.id);
      if (result.success) {
        toast.success(result.success, { duration: TOAST_DURATION_MS });
      } else if (result.error) {
        toast.error(result.error);
      }
      setShowRemoveDialog(false);
    });
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-card-foreground truncate">
              {member.name}
              {isCurrentUser && (
                <span className="ml-1.5 text-xs text-muted-foreground">
                  (vous)
                </span>
              )}
            </p>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{member.email}</span>
            </div>
          </div>
          {isCurrentUser ? (
            <RoleBadge role={member.role} />
          ) : (
            <select
              value={member.role}
              onChange={(e) =>
                handleRoleChange(e.target.value as "admin" | "collaborateur")
              }
              disabled={isPending}
              className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary [&>option]:bg-background [&>option]:text-foreground"
            >
              <option value="admin">Admin</option>
              <option value="collaborateur">Collaborateur</option>
            </select>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {member.joined_at
              ? `Membre depuis ${formatDate(member.joined_at)}`
              : `Invité le ${formatDate(member.invited_at)}`}
          </p>
          {!isCurrentUser && (
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => setShowRemoveDialog(true)}
              className="h-7 gap-1 text-xs text-destructive hover:text-destructive"
            >
              {isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <UserMinus className="h-3 w-3" />
              )}
              Retirer
            </Button>
          )}
        </div>
      </div>

      {/* Remove confirmation dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer {member.name} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Ce membre n&apos;aura plus accès aux outils de l&apos;organisation.
              Vous pourrez le réinviter à tout moment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserMinus className="h-4 w-4" />
              )}
              Retirer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

type MemberListProps = {
  members: OrgMember[];
  currentUserId: string;
};

export function MemberList({ members, currentUserId }: MemberListProps) {
  if (members.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Aucun membre dans l&apos;organisation.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => (
        <MemberCard
          key={member.id}
          member={member}
          isCurrentUser={member.user_id === currentUserId}
        />
      ))}
    </div>
  );
}
