"use client";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import z from "zod";
import { changePasswordSchema } from "@/lib/validation/profiles.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import { Button } from "../ui/button";
import { AlertCircleIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/input";
import { updateForgotPassword } from "@/actions/auth/auth";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from 'next/navigation'

export function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const [code, setCode] = useState(searchParams.get('code'));
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    //setup form
    const form = useForm<z.infer<typeof changePasswordSchema>>({
        resolver: zodResolver(changePasswordSchema) as Resolver<
            z.infer<typeof changePasswordSchema>
        >,
    });

    const handleFormSubmit = async (values: z.infer<typeof changePasswordSchema>) => {
        setIsLoading(true);
        if (!code) {
            toast.error("Lien de réinitialisation invalide.");
            return;
        }

        const updatePromise = updateForgotPassword(values.password, code).then((result) => {
            if (!result.ok) {
                setCode(null)
                throw new Error(result.error);
            }
            form.reset();
            return result;
        }).finally(() => {
            setIsLoading(false);
        });

        toast.promise(
            updatePromise,
            {
                loading: "Mise à jour du mot de passe...",
                success: () => {
                    let count = 3;
                    const countdownToast = toast.info(`Redirection dans ${count}...`, {
                        duration: 1000,
                    })
                    const interval = setInterval(() => {
                        count--
                        if (count > 0) {
                            toast.info(`Redirection dans ${count}...`, {
                                id: countdownToast,
                                duration: 1000,
                            })
                        } else {
                            clearInterval(interval)
                            router.replace("/dashboard/user")
                        }
                    }, 1000)

                    return "Mot de passe mis à jour avec succès !"
                },
                error: (err) => err.message || "Erreur lors de la mise à jour du mot de passe"
            }
        );
    };

    if (code) {
        return (
            <div className="w-full flex flex-col items-center gap-2">
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Mot de passe</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Réinitialisez votre mot de passe.
                    </p>
                </div>
                <div className="grid flex-1 gap-2 w-full">
                    <Form {...form}>
                        <form className="space-y-6"
                            onSubmit={form.handleSubmit(async (vals) => {
                                handleFormSubmit(vals)
                            })}>
                            <div className="grid grid-cols-1 gap-6">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nouveau mot de passe</FormLabel>
                                            <Input {...field} type="password" autoComplete="new-password webauthn" />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirmer mot de passe</FormLabel>
                                            <Input {...field} type="password" autoComplete="new-password webauthn" />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <Button
                                    size="lg"
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    Mettre à jour
                                    {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        )
    } else {
        return (
            <div className="w-full flex flex-col items-center gap-2">
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Mot de passe</h1>
                    <Alert variant={"destructive"} className="text-left mt-3">
                        <AlertCircleIcon />
                        <AlertTitle>Lien de réinitialisation invalide</AlertTitle>
                        <AlertDescription>
                            <p>
                                Votre lien de récupération est soit expiré ou invalide.
                                Veuillez cliquer <Link href={"/login"} className="font-medium underline underline-offset-2">ici</Link> pour reprendre le processus.
                            </p>
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        )
    }
}