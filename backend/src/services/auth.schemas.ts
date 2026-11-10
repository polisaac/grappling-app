import { z } from "zod";

// Validaciones de F01: email válido, contraseña >= 6 caracteres, campos no vacíos.
const emailSchema = z
  .string()
  .trim()
  .min(1, "El correo es obligatorio")
  .pipe(z.email("Formato de correo inválido"))
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(1, "La contraseña es obligatoria")
  .min(6, "La contraseña debe tener al menos 6 caracteres");

export const registerSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
