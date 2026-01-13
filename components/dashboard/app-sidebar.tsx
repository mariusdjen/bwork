"use client";
import * as React from "react";
import {
	GalleryVerticalEnd,
	LayoutDashboardIcon,
	Rocket,
	CircleUserRound,
	SettingsIcon,
} from "lucide-react";
import { NavGroup, NavMain } from "@/components/dashboard/nav-main";
import { NavUser } from "@/components/dashboard/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import { useSession } from "@/context/SessionContext";
import { UserRole } from "@/enums/roles";

const navData: NavGroup[] = [
	{
		group: "B-WORK",
		items: [
			{
				name: "Tableau de bord",
				url: "/dashboard",
				icon: LayoutDashboardIcon,
			},
			{
				name: "Mes outils",
				url: "/dashboard/user/tools-list",
				icon: SettingsIcon,
			},
			{
				name: "Créer un outil",
				url: "/generation/brief",
				icon: Rocket,
			},
			{
				name: "Profil",
				url: "/dashboard/profile",
				icon: CircleUserRound,
			},
		],
	},
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {


	return (
		<Sidebar collapsible={"icon"} {...props}>
			<SidebarHeader className="flex flex-row gap-3">
				<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
					<GalleryVerticalEnd className="size-5" />
				</div>
				<div className="grid flex-1 items-center text-2xl font-bold leading-tight">
					<span className="truncate font-medium">B-WORK</span>
				</div>
			</SidebarHeader>
			<SidebarContent className="overflow-x-hidden">
				<NavMain items={navData} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
