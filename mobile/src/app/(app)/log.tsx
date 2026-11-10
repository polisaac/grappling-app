import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/Button";
import { ChipSelector } from "@/components/ChipSelector";
import { FormError } from "@/components/FormError";
import { ScrambleCard } from "@/components/ScrambleCard";
import { StarRating } from "@/components/StarRating";
import { TextField } from "@/components/TextField";
import { MODALITY_LABELS } from "@/constants/labels";
import { useLogStore } from "@/store/log.store";
import { colors, spacing, typography } from "@/theme";
import type { Modality } from "@/types/log";
import {
  buildLogPayload,
  createEmptyScramble,
  createInitialForm,
  isLogFormValid,
  validateTrainedAt,
} from "@/utils/log";
import type { LogFormState, ScrambleDraft } from "@/utils/log";

const MODALITY_OPTIONS = (Object.keys(MODALITY_LABELS) as Modality[]).map((value) => ({
  value,
  label: MODALITY_LABELS[value],
}));

export default function LogScreen() {
  const createLog = useLogStore((state) => state.createLog);
  const isSaving = useLogStore((state) => state.isSaving);
  const error = useLogStore((state) => state.error);
  const clearError = useLogStore((state) => state.clearError);

  const [form, setForm] = useState<LogFormState>(() => createInitialForm());

  // Limpia el error del servidor al salir de la pantalla.
  useEffect(() => clearError, [clearError]);

  const dateError = validateTrainedAt(form.date, form.time);
  const canSubmit = isLogFormValid(form);

  function updateForm<K extends keyof LogFormState>(key: K, value: LogFormState[K]): void {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function addScramble(): void {
    setForm((previous) => ({
      ...previous,
      scrambles: [...previous.scrambles, createEmptyScramble()],
    }));
  }

  function updateScramble(key: string, changes: Partial<Omit<ScrambleDraft, "key">>): void {
    setForm((previous) => ({
      ...previous,
      scrambles: previous.scrambles.map((scramble) =>
        scramble.key === key ? { ...scramble, ...changes } : scramble,
      ),
    }));
  }

  function removeScramble(key: string): void {
    setForm((previous) => ({
      ...previous,
      scrambles: previous.scrambles.filter((scramble) => scramble.key !== key),
    }));
  }

  // Vuelve al Feed sin publicar. Si se llegó por enlace directo no hay historial: se va al Feed.
  function handleCancel(): void {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/feed");
    }
  }

  async function handleSubmit(): Promise<void> {
    const payload = buildLogPayload(form);
    if (!payload) {
      return;
    }
    const saved = await createLog(payload);
    if (saved) {
      router.replace("/feed");
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancelar y volver al feed"
              disabled={isSaving}
                onPress={handleCancel}
                hitSlop={8}
                style={styles.cancelButton}
              >
              <Text style={[styles.cancel, isSaving && styles.cancelDisabled]}>Cancelar</Text>
            </Pressable>
          ),
        }}
      />
      <AuthLayout title="Registrar entrenamiento" footer={null}>
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <TextField
              label="Fecha (AAAA-MM-DD)"
              value={form.date}
              onChangeText={(value) => updateForm("date", value)}
              keyboardType="numbers-and-punctuation"
              autoCorrect={false}
              maxLength={10}
            />
          </View>
          <View style={styles.rowItem}>
            <TextField
              label="Hora (HH:mm)"
              value={form.time}
              onChangeText={(value) => updateForm("time", value)}
              keyboardType="numbers-and-punctuation"
              autoCorrect={false}
              maxLength={5}
            />
          </View>
        </View>
        <FormError message={dateError} />

        <ChipSelector
          label="Modalidad (obligatoria)"
          options={MODALITY_OPTIONS}
          selected={form.modality}
          onSelect={(modality) => updateForm("modality", modality)}
        />

        <TextField
          label="Ubicación (opcional)"
          value={form.location}
          onChangeText={(value) => updateForm("location", value)}
          maxLength={120}
        />

        <StarRating
          label="Satisfacción (opcional)"
          value={form.satisfaction}
          onChange={(value) => updateForm("satisfaction", value)}
        />

        <TextField
          label="Nota general (opcional)"
          value={form.note}
          onChangeText={(value) => updateForm("note", value)}
          multiline
          maxLength={2000}
        />

        {form.scrambles.map((scramble, index) => (
          <ScrambleCard
            key={scramble.key}
            index={index}
            scramble={scramble}
            onChange={(changes) => updateScramble(scramble.key, changes)}
            onRemove={() => removeScramble(scramble.key)}
          />
        ))}

        <Button
          title={form.scrambles.length === 0 ? "Agregar acciones (Scrambles)" : "Agregar otro scramble"}
          variant="secondary"
          onPress={addScramble}
          disabled={isSaving}
        />

        <FormError message={error} />
        <Button
          title="Publicar Bitácora"
          onPress={() => void handleSubmit()}
          disabled={!canSubmit}
          loading={isSaving}
        />
      </AuthLayout>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  rowItem: {
    flex: 1,
  },
  cancelButton: {
    // El encabezado web no añade margen a headerLeft; el nativo (iOS/Android) sí.
    paddingHorizontal: Platform.OS === "web" ? spacing.md : 0,
  },
  cancel: {
    ...typography.body,
    color: colors.primary,
  },
  cancelDisabled: {
    opacity: 0.5,
  },
});
