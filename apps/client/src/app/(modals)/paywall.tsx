import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Text } from "@/components/ui/Text";
import { actions } from "@/mocks/store";
import { colors } from "@/theme/tokens";

const INCLUDED = [
  "Unlimited photo-assist on meals",
  "Full comparison history and exports",
  "Unlimited streak freezes",
];

/** No forced-choice decline copy, no countdown, no fake scarcity (PRD 10). */
export default function PaywallScreen() {
  const router = useRouter();

  const upgrade = () => {
    actions.setTier("PRO");
    router.back();
  };

  return (
    <Screen>
      <ScreenHeader dismiss />

      <View className="gap-sm pt-md">
        <Text variant="heading-lg">More room when you want it</Text>
        <Text variant="body-lg" color="body">
          Everything you use today stays free. Pro lifts the limits.
        </Text>
      </View>

      <Card className="mt-lg gap-sm">
        {INCLUDED.map((item) => (
          <View key={item} className="row gap-xs">
            <Feather name="check" size={18} color={colors.primary} />
            <Text variant="body-md" color="body" className="fill">
              {item}
            </Text>
          </View>
        ))}
      </Card>

      <Card className="mt-md gap-xxs">
        <Text variant="metric-md" tabular>
          ₹249
          <Text variant="body-md" color="mute">
            {" "}
            / month
          </Text>
        </Text>
        <Text variant="body-sm" color="mute">
          Or ₹1,999 a year. Cancel any time from your store account.
        </Text>
      </Card>

      <View className="gap-xs pt-lg">
        <Button label="Continue" fullWidth onPress={upgrade} />
        <Button label="Stay on free" variant="ghost" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}
