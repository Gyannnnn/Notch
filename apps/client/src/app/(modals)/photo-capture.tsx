import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Text } from "@/components/ui/Text";
import { useAddPhoto, useUser } from "@/hooks/data";
import { formatShortDate } from "@/lib/date";
import { defaultUnits, formatWeight } from "@/lib/units";
import { MOCK_PHOTOS } from "@/mocks/fixtures";
import { colors } from "@/theme/tokens";
import { PHOTO_ANGLES, type PhotoAngle } from "@/types/domain";

const ANGLE_LABELS: Record<PhotoAngle, string> = {
  FRONT: "Front",
  SIDE: "Side",
  BACK: "Back",
};

type Phase = "angle" | "camera" | "confirm";

export default function PhotoCaptureScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>("angle");
  const [angle, setAngle] = useState<PhotoAngle>("FRONT");
  const { data: user } = useUser();
  const addPhoto = useAddPhoto();
  const unit = defaultUnits(user.region).weight;

  // No real capture in this pass, so the confirm step previews a sample frame.
  const capturedUri = MOCK_PHOTOS[MOCK_PHOTOS.length - 1]!.uri;

  const save = () => {
    addPhoto(angle, capturedUri);
    router.replace("/(tabs)/progress");
  };

  return (
    <Screen scroll={false}>
      <ScreenHeader title="Progress photo" dismiss />

      {phase === "angle" && (
        <View className="fill gap-md pt-sm">
          <Text variant="heading-md">Which angle?</Text>
          <View className="row gap-xs">
            {PHOTO_ANGLES.map((a) => (
              <Chip
                key={a}
                label={ANGLE_LABELS[a]}
                selected={angle === a}
                onPress={() => setAngle(a)}
              />
            ))}
          </View>
          <Text variant="body-sm" color="mute">
            Same angle each time makes comparisons far easier to read. Your photos stay private.
          </Text>
          <View className="fill" />
          <Button label="Open camera" icon="camera" fullWidth onPress={() => setPhase("camera")} />
        </View>
      )}

      {phase === "camera" &&
        (permission?.granted ? (
          <View className="fill gap-md pt-sm">
            <View className="fill overflow-hidden rounded-lg">
              <CameraView style={{ flex: 1 }} facing="front" />
              <View className="absolute-fill center">
                <View
                  className="rounded-xl border border-dashed"
                  style={{
                    width: "56%",
                    height: "78%",
                    borderColor: colors["camera-guide"],
                  }}
                />
              </View>
              <View className="absolute bottom-0 left-0 right-0 items-center pb-sm">
                <Text variant="body-sm" color="on-ink">
                  Line up inside the guide
                </Text>
              </View>
            </View>
            <Button label="Capture" fullWidth onPress={() => setPhase("confirm")} />
          </View>
        ) : (
          <EmptyState
            icon="camera-off"
            title="Camera access needed"
            body="Progress photos are taken with the camera and stored privately on your account."
            actionLabel="Allow camera"
            onAction={requestPermission}
            className="mt-lg"
          />
        ))}

      {phase === "confirm" && (
        <View className="fill gap-md pt-sm">
          <Image
            source={capturedUri}
            style={{ width: "100%", flex: 1, borderRadius: 20 }}
            contentFit="cover"
          />
          <View className="row-between rounded-md bg-sunken px-md py-sm">
            <View className="gap-xxs">
              <Text variant="label-sm" color="mute">
                Date
              </Text>
              <Text variant="heading-sm">{formatShortDate(new Date())}</Text>
            </View>
            <View className="items-end gap-xxs">
              <Text variant="label-sm" color="mute">
                Weight
              </Text>
              <Text variant="heading-sm" tabular>
                {user.currentWeightKg ? formatWeight(user.currentWeightKg, unit) : "—"}
              </Text>
            </View>
          </View>
          <View className="row gap-xs">
            <Button
              label="Retake"
              variant="secondary"
              onPress={() => setPhase("camera")}
              className="fill"
            />
            <Button label="Save photo" onPress={save} className="fill" />
          </View>
        </View>
      )}
    </Screen>
  );
}
