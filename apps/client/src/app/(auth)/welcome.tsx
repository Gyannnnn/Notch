import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { APP_NAME } from "@/constants/app";
import { colors } from "@/theme/tokens";

const SLIDES = [
  {
    title: "See the change you can't feel",
    body: "Progress photos line themselves up, so a month of work is one tap away — no digging through your camera roll.",
  },
  {
    title: "Log a meal in seconds",
    body: "Your usuals, Indian dishes by the katori, and barcodes. Pick what you ate instead of typing it out.",
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index]!;
  const isLast = index === SLIDES.length - 1;

  return (
    <Screen scroll={false}>
      <View className="row-between pt-md">
        <Text variant="heading-md">{APP_NAME}</Text>
        <Button label="Skip" variant="ghost" onPress={() => router.push("/(auth)/sign-in")} />
      </View>

      <View className="fill justify-center gap-sm">
        <Animated.View key={index} entering={FadeIn.duration(260)} className="gap-sm">
          <Text variant="heading-lg">{slide.title}</Text>
          <Text variant="body-lg" color="body">
            {slide.body}
          </Text>
        </Animated.View>
      </View>

      <View className="gap-md pb-lg">
        <View className="row center gap-xxs">
          {SLIDES.map((_, i) => (
            <View
              key={i}
              className="rounded-pill"
              style={{
                width: i === index ? 20 : 6,
                height: 6,
                backgroundColor: i === index ? colors.ink : colors.hairline,
              }}
            />
          ))}
        </View>
        <Button
          label={isLast ? "Get started" : "Next"}
          fullWidth
          onPress={() => (isLast ? router.push("/(auth)/sign-in") : setIndex(index + 1))}
        />
      </View>
    </Screen>
  );
}
