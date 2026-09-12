import { View } from "react-native";

import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Stepper } from "@/components/ui/Stepper";
import { Switch } from "@/components/ui/Switch";
import { Text } from "@/components/ui/Text";
import { useNotificationPrefs, useUpdateNotifications } from "@/hooks/data";
import type { NotificationPrefs } from "@/types/domain";

/** Whole hours only. Minute precision on a quiet window is false precision. */
const formatHour = (hour: number) => {
  const suffix = hour < 12 ? "am" : "pm";
  const twelve = hour % 12 === 0 ? 12 : hour % 12;
  return `${twelve}${suffix}`;
};

interface ToggleRow {
  key: keyof Pick<NotificationPrefs, "mealReminders" | "weighInReminder" | "streakMilestones">;
  title: string;
  body: string;
}

const ROWS: ToggleRow[] = [
  {
    key: "mealReminders",
    title: "Meal reminders",
    body: "Timed from when you usually log, not a fixed schedule everyone shares.",
  },
  {
    key: "weighInReminder",
    title: "Weigh-in reminder",
    body: "One nudge on the mornings you'd normally step on the scale.",
  },
  {
    key: "streakMilestones",
    title: "Streak milestones",
    body: "A note when a fresh comparison is ready at the end of a week.",
  },
];

export default function NotificationsScreen() {
  const { data: prefs } = useNotificationPrefs();
  const update = useUpdateNotifications();

  return (
    <Screen>
      <ScreenHeader title="Notifications" dismiss />

      <View className="gap-md pt-xs">
        <Text variant="body-md" color="body">
          Reminders are capped and worded plainly. Turning any of them off never affects your
          streak or your data.
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

        <Card className="gap-sm">
          <View className="gap-xxs">
            <Text variant="heading-md">Quiet hours</Text>
            <Text variant="body-sm" color="mute">
              Nothing arrives between {formatHour(prefs.quietHoursStart)} and{" "}
              {formatHour(prefs.quietHoursEnd)}.
            </Text>
          </View>

          <HourPicker
            label="From"
            value={prefs.quietHoursStart}
            onChange={(quietHoursStart) => update({ quietHoursStart })}
          />
          <View className="hairline-t" />
          <HourPicker
            label="Until"
            value={prefs.quietHoursEnd}
            onChange={(quietHoursEnd) => update({ quietHoursEnd })}
          />
        </Card>
      </View>
    </Screen>
  );
}

function HourPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (hour: number) => void;
}) {
  return (
    <View className="row-between gap-md">
      <Text variant="heading-sm">{label}</Text>
      <Stepper
        value={value}
        onChange={onChange}
        step={1}
        min={0}
        max={23}
        wrap
        valueMinWidth={84}
        format={formatHour}
      />
    </View>
  );
}
