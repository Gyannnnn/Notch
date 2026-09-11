import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { colors } from "@/theme/tokens";

interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
}

/** A shape, not a chart — no axes, no labels (DESIGN.md). */
export function Sparkline({ values, width = 96, height = 32 }: SparklineProps) {
  if (values.length < 2) return <View style={{ width, height }} />;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const points = values.map((value, i) => ({
    x: (i / (values.length - 1)) * width,
    y: height - ((value - min) / span) * height,
  }));

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <Svg width={width} height={height}>
      <Path d={area} fill={colors.ink} fillOpacity={0.06} />
      <Path d={line} stroke={colors.ink} strokeWidth={2} fill="none" strokeLinejoin="round" />
    </Svg>
  );
}
