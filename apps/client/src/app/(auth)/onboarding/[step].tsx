import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Text } from "@/components/ui/Text";
import { UnitToggle } from "@/components/ui/UnitToggle";
import { useUser } from "@/hooks/data";
import { cmToFeetInches, feetInchesToCm, kgToLb, lbToKg } from "@/lib/units";
import type { HeightUnit, WeightUnit } from "@/lib/units";
import { actions } from "@/mocks/store";
import { colors, fonts } from "@/theme/tokens";
import type { ActivityLevel, Goal } from "@/types/domain";

/**
 * One question per screen. The five fields the API needs before onboarding is
 * considered complete (see ONBOARDING_FIELDS in packages/schemas) are collected
 * here; timezone is read from the device rather than asked for.
 */
const STEPS = ["goal", "height", "weight", "target-weight", "activity", "foods"] as const;
type Step = (typeof STEPS)[number];

const GOALS: { value: Goal; title: string; body: string }[] = [
  { value: "CUT", title: "Cut", body: "Lose fat, hold on to muscle" },
  { value: "BULK", title: "Bulk", body: "Build muscle, accept some gain" },
  { value: "MAINTAIN", title: "Maintain", body: "Stay where you are" },
];

const ACTIVITY: { value: ActivityLevel; title: string; body: string }[] = [
  { value: "SEDENTARY", title: "Sedentary", body: "Desk job, little movement" },
  { value: "LIGHT", title: "Lightly active", body: "Some walking, 1–2 sessions a week" },
  { value: "MODERATE", title: "Moderately active", body: "Training 3–4 times a week" },
  { value: "ACTIVE", title: "Active", body: "Training 5–6 times a week" },
  { value: "VERY_ACTIVE", title: "Very active", body: "Daily training or physical work" },
];

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
              {GOALS.map((option) => (
                <SelectCard
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
              <NumberField
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
            <NumberField
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
              {ACTIVITY.map((option) => (
                <SelectCard
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

function SelectCard({
  title,
  body,
  selected,
  onPress,
  compact,
}: {
  title: string;
  body: string;
  selected: boolean;
  onPress: () => void;
  compact?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      className="justify-center rounded-lg bg-elevated p-md"
      style={{
        minHeight: compact ? 64 : 76,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? colors.ink : colors["hairline-strong"],
      }}
    >
      <Text variant="heading-md">{title}</Text>
      <Text variant="body-sm" color="mute">
        {body}
      </Text>
    </Pressable>
  );
}

function NumberField({
  value,
  onChangeText,
  suffix,
}: {
  value: string;
  onChangeText: (text: string) => void;
  suffix: string;
}) {
  return (
    <View className="row items-baseline gap-xs">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
        selectTextOnFocus
        className="text-ink"
        style={{
          fontFamily: fonts.bold,
          fontSize: 56,
          lineHeight: 60,
          letterSpacing: -2,
          minWidth: 130,
          fontVariant: ["tabular-nums"],
        }}
      />
      <Text variant="heading-md" color="mute">
        {suffix}
      </Text>
    </View>
  );
}

function FeetInchesField({ cm, onChange }: { cm: number; onChange: (cm: number) => void }) {
  const { feet, inches } = cmToFeetInches(cm);
  return (
    <View className="row gap-md">
      <NumberField
        value={String(feet)}
        onChangeText={(t) => onChange(feetInchesToCm(Number(t) || 0, inches))}
        suffix="ft"
      />
      <NumberField
        value={String(inches)}
        onChangeText={(t) => onChange(feetInchesToCm(feet, Number(t) || 0))}
        suffix="in"
      />
    </View>
  );
}
