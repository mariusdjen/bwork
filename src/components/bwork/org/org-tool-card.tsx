"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Power,
  PowerOff,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { updateToolVisibility } from "@/actions/org-actions";
import { disableTool, reactivateTool } from "@/actions/deploy-actions";
import { TOAST_DURATION_MS } from "@/lib/constants";
import type { OrgToolSummary } from "@/app/(app)/org/page";

const statusConfig: Record<
  OrgToolSummary["status"],
  { label: string; className: string }
> = {
  active: { label: "Actif", className: "bg-primary/10 text-primary" },
  generating: {
    label: "En génération",
    className: "bg-amber-500/10 text-amber-500 animate-pulse",
  },
  ready: { label: "Prêt", className: "bg-blue-500/10 text-blue-500" },
  draft: { label: "Brouillon", className: "bg-muted text-muted-foreground" },
  disabled: {
    label: "Désactivé",
    className: "bg-destructive/10 text-destructive",
  },
};

const accessConfig: Record<
  OrgToolSummary["access_type"],
  { label: string; className: string }
> = {
  public: { label: "Public", className: "bg-primary/10 text-primary" },
  restricted: {
    label: "Restreint",
    className: "bg-amber-500/10 text-amber-500",
  },
};

type OrgToolCardProps = {
  tool: OrgToolSummary;
};

export function OrgToolCard({ tool }: OrgToolCardProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const status = statusConfig[tool.status];
  const access = accessConfig[tool.access_type];

  const description =
    tool.description && tool.description.length > 80
      ? `${tool.description.slice(0, 80)}...`
      : tool.description;

  function handleCardClick() {
    router.push(`/tool/${tool.id}/preview`);
  }

  function handleToggleVisibility() {
    const newType = tool.access_type === "public" ? "restricted" : "public";
    startTransition(async () => {
      const result = await updateToolVisibility(tool.id, newType);
      if (result.success) {
        toast.success(result.success, { duration: TOAST_DURATION_MS });
      } else if (result.error) {
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

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => { if (e.key === "Enter") handleCardClick(); }}
      className="group cursor-pointer rounded-lg border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-md"
    >
      {/* Header: name + badges */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-card-foreground group-hover:text-primary">
          {tool.name}
        </h3>
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
              status.className,
            )}
          >
            {status.label}
          </span>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
              access.className,
            )}
          >
            {access.label}
          </span>
        </div>
      </div>

      {/* Creator */}
      <p className="mt-1 text-xs text-muted-foreground">
        par {tool.creator_name}
      </p>

      {/* Description */}
      {description && (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      )}

      {/* Admin actions */}
      <div className="mt-3 flex items-center gap-2">
        {/* Toggle visibility */}
        {tool.status === "active" && (
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={(e) => { e.stopPropagation(); handleToggleVisibility(); }}
            className="h-7 gap-1 text-xs"
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : tool.access_type === "public" ? (
              <EyeOff className="h-3 w-3" />
            ) : (
              <Eye className="h-3 w-3" />
            )}
            {tool.access_type === "public" ? "Restreindre" : "Rendre public"}
          </Button>
        )}

        {/* Disable */}
        {tool.status === "active" && (
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={(e) => { e.stopPropagation(); handleDisable(); }}
            className="h-7 gap-1 text-xs text-destructive hover:text-destructive"
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <PowerOff className="h-3 w-3" />
            )}
            Désactiver
          </Button>
        )}

        {/* Reactivate */}
        {tool.status === "disabled" && (
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={(e) => { e.stopPropagation(); handleReactivate(); }}
            className="h-7 gap-1 text-xs"
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Power className="h-3 w-3" />
            )}
            Réactiver
          </Button>
        )}
      </div>
    </div>
  );
}
