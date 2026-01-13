"use client"
import { sendResetPasswordLink } from "@/actions/auth/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { isValidEmail } from "@/utils/isValidEmail"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (email && isValidEmail(email)) {
            setLoading(true);
            const updatePromise = sendResetPasswordLink(email).then((result) => {
                if (!result.ok) {
                    throw new Error(result.error);
                }
                setEmail("")
                setOpen(false)
                return result;
            }).finally(() => {
                setLoading(false);
            });
            toast.promise(updatePromise, {
                loading: "Traitement de la demande...",
                success: "Vous recevrez le lien de récupération dans votre boîte de réception. Pensez à vérifier votre dossier spam si vous ne le voyez pas.",
                error: (err) => err.message || "Erreur lors du traitement de la demande",
            });
        } else {
            toast.error("Adresse email invalide.")
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant={"ghost"}
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                >
                    Mot de passe oublié ?
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle className="text-lg">Mot de passe oublié ?</SheetTitle>
                    <SheetDescription className="text-base">
                        Entrez l'adresse e-mail associée à votre compte.
                        Nous vous enverrons un lien pour réinitialiser votre mot de passe en toute sécurité.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="grid gap-6 px-4">
                    <div className="grid gap-3">
                        <Label htmlFor="email">Adresse e-mail</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="votre.email@exemple.com"
                            required
                        />
                    </div>
                    <SheetFooter>
                        <Button type="submit" className="w-full" disabled={loading}>
                            Envoyer le lien de réinitialisation
                            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                        </Button>
                        <SheetClose asChild>
                            <Button variant="outline">Fermer</Button>
                        </SheetClose>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}