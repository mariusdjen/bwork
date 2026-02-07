import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ToolSummary } from "@/app/(app)/dashboard/page";
import { ToolActions } from "@/components/bwork/dashboard/tool-actions";

const statusConfig: Record<
  ToolSummary["status"],
  { label: string; className: string }
> = {
  active: {
    label: "Actif",
    className: "bg-primary/10 text-primary",
  },
  generating: {
    label: "En generation",
    className: "bg-amber-500/10 text-amber-500 animate-pulse",
  },
  ready: {
    label: "Pret",
    className: "bg-blue-500/10 text-blue-500",
  },
  draft: {
    label: "Brouillon",
    className: "bg-muted text-muted-foreground",
  },
  disabled: {
    label: "Desactive",
    className: "bg-destructive/10 text-destructive",
  },
};

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return "Maintenant";

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30)
    return `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? "s" : ""}`;
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type ToolCardProps = {
  tool: ToolSummary;
};

export function ToolCard({ tool }: ToolCardProps) {
  const status = statusConfig[tool.status];
  const description =
    tool.description && tool.description.length > 80
      ? `${tool.description.slice(0, 80)}...`
      : tool.description;

  return (
    <Link href={`/create/${tool.id}/preview`} className="block">
      <div className="group rounded-lg border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-md">
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
            <ToolActions tool={tool} />
          </div>
        </div>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          {formatRelativeDate(tool.created_at)}
        </p>
      </div>
    </Link>
  );
}
