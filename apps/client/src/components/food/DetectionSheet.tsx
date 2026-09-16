import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { FadeInDown } from "react-native-reanimated";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { useLogFood } from "@/hooks/data";
import { MotionView } from "@/lib/animated";
import { macrosForPortion } from "@/lib/macros";
import { foodById } from "@/mocks/foods";
import { colors, elevation } from "@/theme/tokens";
import type { LoggedVia, MealSlot } from "@/types/domain";

export interface DetectedItem {
  foodItemId: string;
  grams: number;
  confidence: number;
}

interface DetectionSheetProps {
  items: DetectedItem[];
  mealSlot: MealSlot;
  loggedVia: LoggedVia;
  /** Local date key to log against; defaults to today inside the store. */
  dateKey?: string;
  onDone: () => void;
}

const MEAL_LABELS: Record<MealSlot, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACK: "Snacks",
};

/**
 * Confidence is shown but never coloured by value — the TRD is explicit that
 * photo assist is an assist, not an authority, and tinting a percentage green
 * would dress a guess up as a verdict.
 */
export function DetectionSheet({
  items,
  mealSlot,
  loggedVia,
  dateKey,
  onDone,
}: DetectionSheetProps) {
  const logFood = useLogFood();
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>(
    Object.fromEntries(items.map((i) => [i.foodItemId, true])),
  );

  const included = items.filter((i) => confirmed[i.foodItemId]);
  const totalCalories = included.reduce((sum, item) => {
    const food = foodById(item.foodItemId);
    return food ? sum + macrosForPortion(food, item.grams).caloriesLogged : sum;
  }, 0);

  const addAll = () => {
    included.forEach((item) =>
      logFood({ foodItemId: item.foodItemId, grams: item.grams, mealSlot, loggedVia, dateKey }),
    );
    onDone();
  };

  return (
    <MotionView
      entering={FadeInDown.duration(260)}
      className="gap-sm rounded-t-xl bg-elevated p-md pb-lg"
      style={elevation.floating}
    >
      <View className="h-1 w-9 self-center rounded-pill bg-hairline-strong" />

      <Text variant="heading-md">Found {items.length} items</Text>
      <Text variant="body-sm" color="mute">
        Tap any item to include or leave it out.
      </Text>

      <View className="gap-xs">
        {items.map((item) => {
          const food = foodById(item.foodItemId);
          if (!food) return null;
          const isOn = confirmed[item.foodItemId];
          const macros = macrosForPortion(food, item.grams);

          return (
            <Pressable
              key={item.foodItemId}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isOn }}
              onPress={() =>
                setConfirmed((prev) => ({ ...prev, [item.foodItemId]: !prev[item.foodItemId] }))
              }
              className="row gap-sm rounded-sm border border-hairline p-sm"
            >
              <Feather
                name={isOn ? "check-circle" : "circle"}
                size={20}
                color={isOn ? colors.primary : colors.faint}
              />
              <View className="fill">
                <Text variant="heading-sm">{food.name}</Text>
                <Text variant="body-sm" color="mute">
                  {food.portionLabel} · {macros.caloriesLogged} kcal
                </Text>
              </View>
              <Badge label={`${Math.round(item.confidence * 100)}%`} />
            </Pressable>
          );
        })}
      </View>

      <View className="row gap-xs pt-xs">
        <Button label="Edit items" variant="secondary" onPress={onDone} className="fill" />
        <Button
          label={`Add to ${MEAL_LABELS[mealSlot]} · ${totalCalories} kcal`}
          onPress={addAll}
          disabled={included.length === 0}
          className="fill"
        />
      </View>
    </MotionView>
  );
}
