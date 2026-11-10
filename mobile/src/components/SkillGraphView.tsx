import { memo, useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import type { LayoutChangeEvent } from "react-native";
import Svg, { G, Path, Polygon, Rect, Text as SvgText } from "react-native-svg";
import { statusColor, statusTextColor } from "@/constants/skills";
import { colors } from "@/theme";
import type { SkillGraph, SkillNode, TransitionContext } from "@/types/skills";
import { NODE_H, NODE_W, buildSkillLayout } from "@/utils/skillLayout";

// En pantallas anchas (web) el grafo no se estira más allá de este ancho.
const MAX_RENDER_WIDTH = 560;
const NAME_LINE_HEIGHT = 15;
const METRICS_LINE_HEIGHT = 14;

// El texto SVG no hereda la tipografía de React Native: en web caería en una serif por defecto.
// En iOS/Android se deja la fuente del sistema (SF Pro / Roboto), como pide el design system.
const WEB_FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const textFont = Platform.OS === "web" ? { fontFamily: WEB_FONT_FAMILY } : {};

interface SkillGraphViewProps {
  graph: SkillGraph;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const transitionColor = (context: TransitionContext): string =>
  context === "AFTER_SUCCESS" ? colors.success : colors.error;

function metricsLabel(node: SkillNode): string {
  if (node.attempts === 0) {
    return "Sin intentos";
  }
  return node.type === "TECHNIQUE"
    ? `${node.successRate ?? 0}% · ${node.successes}/${node.attempts}`
    : `${node.attempts} intentos`;
}

function SkillGraphViewBase({ graph, selectedId, onSelect }: SkillGraphViewProps) {
  const layout = useMemo(() => buildSkillLayout(graph), [graph]);
  const [availableWidth, setAvailableWidth] = useState(0);

  const handleLayout = (event: LayoutChangeEvent): void => {
    setAvailableWidth(event.nativeEvent.layout.width);
  };

  const renderWidth = Math.min(availableWidth, MAX_RENDER_WIDTH);
  const scale = renderWidth / layout.width;
  const renderHeight = layout.height * scale;

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {renderWidth > 0 ? (
        <View style={{ width: renderWidth, height: renderHeight }}>
          {/* Capa visual: solo dibuja. Los toques los reciben los Pressable de abajo. */}
          <Svg
            width={renderWidth}
            height={renderHeight}
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            pointerEvents="none"
          >
            {/* Aristas debajo de los nodos. */}
            {layout.attempts.map((edge) => (
              <Path
                key={edge.id}
                d={edge.path}
                fill="none"
                stroke={statusColor(edge.status)}
                strokeWidth={2}
                strokeLinejoin="round"
              />
            ))}
            {layout.transitions.map((edge) => (
              <G key={edge.id}>
                <Path
                  d={edge.path}
                  fill="none"
                  stroke={transitionColor(edge.context)}
                  strokeWidth={1.5}
                  strokeDasharray="5 4"
                />
                <Polygon points={edge.arrowPoints} fill={transitionColor(edge.context)} />
              </G>
            ))}

            {layout.nodes.map(({ node, x, y, lines }) => {
              const isSelected = node.id === selectedId;
              const blockHeight = lines.length * NAME_LINE_HEIGHT + METRICS_LINE_HEIGHT;
              const top = y + (NODE_H - blockHeight) / 2;
              const centerX = x + NODE_W / 2;
              return (
                <G key={node.id}>
                  <Rect
                    x={x}
                    y={y}
                    width={NODE_W}
                    height={NODE_H}
                    rx={12}
                    fill={colors.surface}
                    stroke={isSelected ? colors.primary : statusColor(node.status)}
                    strokeWidth={isSelected ? 3 : 1.5}
                  />
                  {lines.map((line, index) => (
                    <SvgText
                      key={line}
                      x={centerX}
                      y={top + 12 + index * NAME_LINE_HEIGHT}
                      fill={colors.textMain}
                      fontSize={13}
                      fontWeight="700"
                      textAnchor="middle"
                      {...textFont}
                    >
                      {line}
                    </SvgText>
                  ))}
                  <SvgText
                    x={centerX}
                    y={top + lines.length * NAME_LINE_HEIGHT + 11}
                    fill={node.type === "TECHNIQUE" ? statusTextColor(node.status) : colors.textMuted}
                    fontSize={11}
                    textAnchor="middle"
                    {...textFont}
                  >
                    {metricsLabel(node)}
                  </SvgText>
                </G>
              );
            })}
          </Svg>

          {/* Capa táctil: tocar un espacio vacío deselecciona; cada nodo es un botón accesible. */}
          <Pressable
            accessibilityLabel="Fondo del grafo, toca para quitar la selección"
            onPress={() => onSelect(null)}
            style={StyleSheet.absoluteFill}
          />
          {layout.nodes.map(({ node, x, y }) => (
            <Pressable
              key={node.id}
              accessibilityRole="button"
              accessibilityLabel={`${node.name}, ${metricsLabel(node)}`}
              accessibilityState={{ selected: node.id === selectedId }}
              onPress={() => onSelect(node.id)}
              style={{
                position: "absolute",
                left: x * scale,
                top: y * scale,
                width: NODE_W * scale,
                height: NODE_H * scale,
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export const SkillGraphView = memo(SkillGraphViewBase);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
  },
});
