import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Text } from "@/components/ui/Text";
import { usePhoto, usePhotos, useRemovePhoto, useUser } from "@/hooks/data";
import { formatShortDate } from "@/lib/date";
import { defaultUnits, formatWeight } from "@/lib/units";
import { colors } from "@/theme/tokens";
import type { PhotoAngle } from "@/types/domain";

const ANGLE_LABELS: Record<PhotoAngle, string> = {
  FRONT: "Front",
  SIDE: "Side",
  BACK: "Back",
};

export default function PhotoDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data: photo } = usePhoto(id);
  const { data: photos } = usePhotos();
  const { data: user } = useUser();
  const removePhoto = useRemovePhoto();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Progress photos are usually portrait but not always. Fixing the frame at
  // 3:4 letterboxes a landscape shot almost to a stripe, so the frame takes the
  // photo's own shape, clamped so nothing extreme takes over the screen.
  const [aspectRatio, setAspectRatio] = useState(0.75);

  const unit = defaultUnits(user.region).weight;

  if (!photo) {
    return (
      <Screen>
        <ScreenHeader title="Photo" dismiss />
        <EmptyState
          icon="image"
          title="This photo is gone"
          body="It may already have been deleted."
          className="mt-lg"
        />
      </Screen>
    );
  }

  const remove = () => {
    removePhoto(photo.id);
    router.back();
  };

  return (
    <Screen>
      <ScreenHeader title={formatShortDate(photo.capturedAt)} dismiss />

      <View className="gap-md pt-xs">
        {/* Ink frame: photos rarely fill 3:4 exactly, and ink letterboxing
            looks intentional where white looks broken (DESIGN.md). */}
        <View
          className="overflow-hidden rounded-lg"
          style={{ backgroundColor: colors.ink, aspectRatio }}
        >
          <Image
            source={photo.uri}
            style={{ flex: 1 }}
            contentFit="contain"
            onLoad={({ source }) => {
              if (!source?.width || !source?.height) return;
              setAspectRatio(Math.min(1.2, Math.max(0.62, source.width / source.height)));
            }}
          />
        </View>

        <View className="row">
          <View className="fill gap-xxs">
            <Text variant="label-sm" color="mute">
              Taken
            </Text>
            <Text variant="heading-sm">{formatShortDate(photo.capturedAt)}</Text>
          </View>
          <View className="fill items-center gap-xxs">
            <Text variant="label-sm" color="mute">
              Angle
            </Text>
            <Badge label={ANGLE_LABELS[photo.angle]} />
          </View>
          <View className="fill items-end gap-xxs">
            <Text variant="label-sm" color="mute">
              Weight
            </Text>
            <Text variant="heading-sm" tabular>
              {photo.weightKgAtCapture !== null
                ? formatWeight(photo.weightKgAtCapture, unit)
                : "—"}
            </Text>
          </View>
        </View>

        {photos.length >= 2 && (
          <Button
            label="See comparison"
            icon="columns"
            variant="secondary"
            fullWidth
            onPress={() => router.push("/(modals)/comparison")}
          />
        )}

        <Text variant="body-sm" color="mute" className="text-center">
          This photo is private. Sharing is always something you choose.
        </Text>

        <View className="items-center gap-xs pt-xs">
          {confirmingDelete ? (
            <>
              <Text variant="body-md" color="body" className="text-center">
                Delete this photo? Your other photos and logs are untouched.
              </Text>
              <View className="row gap-xs">
                <Button
                  label="Keep it"
                  variant="secondary"
                  onPress={() => setConfirmingDelete(false)}
                />
                <Button label="Delete" variant="destructive" onPress={remove} />
              </View>
            </>
          ) : (
            <Button
              label="Delete photo"
              variant="destructive"
              onPress={() => setConfirmingDelete(true)}
            />
          )}
        </View>
      </View>
    </Screen>
  );
}
