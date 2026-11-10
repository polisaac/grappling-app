import Svg, { Circle, Line, Path } from "react-native-svg";

// Iconos de trazo (24x24) para la barra inferior y la pantalla de Perfil. Se dibujan con
// react-native-svg para verse igual en iOS, Android y web, sin depender de fuentes de iconos.

export interface IconProps {
  color: string;
  size?: number;
}

const STROKE_WIDTH = 2;
const DEFAULT_SIZE = 24;

// Los 8 dientes del engranaje: segmentos radiales cada 45 grados.
const GEAR_TEETH = Array.from({ length: 8 }, (_, index) => {
  const angle = (index * Math.PI) / 4;
  return {
    key: index,
    x1: 12 + Math.cos(angle) * 6.5,
    y1: 12 + Math.sin(angle) * 6.5,
    x2: 12 + Math.cos(angle) * 9.5,
    y2: 12 + Math.sin(angle) * 9.5,
  };
});

export function FeedIcon({ color, size = DEFAULT_SIZE }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10.5L12 3l9 7.5V21h-6v-7H9v7H3z"
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SkillTreeIcon({ color, size = DEFAULT_SIZE }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={5} r={2.5} stroke={color} strokeWidth={STROKE_WIDTH} />
      <Circle cx={6} cy={19} r={2.5} stroke={color} strokeWidth={STROKE_WIDTH} />
      <Circle cx={18} cy={19} r={2.5} stroke={color} strokeWidth={STROKE_WIDTH} />
      <Path
        d="M11 7.2L7 16.8M13 7.2l4 9.6"
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ProfileIcon({ color, size = DEFAULT_SIZE }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={STROKE_WIDTH} />
      <Path
        d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function SettingsIcon({ color, size = DEFAULT_SIZE }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={6.5} stroke={color} strokeWidth={STROKE_WIDTH} />
      <Circle cx={12} cy={12} r={2.5} stroke={color} strokeWidth={STROKE_WIDTH} />
      {GEAR_TEETH.map((tooth) => (
        <Line
          key={tooth.key}
          x1={tooth.x1}
          y1={tooth.y1}
          x2={tooth.x2}
          y2={tooth.y2}
          stroke={color}
          strokeWidth={STROKE_WIDTH + 1}
          strokeLinecap="round"
        />
      ))}
    </Svg>
  );
}
