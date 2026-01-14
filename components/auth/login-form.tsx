"use client";
import { Loader2Icon, EyeIcon, EyeOffIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import { FieldDescription } from "@/components/ui/field";
import ForgotPassword from "./forgot-password";
import { signIn } from "@/actions/auth/auth";

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"form">) {
	//variables
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	//forms validation schema
	const loginSchema = z.object({
		email: z.string().email("Email invalide").min(1, "L'email est requis"),
		password: z
			.string()
			.min(6, "Le mot de passe doit contenir au moins 6 caractères"),
	});
	//create form
	const form = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});
	//functions
	const onSubmit = async (values: z.infer<typeof loginSchema>) => {
		setIsLoading(true);
		try {
			const results = await signIn(values);

			if (results.ok) {
				toast.success("Connexion réussie !", {
					description: "Bienvenue dans votre tableau de bord.",
				});

				form.reset();

				router.push("/dashboard/user");
			} else {
				toast.error("Erreur lors de la connexion", {
					description: `${results.error}`,
				});
			}
		} catch {
			toast.error("Une erreur est survenue. Veuillez réessayer.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className={cn("flex flex-col gap-4", className)}
				{...props}
			>
				<div className="flex flex-col items-center gap-1 text-center">
					<h1 className="text-2xl font-bold">Connexion</h1>
					<p className="text-muted-foreground text-sm text-balance">
						Connectez-vous pour accéder à votre compte B WORK.
					</p>
				</div>

				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<Input {...field} type="email" disabled={isLoading} />
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Mot de passe</FormLabel>
							<div className="relative">
								<Input
									{...field}
									type={showPassword ? "text" : "password"}
									disabled={isLoading}
									className="pr-10"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
									disabled={isLoading}
								>
									{showPassword ? (
										<EyeOffIcon className="h-4 w-4" />
									) : (
										<EyeIcon className="h-4 w-4" />
									)}
								</button>
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>

				<ForgotPassword />

				<div className="flex flex-col gap-4">
					<Button className="w-full" type="submit" disabled={isLoading}>
						Se connecter{" "}
						{isLoading && <Loader2Icon className=" animate-spin" />}{" "}
					</Button>

					<FieldDescription className="text-center">
						Pas de compte ?{" "}
						<Link href="/register" className="underline underline-offset-4">
							Créez en un
						</Link>
					</FieldDescription>
				</div>
			</form>
		</Form>
	);
}
