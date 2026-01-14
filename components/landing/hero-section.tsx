"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { HeroHeader } from "./header";
import { AnimatedGroup } from "../ui/animated-group";

const transitionVariants = {
	item: {
		hidden: {
			opacity: 0,
			filter: "blur(12px)",
			y: 12,
		},
		visible: {
			opacity: 1,
			filter: "blur(0px)",
			y: 0,
			transition: {
				type: "spring" as const,
				bounce: 0.3,
				duration: 0.5,
			},
		},
	},
};

export default function HeroSection() {
	return (
		<>
			<HeroHeader />
			<main className="overflow-hidden">
				<section>
					<div className="relative pt-24 md:pt-36">
						<AnimatedGroup
							variants={{
								container: {
									visible: {
										transition: {
											delayChildren: 1,
										},
									},
								},
								item: {
									hidden: {
										opacity: 0,
										y: 20,
									},
									visible: {
										opacity: 1,
										y: 0,
										transition: {
											type: "spring",
											bounce: 0.3,
											duration: 2,
										},
									},
								},
							}}
							className="mask-b-from-35% mask-b-to-90% absolute inset-0 top-56 -z-20 lg:top-32"
						>
							<Image
								src="/images/dashboard-dark.svg"
								alt="background"
								className="hidden size-full dark:block"
								width="3276"
								height="4095"
							/>
						</AnimatedGroup>

						<div
							aria-hidden
							className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
						/>

						<div className="mx-auto max-w-7xl px-6">
							<div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
								<AnimatedGroup
									variants={transitionVariants}
									className="mx-auto"
								>
									<Link
										href="/generation/brief"
										className="hover:bg-background bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-sm transition-colors duration-300"
									>
										<span className="text-foreground text-sm">
											Génère un outil interne sans coder
										</span>
										<span className="block h-4 w-0.5 border-l bg-white/60"></span>
										<div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
											<div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
												<span className="flex size-6">
													<ArrowRight className="m-auto size-3" />
												</span>
												<span className="flex size-6">
													<ArrowRight className="m-auto size-3" />
												</span>
											</div>
										</div>
									</Link>
								</AnimatedGroup>

								<h1 className="mx-auto mt-8 max-w-4xl text-balance text-5xl max-md:font-semibold md:text-6xl lg:mt-16">
									Crée et publie un outil interne en quelques minutes
								</h1>
								<p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
									Décris ton besoin métier, on assemble un brief clair, on
									génère l’app et on te donne une preview prête à partager.
									Aucune étape technique à gérer.
								</p>

								<AnimatedGroup
									variants={{
										container: {
											visible: {
												transition: {
													staggerChildren: 0.05,
													delayChildren: 0.75,
												},
											},
										},
										...transitionVariants,
									}}
									className="mt-12 flex flex-col items-center justify-center gap-3 md:flex-row"
								>
									<div
										key={1}
										className="rounded-xl border bg-background p-0.5"
									>
										<Button
											asChild
											size="lg"
											className="rounded-lg px-5 text-base bg-[#7699D4] hover:bg-[#5f7fb1] text-white border-transparent"
										>
											<Link href="/generation/brief">
												<span className="text-nowrap">Lancer B-WORK</span>
											</Link>
										</Button>
									</div>
									<Button
										key={2}
										asChild
										size="lg"
										variant="ghost"
										className="h-11 rounded-lg px-5"
									>
										<Link href="/#pricing">
											<span className="text-nowrap">Voir les tarifs</span>
										</Link>
									</Button>
								</AnimatedGroup>
							</div>
						</div>

						<AnimatedGroup
							variants={{
								container: {
									visible: {
										transition: {
											staggerChildren: 0.05,
											delayChildren: 0.75,
										},
									},
								},
								...transitionVariants,
							}}
						>
							<div className="mask-b-from-55% relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
								<div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-4 shadow-lg shadow-zinc-950/15 ring-1">
									<Image
										className="bg-background aspect-15/8 relative hidden rounded-2xl dark:block"
										src="/hero2.svg"
										alt="app screen"
										width="2700"
										height="1440"
									/>
									<Image
										className="z-2 border-border/25 aspect-15/8 relative rounded-2xl border dark:hidden"
										src="/hero2.svg"
										alt="app screen"
										width="2700"
										height="1440"
									/>
								</div>
							</div>
						</AnimatedGroup>
					</div>
				</section>
			</main>
		</>
	);
}
