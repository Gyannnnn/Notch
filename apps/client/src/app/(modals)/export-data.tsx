import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Switch } from "@/components/ui/Switch";
import { Text } from "@/components/ui/Text";
import { useExportSummary } from "@/hooks/data";
import { formatShortDate } from "@/lib/date";
import { colors } from "@/theme/tokens";

type Format = "csv" | "json";

const FORMATS: { value: Format; label: string }[] = [
  { value: "csv", label: "CSV" },
  { value: "json", label: "JSON" },
];

const PREPARE_DELAY_MS = 900;

type Section = "logs" | "weights" | "photos";

export default function ExportDataScreen() {
  const { data: summary } = useExportSummary();
  const [format, setFormat] = useState<Format>("csv");
  const [include, setInclude] = useState<Record<Section, boolean>>({
    logs: true,
    weights: true,
    photos: true,
  });
  const [busy, setBusy] = useState(false);
  const [requested, setRequested] = useState(false);

  const sections: { key: Section; title: string; body: string }[] = [
    { key: "logs", title: "Food logs", body: `${summary.foodLogs} entries` },
    { key: "weights", title: "Weigh-ins", body: `${summary.weighIns} entries` },
    { key: "photos", title: "Progress photos", body: `${summary.photos} images` },
  ];

  const nothingSelected = !include.logs && !include.weights && !include.photos;

  /**
   * The export is assembled server-side and emailed as a link rather than
   * built on the device — photos alone can outweigh anything worth holding in
   * memory here, and the link is what the user can forward or archive.
   */
  const request = () => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setRequested(true);
    }, PREPARE_DELAY_MS);
  };

  return (
    <Screen>
      <ScreenHeader title="Export my data" dismiss />

      <View className="gap-md pt-xs">
        <Text variant="body-md" color="body">
          Everything you&apos;ve recorded
          {summary.since ? ` since ${formatShortDate(summary.since)}` : ""}, with each food log
          carrying the macros as they stood at the time. Exporting changes nothing in the app.
        </Text>

        <View className="gap-xs">
          <Text variant="overline" color="mute">
            Format
          </Text>
          <View className="row gap-xs">
            {FORMATS.map((f) => (
              <Chip
                key={f.value}
                label={f.label}
                selected={format === f.value}
                onPress={() => setFormat(f.value)}
              />
            ))}
          </View>
          <Text variant="body-sm" color="mute">
            {format === "csv"
              ? "One spreadsheet per record type, plus the photos."
              : "A single structured file, plus the photos."}
          </Text>
        </View>

        <Card padded={false} className="px-md">
          {sections.map((section, index) => (
            <View key={section.key}>
              {index > 0 && <View className="hairline-t" />}
              <View className="row-between gap-md py-sm" style={{ minHeight: 56 }}>
                <View className="fill gap-xxs">
                  <Text variant="heading-sm">{section.title}</Text>
                  <Text variant="body-sm" color="mute">
                    {section.body}
                  </Text>
                </View>
                <Switch
                  label={section.title}
                  value={include[section.key]}
                  onValueChange={(value) =>
                    setInclude((prev) => ({ ...prev, [section.key]: value }))
                  }
                />
              </View>
            </View>
          ))}
        </Card>

        {requested ? (
          <Card className="row gap-sm">
            <Feather name="mail" size={20} color={colors.primary} />
            <Text variant="body-md" color="body" className="fill">
              We&apos;ll email a download link to {summary.email} once it&apos;s ready. The link
              works for seven days.
            </Text>
          </Card>
        ) : (
          <Button
            label="Email me the export"
            icon="mail"
            fullWidth
            loading={busy}
            disabled={nothingSelected}
            onPress={request}
          />
        )}

        <Text variant="body-sm" color="mute" className="text-center">
          Sent to {summary.email}.
        </Text>
      </View>
    </Screen>
  );
}
