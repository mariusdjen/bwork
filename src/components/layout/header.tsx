"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";

type HeaderProps = {
  userName: string;
  userEmail: string;
  orgName: string | null;
};

export function Header({ userName, userEmail, orgName }: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      {orgName && (
        <span className="text-sm text-muted-foreground">{orgName}</span>
      )}
      <div className="flex-1" />
      <ThemeToggle />
      <UserMenu name={userName} email={userEmail} />
    </header>
  );
}
