import { StyleSheet, Text, View } from "react-native";
import { STATUS_LABELS, statusColor, statusTextColor } from "@/constants/skills";
import { colors, radius, spacing, typography } from "@/theme";
import type { SkillGraph, SkillNode, TransitionContext } from "@/types/skills";

interface SkillSummaryProps {
  node: SkillNode | null;
  graph: SkillGraph;
}

const CONTEXT_LABELS: Record<TransitionContext, string> = {
  AFTER_SUCCESS: "tras éxito",
  AFTER_FAILURE: "tras fallo",
};

interface MetricProps {
  label: string;
  value: string;
  color?: string;
}

function Metric({ label, value, color = colors.textMain }: MetricProps) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

// Detalle del nodo tocado: contexto (desde qué posición / a cuál lleva) y métricas.
function describe(node: SkillNode, graph: SkillGraph): string[] {
  const nameById = new Map(graph.nodes.map((item) => [item.id, item.name]));
  const lines: string[] = [];
  if (node.type === "POSITION") {
    return lines;
  }
  for (const edge of graph.edges) {
    if (edge.type === "ATTEMPTED_TECHNIQUE" && edge.target === node.id) {
      lines.push(`Desde ${nameById.get(edge.source) ?? edge.source}`);
    } else if (edge.type === "TRANSITIONED_TO" && edge.source === node.id) {
      lines.push(`Lleva a ${nameById.get(edge.target) ?? edge.target} ${CONTEXT_LABELS[edge.context]}`);
    }
  }
  return lines;
}

export function SkillSummary({ node, graph }: SkillSummaryProps) {
  if (node === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.hint}>Toca un nodo para ver sus métricas.</Text>
      </View>
    );
  }

  const details = describe(node, graph);
  const hasAttempts = node.attempts > 0;

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.kind}>{node.type === "POSITION" ? "Posición" : "Técnica"}</Text>
          <Text accessibilityRole="header" style={styles.name}>
            {node.name}
          </Text>
        </View>
        {node.status !== null ? (
          <View style={[styles.badge, { borderColor: statusColor(node.status) }]}>
            <Text style={[styles.badgeText, { color: statusTextColor(node.status) }]}>
              {STATUS_LABELS[node.status]}
            </Text>
          </View>
        ) : null}
      </View>

      {details.map((line) => (
        <Text key={line} style={styles.detail}>
          {line}
        </Text>
      ))}

      {hasAttempts ? (
        <View style={styles.metrics}>
          <Metric label="Intentos" value={String(node.attempts)} />
          <Metric label="Éxitos" value={String(node.successes)} color={colors.success} />
          <Metric label="Fallos" value={String(node.failures)} color={colors.error} />
          <Metric label="Éxito" value={`${node.successRate ?? 0}%`} color={colors.primary} />
        </View>
      ) : (
        <Text style={styles.detail}>Todavía no tienes intentos registrados aquí.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  hint: {
    ...typography.body,
    color: colors.textMuted,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  titleBlock: {
    flexShrink: 1,
  },
  kind: typography.label,
  name: typography.h2,
  badge: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  detail: {
    ...typography.label,
    fontSize: 14,
  },
  metrics: {
    flexDirection: "row",
    paddingTop: spacing.xs,
  },
  metric: {
    flex: 1,
    gap: 2,
  },
  metricValue: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "800",
  },
  metricLabel: typography.label,
});
