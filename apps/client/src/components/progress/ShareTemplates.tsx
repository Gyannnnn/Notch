import { Image } from "expo-image";
import { View } from "react-native";

import { Text } from "@/components/ui/Text";
import { APP_NAME } from "@/constants/app";
import type { Comparison } from "@/hooks/data";
import { formatDuration, formatShortDate } from "@/lib/date";
import { formatWeightDelta, type WeightUnit } from "@/lib/units";

export type TemplateId = "minimal" | "stacked" | "slider";

export const TEMPLATES: { id: TemplateId; label: string }[] = [
  { id: "minimal", label: "Minimal" },
  { id: "stacked", label: "Stacked" },
  { id: "slider", label: "Slider" },
];

interface TemplateProps {
  comparison: Comparison;
  unit: WeightUnit;
  showWeight: boolean;
  blurFaces: boolean;
}

/**
 * Templates carry only what the app actually tracks — weight and dates. No
 * body-fat stat, no score, no verification badge, no social handle.
 */
export function ShareTemplate({
  id,
  ...props
}: TemplateProps & { id: TemplateId }) {
  if (id === "stacked") return <StackedTemplate {...props} />;
  if (id === "slider") return <SliderTemplate {...props} />;
  return <MinimalTemplate {...props} />;
}

function Watermark() {
  return (
    <Text variant="label-sm" color="faint">
      {APP_NAME}
    </Text>
  );
}

function PhotoPane({
  uri,
  blurFaces,
  className,
}: {
  uri: string | number;
  blurFaces: boolean;
  className?: string;
}) {
  return (
    <View className={className}>
      <Image source={uri} style={{ width: "100%", height: "100%" }} contentFit="cover" />
      {blurFaces && (
        <View
          className="absolute left-0 right-0 bg-ink opacity-90"
          style={{ top: "8%", height: "14%" }}
        />
      )}
    </View>
  );
}

function MinimalTemplate({ comparison, unit, showWeight, blurFaces }: TemplateProps) {
  return (
    <View className="overflow-hidden rounded-lg bg-elevated" style={{ aspectRatio: 0.8 }}>
      <View className="fill flex-row gap-px">
        <PhotoPane uri={comparison.from.uri} blurFaces={blurFaces} className="fill" />
        <PhotoPane uri={comparison.to.uri} blurFaces={blurFaces} className="fill" />
      </View>
      <View className="row-between px-md py-sm">
        <Text variant="label-sm" color="mute">
          {formatDuration(comparison.from.capturedAt, comparison.to.capturedAt)}
          {showWeight && comparison.weightDeltaKg !== null
            ? ` · ${formatWeightDelta(comparison.weightDeltaKg, unit)}`
            : ""}
        </Text>
        <Watermark />
      </View>
    </View>
  );
}

function StackedTemplate({ comparison, unit, showWeight, blurFaces }: TemplateProps) {
  return (
    <View className="overflow-hidden rounded-lg bg-elevated" style={{ aspectRatio: 0.5625 }}>
      <PhotoPane uri={comparison.from.uri} blurFaces={blurFaces} className="fill" />
      <View className="items-center bg-canvas py-sm">
        {showWeight && comparison.weightDeltaKg !== null && (
          <Text variant="metric-lg" tabular>
            {formatWeightDelta(comparison.weightDeltaKg, unit)}
          </Text>
        )}
        <Text variant="label-sm" color="mute">
          {formatDuration(comparison.from.capturedAt, comparison.to.capturedAt)}
        </Text>
      </View>
      <PhotoPane uri={comparison.to.uri} blurFaces={blurFaces} className="fill" />
      <View className="absolute bottom-0 right-0 p-xs">
        <Watermark />
      </View>
    </View>
  );
}

function SliderTemplate({ comparison, unit, showWeight, blurFaces }: TemplateProps) {
  return (
    <View className="overflow-hidden rounded-lg bg-ink" style={{ aspectRatio: 0.5625 }}>
      <PhotoPane uri={comparison.to.uri} blurFaces={blurFaces} className="absolute-fill" />
      <View className="absolute bottom-0 left-0 top-0 overflow-hidden" style={{ width: "52%" }}>
        <PhotoPane uri={comparison.from.uri} blurFaces={blurFaces} className="fill" />
      </View>
      <View className="absolute bottom-0 top-0 bg-elevated" style={{ left: "52%", width: 2 }} />
      <View className="absolute bottom-0 left-0 right-0 row-between p-md">
        <View>
          <Text variant="label-sm" color="on-ink">
            {formatShortDate(comparison.from.capturedAt)} →{" "}
            {formatShortDate(comparison.to.capturedAt)}
          </Text>
          {showWeight && comparison.weightDeltaKg !== null && (
            <Text variant="metric-md" color="on-ink" tabular>
              {formatWeightDelta(comparison.weightDeltaKg, unit)}
            </Text>
          )}
        </View>
        <Text variant="label-sm" color="on-ink" className="opacity-70">
          {APP_NAME}
        </Text>
      </View>
    </View>
  );
}
