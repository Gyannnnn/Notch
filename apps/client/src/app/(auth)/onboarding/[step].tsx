import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/ui/Button";
import { ChoiceCard } from "@/components/ui/ChoiceCard";
import { Chip } from "@/components/ui/Chip";
import { NumericHeroInput } from "@/components/ui/NumericHeroInput";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Text } from "@/components/ui/Text";
import { UnitToggle } from "@/components/ui/UnitToggle";
import { ACTIVITY_OPTIONS, GOAL_OPTIONS } from "@/constants/profile";
import { useUser } from "@/hooks/data";
import { cmToFeetInches, feetInchesToCm, kgToLb, lbToKg } from "@/lib/units";
import type { HeightUnit, WeightUnit } from "@/lib/units";
import { actions } from "@/mocks/store";
import { colors } from "@/theme/tokens";
import type { ActivityLevel, Goal } from "@/types/domain";

/**
 * One question per screen. The five fields the API needs before onboarding is
 * considered complete (see ONBOARDING_FIELDS in packages/schemas) are collected
 * here; timezone is read from the device rather than asked for.
 */
const STEPS = ["goal", "height", "weight", "target-weight", "activity", "foods"] as const;
type Step = (typeof STEPS)[number];

const FOOD_HABITS = [
  "Rice-based meals",
  "Roti-based meals",
  "High protein",
  "Mostly home-cooked",
  "Mostly packaged",
  "Eat out often",
  "Vegetarian",
  "Egg and chicken",
];

export default function OnboardingStepScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ step?: string }>();
  const step = (STEPS.includes(params.step as Step) ? params.step : "goal") as Step;
  const index = STEPS.indexOf(step);

  const { data: user } = useUser();

  const [goal, setGoal] = useState<Goal>(user.goal ?? "CUT");
  const [activity, setActivity] = useState<ActivityLevel>(user.activityLevel ?? "MODERATE");
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [heightCm, setHeightCm] = useState(user.heightCm ?? 175);
  const [weightKg, setWeightKg] = useState(user.startingWeightKg ?? 75);
  const [targetKg, setTargetKg] = useState(user.targetWeightKg ?? 70);
  const [habits, setHabits] = useState<string[]>([]);

  const next = () => {
    if (step === "goal") actions.updateUser({ goal });
    if (step === "height") actions.updateUser({ heightCm });
    if (step === "weight")
      actions.updateUser({ startingWeightKg: weightKg, currentWeightKg: weightKg });
    if (step === "target-weight") actions.updateUser({ targetWeightKg: targetKg });
    if (step === "activity") actions.updateUser({ activityLevel: activity });

    if (index === STEPS.length - 1) {
      actions.updateUser({
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        onboardingComplete: true,
      });
      router.replace("/(tabs)/today");
      return;
    }
    router.push(`/(auth)/onboarding/${STEPS[index + 1]}`);
  };

  return (
    <Screen scroll={false}>
      <ScreenHeader />

      <View className="row gap-xxs pb-lg">
        {STEPS.map((s, i) => (
          <View
            key={s}
            className="fill rounded-pill"
            style={{ height: 3, backgroundColor: i <= index ? colors.ink : colors.hairline }}
          />
        ))}
      </View>

      <View className="fill gap-lg">
        {step === "goal" && (
          <>
            <Text variant="heading-lg">What are you working on?</Text>
            <View className="gap-xs">
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
          </>
        )}

        {step === "height" && (
          <>
            <Text variant="heading-lg">How tall are you?</Text>
            {heightUnit === "cm" ? (
              <NumericHeroInput
                value={String(Math.round(heightCm))}
                onChangeText={(t) => setHeightCm(Number(t) || 0)}
                suffix="cm"
              />
            ) : (
              <FeetInchesField cm={heightCm} onChange={setHeightCm} />
            )}
            <UnitToggle
              value={heightUnit}
              options={[
                { value: "cm", label: "cm" },
                { value: "ft", label: "ft / in" },
              ]}
              onChange={setHeightUnit}
            />
          </>
        )}

        {(step === "weight" || step === "target-weight") && (
          <>
            <Text variant="heading-lg">
              {step === "weight" ? "What do you weigh now?" : "Any target in mind?"}
            </Text>
            {step === "target-weight" && (
              <Text variant="body-md" color="mute">
                Optional — you can skip this and set it later.
              </Text>
            )}
            <NumericHeroInput
              value={(() => {
                const kg = step === "weight" ? weightKg : targetKg;
                return (weightUnit === "kg" ? kg : kgToLb(kg)).toFixed(1);
              })()}
              onChangeText={(t) => {
                const parsed = Number(t) || 0;
                const kg = weightUnit === "kg" ? parsed : lbToKg(parsed);
                step === "weight" ? setWeightKg(kg) : setTargetKg(kg);
              }}
              suffix={weightUnit}
            />
            <UnitToggle
              value={weightUnit}
              options={[
                { value: "kg", label: "kg" },
                { value: "lb", label: "lb" },
              ]}
              onChange={setWeightUnit}
            />
          </>
        )}

        {step === "activity" && (
          <>
            <Text variant="heading-lg">How active is your week?</Text>
            <View className="gap-xs">
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
          </>
        )}

        {step === "foods" && (
          <>
            <Text variant="heading-lg">What do you usually eat?</Text>
            <Text variant="body-md" color="mute">
              Rough is fine — this just stops day one being empty.
            </Text>
            <View className="flex-row flex-wrap gap-xs">
              {FOOD_HABITS.map((habit) => (
                <Chip
                  key={habit}
                  label={habit}
                  selected={habits.includes(habit)}
                  onPress={() =>
                    setHabits((prev) =>
                      prev.includes(habit) ? prev.filter((h) => h !== habit) : [...prev, habit],
                    )
                  }
                />
              ))}
            </View>
          </>
        )}
      </View>

      <View className="gap-xs pb-lg">
        <Button
          label={index === STEPS.length - 1 ? "Done" : "Continue"}
          fullWidth
          onPress={next}
        />
        {step === "target-weight" && (
          <Button label="Skip" variant="ghost" onPress={next} />
        )}
      </View>
    </Screen>
  );
}

function FeetInchesField({ cm, onChange }: { cm: number; onChange: (cm: number) => void }) {
  const { feet, inches } = cmToFeetInches(cm);
  return (
    <View className="row gap-md">
      <NumericHeroInput
        value={String(feet)}
        onChangeText={(t) => onChange(feetInchesToCm(Number(t) || 0, inches))}
        suffix="ft"
      />
      <NumericHeroInput
        value={String(inches)}
        onChangeText={(t) => onChange(feetInchesToCm(feet, Number(t) || 0))}
        suffix="in"
      />
    </View>
  );
}
