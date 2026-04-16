import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "L’email est requis.")
  .email("Adresse email invalide.");

export const passwordSchema = z
  .string()
  .min(10, "Le mot de passe doit contenir au moins 10 caractères.")
  .regex(/[a-z]/, "Au moins une lettre minuscule.")
  .regex(/[A-Z]/, "Au moins une lettre majuscule.")
  .regex(/[0-9]/, "Au moins un chiffre.")
  .regex(/[^a-zA-Z0-9]/, "Au moins un caractère spécial.");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Le mot de passe est requis."),
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z
    .string()
    .trim()
    .max(120, "Le nom est trop long.")
    .optional(),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
});
