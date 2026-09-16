import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { FadeIn, FadeInDown } from "react-native-reanimated";

import { ComparisonSlider } from "@/components/progress/ComparisonSlider";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { Screen } from "@/components/ui/Screen";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Text } from "@/components/ui/Text";
import { useComparison, usePhotos, useUser, type ComparisonRange } from "@/hooks/data";
import { MotionView } from "@/lib/animated";
import { formatDuration, formatShortDate } from "@/lib/date";
import { defaultUnits, formatWeight, formatWeightDelta } from "@/lib/units";
import { colors, curve, radius, spacing } from "@/theme/tokens";
import type { Goal, ProgressPhoto } from "@/types/domain";

const RANGES: { value: ComparisonRange; label: string }[] = [
  { value: "2w", label: "2 weeks" },
  { value: "1m", label: "1 month" },
  { value: "oldest", label: "All time" },
];

const COLUMNS = 3;
const GRID_GAP = spacing.xs;

/**
 * Whether a weight change reads as progress depends entirely on what the user
 * signed up for, so the badge is only tinted when the direction matches their
 * goal. Without a goal set, or on maintain, the number is reported flat.
 */
function deltaTone(deltaKg: number, goal: Goal | null) {
  if (goal === "CUT" && deltaKg < 0) return "positive" as const;
  if (goal === "BULK" && deltaKg > 0) return "positive" as const;
  return "neutral" as const;
}

/**
 * An exact 3-up grid that needs no measurement: the row pulls out by half a
 * gutter on each side and every cell pads back in by the same amount, so the
 * columns are always `100 / COLUMNS` wide however narrow the screen gets.
 * Percentage widths combined with `gap` cannot add up to 100% and would drop a
 * column to the next row on some widths.
 */
const gridRow = {
  flexDirection: "row",
  flexWrap: "wrap",
  marginHorizontal: -GRID_GAP / 2,
  rowGap: spacing.sm,
} as const;

const gridCell = {
  width: `${100 / COLUMNS}%`,
  paddingHorizontal: GRID_GAP / 2,
} as const;

export default function ProgressScreen() {
  const router = useRouter();
  const [range, setRange] = useState<ComparisonRange>("1m");
  const { data: photos } = usePhotos();
  const { data: comparison } = useComparison(range);
  const { data: user } = useUser();
  const unit = defaultUnits(user.region).weight;

  const capture = () => router.push("/(modals)/photo-capture");

  /** Newest first — the gallery reads as a feed, most recent at the top. */
  const sorted = useMemo(
    () =>
      [...photos].sort(
        (a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime(),
      ),
    [photos],
  );
  const oldest = sorted[sorted.length - 1];

  if (photos.length === 0) {
    return (
      <Screen tabBarPadding>
        <Header count={0} onCapture={capture} />
        <EmptyState
          icon="camera"
          title="No photos yet"
          body="Take your first progress photo. It stays private, and after the second one your comparison builds itself."
          actionLabel="Take a photo"
          onAction={capture}
          className="mt-lg"
        />
      </Screen>
    );
  }

  return (
    <Screen tabBarPadding>
      <Header
        count={photos.length}
        since={oldest ? formatShortDate(oldest.capturedAt) : undefined}
        onCapture={capture}
      />

      <View className="gap-lg pt-md">
        {comparison ? (
          <View className="gap-sm">
            <SegmentedControl segments={RANGES} value={range} onChange={setRange} />

            {/* `overflow-hidden` so the slider's square top corners are clipped
                by the card's radius instead of doubling up on their own. */}
            <Card padded={false} raised className="overflow-hidden">
              <ComparisonSlider
                key={range}
                beforeUri={comparison.from.uri}
                afterUri={comparison.to.uri}
                aspectRatio={0.84}
                rounded={false}
                beforeLabel={formatShortDate(comparison.from.capturedAt)}
                afterLabel={formatShortDate(comparison.to.capturedAt)}
              />

              {/* The slider owns horizontal drag, so the tap target that opens
                  the full comparison screen lives here rather than wrapping the
                  photo — nesting the two would fight the pan gesture. */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open full comparison"
                onPress={() => router.push("/(modals)/comparison")}
                className="row-between gap-sm px-md py-sm active:bg-sunken"
              >
                <View className="fill">
                  <Text variant="heading-sm">
                    {formatDuration(comparison.from.capturedAt, comparison.to.capturedAt)} apart
                  </Text>
                  <Text variant="body-sm" color="mute">
                    Drag to wipe between them
                  </Text>
                </View>
                {comparison.weightDeltaKg !== null && (
                  <Badge
                    label={formatWeightDelta(comparison.weightDeltaKg, unit)}
                    tone={deltaTone(comparison.weightDeltaKg, user.goal)}
                  />
                )}
                <Feather name="chevron-right" size={18} color={colors.faint} />
              </Pressable>
            </Card>
          </View>
        ) : (
          <Card className="row items-center gap-sm" raised>
            <View className="center rounded-full bg-primary-soft" style={{ width: 40, height: 40 }}>
              <Feather name="layers" size={18} color={colors["primary-deep"]} />
            </View>
            <View className="fill">
              <Text variant="heading-sm">One more photo</Text>
              <Text variant="body-sm" color="mute">
                A second shot unlocks your side-by-side comparison.
              </Text>
            </View>
          </Card>
        )}

        <View className="gap-sm">
          <View className="row-between">
            <Text variant="overline" color="mute">
              All photos
            </Text>
            <Text variant="label-sm" color="faint" tabular>
              {photos.length}
            </Text>
          </View>

          <View style={gridRow}>
            {sorted.map((photo, index) => (
              <PhotoTile
                key={photo.id}
                photo={photo}
                unit={unit}
                index={index}
                onPress={() =>
                  router.push({ pathname: "/(modals)/photo-detail", params: { id: photo.id } })
                }
              />
            ))}
            {/* Always the last cell: the primary action stays in reach, and a
                partial final row reads as deliberate rather than truncated. */}
            <AddTile index={sorted.length} onPress={capture} />
          </View>
        </View>
      </View>
    </Screen>
  );
}

function Header({
  count,
  since,
  onCapture,
}: {
  count: number;
  since?: string;
  onCapture: () => void;
}) {
  return (
    <View className="row-between gap-sm pt-xs">
      <View className="fill">
        <Text variant="heading-lg">Progress</Text>
        {count > 0 && (
          <Text variant="body-sm" color="mute" tabular>
            {count} {count === 1 ? "photo" : "photos"}
            {since ? ` · since ${since}` : ""}
          </Text>
        )}
      </View>
      <IconButton icon="camera" accessibilityLabel="Add photo" onPress={onCapture} />
    </View>
  );
}

function PhotoTile({
  photo,
  unit,
  index,
  onPress,
}: {
  photo: ProgressPhoto;
  unit: ReturnType<typeof defaultUnits>["weight"];
  index: number;
  onPress: () => void;
}) {
  return (
    <MotionView
      entering={FadeInDown.duration(220).delay(Math.min(index, 8) * 30)}
      style={gridCell}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Photo from ${formatShortDate(photo.capturedAt)}`}
        onPress={onPress}
        className="gap-xxs active:opacity-80"
      >
        <Image
          source={photo.uri}
          style={{ width: "100%", aspectRatio: 0.8, borderRadius: radius.sm }}
          contentFit="cover"
        />
        {/* One caption line per tile: date pinned left, weight pinned right, so
            the numbers line up down each column. `shrink` keeps a long date from
            pushing the weight out of a ~100px cell instead of both truncating. */}
        <View className="row-between gap-xxs">
          <Text variant="label-sm" numberOfLines={1} className="shrink">
            {formatShortDate(photo.capturedAt)}
          </Text>
          {photo.weightKgAtCapture !== null && (
            <Text variant="body-sm" color="mute" tabular numberOfLines={1}>
              {formatWeight(photo.weightKgAtCapture, unit)}
            </Text>
          )}
        </View>
      </Pressable>
    </MotionView>
  );
}

function AddTile({ index, onPress }: { index: number; onPress: () => void }) {
  return (
    <MotionView
      entering={FadeIn.duration(220).delay(Math.min(index, 8) * 30)}
      style={gridCell}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add photo"
        onPress={onPress}
        className="center border border-dashed border-hairline-strong bg-elevated active:bg-sunken"
        style={[{ width: "100%", aspectRatio: 0.8, borderRadius: radius.sm }, curve]}
      >
        <Feather name="plus" size={22} color={colors.faint} />
      </Pressable>
    </MotionView>
  );
}
