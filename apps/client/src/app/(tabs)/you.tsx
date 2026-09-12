import { useRouter } from "expo-router";
import { View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ListRow } from "@/components/ui/ListRow";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { ACTIVITY_LABELS, GOAL_STATUS_LABELS } from "@/constants/profile";
import { useSubscription, useUser } from "@/hooks/data";
import { actions, getDataset } from "@/mocks/store";
import { defaultUnits, formatHeight, formatWeight } from "@/lib/units";

export default function YouScreen() {
  const router = useRouter();
  const { data: user } = useUser();
  const { data: subscription } = useSubscription();
  const units = defaultUnits(user.region);
  const editProfile = () => router.push("/(modals)/edit-profile");

  return (
    <Screen tabBarPadding>
      <Text variant="heading-lg" className="pt-xs">
        You
      </Text>

      <View className="gap-md pt-md">
        <Card className="row gap-sm">
          <View
            className="center rounded-full bg-sunken"
            style={{ width: 56, height: 56 }}
          >
            <Text variant="metric-md" color="body">
              {(user.displayName?.[0] ?? "?").toUpperCase()}
            </Text>
          </View>
          <View className="fill gap-xxs">
            <Text variant="heading-md">{user.displayName}</Text>
            <Text variant="body-sm" color="mute">
              {user.email}
            </Text>
          </View>
          {user.goal && <Badge label={GOAL_STATUS_LABELS[user.goal]} tone="positive" />}
        </Card>

        <Card padded={false} className="px-md">
          <ListRow
            title="Goal"
            value={user.goal ? GOAL_STATUS_LABELS[user.goal] : "Not set"}
            onPress={editProfile}
            showChevron
          />
          <View className="hairline-t" />
          <ListRow
            title="Height"
            value={user.heightCm ? formatHeight(user.heightCm, units.height) : "—"}
            onPress={editProfile}
            showChevron
          />
          <View className="hairline-t" />
          <ListRow
            title="Current weight"
            value={user.currentWeightKg ? formatWeight(user.currentWeightKg, units.weight) : "—"}
            onPress={() => router.push("/(modals)/weight-entry")}
            showChevron
          />
          <View className="hairline-t" />
          <ListRow
            title="Target weight"
            value={user.targetWeightKg ? formatWeight(user.targetWeightKg, units.weight) : "Not set"}
            onPress={editProfile}
            showChevron
          />
          <View className="hairline-t" />
          <ListRow
            title="Activity level"
            value={user.activityLevel ? ACTIVITY_LABELS[user.activityLevel] : "—"}
            onPress={editProfile}
            showChevron
          />
        </Card>

        <Card className="gap-sm">
          <View className="row-between">
            <Text variant="heading-md">
              {subscription.tier === "PRO" ? "Pro" : "Free plan"}
            </Text>
            <Badge
              label={subscription.tier}
              tone={subscription.tier === "PRO" ? "positive" : "neutral"}
            />
          </View>
          <Text variant="body-md" color="body">
            {subscription.tier === "PRO"
              ? "Unlimited photo assist, full comparison history and exports."
              : "Unlimited comparisons and exports are available on Pro, whenever it's useful."}
          </Text>
          {subscription.tier === "FREE" && (
            <Button
              label="See what's included"
              variant="secondary"
              onPress={() => router.push("/(modals)/paywall")}
            />
          )}
        </Card>

        <Card padded={false} className="px-md">
          <ListRow
            title="Notifications"
            subtitle="Reminders and quiet hours"
            onPress={() => router.push("/(modals)/notifications")}
            showChevron
          />
          <View className="hairline-t" />
          <ListRow
            title="Privacy"
            subtitle="Photo visibility and analytics"
            onPress={() => router.push("/(modals)/privacy")}
            showChevron
          />
          <View className="hairline-t" />
          <ListRow
            title="Export my data"
            subtitle="A copy of your logs, weights and photos"
            onPress={() => router.push("/(modals)/export-data")}
            showChevron
          />
          <View className="hairline-t" />
          <ListRow
            title="Widget preview"
            subtitle="How the home-screen widget will look"
            onPress={() => router.push("/(modals)/widget-preview")}
            showChevron
          />
        </Card>

        <Card className="gap-sm">
          <Text variant="overline" color="mute">
            Demo data
          </Text>
          <Text variant="body-sm" color="mute">
            Switch between a populated account and a brand-new one to see every empty state.
          </Text>
          <View className="row gap-xs">
            <Button
              label="Populated"
              variant={getDataset() === "populated" ? "primary" : "secondary"}
              onPress={() => actions.useDataset("populated")}
              className="fill"
            />
            <Button
              label="New user"
              variant={getDataset() === "new" ? "primary" : "secondary"}
              onPress={() => actions.useDataset("new")}
              className="fill"
            />
          </View>
        </Card>

        <View className="items-center gap-xs pt-xs">
          <Button label="Sign out" variant="ghost" onPress={() => router.replace("/(auth)/welcome")} />
          <Button
            label="Delete account"
            variant="destructive"
            onPress={() => router.push("/(modals)/delete-account")}
          />
        </View>
      </View>
    </Screen>
  );
}
