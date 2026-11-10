import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/theme";

const STARS = [1, 2, 3, 4, 5] as const;

interface StarRatingProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
}

export function StarRating({ label, value, onChange }: StarRatingProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.stars}>
        {STARS.map((star) => {
          const isFilled = value !== null && star <= value;
          return (
            <Pressable
              key={star}
              accessibilityRole="button"
              accessibilityLabel={`${star} de 5`}
              accessibilityState={{ selected: value === star }}
              hitSlop={6}
              // Tocar la calificación actual la quita (la satisfacción es opcional).
              onPress={() => onChange(value === star ? null : star)}
            >
              <Text style={[styles.star, isFilled && styles.starFilled]}>★</Text>
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
  stars: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  star: {
    fontSize: 32,
    lineHeight: 38,
    color: colors.border,
  },
  starFilled: {
    color: colors.primary,
  },
});
