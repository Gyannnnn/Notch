import Feather from "@expo/vector-icons/Feather";
import { View } from "react-native";

import { cn } from "@/lib/cn";
import { colors } from "@/theme/tokens";
import { Button } from "./Button";
import { Text } from "./Text";

interface EmptyStateProps {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
  className?: string;
}

/**
 * Dashed border distinguishes "nothing here yet" from "something failed".
 * Copy is always an invitation, never a correction (PRD 10.3).
 */
export function EmptyState({
  icon,
  title,
  body,
  actionLabel,
  onAction,
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <View
      className={cn(
        "center gap-xs rounded-lg border border-dashed border-hairline-strong bg-elevated",
        compact ? "p-md" : "p-lg",
        className,
      )}
    >
      {icon && <Feather name={icon} size={compact ? 20 : 24} color={colors.faint} />}
      <Text variant={compact ? "heading-sm" : "heading-md"} className="text-center">
        {title}
      </Text>
      {body && (
        <Text variant="body-md" color="body" className="text-center">
          {body}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button label={actionLabel} variant="secondary" onPress={onAction} className="mt-xs" />
      )}
    </View>
  );
}
