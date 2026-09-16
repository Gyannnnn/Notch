import Feather from "@expo/vector-icons/Feather";
import * as Haptics from "expo-haptics";
import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { usePressScale } from "@/hooks/usePressScale";
import { MotionPressable } from "@/lib/animated";
import { addDays, formatDayLabel, localDateKey } from "@/lib/date";
import { colors } from "@/theme/tokens";

interface DayNavProps {
  dateKey: string;
  onChange: (dateKey: string) => void;
}

/**
 * Paging back through days, without a calendar. There is no forward step past
 * today — a day that hasn't happened has nothing to say, and an empty future
 * date would read as a gap the user is behind on.
 */
export function DayNav({ dateKey, onChange }: DayNavProps) {
  const isToday = dateKey === localDateKey();
  const todayPress = usePressScale();

  // Paging is a value ticking past a step, which is what selection feedback is
  // for. The label change carries it on its own if haptics are off.
  const step = (next: string) => {
    Haptics.selectionAsync();
    onChange(next);
  };

  return (
    <View className="row-between">
      <Arrow
        direction="left"
        label="Previous day"
        onPress={() => step(localDateKey(addDays(dateKey, -1)))}
      />

      <MotionPressable
        accessibilityRole="button"
        accessibilityLabel={isToday ? "Today" : `${formatDayLabel(dateKey)}, back to today`}
        disabled={isToday}
        onPress={() => step(localDateKey())}
        {...todayPress.handlers}
        className="center row gap-xxs px-sm"
        style={[todayPress.style, { minHeight: 44 }]}
      >
        <Text variant="label-md" color={isToday ? "mute" : "ink"}>
          {formatDayLabel(dateKey)}
        </Text>
        {!isToday && <Feather name="corner-up-right" size={14} color={colors.mute} />}
      </MotionPressable>

      <Arrow
        direction="right"
        label="Next day"
        disabled={isToday}
        onPress={() => step(localDateKey(addDays(dateKey, 1)))}
      />
    </View>
  );
}

function Arrow({
  direction,
  label,
  disabled,
  onPress,
}: {
  direction: "left" | "right";
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      className="tappable center active:opacity-70"
    >
      <Feather
        name={direction === "left" ? "chevron-left" : "chevron-right"}
        size={20}
        color={disabled ? colors.hairline : colors.ink}
      />
    </Pressable>
  );
}
