import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FeedMessage } from "@/components/FeedMessage";
import { GraphErrorBoundary } from "@/components/GraphErrorBoundary";
import { SkillGraphView } from "@/components/SkillGraphView";
import { SkillSummary } from "@/components/SkillSummary";
import { useSkillsStore } from "@/store/skills.store";
import { colors, spacing, typography } from "@/theme";
import type { SkillGraph } from "@/types/skills";

interface LegendItem {
  color: string;
  label: string;
}

// Los umbrales son los de docs/ONTOLOGY.md §3 y los calcula el backend.
const LEGEND: LegendItem[] = [
  { color: colors.success, label: "Fortaleza (>70% éxito)" },
  { color: colors.border, label: "En desarrollo" },
  { color: colors.error, label: "Debilidad (>60% fallo)" },
];

function Legend() {
  return (
    <View style={styles.legend}>
      {LEGEND.map((item) => (
        <View key={item.label} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: item.color }]} />
          <Text style={styles.legendLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

function renderGraph(graph: SkillGraph, selectedId: string | null, onSelect: (id: string | null) => void) {
  return (
    <GraphErrorBoundary
      fallback={
        <FeedMessage
          title="No se pudo dibujar el árbol"
          description="Ocurrió un error al renderizar el grafo. Desliza hacia abajo para reintentar."
        />
      }
    >
      <SkillGraphView graph={graph} selectedId={selectedId} onSelect={onSelect} />
    </GraphErrorBoundary>
  );
}

export default function SkillsScreen() {
  const graph = useSkillsStore((state) => state.graph);
  const status = useSkillsStore((state) => state.status);
  const error = useSkillsStore((state) => state.error);
  const isRefreshing = useSkillsStore((state) => state.isRefreshing);
  const load = useSkillsStore((state) => state.load);
  const syncOnFocus = useSkillsStore((state) => state.syncOnFocus);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void syncOnFocus();
    }, [syncOnFocus]),
  );

  const handleRefresh = useCallback(() => {
    void load("refresh");
  }, [load]);

  const handleRetry = useCallback(() => {
    void load("initial");
  }, [load]);

  // Si tras recargar el nodo ya no existe, simplemente no hay selección.
  const selectedNode = graph?.nodes.find((node) => node.id === selectedId) ?? null;

  if (graph === null) {
    return (
      <SafeAreaView edges={[]} style={styles.container}>
        {status === "error" ? (
          <FeedMessage
            title="No se pudo cargar el árbol"
            {...(error ? { description: error } : {})}
            actionLabel="Reintentar"
            onAction={handleRetry}
          />
        ) : (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}
      </SafeAreaView>
    );
  }

  // F04, estado vacío: usuario sin datos.
  if (graph.nodes.length === 0) {
    return (
      <SafeAreaView edges={[]} style={styles.container}>
        <FeedMessage
          title="Sin datos aún"
          description="Registra tus primeros entrenamientos para desbloquear tu árbol."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={[]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.surface}
          />
        }
      >
        <Legend />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {renderGraph(graph, selectedId, setSelectedId)}
      </ScrollView>
      <SkillSummary node={selectedNode} graph={graph} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.md,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: typography.label,
  error: {
    ...typography.label,
    color: colors.error,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
});
