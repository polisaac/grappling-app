import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import type { TextInputProps } from "react-native";
import { colors, radius, spacing, typography } from "@/theme";

interface TextFieldProps extends Omit<TextInputProps, "style"> {
  label: string;
  error?: string | null;
}

export function TextField({ label, error, onFocus, onBlur, ...inputProps }: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error ? colors.error : isFocused ? colors.primary : colors.border;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        style={[styles.input, inputProps.multiline && styles.multiline, { borderColor }]}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: typography.label,
  input: {
    ...typography.body,
    height: 52,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: radius.input,
  },
  multiline: {
    height: undefined,
    minHeight: 104,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  error: {
    ...typography.label,
    color: colors.error,
  },
});
