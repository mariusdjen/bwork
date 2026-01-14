"use client";

import { Button } from "@/components/ui/button";
import { Tagline } from "@/components/landing/tagline";
import { Check } from "lucide-react";
import Link from "next/link";

export type PricingPlan = {
	name: string;
	price: string;
	period: string;
	description: string;
	features: string[];
	link: string;
	highlight: boolean;
	badge?: string;
};

const PLANS: PricingPlan[] = [
	{
		name: "Starter",
		price: "0",
		period: "mois",
		description: "Pour tester B-WORK et lancer vos premiers outils.",
		features: [
			"Générations guidées",
			"Styles shadcn/Tailwind prêts à l'emploi",
			"Suivi de génération de base",
		],
		link: "/register?plan=starter",
		highlight: false,
	},
	{
		name: "Pro",
		price: "29",
		period: "mois",
		description: "Pour industrialiser vos apps internes et gagner du temps.",
		features: [
			"Générations en arrière-plan + notifications",
			"Anti-doublons & liens sandbox longs",
			"Actions outils (partager, supprimer, public/privé)",
		],
		link: "/register?plan=pro",
		highlight: true,
		badge: "Le plus choisi",
	},
	{
		name: "Entreprise",
		price: "Sur-mesure",
		period: "",
		description: "Pour vos équipes élargies et vos règles métier avancées.",
		features: [
			"Workflows dédiés et priorisation",
			"Intégrations personnalisées",
			"Support premium & SLA",
		],
		link: "/contact",
		highlight: false,
	},
];

export function Pricing({
	onSelect,
}: {
	onSelect?: (plan: PricingPlan) => void;
}) {
	const isSelectable = typeof onSelect === "function";

	return (
		<section
			className="bg-background section-padding-y py-16 md:py-28"
			id="pricing"
			aria-labelledby="pricing-section-title"
		>
			<div className="container-padding-x container mx-auto">
				<div className="flex flex-col items-center gap-10 md:gap-12">
					<div className="section-title-gap-lg flex max-w-xl flex-col items-center text-center">
						<Tagline>Tarification</Tagline>
						<h2
							id="pricing-section-title"
							className="heading-lg text-foreground"
						>
							Choisissez le forfait adapté à votre équipe
						</h2>
						<p className="text-muted-foreground text-base">
							Des offres simples pour démarrer, accélérer ou industrialiser vos
							générations d’outils internes.
						</p>
					</div>

					<div className="grid w-full grid-cols-1 gap-4 lg:max-w-5xl lg:grid-cols-3 lg:gap-6">
						{PLANS.map((plan) => (
							<div
								key={plan.name}
								className={`rounded-xl p-6 lg:p-8 border bg-card shadow-sm ${
									plan.highlight ? "border-2 border-[#7699D4]" : "border-border"
								}`}
							>
								<div className="flex flex-col gap-8">
									<div className="flex flex-col gap-4">
										<div className="relative flex flex-col gap-2">
											{plan.badge && (
												<span className="absolute top-1 right-0 w-fit rounded-full bg-[#7699D4]/15 px-3 py-1 text-xs font-medium text-[#5f7fb1]">
													{plan.badge}
												</span>
											)}
											<h3
												className={`text-lg font-semibold ${
													plan.highlight ? "text-[#7699D4]" : ""
												}`}
											>
												{plan.name}
											</h3>
											<p className="text-muted-foreground text-sm">
												{plan.description}
											</p>
										</div>

										<div className="flex items-end gap-1">
											<span className="text-4xl font-semibold">
												{plan.price}
											</span>
											{plan.period && (
												<span className="text-muted-foreground text-base">
													/{plan.period}
												</span>
											)}
										</div>
										{plan.highlight && (
											<span className="w-fit rounded-full bg-[#7699D4]/15 px-2.5 py-1 text-xs font-medium text-[#5f7fb1]">
												Recommandé
											</span>
										)}

										{isSelectable ? (
											<Button
												className={`w-full ${
													plan.highlight
														? "bg-[#7699D4] hover:bg-[#5f7fb1] text-white"
														: ""
												}`}
												onClick={() => onSelect?.(plan)}
											>
												{plan.price === "0"
													? "Commencer gratuitement"
													: plan.price === "Sur-mesure"
													? "Parler à un expert"
													: "Choisir ce forfait"}
											</Button>
										) : (
											<Link href={plan.link} className="w-full">
												<Button
													className={`w-full ${
														plan.highlight
															? "bg-[#7699D4] hover:bg-[#5f7fb1] text-white"
															: ""
													}`}
												>
													{plan.price === "0"
														? "Commencer gratuitement"
														: plan.price === "Sur-mesure"
														? "Parler à un expert"
														: "Choisir ce forfait"}
												</Button>
											</Link>
										)}
									</div>

									<div className="flex flex-col gap-3">
										<p className="text-sm font-medium">Fonctionnalités :</p>
										<div className="flex flex-col gap-3">
											{plan.features.map((feature, i) => (
												<div key={i} className="flex items-center gap-3">
													<Check className="text-[#7699D4] h-5 w-5" />
													<span className="text-muted-foreground flex-1 text-sm">
														{feature}
													</span>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
