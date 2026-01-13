"use server";

import { getUser } from "@/actions/authHelpers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Profile() {
	const { profile, user } = await getUser();
	if (!profile || !user) {
		redirect("/login?next=/dashboard/profile");
	}

	const created = profile.created_at
		? new Date(profile.created_at).toLocaleDateString("fr-FR")
		: "N/A";

	return (
		<div className="space-y-6">
			<div>
				<p className="text-sm text-muted-foreground">Profil</p>
				<h1 className="text-2xl font-semibold">Mon compte</h1>
				<p className="text-sm text-muted-foreground">
					Vos informations de connexion B-WORK.
				</p>
			</div>

			<div className="rounded-xl border bg-white p-4 shadow-sm">
				<h3 className="text-lg font-medium">Informations</h3>
				<div className="mt-4 grid gap-4 md:grid-cols-2">
					<div className="space-y-1">
						<p className="text-xs text-muted-foreground">Nom</p>
						<p className="font-medium">
							{profile.first_name} {profile.last_name}
						</p>
					</div>
					<div className="space-y-1">
						<p className="text-xs text-muted-foreground">Email</p>
						<p className="font-medium">{profile.email}</p>
					</div>
					<div className="space-y-1">
						<p className="text-xs text-muted-foreground">Créé le</p>
						<p className="font-medium">{created}</p>
					</div>
				</div>
			</div>

			<div className="rounded-xl border bg-white p-4 shadow-sm">
				<h3 className="text-lg font-medium">Actions rapides</h3>
				<div className="mt-3 flex flex-wrap gap-3">
					<Button asChild>
						<Link href="/generation/brief">Créer un nouvel outil</Link>
					</Button>
					<Button asChild variant="outline">
						<Link href="/dashboard/user">Voir mes outils</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
