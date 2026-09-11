import Feather from "@expo/vector-icons/Feather";
import { View } from "react-native";

import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Text } from "@/components/ui/Text";
import { useStreak } from "@/hooks/data";
import { colors, elevation } from "@/theme/tokens";

/**
 * A static preview, not a working widget. Real OS widgets need native config
 * plugins (expo-widgets is iOS-only and alpha; Android needs a separate
 * library) — carried as a known risk in TRD §12.1 and scheduled as its own
 * task. This exists so the visual design is settled beforehand.
 */
export default function WidgetPreviewScreen() {
  const { data: streak } = useStreak();

  return (
    <Screen>
      <ScreenHeader title="Widget preview" dismiss />

      <Text variant="body-md" color="body" className="pt-sm">
        How the home-screen widget will look. Streak count and one tap to log — nothing else.
      </Text>

      <View className="center py-xl">
        <View
          className="justify-between rounded-xl bg-elevated p-md"
          style={[{ width: 170, height: 170 }, elevation.floating]}
        >
          <View className="row gap-xxs">
            <Feather name="zap" size={16} color={colors.caution} />
            <Text variant="label-sm" color="mute">
              Streak
            </Text>
          </View>
          <View>
            <Text variant="metric-lg" tabular>
              {streak.currentStreak}
            </Text>
            <Text variant="body-sm" color="mute">
              {streak.currentStreak === 1 ? "day" : "days"}
            </Text>
          </View>
          <View className="center rounded-pill bg-ink py-xs">
            <Text variant="button-md" color="on-ink">
              Log now
            </Text>
          </View>
        </View>
      </View>

      <Card className="gap-xs">
        <Text variant="overline" color="mute">
          Not yet built
        </Text>
        <Text variant="body-sm" color="mute">
          The native widget is a separate piece of work with its own build and release path. This
          screen only fixes the design.
        </Text>
      </Card>
    </Screen>
  );
}
