import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CGU() {
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
          Conditions generales d&apos;utilisation
        </h1>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Article 1 — Objet
            </h2>
            <p>
              Les presentes Conditions Generales d&apos;Utilisation (CGU)
              definissent les modalites d&apos;acces et d&apos;utilisation de
              la plateforme B-WORK, accessible a l&apos;adresse b-work.fr et
              ses sous-domaines. En utilisant la plateforme, vous acceptez les
              presentes CGU dans leur integralite.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Article 2 — Definitions
            </h2>
            <ul className="list-inside list-disc space-y-1">
              <li>
                <strong className="text-foreground">Plateforme :</strong> le
                service en ligne B-WORK accessible via navigateur web
              </li>
              <li>
                <strong className="text-foreground">Utilisateur :</strong>{" "}
                toute personne physique ou morale inscrite sur la plateforme
              </li>
              <li>
                <strong className="text-foreground">Outil :</strong> une
                application web generee par l&apos;IA via la plateforme B-WORK
              </li>
              <li>
                <strong className="text-foreground">Contenu :</strong> tout
                element (texte, donnees, fichiers) cree ou importe par
                l&apos;utilisateur
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Article 3 — Inscription et compte
            </h2>
            <p>
              L&apos;utilisation de B-WORK necessite la creation d&apos;un
              compte. Vous vous engagez a fournir des informations exactes et a
              jour, et a preserver la confidentialite de vos identifiants. Vous
              etes responsable de toute activite effectuee depuis votre compte.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Article 4 — Description du service
            </h2>
            <p>
              B-WORK permet aux utilisateurs de creer des outils web internes
              grace a l&apos;intelligence artificielle generative. Le service
              inclut : la description du besoin metier, la modelisation des
              donnees, la configuration de regles metier, la generation de code,
              la previsualisation et le deploiement des outils.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Article 5 — Obligations de l&apos;utilisateur
            </h2>
            <p>L&apos;utilisateur s&apos;engage a :</p>
            <ul className="mt-3 list-inside list-disc space-y-1">
              <li>Utiliser la plateforme de maniere licite et loyale</li>
              <li>
                Ne pas utiliser le service pour generer des contenus illicites,
                discriminatoires, diffamatoires ou contraires a l&apos;ordre
                public
              </li>
              <li>
                Ne pas tenter de contourner les limites techniques ou
                tarifaires de son plan
              </li>
              <li>
                Ne pas effectuer d&apos;operations susceptibles de nuire au bon
                fonctionnement de la plateforme
              </li>
              <li>Respecter les droits de propriete intellectuelle des tiers</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Article 6 — Propriete intellectuelle
            </h2>
            <p>
              La plateforme B-WORK, son interface, son code source et ses
              algorithmes sont la propriete exclusive de B-WORK SAS. Les outils
              generes par l&apos;utilisateur via la plateforme appartiennent a
              l&apos;utilisateur, sous reserve du respect des presentes CGU et
              des droits des tiers.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Article 7 — Disponibilite du service
            </h2>
            <p>
              B-WORK s&apos;efforce d&apos;assurer la disponibilite du service
              24h/24 et 7j/7. Toutefois, des interruptions pour maintenance,
              mise a jour ou cas de force majeure peuvent survenir. B-WORK ne
              saurait etre tenu responsable des dommages resultant de
              l&apos;indisponibilite temporaire du service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Article 8 — Limitation de responsabilite
            </h2>
            <p>
              B-WORK fournit un service de generation d&apos;outils par IA.
              Les outils generes sont fournis en l&apos;etat. B-WORK ne
              garantit pas l&apos;adequation des outils generes a un usage
              particulier. La responsabilite de B-WORK est limitee au montant
              des sommes versees par l&apos;utilisateur au cours des 12 derniers
              mois.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Article 9 — Donnees personnelles
            </h2>
            <p>
              Le traitement des donnees personnelles est decrit dans notre{" "}
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
              Article 10 — Resiliation
            </h2>
            <p>
              L&apos;utilisateur peut supprimer son compte a tout moment.
              B-WORK se reserve le droit de suspendre ou supprimer un compte en
              cas de manquement aux presentes CGU, apres notification prealable
              sauf en cas d&apos;urgence.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Article 11 — Modification des CGU
            </h2>
            <p>
              B-WORK se reserve le droit de modifier les presentes CGU. Les
              utilisateurs seront informes des modifications substantielles par
              email ou notification dans l&apos;application. La poursuite de
              l&apos;utilisation du service vaut acceptation des nouvelles CGU.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Article 12 — Droit applicable et juridiction
            </h2>
            <p>
              Les presentes CGU sont soumises au droit francais. Tout litige
              relatif a l&apos;utilisation de la plateforme sera soumis aux
              tribunaux competents de Paris, France.
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
