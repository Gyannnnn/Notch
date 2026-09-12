import * as Sharing from "expo-sharing";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Dimensions, ScrollView, View } from "react-native";
import { captureRef } from "react-native-view-shot";

import { ShareTemplate, TEMPLATES, type TemplateId } from "@/components/progress/ShareTemplates";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Switch } from "@/components/ui/Switch";
import { Text } from "@/components/ui/Text";
import { useComparison, useUser } from "@/hooks/data";
import { defaultUnits } from "@/lib/units";

type Format = "story" | "square" | "status";

const FORMATS: { value: Format; label: string }[] = [
  { value: "story", label: "Story 9:16" },
  { value: "square", label: "Square" },
  { value: "status", label: "WhatsApp Status" },
];

export default function ShareTemplateScreen() {
  const router = useRouter();
  const { data: comparison } = useComparison("1m");
  const { data: user } = useUser();
  const unit = defaultUnits(user.region).weight;

  const [template, setTemplate] = useState<TemplateId>("minimal");
  const [format, setFormat] = useState<Format>("story");
  const [showWeight, setShowWeight] = useState(true);
  const [blurFaces, setBlurFaces] = useState(false);
  const [busy, setBusy] = useState(false);

  const cardRef = useRef<View>(null);
  const cardWidth = Dimensions.get("window").width - 64;

  if (!comparison) {
    return (
      <Screen>
        <ScreenHeader title="Share" dismiss />
        <EmptyState
          icon="image"
          title="Nothing to share yet"
          body="A comparison needs two photos."
          className="mt-lg"
        />
      </Screen>
    );
  }

  /**
   * Hands off to the OS share sheet rather than faking a per-platform success
   * state — the sheet already covers every destination.
   */
  const share = async () => {
    setBusy(true);
    try {
      const uri = await captureRef(cardRef, { format: "png", quality: 0.95 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "image/png" });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <ScreenHeader title="Share" dismiss />

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        className="-mx-md"
        contentContainerStyle={{ paddingHorizontal: 32 }}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / (cardWidth + 16));
          setTemplate(TEMPLATES[Math.min(index, TEMPLATES.length - 1)]!.id);
        }}
      >
        {TEMPLATES.map((t) => (
          <View key={t.id} style={{ width: cardWidth, marginRight: 16 }}>
            <View ref={t.id === template ? cardRef : undefined} collapsable={false}>
              <ShareTemplate
                id={t.id}
                comparison={comparison}
                unit={unit}
                showWeight={showWeight}
                blurFaces={blurFaces}
              />
            </View>
            <Text variant="label-sm" color="mute" className="pt-xs text-center">
              {t.label}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View className="gap-md pt-lg">
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
        </View>

        <View className="gap-xs">
          <Text variant="overline" color="mute">
            Privacy
          </Text>
          <ToggleRow
            label="Show weight"
            hint="Include the weight change on the card"
            value={showWeight}
            onChange={setShowWeight}
          />
          <ToggleRow
            label="Hide my face"
            hint="Covers the face area before sharing"
            value={blurFaces}
            onChange={setBlurFaces}
          />
        </View>

        <Button label="Share" icon="share-2" fullWidth loading={busy} onPress={share} />
        <Button label="Save to photos" variant="secondary" fullWidth onPress={share} />
        <Button label="Not now" variant="ghost" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

function ToggleRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View className="row-between rounded-md border border-hairline bg-elevated px-md py-sm">
      <View className="fill">
        <Text variant="heading-sm">{label}</Text>
        <Text variant="body-sm" color="mute">
          {hint}
        </Text>
      </View>
      <Switch label={label} value={value} onValueChange={onChange} />
    </View>
  );
}
