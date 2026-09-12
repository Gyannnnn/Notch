import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Text } from "@/components/ui/Text";
import { useDeleteAccount, useExportSummary } from "@/hooks/data";
import { colors } from "@/theme/tokens";

const GRACE_DAYS = 30;

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { data: summary } = useExportSummary();
  const deleteAccount = useDeleteAccount();
  const [confirming, setConfirming] = useState(false);

  const removed = [
    `${summary.foodLogs} food log ${summary.foodLogs === 1 ? "entry" : "entries"}`,
    `${summary.weighIns} weigh-${summary.weighIns === 1 ? "in" : "ins"}`,
    `${summary.photos} progress ${summary.photos === 1 ? "photo" : "photos"}`,
    "Your goal, targets and streak history",
  ];

  const confirm = () => {
    deleteAccount();
    router.replace("/(auth)/welcome");
  };

  return (
    <Screen>
      <ScreenHeader title="Delete account" dismiss />

      <View className="gap-md pt-xs">
        <Text variant="body-lg" color="body">
          Your account is scheduled for deletion straight away and permanently erased after{" "}
          {GRACE_DAYS} days. Signing back in during that window cancels it.
        </Text>

        <Card className="gap-sm">
          <Text variant="overline" color="mute">
            What goes
          </Text>
          {removed.map((item) => (
            <View key={item} className="row gap-xs">
              <Feather name="minus" size={16} color={colors.mute} />
              <Text variant="body-md" color="body" className="fill">
                {item}
              </Text>
            </View>
          ))}
        </Card>

        <Card className="row gap-sm">
          <Feather name="download" size={20} color={colors.primary} />
          <View className="fill gap-xxs">
            <Text variant="heading-sm">Want a copy first?</Text>
            <Text variant="body-sm" color="mute">
              An export takes a minute and is yours to keep.
            </Text>
          </View>
        </Card>

        <Button
          label="Export my data"
          variant="secondary"
          fullWidth
          onPress={() => router.push("/(modals)/export-data")}
        />

        <View className="items-center gap-xs pt-md">
          {confirming ? (
            <>
              <Text variant="body-md" color="body" className="text-center">
                Delete the account for {summary.email}?
              </Text>
              <View className="row gap-xs">
                <Button label="Keep my account" onPress={() => router.back()} />
                <Button label="Delete" variant="destructive" onPress={confirm} />
              </View>
            </>
          ) : (
            <Button
              label="Delete my account"
              variant="destructive"
              onPress={() => setConfirming(true)}
            />
          )}
        </View>
      </View>
    </Screen>
  );
}
