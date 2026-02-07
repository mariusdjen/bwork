import { cn } from "@/lib/utils";

const roleConfig = {
  admin: { label: "Admin", className: "bg-primary/10 text-primary" },
  collaborateur: {
    label: "Collaborateur",
    className: "bg-muted text-muted-foreground",
  },
} as const;

type RoleBadgeProps = {
  role: "admin" | "collaborateur";
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const config = roleConfig[role];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}
