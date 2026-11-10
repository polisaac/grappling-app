import { z } from "zod";
import { Modality, ScrambleResult } from "../generated/prisma/client";
import { POSITIONS, TECHNIQUES } from "../ontology";

// Validaciones de F02: fecha y modalidad obligatorias; si hay scramble, posición y resultado obligatorios.

// Texto opcional: cadena vacía o ausente se normaliza a null.
function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .nullish()
    .transform((value) => (value ? value : null));
}

const scrambleSchema = z.object({
  position: z.enum(POSITIONS, "Posición inicial inválida"),
  technique: z
    .enum(TECHNIQUES, "Técnica inválida")
    .nullish()
    .transform((value) => value ?? null),
  result: z.enum(ScrambleResult, "Resultado inválido (IN_FAVOR, AGAINST o FAILED)"),
});

export const createLogSchema = z.object({
  trainedAt: z.iso
    .datetime({ offset: true, message: "La fecha y hora debe estar en formato ISO 8601" })
    .transform((value) => new Date(value)),
  modality: z.enum(Modality, "Modalidad inválida (GI, NO_GI, JUDO o SAMBO)"),
  location: optionalText(120),
  satisfaction: z
    .number("La satisfacción debe ser un número")
    .int("La satisfacción debe ser un entero")
    .min(1, "La satisfacción mínima es 1")
    .max(5, "La satisfacción máxima es 5")
    .nullish()
    .transform((value) => value ?? null),
  note: optionalText(2000),
  scrambles: z.array(scrambleSchema).max(50, "Máximo 50 scrambles por bitácora").default([]),
});

export type CreateLogInput = z.infer<typeof createLogSchema>;
