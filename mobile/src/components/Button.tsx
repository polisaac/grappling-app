import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors, radius, typography } from "@/theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  // danger: acción destructiva (p. ej. cerrar sesión), relleno rojo.
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  loading?: boolean;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
}: ButtonProps) {
  const isInactive = disabled || loading;
  // primary y danger son botones rellenos; secondary es solo contorno.
  const isPrimary = variant !== "secondary";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive, busy: loading }}
      disabled={isInactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "danger" ? styles.danger : isPrimary ? styles.primary : styles.secondary,
        isInactive && styles.inactive,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.onPrimary : colors.primary} />
      ) : (
        <Text style={[styles.title, !isPrimary && styles.secondaryTitle]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  danger: {
    backgroundColor: colors.error,
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  inactive: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  title: typography.button,
  secondaryTitle: {
    color: colors.primary,
  },
});
