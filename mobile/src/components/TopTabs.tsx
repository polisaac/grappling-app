import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@/theme";

export interface TopTabOption<T extends string> {
  value: T;
  label: string;
}

interface TopTabsProps<T extends string> {
  options: TopTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

// Selector superior estilo X: opciones a partes iguales; la activa va en negrita con un
// subrayado azul (F06, "Para ti" / "Siguiendo").
export function TopTabs<T extends string>({ options, value, onChange }: TopTabsProps<T>) {
  return (
    <View accessibilityRole="tablist" style={styles.container}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
          >
            <View style={styles.labelWrapper}>
              <Text style={[styles.label, isActive && styles.labelActive]}>{option.label}</Text>
              <View style={[styles.underline, isActive && styles.underlineActive]} />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: "center",
  },
  pressed: {
    backgroundColor: colors.surface,
  },
  labelWrapper: {
    alignItems: "center",
  },
  label: {
    ...typography.body,
    fontWeight: "500",
    color: colors.textMuted,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm + 2,
  },
  labelActive: {
    fontWeight: "700",
    color: colors.textMain,
  },
  // Siempre ocupa su espacio para que el texto no salte al cambiar de pestaña.
  underline: {
    alignSelf: "stretch",
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: "transparent",
  },
  underlineActive: {
    backgroundColor: colors.primary,
  },
});
