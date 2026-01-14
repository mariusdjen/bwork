"use client";

"use client";

import { BellRing, Clock, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import Image from "next/image";

export default function WhyChooseUs() {
	return (
		<section className="py-16 md:py-28">
			<div className="mx-auto max-w-6xl px-6">
				<div className="grid items-center gap-12 md:grid-cols-2 lg:grid-cols-5 lg:gap-20">
					<div className="lg:col-span-3 space-y-6">
						<div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
							<ShieldCheck className="h-4 w-4" />
							B-WORK • Fiable et prêt pour vos équipes
						</div>
						<div className="md:pr-6 lg:pr-0">
							<h2 className="text-4xl font-semibold lg:text-5xl">
								Générez vos outils sans friction
							</h2>
							<p className="mt-4 text-lg text-muted-foreground">
								B-WORK crée et déploie vos apps internes en quelques minutes :
								sandbox prêt, styles shadcn/Tailwind, notifications quand c’est
								prêt, et un suivi clair des générations.
							</p>
						</div>
						<ul className="mt-4 divide-y border-y *:flex *:items-center *:gap-3 *:py-3">
							<li>
								<Clock className="h-5 w-5 text-primary" />
								Gagnez du temps : création guidée + anti-doublons
							</li>
							<li>
								<Workflow className="h-5 w-5 text-primary" />
								Automatisez la génération et le suivi des sandboxes
							</li>
							<li>
								<BellRing className="h-5 w-5 text-primary" />
								Notifications dès que l’outil est prêt (ou en arrière-plan)
							</li>
							<li>
								<Sparkles className="h-5 w-5 text-primary" />
								Design cohérent (shadcn/ui, Tailwind) sans réglages manuels
							</li>
						</ul>
					</div>
					<div className="lg:col-span-2">
						<div className="relative rounded-3xl border border-border/60 bg-gradient-to-b from-muted/60 to-background p-3 shadow-sm">
							<div className="relative overflow-hidden rounded-2xl bg-background ring-1 ring-border">
								<div className="absolute inset-0 bg-gradient-to-br from-[#7699D4]/10 via-transparent to-transparent" />
								<Image
									src="/whys.svg"
									alt="Aperçu B-WORK"
									width={1200}
									height={800}
									className="relative block w-full rounded-2xl"
									priority
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		
	);
}
