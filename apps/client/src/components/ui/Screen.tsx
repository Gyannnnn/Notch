import type { ReactNode } from "react";
import { ScrollView, View, type ScrollViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cn } from "@/lib/cn";
import { spacing } from "@/theme/tokens";

interface ScreenProps extends Pick<ScrollViewProps, "stickyHeaderIndices"> {
  children: ReactNode;
  /** Set false for screens that manage their own scrolling (camera, lists). */
  scroll?: boolean;
  /** Adds the 16px gutter DESIGN.md mandates. Off for edge-to-edge content. */
  gutter?: boolean;
  /** Set true on a screen mounted under the tab bar. */
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
  /**
   * A tab screen's own height already excludes the tab bar: expo-router's
   * BottomTabView lays screens and the tab bar out as normal flex-column
   * siblings (screens `flex: 1`, the bar sized to its own measured height),
   * so the scroll area already stops flush with the bar's top edge — and
   * that measured height already bakes in `insets.bottom` (TabBar sets it on
   * its own root). Adding `insets.bottom` again here, on top of a large
   * fixed guess at the bar's height, double-reserved space no scroll ever
   * needed: on a short screen the two stacked paddings showed up as a bare
   * band of `bg-canvas` sitting above the bar. A tab screen only needs the
   * breathing gap DESIGN.md specifies ("Above the tab bar: reserve
   * `{spacing.3xl}`"); a non-tab screen (no bar to exclude it) still needs
   * the safe-area inset itself.
   */
  const paddingBottom = tabBarPadding ? spacing["3xl"] : insets.bottom + spacing.md;

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
