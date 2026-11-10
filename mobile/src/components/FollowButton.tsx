import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius, typography } from "@/theme";

interface FollowButtonProps {
  isFollowing: boolean;
  // Mientras se guarda el cambio se bloquean toques repetidos.
  disabled?: boolean;
  onPress: () => void;
}

// F06, botón de seguir (estilo X):
//  - No seguido: relleno blanco con texto negro ("Seguir").
//  - Seguido: fondo #000000, borde #2F3336 y texto blanco ("Siguiendo").
export function FollowButton({ isFollowing, disabled = false, onPress }: FollowButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isFollowing ? "Siguiendo. Toca para dejar de seguir" : "Seguir"}
      accessibilityState={{ selected: isFollowing, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isFollowing ? styles.following : styles.follow,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.title, isFollowing ? styles.followingTitle : styles.followTitle]}>
        {isFollowing ? "Siguiendo" : "Seguir"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 104,
    height: 36,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  follow: {
    backgroundColor: colors.white,
    borderColor: colors.white,
  },
  following: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.85,
  },
  title: {
    ...typography.button,
    fontSize: 15,
  },
  followTitle: {
    color: colors.background,
  },
  followingTitle: {
    color: colors.white,
  },
});
