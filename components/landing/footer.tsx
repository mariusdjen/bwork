"use client";

import Link from "next/link";
import { LogoIcon } from "./logo";
import { ThemeModeSwitcher } from "../theme/mode-switcher";

const links = [
	{
		group: "Produit",
		items: [
			{ title: "Lancer B-WORK", href: "/generation/brief" },
			{ title: "Fonctionnalités", href: "#features" },
			{ title: "Tarifs", href: "/pricing" },
		],
	},
	{
		group: "Ressources",
		items: [
			{ title: "Aide & FAQ", href: "/help/faq" },
			{ title: "Contact", href: "/contact" },
			{ title: "Support", href: "/support/ticket" },
		],
	},
	{
		group: "Légal",
		items: [
			{ title: "Mentions légales", href: "/legal/impressum" },
			{ title: "Conditions d’utilisation", href: "/legal/terms" },
			{ title: "Politique de confidentialité", href: "/legal/privacy" },
		],
	},
];

export default function Footer() {
	return (
		<>
			<hr />

			<footer className="border-b bg-white pt-20 dark:bg-transparent">
				<div className="mx-auto max-w-5xl px-6">
					<div className="grid gap-12 md:grid-cols-5">
						<div className="md:col-span-2">
							<Link href="/" aria-label="go home" className="block size-fit">
								<LogoIcon />
								<p className="text-lg py-5 font-light text-muted-foreground">
									B-WORK permet aux équipes non techniques de décrire un besoin,
									générer un outil interne guidé et le prévisualiser en quelques
									minutes.
								</p>
							</Link>
						</div>

						<div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:col-span-3">
							{links.map((link, index) => (
								<div key={index} className="space-y-4 text-sm">
									<span className="block font-medium">{link.group}</span>
									{link.items.map((item, index) => (
										<Link
											key={index}
											href={item.href}
											className="text-muted-foreground hover:text-primary block duration-150"
										>
											<span>{item.title}</span>
										</Link>
									))}
								</div>
							))}
						</div>
					</div>
					<div className="mt-12 flex flex-wrap items-end justify-between gap-6 border-t py-6">
						<span className="text-muted-foreground order-last block text-center text-sm md:order-first">
							© {new Date().getFullYear()} B-WORK. Tous droits réservés.
						</span>
						<div className="order-first flex flex-wrap justify-center gap-6 text-sm md:order-last">
							<ThemeModeSwitcher />
						</div>
					</div>
				</div>
			</footer>
		</>
	);
}
