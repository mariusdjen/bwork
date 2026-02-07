import type { Metadata } from "next";
import Link from "next/link";
import { PricingGrid } from "@/components/bwork/pricing/pricing-grid";

export const metadata: Metadata = {
  title: "Tarifs | B-WORK",
  description:
    "Choisissez le plan qui convient le mieux a vos besoins. Plans a partir de 0 euros.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Simple header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-foreground"
          >
            B-WORK
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Creer un compte
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground">
            Tarifs simples et transparents
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Choisissez le plan qui correspond a vos besoins. Changez de plan a
            tout moment, sans engagement.
          </p>
        </div>

        <PricingGrid />

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Tous les plans incluent les mises a jour et l&apos;acces a la
            plateforme. Pas de frais caches.
          </p>
        </div>
      </main>
    </div>
  );
}
