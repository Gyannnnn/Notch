import { useRouter } from "expo-router";
import { useState } from "react";
import { TextInput, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Text } from "@/components/ui/Text";
import { UnitToggle } from "@/components/ui/UnitToggle";
import { useLogWeight, useUser } from "@/hooks/data";
import { defaultUnits, kgToLb, lbToKg, type WeightUnit } from "@/lib/units";
import { colors, fonts } from "@/theme/tokens";

/** Deliberately almost empty: this is a two-tap interaction and nothing competes with the field. */
export default function WeightEntryScreen() {
  const router = useRouter();
  const { data: user } = useUser();
  const logWeight = useLogWeight();

  const [unit, setUnit] = useState<WeightUnit>(defaultUnits(user.region).weight);
  const startingValue = user.currentWeightKg ?? 70;
  const [value, setValue] = useState(
    (unit === "kg" ? startingValue : kgToLb(startingValue)).toFixed(1),
  );

  const switchUnit = (next: WeightUnit) => {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      setValue((next === "kg" ? lbToKg(parsed) : kgToLb(parsed)).toFixed(1));
    }
    setUnit(next);
  };

  const save = () => {
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed <= 0) return;
    logWeight(unit === "kg" ? parsed : lbToKg(parsed));
    router.back();
  };

  return (
    <Screen scroll={false}>
      <ScreenHeader title="Weight" dismiss />

      <View className="fill center gap-md">
        <View className="row items-baseline gap-xs">
          <TextInput
            value={value}
            onChangeText={setValue}
            keyboardType="decimal-pad"
            selectTextOnFocus
            autoFocus
            className="text-ink"
            style={{
              fontFamily: fonts.bold,
              fontSize: 56,
              lineHeight: 60,
              letterSpacing: -2,
              minWidth: 150,
              textAlign: "center",
              fontVariant: ["tabular-nums"],
            }}
            placeholderTextColor={colors.faint}
          />
          <Text variant="heading-md" color="mute">
            {unit}
          </Text>
        </View>

        <UnitToggle
          value={unit}
          options={[
            { value: "kg", label: "kg" },
            { value: "lb", label: "lb" },
          ]}
          onChange={switchUnit}
        />
      </View>

      <View className="pb-lg">
        <Button label="Save" fullWidth onPress={save} />
      </View>
    </Screen>
  );
}
