"use client";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GenerationIndicator } from "@/components/dashboard/generation-indicator";
import { Crown } from "lucide-react";
import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Pricing } from "@/components/landing/pricing";

export function AppHeader() {
	const [showPricing, setShowPricing] = useState(false);

	const handleSelectPlan = (plan: { name: string; price: string }) => {
		const checkoutUrl = "https://buy.stripe.com/test_8x26oHfc42eA33t6Z1fnO00";
		window.open(checkoutUrl, "_blank", "noreferrer");
		setShowPricing(false);
	};

	return (
		<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
			<div className="flex items-center gap-2 px-4">
				<SidebarTrigger className="-ml-1" />
				<Separator
					orientation="vertical"
					className="mr-2 data-[orientation=vertical]:h-4"
				/>
				<div>
					<p className="text-xs text-muted-foreground">Dashboard</p>
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink href="/dashboard">B-WORK</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>Mes outils</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</div>

			<div className="ml-auto flex items-center gap-3 pr-4">
				<GenerationIndicator />
				<Button
					onClick={() => setShowPricing(true)}
					variant="default"
					className="px-3 bg-[#7699D4] hover:bg-[#5f7fb1] text-white border-transparent"
				>
					<span className="flex items-center gap-2">
						<Crown className="h-4 w-4" />
						Passer en Premium
					</span>
				</Button>
			</div>

			<Dialog open={showPricing} onOpenChange={setShowPricing}>
				<DialogContent className="w-[96vw] max-w-[1200px] max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Choisis ton plan</DialogTitle>
					</DialogHeader>
					<div className="mt-4">
						<Pricing onSelect={handleSelectPlan} />
					</div>
				</DialogContent>
			</Dialog>
		</header>
	);
}
