import { Stack } from "expo-router";

import { colors } from "@/theme/tokens";

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: "modal",
        contentStyle: { backgroundColor: colors.canvas },
      }}
    />
  );
}
