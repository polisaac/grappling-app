import type { TextStyle } from "react-native";

// Fuente única de verdad: docs/specs/01-design-system.md

export const colors = {
  background: "#000000",
  surface: "#16181C",
  border: "#2F3336",
  primary: "#1D9BF0",
  textMain: "#E7E9EA",
  textMuted: "#71767B",
  success: "#00BA7C",
  error: "#F4212E",
  // Texto sobre botones primarios (no definido en la spec; blanco como en X).
  onPrimary: "#FFFFFF",
  // Botón "Seguir" relleno de blanco / texto de "Siguiendo" (F06).
  white: "#FFFFFF",
} as const;

export const radius = {
  pill: 9999,
  input: 8,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

// Sans-serif del sistema (SF Pro en iOS, Roboto en Android): no se fija fontFamily.
export const typography = {
  h1: {
    fontSize: 31,
    lineHeight: 36,
    fontWeight: "800",
    color: colors.textMain,
  },
  h2: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "700",
    color: colors.textMain,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
    color: colors.textMain,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
    color: colors.textMuted,
  },
  button: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
    color: colors.onPrimary,
  },
} satisfies Record<string, TextStyle>;
