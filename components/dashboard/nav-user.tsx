"use client";
import { ChevronsUpDown, LogOut, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { signOut } from "@/actions/auth/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionContext";

export function NavUser() {
	const router = useRouter();
	const { isMobile } = useSidebar();
	const { user: currentUser, profile } = useSession();
	console.log("currentUser",currentUser);
	console.log("profile",currentUser);
	//user
	if (!currentUser || !profile) {
		return null;
	}

	
	const fullName =
		`${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() ||
		currentUser.email ||
		"Utilisateur";
	const userInitial = (
		profile.first_name?.[0] ??
		profile.last_name?.[0] ??
		currentUser.email?.[0] ??
		"U"
	).toUpperCase();

	const handleLogout = async () => {
		await signOut();
		toast.success("Déconnexion réussie");
		router.push("/");
	};

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarFallback className="rounded-lg uppercase">
									{userInitial}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium capitalize">
									{fullName}
								</span>
								<span className="truncate text-xs">{currentUser.email}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									
									<AvatarFallback className="rounded-lg uppercase">
										{userInitial}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium capitalize">
										{fullName}
									</span>
									<span className="truncate text-xs">{currentUser.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem
								onClick={() => router.push("/dashboard/profile")}
								className="cursor-pointer"
							>
								<UserRound />
								Mon profil
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
							<LogOut />
							Se déconnecter
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
