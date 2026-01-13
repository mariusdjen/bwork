'use client';

import {
	Clock,
	DoorClosedLocked,
	SquareActivity,
	Workflow,
} from "lucide-react";
import Image from "next/image";

export default function WhyChooseUs() {
	return (
		<section className="py-16 md:py-32">
			<div className="mx-auto max-w-6xl px-6">
				<div className="grid items-center gap-12 md:grid-cols-2 md:gap-12 lg:grid-cols-5 lg:gap-24">
					<div className="lg:col-span-2">
						<div className="md:pr-6 lg:pr-0">
							<h2 className="text-4xl font-semibold lg:text-5xl">
								Gérez mieux, plus vite, sans stress
							</h2>
							<p className="mt-6">
								Simplifiez votre quotidien de propriétaire. Tout est centralisé,
								automatisé et clair plus besoin de jongler entre documents et
								calculs.
							</p>
						</div>
						<ul className="mt-8 divide-y border-y *:flex *:items-center *:gap-3 *:py-3">
							<li>
								<Clock className="size-5" />
								Gagnez du temps sur chaque location
							</li>
							<li>
								<SquareActivity className="size-5" />
								Suivez vos revenus en un clin d’œil
							</li>
							<li>
								<Workflow className="size-5" />
								Automatisez loyers et relances
							</li>
							<li>
								<DoorClosedLocked className="size-5" />
								Gardez tout organisé au même endroit
							</li>
						</ul>
					</div>
					<div className="border-border/50 relative rounded-3xl border p-3 lg:col-span-3">
						<div className=" rotate-3 bg-linear-to-b aspect-76/59 relative rounded-2xl from-zinc-300 to-transparent p-px dark:from-zinc-700">
							<Image
								src="/images/landing/payement-table-light.png"
								className="hidden rounded-[15px] dark:block"
								alt="payments illustration dark"
								width={1207}
								height={929}
							/>
							<Image
								src="/images/landing/payement-table-light.png"
								className="rounded-[15px] shadow dark:hidden"
								alt="payments illustration light"
								width={1207}
								height={929}
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
