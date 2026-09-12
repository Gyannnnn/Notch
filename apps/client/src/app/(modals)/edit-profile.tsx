import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChoiceCard } from "@/components/ui/ChoiceCard";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Text } from "@/components/ui/Text";
import { TextField } from "@/components/ui/TextField";
import { UnitToggle } from "@/components/ui/UnitToggle";
import { ACTIVITY_OPTIONS, GOAL_OPTIONS } from "@/constants/profile";
import { useUser } from "@/hooks/data";
import { cmToFeetInches, defaultUnits, feetInchesToCm, kgToLb, lbToKg } from "@/lib/units";
import type { HeightUnit, WeightUnit } from "@/lib/units";
import { actions } from "@/mocks/store";
import type { ActivityLevel, Goal } from "@/types/domain";

/** Trims a converted value to the precision the field is edited at. */
const trim = (value: number, decimals: number) => String(Number(value.toFixed(decimals)));

/**
 * Everything onboarding asked for, editable afterwards. It exists because the
 * onboarding steps cannot double as an edit screen: they always advance to the
 * next question, so entering one from Settings would walk an established user
 * back through the whole sequence.
 *
 * Maps to `PATCH /me` (TRD §4). Daily calorie and macro targets are derived
 * from these fields server-side, so nothing is recomputed here.
 */
export default function EditProfileScreen() {
  const router = useRouter();
  const { data: user } = useUser();
  const units = defaultUnits(user.region);

  const [goal, setGoal] = useState<Goal>(user.goal ?? "MAINTAIN");
  const [activity, setActivity] = useState<ActivityLevel>(user.activityLevel ?? "MODERATE");

  const [heightUnit, setHeightUnit] = useState<HeightUnit>(units.height);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(units.weight);

  // Held as text, not as numbers: a numeric state has to re-render a formatted
  // value on every keystroke, which eats the decimal point as it is typed.
  const initialFeet = user.heightCm ? cmToFeetInches(user.heightCm) : null;
  const [cmText, setCmText] = useState(user.heightCm ? String(Math.round(user.heightCm)) : "");
  const [feetText, setFeetText] = useState(initialFeet ? String(initialFeet.feet) : "");
  const [inchText, setInchText] = useState(initialFeet ? String(initialFeet.inches) : "");
  const [targetText, setTargetText] = useState(() => {
    if (user.targetWeightKg === null) return "";
    return trim(units.weight === "kg" ? user.targetWeightKg : kgToLb(user.targetWeightKg), 1);
  });

  // Unit toggles convert what is already typed rather than clearing it — the
  // toggle is there to check a number in other units, not to start over.
  const switchHeightUnit = (next: HeightUnit) => {
    if (next === heightUnit) return;
    if (next === "ft") {
      const { feet, inches } = cmToFeetInches(Number(cmText) || 0);
      if (cmText.trim() !== "") {
        setFeetText(String(feet));
        setInchText(String(inches));
      }
    } else if (feetText.trim() !== "" || inchText.trim() !== "") {
      setCmText(String(Math.round(feetInchesToCm(Number(feetText) || 0, Number(inchText) || 0))));
    }
    setHeightUnit(next);
  };

  const switchWeightUnit = (next: WeightUnit) => {
    if (next === weightUnit) return;
    const parsed = Number(targetText);
    if (targetText.trim() !== "" && !Number.isNaN(parsed)) {
      setTargetText(trim(next === "lb" ? kgToLb(parsed) : lbToKg(parsed), 1));
    }
    setWeightUnit(next);
  };

  const resolvedHeightCm = () => {
    if (heightUnit === "cm") {
      const parsed = Number(cmText);
      return cmText.trim() === "" || Number.isNaN(parsed) || parsed <= 0 ? null : parsed;
    }
    const feet = Number(feetText) || 0;
    const inches = Number(inchText) || 0;
    return feet === 0 && inches === 0 ? null : Math.round(feetInchesToCm(feet, inches));
  };

  const resolvedTargetKg = () => {
    const parsed = Number(targetText);
    if (targetText.trim() === "" || Number.isNaN(parsed) || parsed <= 0) return null;
    return weightUnit === "kg" ? parsed : lbToKg(parsed);
  };

  const save = () => {
    actions.updateUser({
      goal,
      activityLevel: activity,
      heightCm: resolvedHeightCm(),
      targetWeightKg: resolvedTargetKg(),
    });
    router.back();
  };

  return (
    <Screen>
      <ScreenHeader title="Goals and measurements" dismiss />

      <View className="gap-lg pt-xs">
        <Text variant="body-md" color="body">
          These set your daily calorie and macro targets. Changing them never touches anything
          you have already logged.
        </Text>

        <View className="gap-xs">
          <Text variant="overline" color="mute">
            Goal
          </Text>
          {GOAL_OPTIONS.map((option) => (
            <ChoiceCard
              key={option.value}
              title={option.title}
              body={option.body}
              selected={goal === option.value}
              onPress={() => setGoal(option.value)}
            />
          ))}
        </View>

        <Card className="gap-sm">
          <View className="row-between">
            <Text variant="heading-sm">Height</Text>
            <UnitToggle
              value={heightUnit}
              options={[
                { value: "cm", label: "cm" },
                { value: "ft", label: "ft / in" },
              ]}
              onChange={switchHeightUnit}
            />
          </View>
          {heightUnit === "cm" ? (
            <TextField
              value={cmText}
              onChangeText={setCmText}
              keyboardType="number-pad"
              suffix="cm"
              placeholder="175"
              accessibilityLabel="Height in centimetres"
            />
          ) : (
            <View className="row gap-xs">
              <TextField
                value={feetText}
                onChangeText={setFeetText}
                keyboardType="number-pad"
                suffix="ft"
                placeholder="5"
                accessibilityLabel="Height, feet"
                className="fill"
              />
              <TextField
                value={inchText}
                onChangeText={setInchText}
                keyboardType="number-pad"
                suffix="in"
                placeholder="9"
                accessibilityLabel="Height, inches"
                className="fill"
              />
            </View>
          )}
        </Card>

        <Card className="gap-sm">
          <View className="row-between">
            <Text variant="heading-sm">Target weight</Text>
            <UnitToggle
              value={weightUnit}
              options={[
                { value: "kg", label: "kg" },
                { value: "lb", label: "lb" },
              ]}
              onChange={switchWeightUnit}
            />
          </View>
          <TextField
            value={targetText}
            onChangeText={setTargetText}
            keyboardType="decimal-pad"
            suffix={weightUnit}
            placeholder="—"
            accessibilityLabel={`Target weight in ${weightUnit}`}
            hint="Optional. Leave it empty and the app tracks your trend without a finish line."
          />
        </Card>

        <View className="gap-xs">
          <Text variant="overline" color="mute">
            Activity level
          </Text>
          {ACTIVITY_OPTIONS.map((option) => (
            <ChoiceCard
              key={option.value}
              title={option.title}
              body={option.body}
              selected={activity === option.value}
              onPress={() => setActivity(option.value)}
              compact
            />
          ))}
        </View>

        <Button label="Save" fullWidth onPress={save} />
      </View>
    </Screen>
  );
}
