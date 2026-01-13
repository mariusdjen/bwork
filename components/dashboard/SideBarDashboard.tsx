"use client";

import { LayoutDashboardIcon, Rocket, CircleUserRound, LogOutIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarTrigger,
} from "../ui/sidebar";
import { signOut } from "@/actions/auth/auth";

export function SideBarDashboard() {
	const router = useRouter();

	const items = [
		{ title: "Tableau de bord", url: "/dashboard", icon: LayoutDashboardIcon },
		{ title: "Mes outils", url: "/dashboard/user", icon: Rocket },
		{ title: "Créer un outil", url: "/generation/brief", icon: Rocket },
		{ title: "Profil", url: "/dashboard/profile", icon: CircleUserRound },
	];

	const handleLogout = async () => {
		await signOut();
		toast.success("Déconnexion réussie");
		router.push("/");
	};

	return (
		<section>
			<Sidebar collapsible="icon">
				<SidebarHeader>
					<div className="flex items-center gap-2 h-12">
						<SidebarTrigger />
						<p className="font-medium">B-WORK</p>
					</div>
				</SidebarHeader>
				<hr />
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupLabel>Menu</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{items.map((item) => (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton asChild tooltip={item.title} className="flex items-center gap-2">
											<Link href={item.url}>
												<item.icon className="size-4" />
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
				<SidebarFooter>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton asChild tooltip="Se déconnecter" className="flex items-center gap-2">
								<button onClick={handleLogout}>
									<LogOutIcon className="size-4" />
									<span>Se déconnecter</span>
								</button>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarFooter>
			</Sidebar>
		</section>
	);
}
