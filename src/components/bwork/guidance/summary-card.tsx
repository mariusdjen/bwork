"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SummaryCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
};

export function SummaryCard({ icon: Icon, title, description, href }: SummaryCardProps) {
  const content = (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-colors",
        href ? "cursor-pointer hover:border-primary/50 hover:bg-accent/50" : "opacity-75",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
        </div>
        {href && (
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            Modifier
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label={`Modifier : ${title}`}>
        {content}
      </Link>
    );
  }

  return <div aria-label={title}>{content}</div>;
}
