import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
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
import {
  useComparison,
  usePhotoSessions,
  usePhotos,
  useUser,
  type ComparisonRange,
  type PhotoSession,
} from "@/hooks/data";
import { MotionView } from "@/lib/animated";
import { formatDuration, formatShortDate } from "@/lib/date";
import { defaultUnits, formatWeight, formatWeightDelta } from "@/lib/units";
import { colors, spacing } from "@/theme/tokens";
import type { Goal } from "@/types/domain";

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
  const { data: sessions } = usePhotoSessions();
  const { data: comparison } = useComparison(range);
  const { data: user } = useUser();
  const unit = defaultUnits(user.region).weight;

  const capture = () => router.push("/(modals)/photo-capture");

  /** Sessions arrive newest first — the gallery reads as a feed. */
  const oldest = sessions[sessions.length - 1];

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
            {sessions.map((session, index) => (
              <SessionTile
                key={session.key}
                session={session}
                unit={unit}
                index={index}
                onPress={() =>
                  router.push({
                    pathname: "/(modals)/photo-detail",
                    params: { id: session.cover.id },
                  })
                }
              />
            ))}
            {/* Always the last cell: the primary action stays in reach, and a
                partial final row reads as deliberate rather than truncated. */}
            <AddTile index={sessions.length} onPress={capture} />
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

/**
 * One tile per day's shoot, not per frame — the detail pager pages by day, and
 * a grid that counted frames would scroll past entries the grid never showed.
 * Square corners throughout: a contact sheet of square cells reads as one
 * surface, where rounded ones read as a row of separate cards.
 */
function SessionTile({
  session,
  unit,
  index,
  onPress,
}: {
  session: PhotoSession;
  unit: ReturnType<typeof defaultUnits>["weight"];
  index: number;
  onPress: () => void;
}) {
  const angles = session.photos.length;

  return (
    <MotionView
      entering={FadeInDown.duration(220).delay(Math.min(index, 8) * 30)}
      style={gridCell}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          angles > 1
            ? `${angles} photos from ${formatShortDate(session.capturedAt)}`
            : `Photo from ${formatShortDate(session.capturedAt)}`
        }
        onPress={onPress}
        className="gap-xxs active:opacity-80"
      >
        <View>
          <Image
            source={session.cover.uri}
            style={{ width: "100%", aspectRatio: 0.8 }}
            contentFit="cover"
          />
          {/* Same signal a photo app's carousel post carries: this cell holds
              more than the frame on top of it. */}
          {angles > 1 && (
            <View
              className="absolute right-xxs top-xxs row gap-xxs rounded-pill p-xxs"
              style={{ backgroundColor: colors["photo-scrim"] }}
            >
              <Feather name="layers" size={10} color={colors["on-ink"]} />
              <Text variant="label-sm" color="on-ink" tabular>
                {angles}
              </Text>
            </View>
          )}
        </View>
        {/* One caption line per tile: date pinned left, weight pinned right, so
            the numbers line up down each column. `shrink` keeps a long date from
            pushing the weight out of a ~100px cell instead of both truncating. */}
        <View className="row-between gap-xxs">
          <Text variant="label-sm" numberOfLines={1} className="shrink">
            {formatShortDate(session.capturedAt)}
          </Text>
          {session.weightKgAtCapture !== null && (
            <Text variant="body-sm" color="mute" tabular numberOfLines={1}>
              {formatWeight(session.weightKgAtCapture, unit)}
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
        style={{ width: "100%", aspectRatio: 0.8 }}
      >
        <Feather name="plus" size={22} color={colors.faint} />
      </Pressable>
    </MotionView>
  );
}
