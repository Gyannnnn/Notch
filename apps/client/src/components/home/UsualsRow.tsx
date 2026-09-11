import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Text } from "@/components/ui/Text";
import { useLogFood, useUsuals } from "@/hooks/data";
import { colors, elevation } from "@/theme/tokens";

/**
 * One tap logs a usual and the ring responds immediately — the "≤2 taps from
 * Home" path in PRD 6.2.
 */
export function UsualsRow() {
  const { data: usuals } = useUsuals();
  const logFood = useLogFood();
  const [justLogged, setJustLogged] = useState<string | null>(null);

  const onLog = (foodItemId: string, grams: number, mealSlot: Parameters<typeof logFood>[0]["mealSlot"]) => {
    logFood({ foodItemId, grams, mealSlot, loggedVia: "USUAL_REPEAT" });
    setJustLogged(foodItemId);
    setTimeout(() => setJustLogged((id) => (id === foodItemId ? null : id)), 1200);
  };

  return (
    <View className="gap-xs">
      <Text variant="overline" color="mute">
        Your usuals
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-xs pr-md"
      >
        {usuals.map((usual) => {
          const logged = justLogged === usual.foodItemId;
          return (
            <Pressable
              key={usual.foodItemId}
              accessibilityRole="button"
              accessibilityLabel={`Log ${usual.name}`}
              onPress={() => onLog(usual.foodItemId, usual.portionGrams, usual.mealSlot)}
              className="justify-between rounded-lg border border-hairline bg-elevated p-sm active:opacity-80"
              style={[{ width: 132, height: 104 }, elevation.whisper]}
            >
              <View className="row-between">
                <Text variant="body-sm" color="mute">
                  {usual.portionLabel}
                </Text>
                {logged ? (
                  <Animated.View
                    entering={FadeIn.duration(120)}
                    className="center rounded-full bg-primary"
                    style={{ width: 22, height: 22 }}
                  >
                    <Feather name="check" size={14} color={colors["on-primary"]} />
                  </Animated.View>
                ) : (
                  <Feather name="plus-circle" size={20} color={colors.faint} />
                )}
              </View>
              <Text variant="heading-sm" numberOfLines={2}>
                {usual.name}
              </Text>
              <Text variant="label-sm" color="mute" tabular>
                {usual.calories} kcal
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
