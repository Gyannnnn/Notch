import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Text } from "@/components/ui/Text";
import { TextField } from "@/components/ui/TextField";
import { useUser } from "@/hooks/data";
import { maintenanceCalories, targetInputsFor, targetsForUser } from "@/lib/targets";
import { actions } from "@/mocks/store";

/** Below this, a macro split that disagrees with the calorie number is just rounding. */
const DRIFT_TOLERANCE_KCAL = 50;

const num = (text: string) => {
  const parsed = Number(text);
  return text.trim() === "" || Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
};

/**
 * The one place the numbers on the home-screen ring can be read as numbers and
 * changed. Everything here is derived from the profile by default (PRD 6.4);
 * typing over any of it sets `targetsCustom`, which stops a later weigh-in or
 * goal change from quietly overwriting what the user chose.
 */
export default function TargetsScreen() {
  const router = useRouter();
  const { data: user } = useUser();

  const recommended = targetsForUser(user);
  const maintenance = maintenanceCalories(targetInputsFor(user));

  const [calories, setCalories] = useState(String(user.dailyCalorieTarget ?? ""));
  const [protein, setProtein] = useState(String(user.dailyProteinTargetG ?? ""));
  const [carbs, setCarbs] = useState(String(user.dailyCarbsTargetG ?? ""));
  const [fat, setFat] = useState(String(user.dailyFatTargetG ?? ""));

  // A calorie target and a macro split are two statements about the same day,
  // and they can disagree. Saying so beats silently rewriting what was typed.
  const macroKcal = num(protein) * 4 + num(carbs) * 4 + num(fat) * 9;
  const drift = macroKcal - num(calories);
  const driftMatters = num(calories) > 0 && Math.abs(drift) > DRIFT_TOLERANCE_KCAL;

  const save = () => {
    actions.updateUser({
      dailyCalorieTarget: num(calories) || null,
      dailyProteinTargetG: num(protein) || null,
      dailyCarbsTargetG: num(carbs) || null,
      dailyFatTargetG: num(fat) || null,
      targetsCustom: true,
    });
    router.back();
  };

  // Clearing the flag is enough — the store re-derives on any profile write.
  // The fields are reset here too so the result is visible without a reopen.
  const useRecommended = () => {
    if (!recommended) return;
    actions.updateUser({ targetsCustom: false });
    setCalories(String(recommended.calories));
    setProtein(String(recommended.proteinG));
    setCarbs(String(recommended.carbsG));
    setFat(String(recommended.fatG));
  };

  return (
    <Screen>
      <ScreenHeader title="Daily targets" dismiss />

      <View className="gap-md pt-xs">
        <View className="row gap-xs">
          <Badge
            label={user.targetsCustom ? "Custom" : "Recommended"}
            tone={user.targetsCustom ? "neutral" : "positive"}
          />
        </View>

        <Text variant="body-md" color="body">
          {recommended === null
            ? "Once your goal, weight and activity level are set, these are worked out for you."
            : user.targetsCustom
              ? "You have set these yourself, so they stay put when your weight or goal changes."
              : maintenance === null
                ? "These follow your goal, weight and activity level."
                : `Worked out from about ${maintenance} kcal a day at your activity level, adjusted for your goal. They move with your weight unless you set your own.`}
        </Text>

        <Card className="gap-sm">
          <TextField
            label="Daily calories"
            value={calories}
            onChangeText={setCalories}
            keyboardType="number-pad"
            suffix="kcal"
            placeholder="2000"
            accessibilityLabel="Daily calorie target"
          />
          <View className="row gap-xs">
            <TextField
              label="Protein"
              value={protein}
              onChangeText={setProtein}
              keyboardType="number-pad"
              suffix="g"
              accessibilityLabel="Daily protein target in grams"
              className="fill"
            />
            <TextField
              label="Carbs"
              value={carbs}
              onChangeText={setCarbs}
              keyboardType="number-pad"
              suffix="g"
              accessibilityLabel="Daily carbohydrate target in grams"
              className="fill"
            />
            <TextField
              label="Fat"
              value={fat}
              onChangeText={setFat}
              keyboardType="number-pad"
              suffix="g"
              accessibilityLabel="Daily fat target in grams"
              className="fill"
            />
          </View>
          {driftMatters && (
            <Text variant="body-sm" color="caution">
              Those macros come to {macroKcal} kcal, {Math.abs(drift)} {drift > 0 ? "over" : "under"}{" "}
              your calorie target. Both are saved as written.
            </Text>
          )}
        </Card>

        <Button label="Save" fullWidth onPress={save} />

        {recommended !== null && (
          <View className="gap-xxs">
            <Button label="Use recommended" variant="ghost" onPress={useRecommended} />
            <Text variant="body-sm" color="mute" className="text-center">
              {recommended.calories} kcal · {recommended.proteinG}g protein · {recommended.carbsG}g
              carbs · {recommended.fatG}g fat
            </Text>
          </View>
        )}
      </View>
    </Screen>
  );
}
