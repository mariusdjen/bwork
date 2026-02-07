"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type UseCaseCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export function UseCaseCard({
  icon: Icon,
  title,
  description,
  selected,
  disabled,
  onClick,
}: UseCaseCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 text-center transition-all hover:border-primary hover:shadow-md",
        selected && "border-primary ring-2 ring-primary/20",
      )}
    >
      <Icon className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
      <h3 className="font-semibold text-card-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </button>
  );
}
