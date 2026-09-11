import Feather from "@expo/vector-icons/Feather";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { cn } from "@/lib/cn";
import { colors } from "@/theme/tokens";
import { Text } from "./Text";

interface ListRowProps {
  title: string;
  subtitle?: string;
  /** Right-aligned value, e.g. a calorie count. */
  value?: string;
  valueCaption?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  className?: string;
}

export function ListRow({
  title,
  subtitle,
  value,
  valueCaption,
  leading,
  trailing,
  onPress,
  showChevron,
  className,
}: ListRowProps) {
  const Container = onPress ? Pressable : View;

  return (
    <Container
      {...(onPress ? { onPress, accessibilityRole: "button" as const } : {})}
      className={cn("row-between gap-sm py-sm", onPress && "active:opacity-70", className)}
      style={{ minHeight: 56 }}
    >
      {leading}
      <View className="fill">
        <Text variant="heading-sm" numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="body-sm" color="mute" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {value && (
        <View className="items-end">
          <Text variant="label-md" tabular>
            {value}
          </Text>
          {valueCaption && (
            <Text variant="body-sm" color="mute">
              {valueCaption}
            </Text>
          )}
        </View>
      )}
      {trailing}
      {showChevron && <Feather name="chevron-right" size={18} color={colors.faint} />}
    </Container>
  );
}
