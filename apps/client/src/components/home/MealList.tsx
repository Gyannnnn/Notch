import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import type { FoodLog, MealSlot } from "@/types/domain";
import { MEAL_SLOTS } from "@/types/domain";
import { sumLogs } from "@/lib/macros";
import { colors } from "@/theme/tokens";

const MEAL_LABELS: Record<MealSlot, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACK: "Snacks",
};

interface MealListProps {
  groups: Record<MealSlot, FoodLog[]>;
  nextSlot: MealSlot | null;
}

export function MealList({ groups, nextSlot }: MealListProps) {
  const router = useRouter();

  return (
    <View className="gap-xs">
      <Text variant="overline" color="mute">
        Today&apos;s meals
      </Text>
      {MEAL_SLOTS.map((slot) => {
        const logs = groups[slot];
        const totals = sumLogs(logs);
        const isNext = slot === nextSlot;

        return (
          <Card key={slot} padded={false} className="px-md py-sm">
            <View className="row-between">
              <Text variant="heading-sm">{MEAL_LABELS[slot]}</Text>
              {logs.length > 0 && (
                <Text variant="label-md" color="mute" tabular>
                  {Math.round(totals.calories)} kcal
                </Text>
              )}
            </View>

            {logs.map((log) => (
              <View key={log.id} className="row-between pt-xs">
                <Text variant="body-md" color="body" numberOfLines={1} className="fill">
                  {log.name}
                  {log.portionLabel ? ` · ${log.portionLabel}` : ""}
                </Text>
                <Text variant="body-sm" color="mute" tabular>
                  {Math.round(log.caloriesLogged)}
                </Text>
              </View>
            ))}

            {logs.length === 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Add ${MEAL_LABELS[slot]}`}
                onPress={() =>
                  router.push({ pathname: "/(modals)/food-capture", params: { slot } })
                }
                className="row gap-xxs pt-xs active:opacity-70"
              >
                <Feather
                  name="plus"
                  size={16}
                  color={isNext ? colors.primary : colors.faint}
                />
                <Text variant="body-md" color={isNext ? "primary" : "mute"}>
                  Add {MEAL_LABELS[slot].toLowerCase()}
                </Text>
              </Pressable>
            )}
          </Card>
        );
      })}
    </View>
  );
}
