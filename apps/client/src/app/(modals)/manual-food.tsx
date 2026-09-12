import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Text } from "@/components/ui/Text";
import { TextField } from "@/components/ui/TextField";
import { useCreateManualFood, useLogFood } from "@/hooks/data";
import { currentMealSlot, formatDayLabel, localDateKey } from "@/lib/date";
import { MEAL_SLOTS, type MealSlot } from "@/types/domain";

const SLOT_LABELS: Record<MealSlot, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACK: "Snack",
};

const SLOT_SEGMENTS = MEAL_SLOTS.map((slot) => ({ value: slot, label: SLOT_LABELS[slot] }));

const num = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

/**
 * The manual fallback in PRD 6.2 — always available when neither a barcode nor
 * a preset fits. Macros are asked for *per serving* because that is what a
 * label or a recipe states; the store keeps them per 100g, so the conversion
 * happens here rather than in the user's head.
 */
export default function ManualFoodScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string; slot?: string; date?: string }>();
  const createFood = useCreateManualFood();
  const logFood = useLogFood();

  const dateKey = params.date ?? localDateKey();
  const [name, setName] = useState(params.name ?? "");
  const [slot, setSlot] = useState<MealSlot>((params.slot as MealSlot) ?? currentMealSlot());
  const [serving, setServing] = useState("100");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  const servingG = num(serving);
  const canSave = name.trim().length > 0 && servingG > 0 && num(calories) > 0;

  const save = () => {
    if (!canSave) return;
    const per100 = (value: string) => Math.round((num(value) / servingG) * 100 * 10) / 10;

    const item = createFood({
      name: name.trim(),
      servingSizeG: servingG,
      caloriesPer100g: per100(calories),
      proteinPer100g: per100(protein),
      carbsPer100g: per100(carbs),
      fatPer100g: per100(fat),
    });

    logFood({
      foodItemId: item.id,
      grams: servingG,
      mealSlot: slot,
      loggedVia: "MANUAL_ENTRY",
      dateKey,
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <Screen>
        <ScreenHeader title="Add a food" dismiss />

        <View className="gap-md pt-xs">
          <TextField
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Grandma's rajma"
            autoFocus={!params.name}
            autoCapitalize="sentences"
          />

          <TextField
            label="Serving size"
            value={serving}
            onChangeText={setServing}
            keyboardType="decimal-pad"
            suffix="g"
            hint="Everything below is for one serving of this size."
          />

          <Card className="gap-sm">
            <TextField
              label="Calories"
              value={calories}
              onChangeText={setCalories}
              keyboardType="decimal-pad"
              placeholder="0"
              suffix="kcal"
            />
            <View className="row gap-xs">
              <TextField
                label="Protein"
                value={protein}
                onChangeText={setProtein}
                keyboardType="decimal-pad"
                placeholder="0"
                suffix="g"
                className="fill"
              />
              <TextField
                label="Carbs"
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="decimal-pad"
                placeholder="0"
                suffix="g"
                className="fill"
              />
              <TextField
                label="Fat"
                value={fat}
                onChangeText={setFat}
                keyboardType="decimal-pad"
                placeholder="0"
                suffix="g"
                className="fill"
              />
            </View>
          </Card>

          <View className="gap-xs">
            <Text variant="label-sm" color="mute">
              Add to
            </Text>
            <SegmentedControl segments={SLOT_SEGMENTS} value={slot} onChange={setSlot} />
          </View>

          <Button label="Save and log" fullWidth disabled={!canSave} onPress={save} />

          <Text variant="body-sm" color="mute" className="text-center">
            Saved under My foods
            {dateKey === localDateKey() ? "" : `, logged to ${formatDayLabel(dateKey)}`}. You can
            log it again in one tap.
          </Text>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
