import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { colors, spacing, typography } from "@/theme";

interface FeedMessageProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

// Estado vacío o de error del feed: nunca una pantalla en blanco (F03, criterios de aceptación).
export function FeedMessage({ title, description, actionLabel, onAction }: FeedMessageProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button title={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    gap: spacing.sm,
  },
  title: typography.h1,
  description: {
    ...typography.body,
    color: colors.textMuted,
  },
  action: {
    paddingTop: spacing.md,
    alignSelf: "flex-start",
    minWidth: 160,
  },
});
