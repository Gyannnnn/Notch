import { useRouter } from "expo-router";
import { View } from "react-native";

import { Card } from "@/components/ui/Card";
import { ListRow } from "@/components/ui/ListRow";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Switch } from "@/components/ui/Switch";
import { Text } from "@/components/ui/Text";
import { usePrivacyPrefs, useUpdatePrivacy } from "@/hooks/data";
import type { PrivacyPrefs } from "@/types/domain";

interface ToggleRow {
  key: keyof PrivacyPrefs;
  title: string;
  body: string;
}

const ROWS: ToggleRow[] = [
  {
    key: "photosPrivateByDefault",
    title: "Photos private by default",
    body: "New photos are visible only to you until you share them yourself.",
  },
  {
    key: "shareIncludesStats",
    title: "Include stats on share cards",
    body: "Weight change and date range appear on exported comparisons.",
  },
  {
    key: "analyticsOptOut",
    title: "Opt out of usage analytics",
    body: "Stops anonymous product analytics. Crash reports are unaffected.",
  },
];

export default function PrivacyScreen() {
  const router = useRouter();
  const { data: prefs } = usePrivacyPrefs();
  const update = useUpdatePrivacy();

  return (
    <Screen>
      <ScreenHeader title="Privacy" dismiss />

      <View className="gap-md pt-xs">
        <Text variant="body-md" color="body">
          Your progress photos are stored privately and are never posted anywhere on your behalf.
          Sharing is always an explicit action, one card at a time.
        </Text>

        <Card padded={false} className="px-md">
          {ROWS.map((row, index) => (
            <View key={row.key}>
              {index > 0 && <View className="hairline-t" />}
              <View className="row-between gap-md py-sm" style={{ minHeight: 56 }}>
                <View className="fill gap-xxs">
                  <Text variant="heading-sm">{row.title}</Text>
                  <Text variant="body-sm" color="mute">
                    {row.body}
                  </Text>
                </View>
                <Switch
                  label={row.title}
                  value={prefs[row.key]}
                  onValueChange={(value) => update({ [row.key]: value })}
                />
              </View>
            </View>
          ))}
        </Card>

        <Card padded={false} className="px-md">
          <ListRow
            title="Export my data"
            subtitle="A copy of your logs, weights and photos"
            onPress={() => router.push("/(modals)/export-data")}
            showChevron
          />
          <View className="hairline-t" />
          <ListRow
            title="Delete my account"
            subtitle="Removes everything, after a grace period"
            onPress={() => router.push("/(modals)/delete-account")}
            showChevron
          />
        </Card>
      </View>
    </Screen>
  );
}
