import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { colors } from "@/theme/tokens";
import { Text } from "./Text";

interface ScreenHeaderProps {
  title?: string;
  onBack?: () => void;
  /** Shows a close affordance instead of a back arrow, for modal routes. */
  dismiss?: boolean;
  trailing?: ReactNode;
}

export function ScreenHeader({ title, onBack, dismiss, trailing }: ScreenHeaderProps) {
  const router = useRouter();
  const goBack = onBack ?? (() => router.back());

  return (
    <View className="row-between py-xs" style={{ minHeight: 52 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={dismiss ? "Close" : "Go back"}
        onPress={goBack}
        hitSlop={12}
        className="center tappable -ml-xs"
      >
        <Feather name={dismiss ? "x" : "arrow-left"} size={22} color={colors.ink} />
      </Pressable>
      {title ? (
        <Text variant="heading-md" numberOfLines={1} className="fill text-center">
          {title}
        </Text>
      ) : (
        <View className="fill" />
      )}
      <View className="tappable center -mr-xs">{trailing}</View>
    </View>
  );
}
