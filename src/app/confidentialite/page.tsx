import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Confidentialite() {
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
          Politique de confidentialite
        </h1>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Introduction
            </h2>
            <p>
              B-WORK SAS s&apos;engage a proteger la vie privee de ses
              utilisateurs. La presente politique de confidentialite decrit les
              donnees personnelles que nous collectons, comment nous les
              utilisons et les droits dont vous disposez conformement au
              Reglement General sur la Protection des Donnees (RGPD).
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Responsable du traitement
            </h2>
            <p>
              Le responsable du traitement est B-WORK SAS, joignable a
              l&apos;adresse : contact@b-work.fr
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Donnees collectees
            </h2>
            <p>Nous collectons les donnees suivantes :</p>
            <ul className="mt-3 list-inside list-disc space-y-1">
              <li>
                Donnees d&apos;inscription : adresse email, nom, mot de passe
                (hache)
              </li>
              <li>
                Donnees de profil : nom de l&apos;organisation, plan
                d&apos;abonnement
              </li>
              <li>
                Donnees d&apos;utilisation : outils crees, generations
                effectuees, logs techniques
              </li>
              <li>
                Donnees de paiement : traitees par Stripe (nous ne stockons
                jamais vos numeros de carte)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Finalites du traitement
            </h2>
            <ul className="list-inside list-disc space-y-1">
              <li>Fourniture et amelioration du service B-WORK</li>
              <li>Gestion de votre compte utilisateur</li>
              <li>Facturation et gestion des abonnements</li>
              <li>Support technique</li>
              <li>
                Communication relative au service (mises a jour, incidents)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Base legale
            </h2>
            <p>
              Les traitements sont fondes sur l&apos;execution du contrat
              (fourniture du service), votre consentement (inscription), et nos
              obligations legales (facturation, comptabilite).
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Duree de conservation
            </h2>
            <p>
              Vos donnees sont conservees pendant toute la duree de votre
              compte actif, puis pendant 3 ans apres la suppression du compte
              pour les obligations legales de facturation. Les logs techniques
              sont conserves 12 mois maximum.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Sous-traitants
            </h2>
            <ul className="list-inside list-disc space-y-1">
              <li>Supabase Inc. — hebergement de la base de donnees (AWS EU)</li>
              <li>Vercel Inc. — hebergement de l&apos;application web</li>
              <li>Stripe Inc. — traitement des paiements</li>
              <li>
                Anthropic / OpenAI / Google — generation IA (les prompts
                envoyes ne contiennent pas de donnees personnelles)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Transferts hors UE
            </h2>
            <p>
              Certains sous-traitants (Vercel, Stripe, Anthropic) sont etablis
              aux Etats-Unis. Ces transferts sont encadres par les clauses
              contractuelles types de la Commission europeenne et/ou le Data
              Privacy Framework.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Vos droits
            </h2>
            <p>
              Conformement au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1">
              <li>Droit d&apos;acces a vos donnees personnelles</li>
              <li>Droit de rectification</li>
              <li>Droit a l&apos;effacement (droit a l&apos;oubli)</li>
              <li>Droit a la portabilite</li>
              <li>Droit d&apos;opposition</li>
              <li>Droit a la limitation du traitement</li>
            </ul>
            <p className="mt-3">
              Pour exercer ces droits, contactez-nous a : contact@b-work.fr.
              Vous pouvez egalement introduire une reclamation aupres de la
              CNIL (www.cnil.fr).
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Securite
            </h2>
            <p>
              Nous mettons en oeuvre des mesures techniques et
              organisationnelles appropriees pour proteger vos donnees :
              chiffrement HTTPS, hachage des mots de passe, controles
              d&apos;acces, Row Level Security (RLS) sur la base de donnees.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Modification de cette politique
            </h2>
            <p>
              Cette politique peut etre mise a jour. En cas de modification
              substantielle, nous vous en informerons par email ou via une
              notification dans l&apos;application.
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
