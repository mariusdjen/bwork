import { GalleryVerticalEndIcon } from "lucide-react";
import Image from "next/image";
import { RegisterForm } from "@/components/auth/register-form";
import { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/landing/logo";

export const metadata: Metadata = {
	title: "Créer un compte - B-WORK",
	description: "Inscrivez-vous pour générer vos outils internes avec B-WORK",
	applicationName: "B-WORK",
	creator: "B-WORK",
	keywords: ["b-work", "outils internes", "génération assistée"],
};

export default function Register() {
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<Link href="/" className="flex items-center gap-2 font-medium">
						<Logo />
					</Link>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-md">
						<RegisterForm />
					</div>
				</div>
			</div>
			<div className="bg-muted relative hidden lg:block">
				<Image
					src="/images/auth/login.svg"
					width={500}
					height={500}
					alt="Image"
					className="absolute bottom-0 right-0 w-full"
					priority
				/>
			</div>
		</div>
	);
}
