import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CGV() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="size-4" />
              Retour
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">
          Conditions generales de vente
        </h1>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Article 1 — Objet
            </h2>
            <p>
              Les presentes Conditions Generales de Vente (CGV) regissent les
              conditions de souscription et de paiement des abonnements
              payants proposes par B-WORK SAS sur la plateforme b-work.fr.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Article 2 — Plans et tarifs
            </h2>
            <p>
              B-WORK propose plusieurs plans d&apos;abonnement dont les
              details (fonctionnalites, limites, tarifs) sont presentes sur la{" "}
              <Link
                href="/#pricing"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                page tarifs
              </Link>
              . Les prix sont indiques en euros hors taxes (HT) et toutes taxes
              comprises (TTC) selon la reglementation applicable.
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1">
              <li>
                <strong className="text-foreground">Gratuit :</strong> 0 EUR/mois
                — 3 outils actifs, 10 regenerations/mois
              </li>
              <li>
                <strong className="text-foreground">Pro :</strong> 29 EUR/mois —
                20 outils actifs, 100 regenerations/mois, support prioritaire
              </li>
              <li>
                <strong className="text-foreground">Business :</strong> 79
                EUR/mois — outils illimites, regenerations illimitees,
                accompagnement dedie
              </li>
              <li>
                <strong className="text-foreground">Enterprise :</strong> sur
                devis — configuration sur mesure, SLA garanti
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Article 3 — Souscription
            </h2>
            <p>
              La souscription a un plan payant s&apos;effectue en ligne via la
              plateforme. Le paiement est traite de maniere securisee par
              Stripe. B-WORK ne stocke aucune donnee de carte bancaire.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Article 4 — Facturation et paiement
            </h2>
            <p>
              Les abonnements sont factures mensuellement, a compter de la
              date de souscription. Le paiement est preleve automatiquement par
              carte bancaire via Stripe. En cas d&apos;echec du paiement,
              B-WORK se reserve le droit de suspendre l&apos;acces aux
              fonctionnalites premium apres notification.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Article 5 — Changement de plan
            </h2>
            <p>
              Vous pouvez changer de plan a tout moment depuis votre espace de
              facturation. En cas de passage a un plan superieur, le prorata
              est calcule automatiquement. En cas de passage a un plan
              inferieur, le changement prend effet a la fin de la periode de
              facturation en cours.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Article 6 — Droit de retractation
            </h2>
            <p>
              Conformement a l&apos;article L.221-28 du Code de la
              consommation, le droit de retractation ne s&apos;applique pas aux
              services pleinement executes avant la fin du delai de retractation
              et dont l&apos;execution a commence avec l&apos;accord expres du
              consommateur. En acceptant les presentes CGV et en utilisant
              immediatement le service, vous renoncez expressement a votre
              droit de retractation.
            </p>
            <p className="mt-3">
              Toutefois, B-WORK offre une garantie de satisfaction de 14 jours.
              Si vous n&apos;etes pas satisfait, contactez-nous a
              contact@b-work.fr pour un remboursement.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Article 7 — Resiliation
            </h2>
            <p>
              Vous pouvez resilier votre abonnement a tout moment depuis votre
              espace de facturation ou en contactant notre support. La
              resiliation prend effet a la fin de la periode de facturation en
              cours. Aucun remboursement au prorata n&apos;est effectue pour
              la periode en cours, sauf dans le cadre de la garantie de
              satisfaction (Article 6).
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Article 8 — Responsabilite
            </h2>
            <p>
              B-WORK s&apos;engage a fournir un service conforme aux
              descriptions de chaque plan. La responsabilite de B-WORK ne
              saurait exceder le montant total paye par le client au cours des
              12 derniers mois. B-WORK ne saurait etre tenu responsable des
              dommages indirects.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Article 9 — Modification des tarifs
            </h2>
            <p>
              B-WORK se reserve le droit de modifier ses tarifs. Les
              utilisateurs existants seront informes au moins 30 jours avant
              toute modification tarifaire. En cas de desaccord, le client peut
              resilier son abonnement avant l&apos;entree en vigueur des
              nouveaux tarifs.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Article 10 — Donnees personnelles
            </h2>
            <p>
              Le traitement des donnees personnelles liees a la facturation est
              decrit dans notre{" "}
              <Link
                href="/confidentialite"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Politique de confidentialite
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Article 11 — Droit applicable
            </h2>
            <p>
              Les presentes CGV sont soumises au droit francais. Pour les
              consommateurs, les dispositions du Code de la consommation
              s&apos;appliquent de plein droit. Tout litige sera soumis aux
              tribunaux competents de Paris, France.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Article 12 — Mediation
            </h2>
            <p>
              En cas de litige, vous pouvez recourir gratuitement a un
              mediateur de la consommation. Le mediateur competent sera
              communique sur simple demande a contact@b-work.fr.
            </p>
            <p className="mt-3 text-xs">
              Derniere mise a jour : fevrier 2026
            </p>
          </section>
        </div>
      </main>

      <footer className="mt-auto border-t border-border/60 bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-sm text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} B-WORK</span>
          <div className="flex gap-4">
            <Link href="/mentions-legales" className="hover:text-foreground">
              Mentions legales
            </Link>
            <Link href="/confidentialite" className="hover:text-foreground">
              Confidentialite
            </Link>
            <Link href="/cgu" className="hover:text-foreground">
              CGU
            </Link>
            <Link href="/cgv" className="hover:text-foreground">
              CGV
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
