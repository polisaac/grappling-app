import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChipSelector } from "@/components/ChipSelector";
import { SCRAMBLE_RESULT_LABELS } from "@/constants/labels";
import { POSITIONS, TECHNIQUES } from "@/constants/ontology";
import { colors, radius, spacing, typography } from "@/theme";
import type { ScrambleResult } from "@/types/log";
import type { ScrambleDraft } from "@/utils/log";

const POSITION_OPTIONS = POSITIONS.map((value) => ({ value, label: value }));
const TECHNIQUE_OPTIONS = TECHNIQUES.map((value) => ({ value, label: value }));
const RESULT_OPTIONS = (Object.keys(SCRAMBLE_RESULT_LABELS) as ScrambleResult[]).map((value) => ({
  value,
  label: SCRAMBLE_RESULT_LABELS[value],
}));

interface ScrambleCardProps {
  index: number;
  scramble: ScrambleDraft;
  onChange: (changes: Partial<Omit<ScrambleDraft, "key">>) => void;
  onRemove: () => void;
}

export function ScrambleCard({ index, scramble, onChange, onRemove }: ScrambleCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Scramble {index + 1}</Text>
        <Pressable accessibilityRole="button" onPress={onRemove} hitSlop={8}>
          <Text style={styles.remove}>Eliminar</Text>
        </Pressable>
      </View>
      <ChipSelector
        label="Posición inicial (obligatoria)"
        options={POSITION_OPTIONS}
        selected={scramble.position}
        onSelect={(position) => onChange({ position })}
      />
      <ChipSelector
        label="Técnica intentada (opcional)"
        options={TECHNIQUE_OPTIONS}
        selected={scramble.technique}
        onSelect={(technique) => onChange({ technique })}
        allowClear
      />
      <ChipSelector
        label="Resultado (obligatorio)"
        options={RESULT_OPTIONS}
        selected={scramble.result}
        onSelect={(result) => onChange({ result })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: typography.h2,
  remove: {
    ...typography.body,
    color: colors.error,
  },
});
