import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useComparison, usePhotos, useUser } from "@/hooks/data";
import { formatDuration, formatShortDate } from "@/lib/date";
import { defaultUnits, formatWeight, formatWeightDelta } from "@/lib/units";

export default function ProgressScreen() {
  const router = useRouter();
  const { data: photos } = usePhotos();
  const { data: comparison } = useComparison("1m");
  const { data: user } = useUser();
  const unit = defaultUnits(user.region).weight;

  const sorted = [...photos].sort(
    (a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime(),
  );

  return (
    <Screen tabBarPadding>
      <View className="row-between pt-xs">
        <Text variant="heading-lg">Progress</Text>
        <Button
          label="Add photo"
          variant="secondary"
          icon="camera"
          onPress={() => router.push("/(modals)/photo-capture")}
        />
      </View>

      {photos.length === 0 ? (
        <EmptyState
          icon="camera"
          title="No photos yet"
          body="Take your first progress photo. It stays private, and after the second one your comparison builds itself."
          actionLabel="Take a photo"
          onAction={() => router.push("/(modals)/photo-capture")}
          className="mt-lg"
        />
      ) : (
        <View className="gap-lg pt-md">
          {comparison && (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(modals)/comparison")}
              className="gap-xs active:opacity-90"
            >
              <Text variant="overline" color="mute">
                Latest comparison
              </Text>
              <View className="row gap-xxs">
                <Image
                  source={comparison.from.uri}
                  style={{ flex: 1, aspectRatio: 0.75, borderRadius: 20 }}
                  contentFit="cover"
                />
                <Image
                  source={comparison.to.uri}
                  style={{ flex: 1, aspectRatio: 0.75, borderRadius: 20 }}
                  contentFit="cover"
                />
              </View>
              <Text variant="body-sm" color="mute">
                {formatDuration(comparison.from.capturedAt, comparison.to.capturedAt)}
                {comparison.weightDeltaKg !== null
                  ? ` · ${formatWeightDelta(comparison.weightDeltaKg, unit)}`
                  : ""}
              </Text>
            </Pressable>
          )}

          <View className="gap-xs">
            <Text variant="overline" color="mute">
              All photos
            </Text>
            <View className="flex-row flex-wrap gap-xs">
              {sorted.map((photo, index) => (
                <Animated.View
                  key={photo.id}
                  entering={FadeInDown.duration(180).delay(index * 35)}
                  style={{ width: "31.5%" }}
                  className="gap-xxs"
                >
                  <Image
                    source={photo.uri}
                    style={{ width: "100%", aspectRatio: 0.75, borderRadius: 16 }}
                    contentFit="cover"
                  />
                  <Text variant="body-sm" color="mute">
                    {formatShortDate(photo.capturedAt)}
                  </Text>
                  {photo.weightKgAtCapture !== null && (
                    <Text variant="body-sm" color="faint" tabular>
                      {formatWeight(photo.weightKgAtCapture, unit)}
                    </Text>
                  )}
                </Animated.View>
              ))}
            </View>
          </View>
        </View>
      )}
    </Screen>
  );
}
