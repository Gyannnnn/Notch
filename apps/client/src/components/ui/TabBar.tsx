import Feather from "@expo/vector-icons/Feather";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, elevation, motion } from "@/theme/tokens";
import { Text } from "./Text";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  today: "sun",
  progress: "image",
  plan: "trending-up",
  you: "user",
};

/**
 * Typed against only what this bar uses. expo-router ships its own bottom-tabs
 * types that are structurally incompatible with @react-navigation/bottom-tabs,
 * so depending on either one's full prop type breaks on version drift.
 */
interface TabBarProps {
  state: {
    index: number;
    routes: { key: string; name: string }[];
  };
  navigation: { navigate: (name: string) => void };
}

/**
 * Four destinations plus a raised centre action. The "+" is not a fifth tab —
 * it opens the capture sheet stack and owns no route of its own.
 */
export function TabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const routes = state.routes.filter((r) => r.name in ICONS);
  const [left, right] = [routes.slice(0, 2), routes.slice(2)];

  return (
    <View
      className="row-between hairline-t bg-elevated px-xs"
      style={{ paddingBottom: insets.bottom, height: 56 + insets.bottom }}
    >
      {left.map((route) => (
        <TabItem
          key={route.key}
          name={route.name}
          focused={state.routes[state.index]?.key === route.key}
          onPress={() => navigation.navigate(route.name)}
        />
      ))}

      <CentreAction onPress={() => router.push("/(modals)/food-capture")} />

      {right.map((route) => (
        <TabItem
          key={route.key}
          name={route.name}
          focused={state.routes[state.index]?.key === route.key}
          onPress={() => navigation.navigate(route.name)}
        />
      ))}
    </View>
  );
}

const LABELS: Record<string, string> = {
  today: "Today",
  progress: "Progress",
  plan: "Plan",
  you: "You",
};

function TabItem({
  name,
  focused,
  onPress,
}: {
  name: string;
  focused: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={LABELS[name]}
      onPress={onPress}
      className="fill center gap-xxs"
      style={{ minHeight: 48 }}
    >
      <Feather
        name={ICONS[name] ?? "circle"}
        size={22}
        color={focused ? colors.ink : colors.mute}
      />
      <Text variant="label-sm" color={focused ? "ink" : "mute"}>
        {LABELS[name]}
      </Text>
    </Pressable>
  );
}

function CentreAction({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View className="center" style={{ width: 72 }}>
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel="Log food"
        onPressIn={() => scale.set(withSpring(0.92, motion.springPress))}
        onPressOut={() => scale.set(withSpring(1, motion.springPress))}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        className="center rounded-full bg-primary"
        style={[{ width: 56, height: 56, marginTop: -18 }, elevation.floating, style]}
      >
        <Feather name="plus" size={26} color={colors["on-primary"]} />
      </AnimatedPressable>
    </View>
  );
}
