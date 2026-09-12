import { useState } from "react";
import { Dimensions, View } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";

import { Text } from "@/components/ui/Text";
import type { SmoothedPoint } from "@/lib/weightTrend";
import { colors } from "@/theme/tokens";

interface TrendChartProps {
  points: SmoothedPoint[];
  height?: number;
  formatValue?: (value: number) => string;
}

/**
 * Plots the rolling average as the primary line with raw weigh-ins as faint
 * dots behind it. Showing raw weight as the main line would make normal
 * water-weight swing look like progress or failure (PRD 6.3).
 */
/**
 * Seeded from the window so the chart draws on first paint instead of waiting a
 * frame for onLayout — and so it still draws if onLayout never reports a width.
 * The screen gutter and the card padding either side come to 64.
 */
const estimatedWidth = () => Dimensions.get("window").width - 64;

export function TrendChart({ points, height = 180, formatValue }: TrendChartProps) {
  const [width, setWidth] = useState(estimatedWidth);

  const values = points.flatMap((p) => [p.raw, p.average]);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;
  const span = max - min || 1;
  const pad = 12;
  const plotHeight = height - pad * 2;

  if (points.length < 2) {
    return (
      <View className="center rounded-lg bg-sunken" style={{ height }}>
        <Text variant="body-md" color="mute">
          Not enough entries yet
        </Text>
      </View>
    );
  }

  const x = (i: number) => (i / (points.length - 1)) * width;
  const y = (v: number) => pad + plotHeight - ((v - min) / span) * plotHeight;

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.average).toFixed(1)}`)
    .join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <View className="gap-xs">
      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ height }}>
        {width > 0 && (
          <Svg width={width} height={height}>
            {[0, 0.5, 1].map((t) => (
              <Line
                key={t}
                x1={0}
                x2={width}
                y1={pad + plotHeight * t}
                y2={pad + plotHeight * t}
                stroke={colors.hairline}
                strokeWidth={1}
              />
            ))}
            <Path d={area} fill={colors.primary} fillOpacity={0.1} />
            {points.map((p, i) => (
              <Circle key={p.date} cx={x(i)} cy={y(p.raw)} r={2} fill={colors.faint} />
            ))}
            <Path
              d={line}
              stroke={colors.ink}
              strokeWidth={2.5}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </Svg>
        )}
      </View>
      {formatValue && (
        <View className="row-between">
          <Text variant="body-sm" color="mute" tabular>
            {formatValue(min)}
          </Text>
          <Text variant="body-sm" color="mute" tabular>
            {formatValue(max)}
          </Text>
        </View>
      )}
    </View>
  );
}
