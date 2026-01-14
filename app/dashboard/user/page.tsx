"use server";

import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getUserTools } from "@/actions/tools";
import { ToolActions } from "@/components/dashboard/tool-actions";
import { getUserGenerations } from "@/actions/generations";
import { GenerationPoller } from "@/components/dashboard/generation-poller";
import {
	BarChart3,
	Clock3,
	FolderGit2,
	Globe2,
	Lock,
	Plus,
	Sparkles,
} from "lucide-react";

export default async function UserToolsPage() {
	const [{ user, tools }, gens] = await Promise.all([
		getUserTools(),
		getUserGenerations(),
	]);
	if (!user) {
		redirect("/login?next=/dashboard/user");
	}

	const hasTools = tools.length > 0;
	const running = (gens.generations || []).filter(
		(g) => g.status === "queued" || g.status === "running"
	);

	const totalTools = tools.length;
	const publicTools = tools.filter((t) => t.is_public).length;
	const privateTools = totalTools - publicTools;
	const recentTools = [...tools]
		.sort((a, b) => {
			const da = a.created_at ? new Date(a.created_at).getTime() : 0;
			const db = b.created_at ? new Date(b.created_at).getTime() : 0;
			return db - da;
		})
		.slice(0, 4);

	const formatDescription = (text?: string | null) => {
		if (!text) return "";
		let cleaned = text;
		cleaned = cleaned.replace(/Brief métier:\s*/i, "");
		cleaned = cleaned.replace(/Détails structurés:[\s\S]*/i, "");
		cleaned = cleaned.replace(/Attendu:[\s\S]*/i, "");
		cleaned = cleaned.trim();
		return cleaned.slice(0, 160);
	};

	const formatDate = (date?: string | null) => {
		if (!date) return "";
		return new Date(date).toLocaleString("fr-FR", {
			day: "2-digit",
			month: "short",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="space-y-8">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="space-y-1">
					<p className="text-sm text-muted-foreground">Tableau de bord</p>
					<h1 className="text-3xl font-semibold">Mes outils</h1>
					<p className="text-sm text-muted-foreground">
						Un aperçu rapide : outils publiés, brouillons, et générations en
						cours.
					</p>
				</div>
				<div className="flex flex-wrap gap-2 items-center">
					<Button
						asChild
						variant="secondary"
						className="flex items-center gap-2"
					>
						<Link
							href="/dashboard/user/tools-list"
							className="flex flex-row items-center gap-2 whitespace-nowrap"
						>
							<FolderGit2 className="h-4 w-4" />
							Liste complète
						</Link>
					</Button>
					<Button asChild>
						<Link
							href="/generation/brief"
							className="flex flex-row items-center gap-2 whitespace-nowrap"
						>
							<Plus className="h-4 w-4" />
							Créer un outil
						</Link>
					</Button>
				</div>
			</div>

			{/* Indicateur live des générations */}
			<GenerationPoller />

			{/* Statistiques clés */}
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<div className="rounded-xl border bg-white p-4 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-xs uppercase text-muted-foreground">
								Outils au total
							</p>
							<p className="text-2xl font-semibold">{totalTools}</p>
						</div>
						<BarChart3 className="h-5 w-5 text-slate-500" />
					</div>
				</div>
				<div className="rounded-xl border bg-white p-4 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-xs uppercase text-muted-foreground">Publics</p>
							<p className="text-2xl font-semibold">{publicTools}</p>
						</div>
						<Globe2 className="h-5 w-5 text-emerald-600" />
					</div>
				</div>
				<div className="rounded-xl border bg-white p-4 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-xs uppercase text-muted-foreground">Privés</p>
							<p className="text-2xl font-semibold">{privateTools}</p>
						</div>
						<Lock className="h-5 w-5 text-slate-600" />
					</div>
				</div>
				<div className="rounded-xl border bg-white p-4 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-xs uppercase text-muted-foreground">
								Générations actives
							</p>
							<p className="text-2xl font-semibold">{running.length}</p>
						</div>
						<Clock3 className="h-5 w-5 text-amber-600" />
					</div>
				</div>
			</div>

			{/* Bannière aide / raccourcis */}
			<div className="rounded-2xl border bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-sm">
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div className="space-y-1">
						<div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
							<Sparkles className="h-4 w-4" />
							Optimise tes générateurs
						</div>
						<h2 className="text-lg font-semibold">
							Publie, partage ou continue tes générations en fond.
						</h2>
						<p className="text-sm text-white/80">
							Accède rapidement à la génération en cours ou crée un nouveau
							brouillon.
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<Button asChild variant="secondary">
							<Link href="/dashboard/user/tools-list">
								Voir tous mes outils
							</Link>
						</Button>
						<Button
							asChild
							variant="outline"
							className="bg-white text-slate-900 hover:bg-white/90"
						>
							<Link href="/generation?bg=1">Suivre la génération en cours</Link>
						</Button>
					</div>
				</div>
			</div>

			{/* Générations en cours */}
			{running.length > 0 && (
				<div className="rounded-xl border bg-white p-5 shadow-sm space-y-3">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold">Générations en cours</h3>
							<p className="text-sm text-muted-foreground">
								Vous serez notifié dès qu’elles seront prêtes.
							</p>
						</div>
					</div>
					<div className="space-y-3">
						{running.map((g) => (
							<div
								key={g.id}
								className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
							>
								<div className="space-y-1">
									<p className="text-sm font-semibold text-slate-900">
										{g.title || "Génération en arrière-plan"}
									</p>
									<p className="text-xs text-slate-600">
										Statut : {g.status === "queued" ? "En attente" : "En cours"}
									</p>
								</div>
								<Button asChild size="sm" variant="outline">
									<Link href={`/generation?sandbox=${g.sandbox_id}`}>
										Ouvrir la génération
									</Link>
								</Button>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Derniers outils */}
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold">Derniers outils</h3>
					<Button variant="ghost" asChild size="sm">
						<Link href="/dashboard/user/tools-list">Voir tout</Link>
					</Button>
				</div>

				{!hasTools ? (
					<div className="rounded-xl border bg-white p-6 text-center shadow-sm">
						<h4 className="text-lg font-medium">Aucun outil pour le moment</h4>
						<p className="mt-2 text-sm text-muted-foreground">
							Lancez une génération pour voir vos outils ici.
						</p>
						<div className="mt-4 flex justify-center">
							<Button asChild>
								<Link href="/generation/brief">Créer un outil</Link>
							</Button>
						</div>
					</div>
				) : (
					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
						{recentTools.map((tool) => (
							<div
								key={tool.id}
								className="flex h-full flex-col rounded-xl border bg-white p-4 shadow-sm"
							>
								<div className="flex items-start justify-between gap-2">
									<div>
										<h4 className="text-base font-semibold line-clamp-1">
											{tool.title}
										</h4>
										<p className="text-xs text-muted-foreground">
											Créé le {formatDate(tool.created_at)}
										</p>
									</div>
								</div>

								{tool.description ? (
									<p className="mt-3 text-sm text-muted-foreground line-clamp-3">
										{formatDescription(tool.description)}
									</p>
								) : (
									<p className="mt-3 text-sm text-muted-foreground">
										Pas de description fournie.
									</p>
								)}

								<div className="mt-3 flex items-center gap-2">
									<span
										className={`rounded-full text-xs px-2 py-1 ${
											tool.is_public
												? "bg-emerald-50 text-emerald-700 border border-emerald-100"
												: "bg-slate-100 text-slate-700"
										}`}
									>
										Visibilité : {tool.is_public ? "Public" : "Privé"}
									</span>
								</div>

								<div className="mt-4">
									<ToolActions
										toolId={tool.id}
										sandboxUrl={tool.sandbox_url}
										isPublic={tool.is_public}
									/>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
