import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { BarcodeMode } from "@/components/food/BarcodeMode";
import { PhotoMode } from "@/components/food/PhotoMode";
import { SearchMode } from "@/components/food/SearchMode";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Text } from "@/components/ui/Text";
import { currentMealSlot, formatDayLabel, localDateKey } from "@/lib/date";
import type { MealSlot } from "@/types/domain";

type Mode = "photo" | "barcode" | "search";

const MODES: { value: Mode; label: string }[] = [
  { value: "photo", label: "Photo" },
  { value: "barcode", label: "Barcode" },
  { value: "search", label: "Search" },
];

export default function FoodCaptureScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ slot?: string; date?: string }>();
  const [mode, setMode] = useState<Mode>("search");

  const mealSlot = (params.slot as MealSlot) ?? currentMealSlot();
  const dateKey = params.date ?? localDateKey();
  const isToday = dateKey === localDateKey();
  const close = () => router.back();

  return (
    <Screen scroll={false}>
      <ScreenHeader title="Log food" dismiss />
      {!isToday && (
        <View className="mb-sm rounded-sm bg-sunken px-sm py-xs">
          <Text variant="body-sm" color="body">
            Adding to {formatDayLabel(dateKey)}.
          </Text>
        </View>
      )}
      <View className="pb-sm">
        <SegmentedControl segments={MODES} value={mode} onChange={setMode} />
      </View>
      {mode === "photo" && <PhotoMode mealSlot={mealSlot} dateKey={dateKey} onDone={close} />}
      {mode === "barcode" && <BarcodeMode mealSlot={mealSlot} dateKey={dateKey} onDone={close} />}
      {mode === "search" && <SearchMode mealSlot={mealSlot} dateKey={dateKey} />}
    </Screen>
  );
}
