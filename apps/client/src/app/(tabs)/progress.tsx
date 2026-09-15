import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ComparisonSlider } from "@/components/progress/ComparisonSlider";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useComparison, usePhotos, useUser } from "@/hooks/data";
import { formatDuration, formatShortDate } from "@/lib/date";
import { defaultUnits, formatWeight, formatWeightDelta } from "@/lib/units";
import { colors, radius, spacing } from "@/theme/tokens";

export default function ProgressScreen() {
  const router = useRouter();
  const { data: photos } = usePhotos();
  const { data: comparison } = useComparison("1m");
  const { data: user } = useUser();
  const unit = defaultUnits(user.region).weight;

  const sorted = [...photos].sort(
    (a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime(),
  );

  const photoRows: (typeof sorted[number] | null)[][] = [];
  for (let i = 0; i < sorted.length; i += 3) {
    const row: (typeof sorted[number] | null)[] = sorted.slice(i, i + 3);
    while (row.length < 3) row.push(null);
    photoRows.push(row);
  }

  return (
    <Screen tabBarPadding>
      <View className="row-between pt-xs">
        <Text variant="heading-lg">Progress</Text>
        <IconButton
          icon="camera"
          accessibilityLabel="Add photo"
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
            <View className="gap-xs">
              <Text variant="overline" color="mute">
                Latest comparison
              </Text>
              <ComparisonSlider beforeUri={comparison.from.uri} afterUri={comparison.to.uri} />
              {/* The slider above owns horizontal drag, so the tap target that
                  opens the full comparison screen lives here instead — nesting
                  it under the same Pressable as the slider would fight the pan
                  gesture. */}
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/(modals)/comparison")}
                className="row-between active:opacity-70"
              >
                <Text variant="body-sm" color="mute">
                  {formatDuration(comparison.from.capturedAt, comparison.to.capturedAt)}
                  {comparison.weightDeltaKg !== null
                    ? ` · ${formatWeightDelta(comparison.weightDeltaKg, unit)}`
                    : ""}
                </Text>
                <Feather name="chevron-right" size={16} color={colors.mute} />
              </Pressable>
            </View>
          )}

          <View className="gap-xs">
            <Text variant="overline" color="mute">
              All photos
            </Text>
            {/* Edge-to-edge, Instagram-grid style: this breaks out of the
                screen's 16px gutter (only for the grid) so photos run flush to
                the device edges, with square corners and a hairline 2px gap. */}
            <View style={{ marginHorizontal: -spacing.md, gap: 2 }}>
              {/* Rows of three, padded out so a partial last row keeps the same
                  column width as a full one. */}
              {photoRows.map((row, rowIndex) => (
                <View key={rowIndex} className="row items-start" style={{ gap: 2 }}>
                  {row.map((photo, index) =>
                    photo === null ? (
                      <View key={`gap-${index}`} className="fill" />
                    ) : (
                      <Animated.View
                        key={photo.id}
                        entering={FadeInDown.duration(180).delay((rowIndex * 3 + index) * 35)}
                        className="fill"
                      >
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Photo from ${formatShortDate(photo.capturedAt)}`}
                          onPress={() =>
                            router.push({
                              pathname: "/(modals)/photo-detail",
                              params: { id: photo.id },
                            })
                          }
                          className="active:opacity-80"
                        >
                          <Image
                            source={photo.uri}
                            style={{ width: "100%", aspectRatio: 0.75 }}
                            contentFit="cover"
                          />
                          {/* Bottom-right caption chip on the photo-scrim token
                              (the app's overlay-on-photo color), so date/weight
                              stay legible over any photo. */}
                          <View
                            className="absolute"
                            style={{
                              right: 4,
                              bottom: 4,
                              borderRadius: radius.xs,
                              backgroundColor: colors["photo-scrim"],
                              paddingHorizontal: 6,
                              paddingVertical: 3,
                            }}
                          >
                            <Text variant="label-sm" color="on-ink">
                              {formatShortDate(photo.capturedAt)}
                            </Text>
                            {photo.weightKgAtCapture !== null && (
                              <Text
                                variant="label-sm"
                                color="on-ink"
                                tabular
                                style={{ opacity: 0.72 }}
                              >
                                {formatWeight(photo.weightKgAtCapture, unit)}
                              </Text>
                            )}
                          </View>
                        </Pressable>
                      </Animated.View>
                    ),
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    </Screen>
  );
}
