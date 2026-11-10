import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@/theme";

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

interface ChipSelectorProps<T extends string> {
  label: string;
  options: readonly ChipOption<T>[];
  selected: T | null;
  onSelect: (value: T | null) => void;
  // Si es true, tocar de nuevo la opción seleccionada la deselecciona (campos opcionales).
  allowClear?: boolean;
}

export function ChipSelector<T extends string>({
  label,
  options,
  selected,
  onSelect,
  allowClear = false,
}: ChipSelectorProps<T>) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chips}>
        {options.map((option) => {
          const isSelected = option.value === selected;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelect(isSelected && allowClear ? null : option.value)}
              style={[styles.chip, isSelected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: typography.label,
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.body,
    lineHeight: 20,
    color: colors.textMain,
  },
  chipTextSelected: {
    fontWeight: "700",
    color: colors.onPrimary,
  },
});
