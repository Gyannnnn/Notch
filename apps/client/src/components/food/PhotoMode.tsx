import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { View } from "react-native";

import { DetectionSheet } from "@/components/food/DetectionSheet";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Text } from "@/components/ui/Text";
import { AI_DETECTION } from "@/mocks/foods";
import type { MealSlot } from "@/types/domain";

/** Stands in for the Gemini call in TRD §8; long enough that the real loading state gets built. */
const DETECTION_DELAY_MS = 1600;

type Phase = "framing" | "detecting" | "results";

export function PhotoMode({ mealSlot, onDone }: { mealSlot: MealSlot; onDone: () => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>("framing");

  if (!permission) return <View className="fill" />;

  if (!permission.granted) {
    return (
      <EmptyState
        icon="camera-off"
        title="Camera access needed"
        body="Photo logging uses the camera to guess what's on your plate. You can always log by search instead."
        actionLabel="Allow camera"
        onAction={requestPermission}
        className="mt-lg"
      />
    );
  }

  const capture = () => {
    setPhase("detecting");
    setTimeout(() => setPhase("results"), DETECTION_DELAY_MS);
  };

  return (
    <View className="fill">
      <View className="fill overflow-hidden rounded-lg">
        <CameraView style={{ flex: 1 }} facing="back" />
        {phase === "detecting" && (
          <View className="absolute-fill center bg-scrim">
            <Text variant="heading-md" color="on-ink">
              Looking at your plate…
            </Text>
            <Text variant="body-sm" color="on-ink" className="opacity-80">
              This is an estimate you can adjust.
            </Text>
          </View>
        )}
      </View>

      {phase === "results" ? (
        <DetectionSheet
          items={AI_DETECTION.items}
          mealSlot={mealSlot}
          loggedVia="AI_ASSIST"
          onDone={onDone}
        />
      ) : (
        <View className="gap-xs py-md">
          <Button
            label={phase === "detecting" ? "Detecting…" : "Capture"}
            icon="camera"
            fullWidth
            loading={phase === "detecting"}
            onPress={capture}
          />
          <Text variant="body-sm" color="mute" className="text-center">
            Photo assist gives a starting point, not a final number.
          </Text>
        </View>
      )}
    </View>
  );
}
