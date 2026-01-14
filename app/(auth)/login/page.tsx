import { GalleryVerticalEndIcon } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import Image from "next/image";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Connexion - B WORK",
	description: "Connectez-vous à votre compte B WORK",
	applicationName: "B WORK",
	creator: "Marius DJENONTIN",
	keywords: ["B WORK"],
};

export default function Login() {
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<Link href="/" className="flex items-center gap-2 font-medium">
						<div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
							<GalleryVerticalEndIcon className="size-4" />
						</div>
						B WORK.
					</Link>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-md">
						<LoginForm />
					</div>
				</div>
			</div>
			<div className="relative hidden lg:block overflow-hidden bg-gradient-to-br from-[#252525] via-[#1a1a1a] to-[#0f0f0f]">
				<div className="absolute inset-0 bg-gradient-to-tr from-[#7699D4]/25 via-transparent to-[#252525]/40" />
				<div
					className="absolute -top-16 -left-10 h-48 w-48 rounded-full bg-white/15 blur-2xl animate-pulse"
					style={{ animationDuration: "5s" }}
				/>
				<div
					className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-pulse"
					style={{ animationDuration: "7s" }}
				/>
				<div
					className="absolute top-10 right-12 h-24 w-24 rounded-full border border-white/15 animate-spin"
					style={{ animationDuration: "14s" }}
				/>
				<div
					className="absolute bottom-10 left-12 h-16 w-16 rounded-full border border-white/12 animate-spin"
					style={{ animationDuration: "18s" }}
				/>
				<div className="absolute inset-0 opacity-50">
					<div
						className="absolute inset-x-10 top-10 h-1/2 rounded-3xl bg-white/5 blur-3xl animate-pulse"
						style={{ animationDuration: "6s" }}
					/>
					<div
						className="absolute inset-x-16 bottom-10 h-1/3 rounded-3xl bg-[#7699D4]/12 blur-3xl animate-pulse"
						style={{ animationDuration: "8s" }}
					/>
				</div>
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="rounded-2xl bg-white/5 p-6 backdrop-blur-md shadow-lg border border-white/10">
						<Image
							src="/logo.svg"
							alt="B-WORK"
							width={160}
							height={60}
							className="animate-pulse"
							priority
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
