import { cn } from "@/lib/utils";

type ProfileInfoProps = {
  email: string;
  role: "admin" | "collaborateur" | null;
  orgName: string | null;
};

const roleConfig: Record<string, { label: string; className: string }> = {
  admin: {
    label: "Admin",
    className: "bg-primary/10 text-primary",
  },
  collaborateur: {
    label: "Collaborateur",
    className: "bg-muted text-muted-foreground",
  },
};

export function ProfileInfo({ email, role, orgName }: ProfileInfoProps) {
  const roleDisplay = role ? roleConfig[role] : null;

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-card-foreground">
        Informations
      </h2>
      <dl className="mt-4 flex flex-col gap-3">
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Email</dt>
          <dd className="text-sm text-card-foreground">{email}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Role</dt>
          <dd>
            {roleDisplay ? (
              <span
                className={cn(
                  "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                  roleDisplay.className,
                )}
              >
                {roleDisplay.label}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">
            Organisation
          </dt>
          <dd className="text-sm text-card-foreground">
            {orgName ?? "Aucune organisation"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
