import Link from "next/link";
import { PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
      <PackagePlus className="h-12 w-12 text-muted-foreground" />
      <h2 className="mt-4 text-lg font-semibold text-foreground">
        Vous n&apos;avez pas encore d&apos;outils.
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Creez votre premier en quelques minutes.
      </p>
      <Button asChild className="mt-6">
        <Link href="/create/start">
          <PackagePlus className="h-4 w-4" />
          Creer mon premier outil
        </Link>
      </Button>
    </div>
  );
}
