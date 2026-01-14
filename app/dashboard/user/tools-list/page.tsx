"use server";

import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getUserTools } from "@/actions/tools";
import { getUserGenerations } from "@/actions/generations";
import { ToolActions } from "@/components/dashboard/tool-actions";
import { GenerationPoller } from "@/components/dashboard/generation-poller";

export default async function UserToolsListPage() {
	const [{ user, tools }, gens] = await Promise.all([
		getUserTools(),
		getUserGenerations(),
	]);
	if (!user) {
		redirect("/login?next=/dashboard/user/tools-list");
	}

	const hasTools = tools.length > 0;
	const running = (gens.generations || []).filter(
		(g) => g.status === "queued" || g.status === "running"
	);

	const formatDescription = (text?: string | null) => {
		if (!text) return "";
		let cleaned = text;
		cleaned = cleaned.replace(/Brief métier:\s*/i, "");
		cleaned = cleaned.replace(/Détails structurés:[\s\S]*/i, "");
		cleaned = cleaned.replace(/Attendu:[\s\S]*/i, "");
		cleaned = cleaned.trim();
		return cleaned.slice(0, 220);
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<p className="text-sm text-muted-foreground">Outils</p>
					<h1 className="text-2xl font-semibold">
						Liste des outils {hasTools ? `(${tools.length})` : ""}
					</h1>
					<p className="text-sm text-muted-foreground">
						Retrouvez vos outils générés et l’état des générations en cours.
					</p>
				</div>
				<Button asChild>
					<Link href="/generation/brief">Créer un nouvel outil</Link>
				</Button>
			</div>

			<GenerationPoller />

			{running.length > 0 ? (
				<div className="rounded-xl border bg-white p-6 shadow-sm">
					<h3 className="text-lg font-semibold">Génération en arrière-plan</h3>
					<p className="text-sm text-muted-foreground">
						Un outil est en cours de création. Vous pouvez continuer à naviguer
						; nous vous avertirons quand il sera prêt.
					</p>
					<div className="mt-4 space-y-3">
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
										Voir la génération
									</Link>
								</Button>
							</div>
						))}
					</div>
				</div>
			) : null}

			{!hasTools ? (
				<div className="rounded-xl border bg-white p-6 text-center shadow-sm">
					<h3 className="text-lg font-medium">Aucun outil pour le moment</h3>
					<p className="mt-2 text-sm text-muted-foreground">
						Générez un outil pour le voir apparaître ici.
					</p>
					<div className="mt-4 flex justify-center">
						<Button asChild>
							<Link href="/generation/brief">Créer un outil</Link>
						</Button>
					</div>
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
					{tools.map((tool) => {
						const created = tool.created_at
							? new Date(tool.created_at).toLocaleString("fr-FR")
							: "";
						return (
							<div
								key={tool.id}
								className="flex h-full flex-col rounded-xl border bg-white p-4 shadow-sm"
							>
								<div className="flex items-start justify-between gap-2">
									<div>
										<h3 className="text-lg font-semibold">{tool.title}</h3>
										<p className="text-xs text-muted-foreground">
											Créé le {created}
										</p>
									</div>
								</div>

								{tool.description ? (
									<p className="mt-3 text-sm text-muted-foreground line-clamp-3">
										{formatDescription(tool.description)}
									</p>
								) : null}
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

								<ToolActions
									toolId={tool.id}
									sandboxUrl={tool.sandbox_url}
									isPublic={tool.is_public}
								/>

							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
