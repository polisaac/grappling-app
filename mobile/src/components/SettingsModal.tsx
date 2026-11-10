import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { colors, spacing, typography } from "@/theme";

interface SettingsModalProps {
  visible: boolean;
  isLoggingOut: boolean;
  onClose: () => void;
  onLogout: () => void;
}

// F05: el engranaje abre este panel, desde donde se cierra la sesión.
export function SettingsModal({ visible, isLoggingOut, onClose, onLogout }: SettingsModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Tocar fuera del panel lo cierra. */}
      <Pressable
        accessibilityLabel="Cerrar ajustes"
        onPress={isLoggingOut ? undefined : onClose}
        style={styles.backdrop}
      >
        {/* Pressable interno sin acción: evita que tocar el panel cuente como tocar el fondo. */}
        <Pressable accessible={false} style={styles.sheet}>
          <Text accessibilityRole="header" style={styles.title}>
            Ajustes
          </Text>
          <Text style={styles.description}>
            Al cerrar sesión tendrás que volver a iniciar sesión para ver tu información.
          </Text>
          <View style={styles.actions}>
            <Button title="Cerrar sesión" variant="danger" onPress={onLogout} loading={isLoggingOut} />
            <Button title="Cancelar" variant="secondary" onPress={onClose} disabled={isLoggingOut} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  sheet: {
    width: "100%",
    maxWidth: 420,
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
  },
  title: typography.h2,
  description: {
    ...typography.body,
    color: colors.textMuted,
  },
  actions: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
});
