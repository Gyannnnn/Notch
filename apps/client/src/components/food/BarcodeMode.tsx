import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Stepper } from "@/components/ui/Stepper";
import { Text } from "@/components/ui/Text";
import { useLogFood } from "@/hooks/data";
import { macrosForPortion } from "@/lib/macros";
import { BARCODE_RESULT } from "@/mocks/foods";
import { colors } from "@/theme/tokens";
import type { MealSlot } from "@/types/domain";

const SCAN_DELAY_MS = 1200;

export function BarcodeMode({
  mealSlot,
  dateKey,
  onDone,
}: {
  mealSlot: MealSlot;
  dateKey?: string;
  onDone: () => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [servings, setServings] = useState(1);
  const logFood = useLogFood();

  if (!permission) return <View className="fill" />;

  if (!permission.granted) {
    return (
      <EmptyState
        icon="camera-off"
        title="Camera access needed"
        body="Scanning a barcode needs the camera. Search works without it."
        actionLabel="Allow camera"
        onAction={requestPermission}
        className="mt-lg"
      />
    );
  }

  const grams = (BARCODE_RESULT.servingSizeG ?? 100) * servings;
  const macros = macrosForPortion(BARCODE_RESULT, grams);

  const scan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
    }, SCAN_DELAY_MS);
  };

  const add = () => {
    logFood({
      foodItemId: BARCODE_RESULT.id,
      grams,
      mealSlot,
      loggedVia: "BARCODE_SCAN",
      dateKey,
    });
    onDone();
  };

  return (
    <View className="fill">
      <View className="fill overflow-hidden rounded-lg">
        <CameraView style={{ flex: 1 }} facing="back" />
        <View className="absolute-fill center">
          <View
            className="rounded-md border-2"
            style={{ width: 240, height: 240, borderColor: colors["on-ink"] }}
          />
        </View>
      </View>

      {scanned ? (
        <Card className="mt-sm gap-sm">
          <View>
            <Text variant="heading-md">{BARCODE_RESULT.name}</Text>
            <Text variant="body-sm" color="mute">
              {BARCODE_RESULT.brandName}
            </Text>
          </View>

          <View className="row">
            <Nutrient label="kcal" value={macros.caloriesLogged} />
            <Nutrient label="Protein" value={`${macros.proteinLoggedG}g`} />
            <Nutrient label="Carbs" value={`${macros.carbsLoggedG}g`} />
            <Nutrient label="Fat" value={`${macros.fatLoggedG}g`} />
          </View>

          <View className="row-between">
            <Text variant="body-md" color="body">
              Servings
            </Text>
            <Stepper value={servings} onChange={setServings} step={0.5} min={0.5} max={10} />
          </View>

          <Button label={`Add · ${macros.caloriesLogged} kcal`} fullWidth onPress={add} />
        </Card>
      ) : (
        <View className="py-md">
          <Button
            label={scanning ? "Scanning…" : "Scan barcode"}
            icon="maximize"
            fullWidth
            loading={scanning}
            onPress={scan}
          />
        </View>
      )}
    </View>
  );
}

function Nutrient({ label, value }: { label: string; value: string | number }) {
  return (
    <View className="fill items-center gap-xxs">
      <Text variant="metric-md" tabular>
        {value}
      </Text>
      <Text variant="label-sm" color="mute">
        {label}
      </Text>
    </View>
  );
}
