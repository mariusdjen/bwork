"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  Pencil,
  Rocket,
  Copy,
  Power,
  PowerOff,
  Play,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { disableTool, reactivateTool, getDeployLink } from "@/actions/deploy-actions";
import { TOAST_DURATION_MS } from "@/lib/constants";
import type { ToolSummary } from "@/app/(app)/dashboard/page";

type ToolActionsProps = {
  tool: ToolSummary;
};

export function ToolActions({ tool }: ToolActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showDisableDialog, setShowDisableDialog] = useState(false);

  function handleCopyLink() {
    startTransition(async () => {
      const result = await getDeployLink(tool.id);
      if (result?.link) {
        const fullUrl = `${window.location.origin}${result.link}`;
        await navigator.clipboard.writeText(fullUrl);
        toast.success("Lien copie !", { duration: TOAST_DURATION_MS });
      } else if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  function handleDisable() {
    startTransition(async () => {
      const result = await disableTool(tool.id);
      if (result?.success) {
        toast.success(result.success, { duration: TOAST_DURATION_MS });
      } else if (result?.error) {
        toast.error(result.error);
      }
      setShowDisableDialog(false);
    });
  }

  function handleReactivate() {
    startTransition(async () => {
      const result = await reactivateTool(tool.id);
      if (result?.success) {
        toast.success(result.success, { duration: TOAST_DURATION_MS });
      } else if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  // No actions for generating status
  if (tool.status === "generating") {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Draft → Continue creation */}
          {tool.status === "draft" && (
            <DropdownMenuItem asChild>
              <Link href={`/create/${tool.id}/guidance`}>
                <Pencil className="h-4 w-4" />
                Continuer la creation
              </Link>
            </DropdownMenuItem>
          )}

          {/* Ready → Launch generation */}
          {tool.status === "ready" && (
            <DropdownMenuItem asChild>
              <Link href={`/create/${tool.id}/generate`}>
                <Play className="h-4 w-4" />
                Lancer la generation
              </Link>
            </DropdownMenuItem>
          )}

          {/* Active (not deployed) → Deploy, Edit */}
          {tool.status === "active" && !tool.deployed_url && (
            <>
              <DropdownMenuItem asChild>
                <Link href={`/create/${tool.id}/preview`}>
                  <Rocket className="h-4 w-4" />
                  Deployer
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/create/${tool.id}/guidance/summary`}>
                  <Pencil className="h-4 w-4" />
                  Modifier
                </Link>
              </DropdownMenuItem>
            </>
          )}

          {/* Active (deployed) → Copy link, Disable, Edit */}
          {tool.status === "active" && tool.deployed_url && (
            <>
              <DropdownMenuItem onClick={handleCopyLink}>
                <Copy className="h-4 w-4" />
                Copier le lien
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/create/${tool.id}/guidance/summary`}>
                  <Pencil className="h-4 w-4" />
                  Modifier
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDisableDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <PowerOff className="h-4 w-4" />
                Desactiver
              </DropdownMenuItem>
            </>
          )}

          {/* Disabled → Reactivate */}
          {tool.status === "disabled" && (
            <DropdownMenuItem onClick={handleReactivate}>
              <Power className="h-4 w-4" />
              Reactiver
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Disable confirmation dialog */}
      <AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Desactiver {tool.name} ?</AlertDialogTitle>
            <AlertDialogDescription>
              L&apos;outil ne sera plus accessible via son lien de deploiement.
              Vous pourrez le reactiver a tout moment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisable}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PowerOff className="h-4 w-4" />
              )}
              Desactiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
