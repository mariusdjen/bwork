import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Shield,
  LayoutDashboard,
  Database,
  Bot,
  Rocket,
  CheckCircle2,
  ChevronRight,
  Users,
  Clock,
  TrendingUp,
  Star,
  HelpCircle,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingGrid } from "@/components/bwork/pricing/pricing-grid";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const features = [
  {
    icon: Bot,
    title: "Generation par IA",
    description:
      "Decrivez votre besoin metier et l'IA genere une application web complete, prete a l'emploi.",
  },
  {
    icon: Database,
    title: "Modelisation des donnees",
    description:
      "Definissez vos entites, champs et relations a travers un assistant guide, sans ecrire une ligne de code.",
  },
  {
    icon: Shield,
    title: "Regles metier",
    description:
      "Configurez des validations, conditions et automatisations qui refletent votre logique d'entreprise.",
  },
  {
    icon: LayoutDashboard,
    title: "Interface intuitive",
    description:
      "Chaque outil genere dispose d'un tableau de bord, de formulaires et de vues adaptes a votre cas d'usage.",
  },
  {
    icon: Zap,
    title: "Deploiement instantane",
    description:
      "Publiez vos outils en un clic et partagez-les avec votre equipe via un lien unique.",
  },
  {
    icon: Rocket,
    title: "Multi-fournisseur IA",
    description:
      "Tirez parti de Claude, GPT, Gemini ou Llama pour une generation optimale selon vos besoins.",
  },
];

const steps = [
  {
    number: "01",
    title: "Decrivez votre besoin",
    description:
      "Choisissez un cas d'usage (CRM, inventaire, suivi de projet...) et personnalisez-le selon votre contexte.",
  },
  {
    number: "02",
    title: "Definissez vos donnees",
    description:
      "L'assistant vous guide pour structurer vos entites, champs et regles metier etape par etape.",
  },
  {
    number: "03",
    title: "Generez et deploiez",
    description:
      "L'IA construit votre application. Previsualisez, ajustez et publiez en quelques minutes.",
  },
];

const stats = [
  { value: "+500", label: "Outils crees", icon: TrendingUp },
  { value: "3 min", label: "Temps moyen de deploiement", icon: Clock },
  { value: "98%", label: "Taux de satisfaction", icon: Star },
  { value: "+200", label: "Entreprises utilisatrices", icon: Users },
];

const testimonials = [
  {
    quote:
      "B-WORK nous a permis de remplacer nos fichiers Excel par de vrais outils en moins d'une heure. C'est exactement ce dont nos equipes avaient besoin.",
    name: "Marie Durand",
    role: "Directrice des Operations",
    company: "LogiPME",
    initials: "MD",
  },
  {
    quote:
      "Sans aucune competence technique, j'ai cree un outil de suivi de devis qui a reduit notre temps de traitement de 60%. Impressionnant.",
    name: "Thomas Lefebvre",
    role: "Gerant",
    company: "Lefebvre Consulting",
    initials: "TL",
  },
  {
    quote:
      "On a teste plusieurs solutions no-code. B-WORK est la seule qui comprend vraiment les besoins des PME francaises. L'IA fait un travail remarquable.",
    name: "Sophie Martin",
    role: "Responsable IT",
    company: "Groupe Artisan+",
    initials: "SM",
  },
];

const faqs = [
  {
    question: "Est-ce vraiment gratuit pour commencer ?",
    answer:
      "Oui, le plan Gratuit vous permet de creer jusqu'a 3 outils actifs sans limite de temps. Aucune carte bancaire n'est requise pour demarrer.",
  },
  {
    question: "Mes donnees sont-elles securisees ?",
    answer:
      "Absolument. Vos donnees sont hebergees en Europe sur des serveurs securises (Supabase / AWS). Toutes les communications sont chiffrees en HTTPS et nous respectons le RGPD.",
  },
  {
    question: "Puis-je changer de plan a tout moment ?",
    answer:
      "Oui, vous pouvez passer a un plan superieur ou inferieur a tout moment depuis votre espace de facturation. Le changement est effectif immediatement avec un prorata automatique.",
  },
  {
    question: "Ai-je besoin de competences techniques ?",
    answer:
      "Non. B-WORK est concu pour les equipes non-techniques. L'assistant vous guide etape par etape et l'IA se charge de generer le code de votre application.",
  },
  {
    question: "Que se passe-t-il si je depasse la limite de mon plan ?",
    answer:
      "Vous recevrez une notification et pourrez soit passer au plan superieur, soit desactiver des outils existants pour liberer de la place.",
  },
  {
    question: "Proposez-vous un accompagnement ?",
    answer:
      "Le plan Pro inclut un support prioritaire par email. Les plans Business et Enterprise beneficient d'un accompagnement dedie et d'un SLA garanti.",
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-bold tracking-tight">
            B-WORK
          </Link>
          <nav className="hidden items-center gap-8 text-sm md:flex">
            <a
              href="#features"
              className="text-muted-foreground transition hover:text-foreground"
            >
              Fonctionnalites
            </a>
            <a
              href="#how"
              className="text-muted-foreground transition hover:text-foreground"
            >
              Comment ca marche
            </a>
            <a
              href="#pricing"
              className="text-muted-foreground transition hover:text-foreground"
            >
              Tarifs
            </a>
            <a
              href="#faq"
              className="text-muted-foreground transition hover:text-foreground"
            >
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Connexion</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">
                Commencer
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 pb-24 pt-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Zap className="size-3.5" />
            Plateforme no-code propulsee par l&apos;IA
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Creez vos outils web internes{" "}
            <span className="text-primary">sans ecrire de code</span>
          </h1>

          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Decrivez votre besoin metier, definissez vos donnees et regles, et
            laissez l&apos;IA generer une application complete pour votre
            equipe.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="text-base">
              <Link href="/signup">
                Creer mon premier outil
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="text-base"
            >
              <Link href="/login">J&apos;ai deja un compte</Link>
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-primary" />
              Gratuit pour demarrer
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-primary" />
              Aucune competence technique requise
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-primary" />
              Deploiement en quelques minutes
            </span>
          </div>
        </div>
      </section>

      {/* ── Stats / Social Proof ── */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center">
                <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <stat.icon className="size-5 text-primary" />
                </div>
                <span className="text-3xl font-bold text-foreground">
                  {stat.value}
                </span>
                <span className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
              Fonctionnalites
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Tout ce qu&apos;il faut pour construire vos outils
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              De la conception a la mise en production, B-WORK couvre chaque
              etape de la creation de vos applications internes.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-border/60 bg-card p-6 transition hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="size-5" />
                </div>
                <h3 className="mb-2 font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
              Comment ca marche
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              3 etapes pour votre outil sur mesure
            </h2>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.number} className="relative flex flex-col items-start">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="pointer-events-none absolute right-0 top-8 hidden h-px w-12 translate-x-full bg-border md:block" />
                )}
                <span className="mb-4 text-5xl font-black text-primary/15">
                  {s.number}
                </span>
                <h3 className="mb-2 text-lg font-semibold">{s.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
              Temoignages
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ce que nos utilisateurs en pensent
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex flex-col rounded-xl border border-border/60 bg-card p-6"
              >
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="size-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <blockquote className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-4">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.role}, {t.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section
        id="pricing"
        className="border-t border-border/60 bg-muted/30"
      >
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
              Tarifs
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Tarifs simples et transparents
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Choisissez le plan qui correspond a vos besoins. Changez de plan
              a tout moment, sans engagement.
            </p>
          </div>

          <PricingGrid />

          <p className="mt-12 text-center text-sm text-muted-foreground">
            Tous les plans incluent les mises a jour et l&apos;acces a la
            plateforme. Pas de frais caches.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="border-t border-border/60">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
              FAQ
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Questions frequentes
            </h2>
          </div>

          <div className="divide-y divide-border/60">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground transition hover:text-primary [&::-webkit-details-marker]:hidden">
                  <span>{faq.question}</span>
                  <HelpCircle className="size-5 shrink-0 text-muted-foreground transition group-open:text-primary" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Pret a simplifier vos processus ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Rejoignez B-WORK et creez votre premier outil interne en quelques
            minutes, sans expertise technique.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="text-base">
              <Link href="/signup">
                Commencer gratuitement
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="lg"
              asChild
              className="text-base text-muted-foreground"
            >
              <Link href="/login">
                Se connecter
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/60 bg-background">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {/* Col 1 — Brand */}
            <div className="space-y-4">
              <span className="text-lg font-bold tracking-tight text-foreground">
                B-WORK
              </span>
              <p className="text-sm leading-relaxed text-muted-foreground">
                La plateforme no-code propulsee par l&apos;IA pour creer vos
                outils web internes, sans competence technique.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="mailto:contact@b-work.fr"
                  className="flex size-9 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition hover:border-primary/40 hover:text-primary"
                  aria-label="Email"
                >
                  <Mail className="size-4" />
                </a>
              </div>
            </div>

            {/* Col 2 — Produit */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-foreground">
                Produit
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="#features"
                    className="text-muted-foreground transition hover:text-foreground"
                  >
                    Fonctionnalites
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-muted-foreground transition hover:text-foreground"
                  >
                    Tarifs
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="text-muted-foreground transition hover:text-foreground"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#how"
                    className="text-muted-foreground transition hover:text-foreground"
                  >
                    Comment ca marche
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3 — Entreprise */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-foreground">
                Entreprise
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <span className="text-muted-foreground">A propos</span>
                </li>
                <li>
                  <a
                    href="mailto:contact@b-work.fr"
                    className="text-muted-foreground transition hover:text-foreground"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <span className="text-muted-foreground">Blog</span>
                </li>
              </ul>
            </div>

            {/* Col 4 — Legal */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-foreground">
                Legal
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/mentions-legales"
                    className="text-muted-foreground transition hover:text-foreground"
                  >
                    Mentions legales
                  </Link>
                </li>
                <li>
                  <Link
                    href="/confidentialite"
                    className="text-muted-foreground transition hover:text-foreground"
                  >
                    Politique de confidentialite
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cgu"
                    className="text-muted-foreground transition hover:text-foreground"
                  >
                    CGU
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cgv"
                    className="text-muted-foreground transition hover:text-foreground"
                  >
                    CGV
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 text-sm text-muted-foreground sm:flex-row">
            <span>
              &copy; {new Date().getFullYear()} B-WORK. Tous droits reserves.
            </span>
            <span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
