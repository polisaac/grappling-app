import { colors } from "@/theme";
import type { SkillStatus } from "@/types/skills";

export const STATUS_LABELS: Record<SkillStatus, string> = {
  STRONG: "Fortaleza",
  DEVELOPING: "En desarrollo",
  WEAK: "Debilidad",
};

// F04: verde = tasa de éxito alta, rojo = tasa de fallo alta, gris/neutral = en desarrollo.
// Los umbrales (>70% / >60% de fallo) los calcula el backend; aquí solo se pinta.
const STATUS_COLORS: Record<SkillStatus, string> = {
  STRONG: colors.success,
  DEVELOPING: colors.border,
  WEAK: colors.error,
};

export function statusColor(status: SkillStatus | null): string {
  return status === null ? colors.border : STATUS_COLORS[status];
}

// Para texto/indicadores sobre fondo oscuro, donde el gris de borde no se lee.
export function statusTextColor(status: SkillStatus | null): string {
  return status === null || status === "DEVELOPING" ? colors.textMuted : STATUS_COLORS[status];
}
