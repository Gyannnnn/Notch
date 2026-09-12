import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Stepper } from "@/components/ui/Stepper";
import { Text } from "@/components/ui/Text";
import { useFoodLog, useRemoveLog, useUpdateLog } from "@/hooks/data";
import { formatDayLabel } from "@/lib/date";
import { MEAL_SLOTS, type LoggedVia, type MealSlot } from "@/types/domain";

const SLOT_LABELS: Record<MealSlot, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACK: "Snack",
};

const SLOT_SEGMENTS = MEAL_SLOTS.map((slot) => ({ value: slot, label: SLOT_LABELS[slot] }));

const VIA_LABELS: Record<LoggedVia, string> = {
  BARCODE_SCAN: "Scanned from a barcode",
  PRESET_TAP: "Added from the preset library",
  MANUAL_ENTRY: "Entered by hand",
  AI_ASSIST: "Started from a photo estimate",
  USUAL_REPEAT: "Repeated from your usuals",
};

export default function LogDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data: log } = useFoodLog(id);
  const updateLog = useUpdateLog();
  const removeLog = useRemoveLog();

  // Seeded once from the log; nothing is written until Save, so backing out
  // leaves the original entry untouched.
  const [grams, setGrams] = useState(log?.portionGrams ?? 100);
  const [slot, setSlot] = useState<MealSlot>(log?.mealSlot ?? "LUNCH");

  if (!log) {
    return (
      <Screen>
        <ScreenHeader title="Entry" dismiss />
        <EmptyState
          icon="inbox"
          title="This entry is gone"
          body="It may already have been removed."
          className="mt-lg"
        />
      </Screen>
    );
  }

  // Scaled from the macros stored on the log rather than re-read from the
  // catalog, matching how the store rewrites them on save.
  const ratio = grams / log.portionGrams;
  const scaled = {
    calories: Math.round(log.caloriesLogged * ratio),
    protein: Math.round(log.proteinLoggedG * ratio),
    carbs: Math.round(log.carbsLoggedG * ratio),
    fat: Math.round(log.fatLoggedG * ratio),
  };

  const save = () => {
    updateLog(log.id, { portionGrams: grams, mealSlot: slot });
    router.back();
  };

  const remove = () => {
    removeLog(log.id);
    router.back();
  };

  return (
    <Screen>
      <ScreenHeader title="Entry" dismiss />

      <View className="gap-md pt-xs">
        <View className="gap-xxs">
          <Text variant="heading-lg">{log.name}</Text>
          <Text variant="body-sm" color="mute">
            {formatDayLabel(log.loggedAt)} · {VIA_LABELS[log.loggedVia]}
          </Text>
        </View>

        <Card className="gap-md">
          <View className="row-between">
            <View className="gap-xxs">
              <Text variant="label-sm" color="mute">
                Portion
              </Text>
              {log.portionLabel && (
                <Text variant="body-sm" color="mute">
                  {log.portionLabel} is {log.portionGrams}g
                </Text>
              )}
            </View>
            <Stepper
              value={grams}
              onChange={setGrams}
              step={10}
              min={10}
              max={2000}
              format={(v) => `${v} g`}
            />
          </View>

          <View className="hairline-t" />

          <View className="row">
            <Nutrient label="kcal" value={scaled.calories} />
            <Nutrient label="Protein" value={`${scaled.protein}g`} />
            <Nutrient label="Carbs" value={`${scaled.carbs}g`} />
            <Nutrient label="Fat" value={`${scaled.fat}g`} />
          </View>
        </Card>

        <View className="gap-xs">
          <Text variant="label-sm" color="mute">
            Meal
          </Text>
          <SegmentedControl segments={SLOT_SEGMENTS} value={slot} onChange={setSlot} />
        </View>

        <Button label="Save changes" fullWidth onPress={save} />

        <View className="items-center">
          <Button label="Remove from log" variant="destructive" onPress={remove} />
        </View>
      </View>
    </Screen>
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
