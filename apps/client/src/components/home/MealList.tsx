import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { View } from "react-native";

import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { usePressScale } from "@/hooks/usePressScale";
import { MotionPressable } from "@/lib/animated";
import type { FoodLog, MealSlot } from "@/types/domain";
import { MEAL_SLOTS } from "@/types/domain";
import { sumLogs } from "@/lib/macros";
import { colors } from "@/theme/tokens";

/**
 * Full-width rows travel further than a tile at the same ratio, so they press a
 * little less deeply than the 0.97 used on compact controls.
 */
const ROW_SCALE = 0.98;

const MEAL_LABELS: Record<MealSlot, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACK: "Snacks",
};

interface MealListProps {
  groups: Record<MealSlot, FoodLog[]>;
  nextSlot: MealSlot | null;
  /** The day these meals belong to; anything added lands on it. */
  dateKey: string;
  isToday: boolean;
}

export function MealList({ groups, nextSlot, dateKey, isToday }: MealListProps) {
  const router = useRouter();

  return (
    <View className="gap-xs">
      <Text variant="overline" color="mute">
        {isToday ? "Today's meals" : "Meals"}
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
              <LogRow
                key={log.id}
                log={log}
                onPress={() =>
                  router.push({ pathname: "/(modals)/log-detail", params: { id: log.id } })
                }
              />
            ))}

            {logs.length === 0 && (
              <AddMealRow
                label={MEAL_LABELS[slot]}
                isNext={isNext}
                onPress={() =>
                  router.push({
                    pathname: "/(modals)/food-capture",
                    params: { slot, date: dateKey },
                  })
                }
              />
            )}
          </Card>
        );
      })}
    </View>
  );
}

function LogRow({ log, onPress }: { log: FoodLog; onPress: () => void }) {
  const press = usePressScale(ROW_SCALE);

  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={`Edit ${log.name}`}
      onPress={onPress}
      {...press.handlers}
      className="row-between pt-xs"
      style={press.style}
    >
      <Text variant="body-md" color="body" numberOfLines={1} className="fill">
        {log.name}
        {log.portionLabel ? ` · ${log.portionLabel}` : ""}
      </Text>
      <Text variant="body-sm" color="mute" tabular>
        {Math.round(log.caloriesLogged)}
      </Text>
    </MotionPressable>
  );
}

function AddMealRow({
  label,
  isNext,
  onPress,
}: {
  label: string;
  isNext: boolean;
  onPress: () => void;
}) {
  const press = usePressScale(ROW_SCALE);

  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={`Add ${label}`}
      onPress={onPress}
      {...press.handlers}
      className="row gap-xxs pt-xs"
      style={press.style}
    >
      <Feather name="plus" size={16} color={isNext ? colors.primary : colors.faint} />
      <Text variant="body-md" color={isNext ? "primary" : "mute"}>
        Add {label.toLowerCase()}
      </Text>
    </MotionPressable>
  );
}
