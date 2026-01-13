"use client";
import { Loader2Icon, EyeIcon, EyeOffIcon } from "lucide-react";
import z from "zod";
import { FieldDescription, FieldGroup } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import { signUp } from "@/actions/auth/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";

export function RegisterForm({
	className,
	...props
}: React.ComponentProps<"form">) {
	//variables
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	//schema de validation
	const registerSchema = z.object({
		first_name: z.string().min(1, "Le prénom est requis"),
		last_name: z.string().min(1, "Le nom est requis"),
		email: z.string().email("Email invalide").min(1, "L'email est requis"),
		password: z
			.string()
			.min(6, "Le mot de passe doit contenir au moins 6 caractères"),
	});
	//create form
	const form = useForm<z.infer<typeof registerSchema>>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			first_name: "",
			last_name: "",
			email: "",
			password: "",
		},
	});

	//functions

	const onSubmit = async (values: z.infer<typeof registerSchema>) => {
		setIsLoading(true);
		try {
			const results = await signUp(values);

			if (results.ok) {
				toast.success("Inscription réussie", {
					description:
						"Veuillez vérifier votre adresse mail pour confirmer votre compte.",
				});

				router.push("/login");
			} else {
				toast.error("Erreur lors de l'inscription", {
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
				className={cn("flex flex-col gap-6 ", className)}
				{...props}
			>
				<FieldGroup>
					<div className="flex flex-col items-center gap-1 text-center">
						<h1 className="text-2xl font-bold">Créez un compte gratuitement</h1>
						<p className="text-muted-foreground text-sm text-balance">
							Rejoignez GestiLoc pour simplifier votre gestion locative.
						</p>
					</div>
					<FormField
						control={form.control}
						name="last_name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Nom</FormLabel>
								<FormControl>
									<Input
										{...field}
										type="text"
										disabled={isLoading}
										autoComplete="family-name"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="first_name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Prénom</FormLabel>
								<FormControl>
									<Input
										{...field}
										type="text"
										disabled={isLoading}
										autoComplete="given-name"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input
										{...field}
										type="email"
										disabled={isLoading}
										autoComplete="email"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Mot de passe </FormLabel>
								<FormControl>
									<div className="relative">
										<Input
											{...field}
											type={showPassword ? "text" : "password"}
											disabled={isLoading}
											autoComplete="new-password"
										/>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="flex flex-col gap-4">
						<Button className="w-full" type="submit" disabled={isLoading}>
							Créer mon compte
							{isLoading && (
								<Loader2Icon className="ml-2 h-4 w-4 animate-spin" />
							)}
						</Button>
						<FieldDescription className="text-center">
							Déjà un compte ?{" "}
							<Link href="/login" className="underline underline-offset-4">
								Connectez-vous
							</Link>
						</FieldDescription>
					</div>
					{/*
					<FieldSeparator>Or continue with</FieldSeparator>
					<Field>
						<Button variant="outline" type="button">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path
									d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
									fill="currentColor"
								/>
							</svg>
							Login with GitHub
						</Button>
						<FieldDescription className="text-center">
							Don&apos;t have an account?{" "}
							<a href="#" className="underline underline-offset-4">
								Sign up
							</a>
						</FieldDescription>
					</Field>
					
					*/}
				</FieldGroup>
			</form>
		</Form>
	);
}
