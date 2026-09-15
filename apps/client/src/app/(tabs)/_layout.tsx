import { Tabs } from "expo-router";

import { TabBar } from "@/components/ui/TabBar";

/**
 * Order and identity live in TabBar's own config, not here: the custom bar draws
 * no titles, so an `options.title` set here would be a second, silently unused
 * source of truth. These entries exist only to fix the route order.
 */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="today" />
      <Tabs.Screen name="progress" />
      <Tabs.Screen name="plan" />
      <Tabs.Screen name="you" />
    </Tabs>
  );
}
