"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
	toolId: string;
	sandboxUrl?: string | null;
	isPublic?: boolean | null;
};

export function ToolActions({ toolId, sandboxUrl, isPublic }: Props) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [shareOpen, setShareOpen] = useState(false);
	const [shareDesc, setShareDesc] = useState(
		"Ce lien sera public pour votre équipe. Vérifiez le contenu avant de partager."
	);
	const [visibilityLoading, setVisibilityLoading] = useState(false);
	const [isPublicState, setIsPublicState] = useState<boolean>(Boolean(isPublic));

	const handleDelete = async () => {
		if (!toolId) return;
		setLoading(true);
		try {
			const res = await fetch(`/api/tools/${toolId}`, { method: "DELETE" });
			const data = await res.json();
			if (!res.ok || !data?.ok) {
				console.warn("delete tool error", data?.error || res.statusText);
			}
		} catch (err) {
			console.warn("delete tool error", err);
		} finally {
			setLoading(false);
			router.refresh();
		}
	};

	const handleToggleVisibility = async () => {
		if (!toolId) return;
		setVisibilityLoading(true);
		try {
			const next = !isPublicState;
			const res = await fetch(`/api/tools/${toolId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ is_public: next }),
			});
			const data = await res.json();
			if (!res.ok || !data?.ok) {
				console.warn("toggle visibility error", data?.error || res.statusText);
				return;
			}
			setIsPublicState(next);
		} catch (err) {
			console.warn("toggle visibility error", err);
		} finally {
			setVisibilityLoading(false);
			router.refresh();
		}
	};

	return (
		<div className="mt-4 flex items-center gap-2">
			<Button asChild variant="outline" size="sm" disabled={!sandboxUrl}>
				<Link
					href={sandboxUrl || "#"}
					target="_blank"
					rel="noreferrer"
					prefetch={false}
				>
					Ouvrir le sandbox
				</Link>
			</Button>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="sm">
						Actions
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-52">
					<DropdownMenuLabel>Outil</DropdownMenuLabel>
					<DropdownMenuItem
						onSelect={(e) => {
							e.preventDefault();
							setShareOpen(true);
						}}
					>
						Partager
					</DropdownMenuItem>
					<DropdownMenuItem disabled>Modifier (bientôt)</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onSelect={(e) => {
							e.preventDefault();
							handleToggleVisibility();
						}}
					>
						{visibilityLoading
							? "Mise à jour..."
							: isPublicState
								? "Rendre privé"
								: "Rendre public"}
					</DropdownMenuItem>
					<DropdownMenuItem
						className="text-red-600 focus:text-red-600"
						onSelect={(e) => {
							e.preventDefault();
							handleDelete();
						}}
					>
						{loading ? "Suppression..." : "Supprimer"}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<Dialog open={shareOpen} onOpenChange={setShareOpen}>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>Partager cet outil</DialogTitle>
						<DialogDescription>
							Rendre accessible aux membres de l’entreprise. Assure-toi que
							le contenu est prêt avant de le partager.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-3">
						<Input
							readOnly
							value={sandboxUrl || "Lien non disponible"}
							className="bg-slate-50"
						/>
						<Textarea
							value={shareDesc}
							onChange={(e) => setShareDesc(e.target.value)}
							placeholder="Message ou consignes pour tes collègues"
						/>
						<div className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-600">
							Option prochaine étape : générer un lien public/limité (à venir).
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShareOpen(false)}>
							Annuler
						</Button>
						<Button
							onClick={() => {
								// Future: call share API
								setShareOpen(false);
							}}
						>
							Rendre accessible
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

