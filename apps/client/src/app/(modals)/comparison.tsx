import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { ComparisonSlider } from "@/components/progress/ComparisonSlider";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Text } from "@/components/ui/Text";
import { useComparison, useUser, type ComparisonRange } from "@/hooks/data";
import { formatShortDate } from "@/lib/date";
import { defaultUnits, formatWeight, formatWeightDelta } from "@/lib/units";

const RANGES: { value: ComparisonRange; label: string }[] = [
  { value: "2w", label: "2 weeks" },
  { value: "1m", label: "1 month" },
  { value: "oldest", label: "Oldest" },
];

type ViewMode = "slider" | "side";

export default function ComparisonScreen() {
  const router = useRouter();
  const [range, setRange] = useState<ComparisonRange>("1m");
  const [mode, setMode] = useState<ViewMode>("slider");
  const [showStats, setShowStats] = useState(true);

  const { data: user } = useUser();
  const { data: comparison } = useComparison(range);
  const unit = defaultUnits(user.region).weight;

  return (
    <Screen>
      <ScreenHeader title="Comparison" dismiss />

      {!comparison ? (
        <EmptyState
          icon="image"
          title="Two photos needed"
          body="Once you have a second progress photo, your comparison appears here automatically."
          actionLabel="Take a photo"
          onAction={() => router.replace("/(modals)/photo-capture")}
          className="mt-lg"
        />
      ) : (
        <View className="gap-md pt-xs">
          <SegmentedControl segments={RANGES} value={range} onChange={setRange} />

          {mode === "slider" ? (
            <ComparisonSlider
              key={range}
              beforeUri={comparison.from.uri}
              afterUri={comparison.to.uri}
              beforeLabel={formatShortDate(comparison.from.capturedAt)}
              afterLabel={formatShortDate(comparison.to.capturedAt)}
            />
          ) : (
            <View className="row gap-xs">
              {[comparison.from, comparison.to].map((photo) => (
                <View key={photo.id} className="fill gap-xxs">
                  <Image
                    source={photo.uri}
                    style={{ width: "100%", aspectRatio: 0.75, borderRadius: 20 }}
                    contentFit="cover"
                  />
                  <Text variant="label-sm" color="mute">
                    {formatShortDate(photo.capturedAt)}
                    {photo.weightKgAtCapture !== null
                      ? ` · ${formatWeight(photo.weightKgAtCapture, unit)}`
                      : ""}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {showStats && (
            <View className="row-between rounded-md bg-sunken px-md py-sm">
              <Stat label="Elapsed" value={`${comparison.days} days`} />
              {comparison.weightDeltaKg !== null && (
                <Stat
                  label="Weight"
                  value={formatWeightDelta(comparison.weightDeltaKg, unit)}
                />
              )}
            </View>
          )}

          <View className="row gap-xs">
            <Button
              label={mode === "slider" ? "Side by side" : "Slider"}
              variant="secondary"
              icon={mode === "slider" ? "columns" : "sliders"}
              onPress={() => setMode(mode === "slider" ? "side" : "slider")}
              className="fill"
            />
            <Button
              label={showStats ? "Hide stats" : "Show stats"}
              variant="secondary"
              onPress={() => setShowStats((v) => !v)}
              className="fill"
            />
          </View>

          <Button
            label="Share"
            icon="share-2"
            fullWidth
            onPress={() => router.push("/(modals)/share-template")}
          />

          <Text variant="body-sm" color="mute" className="text-center">
            Your photos stay private until you choose to share them.
          </Text>
        </View>
      )}
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="gap-xxs">
      <Text variant="label-sm" color="mute">
        {label}
      </Text>
      <Text variant="metric-md" tabular>
        {value}
      </Text>
    </View>
  );
}
