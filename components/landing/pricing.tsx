"use client";

import * as React from "react";
import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeCheckIcon, Check, Info } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
	TooltipProvider,
} from "@/components/ui/tooltip";
import { Tagline } from "@/components/landing/tagline";
import { VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import Link from "next/link";
import { SubscriptionPlanResolved } from "@/types/subscription_plan";

export function Pricing({
	subscriptionPlans,
}: {
	subscriptionPlans: SubscriptionPlanResolved[];
}) {
	//variables
	const [billingPeriod, setBillingPeriod] = useState("monthly");
	const pricingData = {
		plans: subscriptionPlans.map((plan) => ({
			name: plan.name,
			description: plan.description,
			badge: plan.badge ? "Le plus populaire" : undefined,
			features: plan.subscription_features.map((feature) => ({
				name: feature.name,
				tooltip: feature.tooltip,
			})),
			pricing: {
				monthly: plan.price.monthly ? Math.round(plan.price.monthly / 100) : 0,
				annually: plan.price.annually ? Math.round(plan.price.annually / 100) : 0,
			},
			variant: plan.variant,
			highlighted: plan.highlighted,
			link: `/register?plan=${encodeURIComponent(plan.code)}`,
		})),
	};

	return (
		<section
			className="bg-background section-padding-y "
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
							Choisissez le forfait adapté à votre activité
						</h2>
						<p className="text-muted-foreground text-base">
							Des solutions flexibles pour tous les besoins, des petits
							bailleurs aux agences immobilières. Commencez gratuitement et
							évoluez à votre rythme.
						</p>
					</div>

					<Tabs
						value={billingPeriod}
						onValueChange={setBillingPeriod}
						className="w-fit"
					>
						<TabsList className="bg-muted h-10 rounded-full p-1">
							<TabsTrigger
								value="monthly"
								className=" rounded-full data-[state=active]:bg-background px-3 py-1.5 data-[state=active]:shadow-sm"
							>
								Mensuel
							</TabsTrigger>
							<TabsTrigger
								value="annually"
								className="rounded-full data-[state=active]:bg-background px-3 py-1.5 data-[state=active]:shadow-sm"
							>
								Annuel
							</TabsTrigger>
						</TabsList>
					</Tabs>

					<div className="grid w-full grid-cols-1 gap-4 lg:max-w-5xl lg:grid-cols-3 lg:gap-6">
						{pricingData.plans.map((plan, index) => (
							<Card
								key={plan.name}
								className={`rounded-xl p-6 lg:p-8 ${
									plan.highlighted ? "border-brand border-2" : ""
								}`}
							>
								<CardContent className="flex flex-col gap-8 p-0">
									<div className="flex flex-col gap-6">
										<div className="relative flex flex-col gap-3">
											{plan.badge && (
												<Badge className="absolute top-1 right-0 w-fit">
													{plan.badge}
												</Badge>
											)}
											<h3
												className={`text-lg font-semibold ${
													plan.highlighted ? "text-primary" : ""
												}`}
											>
												{plan.name}
											</h3>
											<p className="text-muted-foreground text-sm">
												{plan.description}
											</p>
										</div>

										<div className="flex items-end gap-0.5">
											<div className="flex flex-col gap-2">
												<div className="flex items-end gap-0.5">
													<span className="text-4xl font-semibold">
														{billingPeriod === "monthly"
															? plan.pricing.monthly
															: plan.pricing.annually}{" "}
													</span>

													<span className="text-4xl font-semibold">€</span>
													<span className="text-muted-foreground text-base">
														/{billingPeriod === "monthly" ? "mois" : "an"}
													</span>
												</div>

												{billingPeriod === "annually" &&
													plan.pricing.annually > 0 && (
														<motion.div
															initial={{ opacity: 0, y: -10 }}
															animate={{ opacity: 1, y: 0 }}
															transition={{ duration: 0.3, delay: 0.2 }}
														>
															<Badge
																variant="secondary"
																className="bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400 border-green-200 dark:border-green-800"
															>
																<BadgeCheckIcon className="h-3 w-3 mr-1" />
																Économisez{" "}
																{plan.pricing.monthly * 12 -
																	plan.pricing.annually}
																€
															</Badge>
														</motion.div>
													)}
											</div>
										</div>

										<Link href={plan.link} className="w-full">
											<Button
												variant={
													plan.variant as VariantProps<
														typeof buttonVariants
													>["variant"]
												}
												className="w-full"
											>
												{plan.pricing.monthly === 0
													? "Commencer gratuitement"
													: "Choisir ce forfait"}
											</Button>
										</Link>
									</div>

									<div className="flex flex-col gap-4">
										<p className="text-sm font-medium">
											{index === 0
												? "Fonctionnalités incluses :"
												: `Tout ${pricingData.plans[index - 1].name}, plus :`}
										</p>
										<div className="flex flex-col gap-4">
											{plan.features.map((feature, i) => (
												<div key={i} className="flex items-center gap-3">
													<Check className="text-primary h-5 w-5" />
													<span className="text-muted-foreground flex-1 text-sm">
														{feature.name}
													</span>
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger
																aria-label={`Plus d'informations sur ${feature.name}`}
															>
																<Info className="text-muted-foreground h-4 w-4 cursor-pointer opacity-70 hover:opacity-100" />
															</TooltipTrigger>
															<TooltipContent className="max-w-xs">
																<p>{feature.tooltip}</p>
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>
												</div>
											))}
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
