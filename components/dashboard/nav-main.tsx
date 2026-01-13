"use client";
import { type LucideIcon } from "lucide-react";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Fragment } from "react";

type NavItem = {
	name: string;
	url: string;
	icon: LucideIcon;
};

export type NavGroup = {
	group: string;
	items: NavItem[];
};

export function NavMain({ items }: { items: NavGroup[] }) {
	return (
		<>
			{items.map((group) => {
				return (
					<Fragment key={group.group}>
						<SidebarGroup>
							<SidebarGroupLabel>{group.group}</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									{group.items.map((item) => (
										<SidebarMenuItem key={item.name}>
											<SidebarMenuButton asChild>
												<Link href={item.url}>
													<item.icon className="size-4" />
													<span>{item.name}</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
						{items.length > 1 && items.indexOf(group) < items.length - 1 && (
							<SidebarSeparator />
						)}
					</Fragment>
				);
			})}
		</>
	);
}
