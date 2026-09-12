import Feather from "@expo/vector-icons/Feather";
import { Stack, useRouter } from "expo-router";
import { View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { colors } from "@/theme/tokens";

/**
 * Reached by a stale deep link or a notification pointing at something that has
 * since been deleted. Deliberately not an `empty-state`: the dashed frame means
 * "nothing here yet", and this is a route that went missing, not a list the
 * user has yet to fill. No apology and no error code — neither helps.
 */
export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen scroll={false}>
        <View className="fill center gap-sm">
          <Feather name="compass" size={28} color={colors.faint} />
          <Text variant="heading-md" className="text-center">
            That page has moved on
          </Text>
          <Text variant="body-md" color="mute" className="text-center">
            The link you followed points at something that is no longer here. Everything you have
            logged is safe.
          </Text>
          <Button
            label="Go to today"
            onPress={() => router.replace("/(tabs)/today")}
            className="mt-xs"
          />
        </View>
      </Screen>
    </>
  );
}
