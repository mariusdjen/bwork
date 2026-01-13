import { GalleryVerticalEndIcon } from "lucide-react";
import Image from "next/image";
import { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Suspense } from "react";
import { ResetPasswordFormSkeleton } from "@/components/skeletons/form-skeletons/reset-password-form-skeleton";

export const metadata: Metadata = {
	title: "Récupérer votre compte - Gestiloc",
	description: "Récupérer votre compte et profitez de nos offres Gestiloc",
	applicationName: "Gestiloc",
	creator: "Marius DJENONTIN",
	keywords: ["gestiloc"],
};

export default async function RecoverPassword() {
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<a href="#" className="flex items-center gap-2 font-medium">
						<div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
							<GalleryVerticalEndIcon className="size-4" />
						</div>
						Gestiloc.
					</a>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-md">
						<Suspense fallback={<ResetPasswordFormSkeleton />}>
							<ResetPasswordForm />
						</Suspense>
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
				/>
			</div>
		</div>
	);
}
