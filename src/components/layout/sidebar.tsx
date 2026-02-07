"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAtomValue } from "jotai";
import { LayoutDashboard, PlusCircle, Building2, User, CreditCard } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { GeneratingBadge } from "@/components/bwork/generation/generating-badge";
import { generatingToolsAtom } from "@/atoms/generation-atoms";

type NavItem = {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
};

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Creer un outil", href: "/create/start", icon: PlusCircle },
  { title: "Organisation", href: "/org", icon: Building2, adminOnly: true },
  { title: "Abonnement", href: "/settings/billing", icon: CreditCard },
  { title: "Profil", href: "/profile", icon: User },
];

type AppSidebarProps = {
  role?: string | null;
};

export function AppSidebar({ role }: AppSidebarProps) {
  const pathname = usePathname();
  const generatingTools = useAtomValue(generatingToolsAtom);
  const hasGenerating = generatingTools.length > 0;
  const isAdmin = role === "admin";

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin,
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex items-center px-4 py-3">
        <Link href="/dashboard" className="text-lg font-bold text-sidebar-foreground">
          B-WORK
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.href === "/dashboard" && hasGenerating && (
                      <SidebarMenuBadge>
                        <GeneratingBadge />
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
