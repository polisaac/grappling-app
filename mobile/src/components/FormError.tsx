import { StyleSheet, Text } from "react-native";
import { colors, typography } from "@/theme";

interface FormErrorProps {
  message: string | null;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <Text accessibilityRole="alert" style={styles.text}>
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    ...typography.body,
    color: colors.error,
  },
});
