import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius, spacing } from "@/theme";

interface FloatingActionButtonProps {
  accessibilityLabel: string;
  onPress: () => void;
}

export function FloatingActionButton({ accessibilityLabel, onPress }: FloatingActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
    >
      <Text style={styles.icon}>+</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.85,
  },
  icon: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "400",
    color: colors.onPrimary,
  },
});
