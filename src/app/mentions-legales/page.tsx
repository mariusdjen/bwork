import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MentionsLegales() {
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
          Mentions legales
        </h1>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Editeur du site
            </h2>
            <p>
              Le site B-WORK est edite par la societe B-WORK SAS, au capital de
              1 000 euros, immatriculee au Registre du Commerce et des Societes
              de Paris.
            </p>
            <ul className="mt-3 space-y-1">
              <li>Siege social : Paris, France</li>
              <li>Email : contact@b-work.fr</li>
              <li>Directeur de la publication : Le representant legal de B-WORK SAS</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Hebergement
            </h2>
            <p>
              Le site est heberge par Vercel Inc., 340 S Lemon Ave #4133,
              Walnut, CA 91789, USA. Les donnees applicatives sont hebergees par
              Supabase Inc. (infrastructure AWS, region Europe — eu-west).
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Propriete intellectuelle
            </h2>
            <p>
              L&apos;ensemble des contenus presents sur le site B-WORK
              (textes, images, logos, logiciels, base de donnees) sont proteges
              par le droit d&apos;auteur et le droit de la propriete
              intellectuelle. Toute reproduction, meme partielle, est interdite
              sans autorisation prealable ecrite.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Responsabilite
            </h2>
            <p>
              B-WORK s&apos;efforce d&apos;assurer l&apos;exactitude des
              informations diffusees sur le site. Toutefois, B-WORK ne peut
              garantir l&apos;exactitude, la completude ou l&apos;actualite des
              informations mises a disposition. L&apos;utilisation du site se
              fait sous la seule responsabilite de l&apos;utilisateur.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Cookies
            </h2>
            <p>
              Le site utilise des cookies strictement necessaires au
              fonctionnement du service (authentification, session). Aucun
              cookie publicitaire ou de pistage n&apos;est utilise.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Contact
            </h2>
            <p>
              Pour toute question relative aux mentions legales, vous pouvez
              nous contacter a l&apos;adresse : contact@b-work.fr
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
