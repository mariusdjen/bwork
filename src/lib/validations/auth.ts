import { z } from "zod/v4";

export const signupSchema = z.object({
  email: z.email("Adresse email invalide."),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caracteres."),
  name: z.string().min(1, "Le nom est requis."),
});

export const loginSchema = z.object({
  email: z.email("Adresse email invalide."),
  password: z.string().min(1, "Le mot de passe est requis."),
});

export const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis.")
    .max(100, "Le nom ne peut pas depasser 100 caracteres."),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
