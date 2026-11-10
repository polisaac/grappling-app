import { StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "@/theme";

const PLACEHOLDER_COUNT = 4;

function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.avatar} />
      <View style={styles.content}>
        <View style={[styles.line, styles.lineShort]} />
        <View style={[styles.line, styles.lineTiny]} />
        <View style={styles.line} />
        <View style={[styles.line, styles.lineMedium]} />
      </View>
    </View>
  );
}

// Feedback visual de carga (F03, paso 2): tarjetas fantasma con la forma de LogCard.
export function FeedSkeleton() {
  return (
    <View accessibilityLabel="Cargando feed" accessibilityRole="progressbar">
      {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  content: {
    flex: 1,
    gap: spacing.sm,
  },
  line: {
    height: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  lineShort: {
    width: "45%",
  },
  lineTiny: {
    width: "25%",
  },
  lineMedium: {
    width: "70%",
  },
});
