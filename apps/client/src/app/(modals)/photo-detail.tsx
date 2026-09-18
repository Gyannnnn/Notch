import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Alert,
  FlatList,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import {
  usePhotoSessions,
  usePhotos,
  useRemovePhoto,
  useUser,
  type PhotoSession,
  type PhotoSlide,
} from "@/hooks/data";
import { usePhotoAspects } from "@/hooks/usePhotoAspects";
import { formatShortDate } from "@/lib/date";
import { defaultUnits, formatWeight } from "@/lib/units";
import { colors, spacing } from "@/theme/tokens";
import type { PhotoAngle } from "@/types/domain";

const ANGLE_LABELS: Record<PhotoAngle, string> = {
  FRONT: "Front",
  SIDE: "Side",
  BACK: "Back",
};

/**
 * A ceiling for a pathological image — a panorama stood on end — so one file
 * can't produce a page taller than the phone can sensibly scroll. Ordinary
 * camera shapes, 1:1 through 9:16, never come near it.
 */
const MAX_PHOTO_SCALE = 1.4;

/** Clear air between one day's card and the next. Enough to read as a break. */
const FRAME_GAP = spacing["2xl"];

/**
 * The band between photo and caption that the carousel dots sit in. It doubles
 * as the gap between the two, so the dots cost no height of their own — and
 * being fixed, it keeps every card's height predictable whatever the dot count.
 */
const DOTS_ROW = spacing.lg;

/** Diameter of one carousel dot. */
const DOT = 6;

/**
 * The caption's parts, fixed rather than measured. Item offsets are computed
 * before anything renders, so a row that decided its own height would put every
 * offset out by however much it disagreed — and `getItemLayout` would send
 * scrollToIndex to the wrong place. 44 is the tap target both controls stand on.
 */
const CAPTION_ROW = 44;
const CAPTION_GAP = spacing.xs;

/** Breathing room at the very top and bottom of the feed — not a centring gap. */
const FEED_PAD_TOP = spacing.xs;
const FEED_PAD_BOTTOM = spacing.lg;

/** How far the pills sit in from the photo's corners and bottom edge. */
const CHROME_INSET = spacing.sm;

/** Used only for a day whose every angle is an empty slot and has no size to read. */
const EMPTY_SLOT_ASPECT = 3 / 4;

interface Frame {
  width: number;
  height: number;
}

interface Slot {
  frame: Frame;
  /** Card plus the gap under it — what one page occupies in the scroll content. */
  height: number;
  offset: number;
}

interface Layout {
  slots: Slot[];
  /** Captions are inset to the gutter while the photo runs edge to edge. */
  contentWidth: number;
  /** Uniform across cards: every card offers the same controls. */
  captionHeight: number;
  paddingTop: number;
  paddingBottom: number;
}

const EMPTY_LAYOUT: Layout = {
  slots: [],
  contentWidth: 0,
  captionHeight: 0,
  paddingTop: 0,
  paddingBottom: 0,
};

/**
 * Two axes, the way a photo app trains people to expect: up and down moves
 * through the days, left and right moves through the angles shot on one day.
 *
 * The frame is built around the photo rather than the photo being cropped into
 * a frame — this screen exists so someone can judge their own physique, and a
 * fixed 3:4 box quietly shaving 40% off a square capture defeats the whole
 * point. Each day's frame takes the proportions of that day's tallest shot, so
 * nothing is cropped and nothing reflows while swiping across angles.
 *
 * Laid out as a feed rather than a pager: photos run edge to edge, each with its
 * own caption and controls beneath it, stacked from the top and scrolled freely.
 * Nothing snaps and nothing is centred — centring each card is what left half a
 * screen of empty canvas above the first one and below the last.
 */
export default function PhotoDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data: sessions } = usePhotoSessions();
  const { data: photos } = usePhotos();
  const { data: user } = useUser();
  const removePhoto = useRemovePhoto();
  const insets = useSafeAreaInsets();
  const unit = defaultUnits(user.region).weight;

  const listRef = useRef<FlatList<PhotoSession>>(null);
  // A relayout puts the day you were reading back under your eyes, but only when
  // that isn't fighting a finger already on the glass.
  const interacting = useRef(false);
  // The opening scroll has to happen once the content has a measured height —
  // see onContentSizeChange below.
  const opened = useRef(false);

  // Pages are sized from the photos themselves, so the pager can't lay out
  // until the space it has to fill is known.
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  const [active, setActive] = useState(() => {
    const index = sessions.findIndex((session) => session.photos.some((photo) => photo.id === id));
    return index < 0 ? 0 : index;
  });

  // Which angle each day is showing. Lifted out of the pages because the footer
  // is fixed to the screen and has to name the frame currently on show.
  const [slides, setSlides] = useState<Record<string, number>>(() => {
    const session = sessions.find((item) => item.photos.some((photo) => photo.id === id));
    if (!session) return {};
    // Open on the photo that was tapped, not on whichever angle happens to sort
    // first that day.
    const index = session.slides.findIndex((slide) => slide.photo?.id === id);
    return index < 0 ? {} : { [session.key]: index };
  });

  const uris = useMemo(
    () => sessions.flatMap((session) => session.photos.map((photo) => photo.uri)),
    [sessions],
  );
  const aspectOf = usePhotoAspects(uris);

  const comparable = photos.length >= 2;

  const layout = useMemo<Layout>(() => {
    if (viewport.width <= 0 || viewport.height <= 0 || sessions.length === 0) return EMPTY_LAYOUT;

    const contentWidth = viewport.width - spacing.md * 2;
    // Same for every card, because every card offers the same controls — which
    // is what lets one number describe all of them.
    const captionHeight = CAPTION_ROW + (comparable ? CAPTION_GAP + CAPTION_ROW : 0);
    const maxHeight = viewport.height * MAX_PHOTO_SCALE;

    const frames: Frame[] = sessions.map((session) => {
      // The day's tallest shot — smallest width÷height — sets the frame, so
      // swiping between angles never resizes it and the footer below never
      // jumps. Wider angles letterbox inside it.
      const tallest = session.slides.reduce(
        (ratio, slide) => (slide.photo ? Math.min(ratio, aspectOf(slide.photo.uri)) : ratio),
        Number.POSITIVE_INFINITY,
      );
      const aspect = Number.isFinite(tallest) ? tallest : EMPTY_SLOT_ASPECT;

      // Edge to edge, and then however tall that makes it. Width is the fixed
      // side now, so the photo's own proportions decide the height outright and
      // nothing is ever cropped to reach it. Only the pathological cap can pull
      // a photo back in from the sides.
      const width = Math.min(viewport.width, maxHeight * aspect);
      return { width: Math.round(width), height: Math.round(width / aspect) };
    });

    // A feed, not a carousel: cards are stacked from the top and read in order.
    // Centring each one is what put half a screen of canvas above the first and
    // below the last, and there is nothing at either end to centre against.
    let cursor = FEED_PAD_TOP;
    const slots: Slot[] = frames.map((frame) => {
      const offset = cursor;
      const height = frame.height + DOTS_ROW + captionHeight + FRAME_GAP;
      cursor += height;
      return { frame, height, offset };
    });

    return {
      slots,
      contentWidth,
      captionHeight,
      paddingTop: FEED_PAD_TOP,
      // The last card already carries FRAME_GAP under it; this is only so its
      // caption doesn't sit flush against the home indicator.
      paddingBottom: Math.max(0, FEED_PAD_BOTTOM - FRAME_GAP),
    };
  }, [sessions, aspectOf, viewport, comparable]);

  // Still tracked, but only so a relayout — a delete, or a remote photo
  // reporting its real size — can put the day you were looking at back under
  // your eyes. Nothing is rendered from it.
  const activeIndex = Math.min(active, Math.max(0, sessions.length - 1));

  // Read through a ref so repositioning depends on the geometry alone. Keyed on
  // `activeIndex` instead, every scroll would change the index, re-run the
  // effect below and yank the list back mid-gesture. Synced in its own effect
  // rather than during render, and declared first so it has already committed by
  // the time the repositioning effect reads it.
  const activeRef = useRef(activeIndex);
  useEffect(() => {
    activeRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    if (layout.slots.length === 0 || interacting.current) return;
    const slot = layout.slots[Math.min(activeRef.current, layout.slots.length - 1)];
    if (!slot) return;
    // Covers the first measure, a remote photo reporting its real size, and a
    // delete reshuffling everything below it.
    listRef.current?.scrollToOffset({ offset: slot.offset, animated: false });
  }, [layout]);

  const measure = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setViewport((current) =>
      current.width === width && current.height === height ? current : { width, height },
    );
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    let nearest = 0;
    let best = Number.POSITIVE_INFINITY;
    for (let index = 0; index < layout.slots.length; index += 1) {
      const distance = Math.abs(layout.slots[index]!.offset - y);
      if (distance >= best) continue;
      best = distance;
      nearest = index;
    }
    // Guarded rather than throttled: this fires every frame, and the footer only
    // has to re-render when the day under it actually changes.
    setActive((current) => (current === nearest ? current : nearest));
  };

  if (sessions.length === 0) {
    return (
      <Screen>
        <EmptyState
          icon="image"
          title="This photo is gone"
          body="It may already have been deleted."
          actionLabel="Close"
          onAction={() => router.back()}
          className="mt-lg"
        />
      </Screen>
    );
  }

  return (
    <View
      className="fill bg-canvas"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* No close control in the corner. This is a sheet — dragging it down
          dismisses it, and the grabber is what says so. */}
      <View className="items-center pb-xxs pt-xs">
        <View className="rounded-pill bg-hairline-strong" style={{ width: 36, height: 4 }} />
      </View>

      {/* Measured on the list's own box, not the screen's: the grabber sits
          outside it, and photos sized against a height that included it would
          each overrun by that much. */}
      <View className="fill" onLayout={measure}>
        {layout.slots.length > 0 && (
          <FlatList
            ref={listRef}
            data={sessions}
            keyExtractor={(session) => session.key}
            extraData={layout}
            showsVerticalScrollIndicator={false}
            // No snapping. A feed of full-bleed photos is read by scrolling, and
            // snapping a list whose items are all different heights fights the
            // finger instead of helping it.
            contentContainerStyle={{
              paddingTop: layout.paddingTop,
              paddingBottom: layout.paddingBottom,
            }}
            getItemLayout={(_, index) => {
              const slot = layout.slots[index]!;
              return { length: slot.height, offset: slot.offset, index };
            }}
            onContentSizeChange={() => {
              // scrollToOffset on the very first frame can clamp to a content
              // height the list hasn't measured yet and quietly land on day one.
              // This fires the moment that height is known, so opening on the
              // fourth photo actually opens on the fourth photo.
              if (opened.current) return;
              const slot = layout.slots[Math.min(activeRef.current, layout.slots.length - 1)];
              if (!slot) return;
              opened.current = true;
              listRef.current?.scrollToOffset({ offset: slot.offset, animated: false });
            }}
            onScroll={onScroll}
            scrollEventThrottle={16}
            onScrollBeginDrag={() => {
              interacting.current = true;
            }}
            onScrollEndDrag={() => {
              interacting.current = false;
            }}
            onMomentumScrollEnd={() => {
              interacting.current = false;
            }}
            renderItem={({ item, index }) => {
              const slot = layout.slots[index]!;
              return (
                <SessionFrame
                  session={item}
                  position={index + 1}
                  total={sessions.length}
                  slot={slot}
                  contentWidth={layout.contentWidth}
                  slide={Math.min(slides[item.key] ?? 0, item.slides.length - 1)}
                  onSlide={(next) => setSlides((current) => ({ ...current, [item.key]: next }))}
                  unit={unit}
                  captionHeight={layout.captionHeight}
                  comparable={comparable}
                  onCompare={() => router.push("/(modals)/comparison")}
                  onDelete={removePhoto}
                />
              );
            }}
          />
        )}
      </View>

    </View>
  );
}

function SessionFrame({
  session,
  position,
  total,
  slot,
  contentWidth,
  captionHeight,
  slide,
  onSlide,
  unit,
  comparable,
  onCompare,
  onDelete,
}: {
  session: PhotoSession;
  position: number;
  total: number;
  slot: Slot;
  contentWidth: number;
  captionHeight: number;
  slide: number;
  onSlide: (index: number) => void;
  unit: ReturnType<typeof defaultUnits>["weight"];
  comparable: boolean;
  onCompare: () => void;
  onDelete: (id: string) => void;
}) {
  const { frame } = slot;
  const active = session.slides[slide]!;
  const photo = active.photo;
  // The angle on show carries its own weight where it has one; the day's figure
  // is the fallback, not the headline.
  const weightKg = photo?.weightKgAtCapture ?? session.weightKgAtCapture;

  const confirmDelete = () => {
    if (!photo) return;
    Alert.alert("Delete this photo?", "Your other photos and logs are untouched.", [
      { text: "Keep it", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => onDelete(photo.id) },
    ]);
  };

  const onSlideEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / Math.max(1, frame.width));
    if (next !== slide) onSlide(next);
  };

  return (
    <View className="items-center" style={{ height: slot.height, paddingBottom: FRAME_GAP }}>
      {/* Edge to edge and square-cornered, the way a feed shows a photo: the
          picture is the page here, and a rounded card around it only makes it
          smaller. */}
      <View
        className="overflow-hidden"
        style={{ width: frame.width, height: frame.height, backgroundColor: colors.ink }}
      >
        <FlatList
          data={session.slides}
          keyExtractor={(item, index) => item.photo?.id ?? `${item.angle}-${index}`}
          extraData={frame}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onSlideEnd}
          initialScrollIndex={slide}
          getItemLayout={(_, index) => ({
            length: frame.width,
            offset: frame.width * index,
            index,
          })}
          renderItem={({ item }) => (
            <Shot slide={item} width={frame.width} height={frame.height} />
          )}
        />

        {/* Riding on the photo rather than sitting above and below it. Two rows
            of chrome cost real height, and on this screen that height is the
            difference between judging a physique and squinting at it. */}
        <View
          className="absolute left-0 right-0 top-0 row justify-between"
          style={{ padding: CHROME_INSET }}
          pointerEvents="none"
        >
          {total > 1 ? (
            <Pill>
              <Text variant="label-sm" color="on-ink" tabular>
                {position} / {total}
              </Text>
            </Pill>
          ) : (
            <View />
          )}
          <Pill>
            <Text variant="label-sm" color="on-ink">
              {ANGLE_LABELS[active.angle]}
            </Text>
          </Pill>
        </View>

      </View>

      {/* Below the photo rather than on it. Sitting on the canvas they read
          against a known background, so they need no scrim behind them and
          nothing covers the bottom of the shot. */}
      <View className="center row gap-xxs" style={{ height: DOTS_ROW }}>
        {session.slides.map((item, index) => (
          <View
            key={item.photo?.id ?? `${item.angle}-${index}`}
            className="rounded-full"
            style={{
              width: DOT,
              height: DOT,
              backgroundColor: index === slide ? colors.ink : colors["hairline-strong"],
            }}
          />
        ))}
      </View>

      {/* This day's own caption, under this day's own photo. Every control here
          acts on the frame above it, so a neighbouring card half on screen is
          fully usable rather than a trap — there is no "current" photo for it to
          act on by mistake. */}
      <View style={{ width: contentWidth, height: captionHeight }}>
        <View className="row-between gap-xs" style={{ height: CAPTION_ROW }}>
          <View className="row shrink gap-xs">
            <Text variant="heading-sm" numberOfLines={1}>
              {formatShortDate(session.capturedAt)}
            </Text>
            <Text variant="body-md" color="faint">
              ·
            </Text>
            <Text variant="body-md" color="body" tabular numberOfLines={1}>
              {weightKg !== null ? formatWeight(weightKg, unit) : "—"}
            </Text>
          </View>

          {/* Deleting acts on the frame above, so an empty angle has nothing to
              offer here and the button simply isn't there. */}
          {photo && (
            <IconButton
              icon="trash-2"
              tone="error"
              accessibilityLabel={`Delete ${ANGLE_LABELS[active.angle].toLowerCase()} photo from ${formatShortDate(session.capturedAt)}`}
              onPress={confirmDelete}
            />
          )}
        </View>

        {/* Its own full-width line. Sharing the row above cost it so much room
            that it had to be labelled "Compare"; down here it can say what it
            actually does. */}
        {comparable && (
          <Button
            label="See comparison"
            icon="columns"
            variant="secondary"
            size="sm"
            fullWidth
            className="mt-xs"
            onPress={onCompare}
          />
        )}
      </View>
    </View>
  );
}

/** Legible over a blown-out shoulder or a dark gym wall alike. */
function Pill({ children }: { children: ReactNode }) {
  return (
    <View
      className="rounded-pill px-xs py-xxs"
      style={{ backgroundColor: colors["photo-scrim"] }}
    >
      {children}
    </View>
  );
}

function Shot({ slide, width, height }: { slide: PhotoSlide; width: number; height: number }) {
  if (!slide.photo) {
    return (
      <View className="center gap-xs px-lg" style={{ width, height }}>
        <Feather name="camera-off" size={22} color={colors["camera-guide"]} />
        <Text variant="body-sm" color="on-ink" className="text-center">
          No {ANGLE_LABELS[slide.angle].toLowerCase()} shot from this day.
        </Text>
      </View>
    );
  }

  return (
    <View className="overflow-hidden" style={{ width, height }}>
      <Image
        source={slide.photo.uri}
        style={{ width, height }}
        // `contain`, not `cover`: the frame already matches the day's tallest
        // shot, so that one fills it exactly and a wider angle letterboxes
        // instead of losing its edges.
        contentFit="contain"
        accessibilityLabel={`${ANGLE_LABELS[slide.angle]} photo`}
      />
    </View>
  );
}
