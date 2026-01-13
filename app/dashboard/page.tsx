import Link from "next/link";
import { Button } from "@/components/ui/button";

const shortcuts = [
	{
		title: "Créer un nouvel outil",
		desc: "Lance un brief guidé et génère une preview en quelques minutes.",
		href: "/generation/brief",
		action: "Lancer",
	},
	{
		title: "Mes outils",
		desc: "Consulte et gère les outils générés (bientôt connecté à Supabase).",
		href: "/dashboard/user",
		action: "Voir",
	},
	{
		title: "Reprendre un brief",
		desc: "Rouvre un brief précédent pour itérer rapidement.",
		href: "/generation",
		action: "Ouvrir",
	},
];

export default function DashboardPage() {
	return (
		<div className="space-y-8">
			<div>
				<p className="text-sm text-muted-foreground">Bienvenue</p>
				<h1 className="text-2xl font-semibold">Pilotage B-WORK</h1>
				<p className="text-muted-foreground mt-2 text-sm">
					Génère des outils internes sans code, partage-les et itère rapidement.
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				{shortcuts.map((item) => (
					<div
						key={item.title}
						className="flex h-full flex-col justify-between rounded-xl border bg-white p-4 shadow-sm"
					>
						<div className="space-y-2">
							<h3 className="text-lg font-medium">{item.title}</h3>
							<p className="text-sm text-muted-foreground">{item.desc}</p>
						</div>
						<div className="mt-4">
							<Button asChild className="w-full">
								<Link href={item.href}>{item.action}</Link>
							</Button>
						</div>
					</div>
				))}
			</div>

			<div className="rounded-xl border bg-white p-4 shadow-sm">
				<h3 className="text-lg font-medium">Mes outils (bientôt)</h3>
				<p className="text-sm text-muted-foreground">
					Connexion Supabase à venir : affichage de la liste des outils et accès
					rapide aux previews.
				</p>
			</div>
		</div>
	);
}
