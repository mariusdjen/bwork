"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

type GeneratedQuestion = {
	fieldKey: string;
	label: string;
	placeholder?: string;
	example?: string;
};

const fallbackQuestions: GeneratedQuestion[] = [
	{
		fieldKey: "workflow",
		label: "Étapes / statuts",
		placeholder: "Ex: Brouillon → En revue → Validé → Archivé",
		example: "Qui valide ? Quelles règles de passage ?",
	},
	{
		fieldKey: "champs",
		label: "Champs à suivre",
		placeholder:
			"Ex: Titre, description, service, priorité, statut, assigné à, deadline",
		example: "Champs obligatoires ? Formats à respecter ?",
	},
	{
		fieldKey: "notifications",
		label: "Notifications",
		placeholder: "Ex: Mail/Slack à la validation, rappel avant deadline",
		example: "Qui reçoit quoi, et quand ?",
	},
	{
		fieldKey: "vue",
		label: "Vue souhaitée",
		placeholder: "Ex: Liste filtrable + formulaire de création",
		example: "Tri, filtres, recherches indispensables",
	},
];

const labelClass = "text-sm font-medium text-slate-900";

export default function BriefPage() {
	const router = useRouter();
	const [step, setStep] = useState<"intro" | "questions">("intro");
	const [intro, setIntro] = useState("");
	const [questions, setQuestions] = useState<GeneratedQuestion[]>(fallbackQuestions);
	const [answers, setAnswers] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [advancedOpen, setAdvancedOpen] = useState(false);
	const [advancedRules, setAdvancedRules] = useState<
		{
			id: string;
			condition: string;
			actionTrue: string;
			actionFalse?: string;
			hasElse?: boolean;
		}[]
	>([]);

	const getRulePlaceholders = () => {
		const introText = intro.toLowerCase();
		if (introText.includes("email") || introText.includes("mail")) {
			return {
				condition: "SI le domaine email contient gmail.com",
				actionTrue: "ALORS envoyer l'email de bienvenue",
				actionFalse: "SINON marquer la demande en faible priorité",
			};
		}
		if (
			introText.includes("ticket") ||
			introText.includes("demande") ||
			introText.includes("support")
		) {
			return {
				condition: "SI le ticket est 'Urgent'",
				actionTrue: "ALORS assigner à l'équipe support senior",
				actionFalse: "SINON mettre dans la file standard",
			};
		}
		if (introText.includes("validation") || introText.includes("workflow")) {
			return {
				condition: "SI le montant dépasse 1 000 €",
				actionTrue: "ALORS demander validation manager",
				actionFalse: "SINON auto-valider",
			};
		}
		return {
			condition: "SI la condition métier est remplie",
			actionTrue: "ALORS exécuter l'action principale",
			actionFalse: "SINON appliquer l'alternative",
		};
	};

	const cleanQuestions = (qs: GeneratedQuestion[]) =>
		qs.filter((q) => {
			const key = q.fieldKey.toLowerCase();
			const label = q.label.toLowerCase();
			return !key.includes("role") && !label.includes("permission") && !label.includes("rôle");
		});

	const updateAnswer = (key: string, value: string) => {
		setAnswers((prev) => ({ ...prev, [key]: value }));
	};

	const fetchQuestions = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/brief-questions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ description: intro }),
			});
			const data = await res.json();
			const qsRaw: GeneratedQuestion[] =
				data?.questions && Array.isArray(data.questions) && data.questions.length > 0
					? data.questions
					: fallbackQuestions;
			const qs = cleanQuestions(qsRaw);
			const initialAnswers = qs.reduce<Record<string, string>>(
				(acc, q) => ({ ...acc, [q.fieldKey]: "" }),
				{}
			);
			setQuestions(qs.length > 0 ? qs : fallbackQuestions);
			setAnswers(initialAnswers);
			setStep("questions");
		} catch (err) {
			console.error("[brief] failed to fetch questions", err);
			const qs = cleanQuestions(fallbackQuestions);
			setQuestions(qs.length > 0 ? qs : fallbackQuestions);
			setError("Impossible de récupérer les questions, on continue avec le modèle standard.");
			setStep("questions");
		} finally {
			setLoading(false);
		}
	};

	const addAdvancedRule = () => {
		setAdvancedRules((prev) => [
			...prev,
			{
				id: crypto.randomUUID(),
				condition: "",
				actionTrue: "",
				actionFalse: "",
				hasElse: true,
			},
		]);
	};

	const updateAdvancedRule = (
		id: string,
		field: "condition" | "actionTrue" | "actionFalse" | "hasElse",
		value: string | boolean
	) => {
		setAdvancedRules((prev) =>
			prev.map((rule) =>
				rule.id === id ? { ...rule, [field]: value } : rule
			)
		);
	};

	const removeAdvancedRule = (id: string) => {
		setAdvancedRules((prev) => prev.filter((r) => r.id !== id));
	};

	const handleGenerate = (e: React.FormEvent) => {
		e.preventDefault();
		const filled = questions
			.map(
				(q) => `${q.label}: ${answers[q.fieldKey]?.trim() || "Non précisé"}`
			)
			.join("\n");

		const advancedText =
			advancedRules.length > 0
				? `\nRègles avancées:\n${advancedRules
						.map(
							(r, idx) =>
								`- Règle ${idx + 1}: SI ${r.condition || "…"} ALORS ${
									r.actionTrue || "…"
								}${
									r.hasElse !== false
										? ` SINON ${r.actionFalse || "…"}`
										: ""
								}`
						)
						.join("\n")}`
				: "";

		const prompt = `Brief métier:
${intro}

Détails structurés:
${filled}

Attendu:
- Générer un outil interne simple, lisible et maintenable (listes, formulaires, validations, statuts).
- Tenir compte des rôles/permissions et des règles métier indiquées.
- Proposer une expérience claire, sobre et rapide à utiliser pour des équipes non techniques.
- Fournir une prévisualisation exploitable immédiatement.${advancedText}`;

		sessionStorage.setItem("briefPrompt", prompt);
		router.push("/generation");
	};

	const handleGenerateBackground = (e: React.FormEvent) => {
		e.preventDefault();
		const filled = questions
			.map(
				(q) => `${q.label}: ${answers[q.fieldKey]?.trim() || "Non précisé"}`
			)
			.join("\n");

		const advancedText =
			advancedRules.length > 0
				? `\nRègles avancées:\n${advancedRules
						.map(
							(r, idx) =>
								`- Règle ${idx + 1}: SI ${r.condition || "…"} ALORS ${
									r.actionTrue || "…"
								}${
									r.hasElse !== false
										? ` SINON ${r.actionFalse || "…"}`
										: ""
								}`
						)
						.join("\n")}`
				: "";

		const prompt = `Brief métier:
${intro}

Détails structurés:
${filled}

Attendu:
- Générer un outil interne simple, lisible et maintenable (listes, formulaires, validations, statuts).
- Tenir compte des rôles/permissions et des règles métier indiquées.
- Proposer une expérience claire, sobre et rapide à utiliser pour des équipes non techniques.
- Fournir une prévisualisation exploitable immédiatement.${advancedText}`;

		sessionStorage.setItem("briefPrompt", prompt);
		sessionStorage.setItem("backgroundMode", "true");
		router.push("/generation?bg=1");
	};

	const tips = [
		"Décris le métier, le problème et qui utilise l’outil.",
		"Précise les validations clés (qui valide, quand).",
		"Note les infos indispensables à saisir ou à suivre.",
	];

	return (
		<div className="min-h-[calc(100vh-120px)] bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-6">
			<div className="mx-auto max-w-5xl space-y-6">
				{step === "intro" && (
					<div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
						<div className="flex flex-wrap items-start justify-between gap-4">
							<div className="space-y-2">
								<p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
									Brief B-WORK
								</p>
								<h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
									Construis ton outil interne sans code
								</h1>
								<p className="text-sm text-slate-600 max-w-3xl">
									On structure ton besoin, on génère l’app. Deux étapes simples :
									raconte ton contexte, puis réponds à quelques questions ciblées.
								</p>
							</div>
							<div className="hidden md:flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
								<span className="text-sm font-medium text-slate-800">
									Bons réflexes
								</span>
								<ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
									{tips.map((tip) => (
										<li key={tip}>{tip}</li>
									))}
								</ul>
							</div>
						</div>
					</div>
				)}

				{step === "intro" && (
					<form
						onSubmit={fetchQuestions}
						className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6"
					>
						<div className="space-y-2">
							<label className={labelClass}>Décris ton besoin</label>
							<Textarea
								className="mt-1 min-h-[140px]"
								placeholder="Ex: Suivre les demandes internes (service, priorité, statut) et les valider rapidement."
								value={intro}
								onChange={(e) => setIntro(e.target.value)}
								required
							/>
						</div>
						<div className="flex flex-wrap gap-3">
							<Button type="submit" disabled={!intro.trim() || loading}>
								{loading ? "Construisons la logique de votre outil…" : "Continuer"}
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => router.push("/")}
							>
								Retour
							</Button>
						</div>
					</form>
				)}

				{step === "questions" && (
					<form onSubmit={handleGenerate} className="space-y-6">
						<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
							<div className="flex items-start justify-between gap-4">
								<div className="space-y-1">
									<p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
										Étape 2/2
									</p>
									<h2 className="text-xl font-semibold text-slate-900">
										Règles métier
									</h2>
									<p className="text-sm text-slate-600">
										Renseigne l’essentiel pour que l’outil colle à tes règles.
									</p>
								</div>
								<div className="hidden md:block max-w-sm text-right text-sm text-slate-600">
									{intro}
								</div>
							</div>
							<div className="mt-4">
								<Dialog open={advancedOpen} onOpenChange={setAdvancedOpen}>
									<DialogTrigger asChild>
										<Button variant="outline" size="sm">
											Appliquer des règles métier avancées
										</Button>
									</DialogTrigger>
									<DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden">
										<DialogHeader>
											<DialogTitle>Règles métier avancées</DialogTitle>
											<DialogDescription>
												Définis des conditions « Si/Alors » pour affiner ton flux.
												Exemple inspiré du flow ci-dessous : domaine d’email,
												actions email ou système, etc.
											</DialogDescription>
										</DialogHeader>
										<div className="space-y-4 overflow-y-auto pr-1 custom-scroll">
											<div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
												<p className="text-sm font-medium text-slate-900">
													Conditions & actions
												</p>
												<div className="space-y-3">
													{advancedRules.length === 0 && (
														<p className="text-sm text-slate-600">
															Ajoute une première condition pour commencer ton flow.
														</p>
													)}
													{advancedRules.map((rule, index) => (
														<div
															key={rule.id}
															className="rounded-lg border border-slate-200 bg-white p-4 space-y-3"
														>
															<div className="flex items-center justify-between">
																<div className="flex items-center gap-2">
																	<span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
																		Règle {index + 1}
																	</span>
																	<span className="text-xs text-slate-500">
																		Construis ton SI / ALORS {rule.hasElse !== false ? "/ SINON" : ""}
																	</span>
																</div>
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() => removeAdvancedRule(rule.id)}
																>
																	Supprimer
																</Button>
															</div>

															<div className="space-y-2">
																<div className="flex items-center gap-2">
																	<span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
																		SI
																	</span>
																	<Input
																		placeholder={`(${getRulePlaceholders().condition})`}
																		value={rule.condition}
																		onChange={(e) =>
																			updateAdvancedRule(
																				rule.id,
																				"condition",
																				e.target.value
																			)
																		}
																	/>
																</div>
																<div className="flex items-center gap-2">
																	<span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
																		ALORS
																	</span>
																	<Input
																		placeholder={`(${getRulePlaceholders().actionTrue})`}
																		value={rule.actionTrue}
																		onChange={(e) =>
																			updateAdvancedRule(
																				rule.id,
																				"actionTrue",
																				e.target.value
																			)
																		}
																	/>
																</div>
																{rule.hasElse !== false && (
																	<div className="flex items-center gap-2">
																		<span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
																			SINON
																		</span>
																		<Input
																			placeholder={`(${getRulePlaceholders().actionFalse})`}
																			value={rule.actionFalse}
																			onChange={(e) =>
																				updateAdvancedRule(
																					rule.id,
																					"actionFalse",
																					e.target.value
																				)
																			}
																		/>
																	</div>
																)}
																<div className="flex items-center gap-2 pt-1">
																	<Button
																		variant="secondary"
																		size="sm"
																		onClick={() =>
																			updateAdvancedRule(
																				rule.id,
																				"hasElse",
																				!(rule.hasElse !== false)
																			)
																		}
																	>
																		{rule.hasElse !== false
																			? "Retirer SINON"
																			: "Ajouter SINON"}
																	</Button>
																</div>
															</div>
														</div>
													))}
													<Button variant="secondary" onClick={addAdvancedRule}>
														+ Ajouter une condition
													</Button>
												</div>
											</div>
										</div>
										<DialogFooter>
											<Button variant="outline" onClick={() => setAdvancedOpen(false)}>
												Annuler
											</Button>
											<Button onClick={() => setAdvancedOpen(false)}>
												Appliquer
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							</div>
							{error && (
								<div className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
									{error}
								</div>
							)}
							<div className="mt-6 grid gap-4 md:grid-cols-2">
								{questions.map((q) => (
									<div
										key={q.fieldKey}
										className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
									>
										<div className="flex items-start justify-between gap-2">
											<label className="text-sm font-medium text-slate-900">
												{q.label}
											</label>
										</div>
										<div className="mt-2 space-y-2">
											<p className="text-xs text-slate-500">
												Complète la phrase :&nbsp;
												<span className="text-slate-700">
													{q.placeholder || "Décris l’élément clé…"}
												</span>
											</p>
											<Input
												placeholder={q.placeholder || "Exemple : À toi de préciser"}
												value={answers[q.fieldKey] ?? ""}
												onChange={(e) =>
													updateAnswer(q.fieldKey, e.target.value)
												}
											/>
										</div>
										{q.example && (
											<p className="text-xs text-slate-500 mt-2">{q.example}</p>
										)}
									</div>
								))}
							</div>
							<div className="mt-6 flex gap-3">
								<Button type="submit">Lancer la génération</Button>
								<Button
									type="button"
									variant="secondary"
									onClick={handleGenerateBackground}
								>
									Lancer en arrière-plan
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => setStep("intro")}
								>
									Retour
								</Button>
							</div>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
