import type { ReactNode } from "react";
import { ScrollView, View, type ScrollViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cn } from "@/lib/cn";

interface ScreenProps extends Pick<ScrollViewProps, "stickyHeaderIndices"> {
  children: ReactNode;
  /** Set false for screens that manage their own scrolling (camera, lists). */
  scroll?: boolean;
  /** Adds the 16px gutter DESIGN.md mandates. Off for edge-to-edge content. */
  gutter?: boolean;
  /** Leaves room for the tab bar so the last row isn't trapped under the FAB. */
  tabBarPadding?: boolean;
  className?: string;
}

export function Screen({
  children,
  scroll = true,
  gutter = true,
  tabBarPadding = false,
  className,
  ...rest
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const paddingTop = insets.top;
  const paddingBottom = insets.bottom + (tabBarPadding ? 96 : 16);

  if (!scroll) {
    return (
      <View className={cn("fill bg-canvas", gutter && "gutter", className)} style={{ paddingTop }}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      className={cn("fill bg-canvas", className)}
      contentContainerClassName={cn(gutter && "gutter")}
      contentContainerStyle={{ paddingTop, paddingBottom }}
      showsVerticalScrollIndicator={false}
      {...rest}
    >
      {children}
    </ScrollView>
  );
}
