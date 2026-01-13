"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Generation = {
	id: string;
	sandbox_id: string;
	status: "queued" | "running" | "done" | "failed";
	sandbox_url?: string | null;
	title?: string | null;
	error?: string | null;
};

export function GenerationPoller() {
	const [gens, setGens] = useState<Generation[]>([]);
	const seenDone = useRef<Set<string>>(new Set());
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const firstLoadRef = useRef(true);

	useEffect(() => {
		const fetchGens = async () => {
			try {
				const res = await fetch("/api/generations", { cache: "no-store" });
				const data = await res.json();
				if (!res.ok || !data?.ok) return;
				const list: Generation[] = data.generations || [];
				setGens(list);

				// Évite les toasts multiples au premier chargement (refresh page)
				if (firstLoadRef.current) {
					list.forEach((g) => {
						if (g.status === "done" || g.status === "failed") {
							seenDone.current.add(g.id);
						}
					});
					firstLoadRef.current = false;
					return;
				}

				// Trigger toast on newly done/failed
				list.forEach((g) => {
					if ((g.status === "done" || g.status === "failed") && !seenDone.current.has(g.id)) {
						seenDone.current.add(g.id);
						if (g.status === "done") {
							toast.success(
								g.title || "Génération terminée",
								{
									description: "Sandbox prêt",
									action: g.sandbox_url
										? {
												label: "Ouvrir",
												onClick: () => {
													window.open(g.sandbox_url!, "_blank", "noreferrer");
												},
											}
										: undefined,
								}
							);
						} else {
							toast.error(g.title || "Génération échouée", {
								description: g.error || "Une erreur est survenue.",
							});
						}
					}
				});
			} catch {
				// ignore polling errors
			}
		};

		// initial fetch
		fetchGens();
		// poll
		timerRef.current = setInterval(fetchGens, 8000);
		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, []);

	const running = gens.filter((g) => g.status === "queued" || g.status === "running");

	if (!running.length) return null;

	return (
		<div className="rounded-xl border bg-white p-4 shadow-sm">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-medium">Générations en cours</h3>
					<p className="text-sm text-muted-foreground">
						Vous serez notifié dès qu’elles seront prêtes.
					</p>
				</div>
			</div>
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
								Ouvrir la génération
							</Link>
						</Button>
					</div>
				))}
			</div>
		</div>
	);
}

