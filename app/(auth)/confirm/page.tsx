import { GalleryVerticalEndIcon } from "lucide-react";
import Image from "next/image";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Vérification email - B WORK",
	applicationName: "B WORK",
	creator: "Marius DJENONTIN",
	keywords: ["B WORK"],
};

export default async function Confirm({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const params = await searchParams;
	const { errorCode, code, errorDescription } = extractConfirmParams(params);

	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<a href="#" className="flex items-center gap-2 font-medium">
						<div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
							<GalleryVerticalEndIcon className="size-4" />
						</div>
						B WORK.
					</a>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-md">
						<div className="w-full flex flex-col items-center gap-1 text-center">
							<h1 className="text-3xl font-bold">Verification</h1>
							{code && !errorCode && (
								<>
									<p className="text-muted-foreground text-balance mb-2">
										Votre adresse e-mail a bien été confirmée. Vous pouvez
										maintenant vous connecter et commencer.
									</p>
									<Button className="w-full" asChild>
										<Link href="/login">Se connecter</Link>
									</Button>
								</>
							)}

							{errorCode && (
								<>
									<p className="text-muted-foreground text-balance mb-2">
										{errorDescription ? (
											errorDescription
										) : (
											<>
												Une erreur s'est produite lors de la vérification de
												votre adresse mail.
											</>
										)}
										<br />
										Veuillez demander un nouveau lien de confirmation.
									</p>
									<Button className="w-full" asChild>
										<Link href="/register">Confirmer email</Link>
									</Button>
								</>
							)}
						</div>
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

function extractConfirmParams(params: Record<string, unknown>) {
	const errorCodeRaw = params.error_code;
	const codeRaw = params.code;
	const errorDescriptionRaw = params.error_description;

	// Normaliser au cas où ce serait un tableau
	const errorCode = Array.isArray(errorCodeRaw)
		? errorCodeRaw[0]
		: errorCodeRaw;
	const code = Array.isArray(codeRaw) ? codeRaw[0] : codeRaw;
	const errorDescription = Array.isArray(errorDescriptionRaw)
		? errorDescriptionRaw[0]
		: errorDescriptionRaw;

	return { errorCode, code, errorDescription };
}
