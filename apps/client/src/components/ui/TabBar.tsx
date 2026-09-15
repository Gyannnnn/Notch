import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePressScale } from "@/hooks/usePressScale";
import { colors, shadow } from "@/theme/tokens";

/**
 * Ionicons rather than the Feather set the rest of the app uses: an icon-only bar
 * needs a filled/outline pair to carry the active state, and Feather ships outlines
 * only. Both sets live inside @expo/vector-icons, so this costs no dependency — and
 * it stays scoped to this file. Everything else in the app is still Feather.
 */
type Glyph = keyof typeof Ionicons.glyphMap;

/**
 * The single source of tab identity and order. Route `name` matches the file in
 * app/(tabs); `label` is never drawn — the bar is icon-only — and exists purely so
 * screen readers still have something to announce.
 */
const TABS = [
  { name: "today", icon: "home-outline", active: "home", label: "Home" },
  { name: "progress", icon: "grid-outline", active: "grid", label: "Progress" },
  { name: "plan", icon: "stats-chart-outline", active: "stats-chart", label: "Plan" },
  { name: "you", icon: "person-circle-outline", active: "person-circle", label: "You" },
] as const satisfies readonly { name: string; icon: Glyph; active: Glyph; label: string }[];

const BAR = 56;
/** How far the FAB rises above the bar surface (DESIGN.md `tab-fab.offsetY`). */
const RISE = 18;
const FAB = 56;
/** Width of the gap the tab row leaves for the FAB to sit in. */
const FAB_SLOT = 72;

/**
 * Typed against only what this bar uses. expo-router ships its own bottom-tabs
 * types that are structurally incompatible with @react-navigation/bottom-tabs,
 * so depending on either one's full prop type breaks on version drift.
 */
interface TabBarProps {
  state: {
    index: number;
    routes: { key: string; name: string }[];
  };
  navigation: { navigate: (name: string) => void };
}

/**
 * Four destinations plus a raised centre action. The "+" is not a fifth tab —
 * it opens the capture sheet stack and owns no route of its own.
 *
 * The FAB rises above the bar, and on Android a view is neither drawn nor
 * touchable outside its parent's bounds. So the bar is two layers inside one
 * container tall enough to hold both: the surface is pinned to the bottom, and
 * the FAB sits at the top of the same container rather than escaping the surface
 * with a negative margin.
 *
 * The FAB's own positioning box is sized to the FAB (56×56), not to the bar's
 * full width — an earlier version spanned edge to edge so it could `alignItems:
 * "center"` the circle, and that oversized transparent layer, elevated (it holds
 * an `elevation`-bearing child), rendered as a faint rectangle above the bar on
 * some Android devices. A box with no more area than its content has no surface
 * left to paint. `box-none` on the outer container still lets touches reach the
 * screen through the empty strips either side of that box.
 */
export function TabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const active = state.routes[state.index]?.name;
  const shown = TABS.filter((tab) => state.routes.some((r) => r.name === tab.name));
  const half = Math.ceil(shown.length / 2);

  return (
    <View pointerEvents="box-none" style={{ height: RISE + BAR + insets.bottom }}>
      <View
        className="row-between hairline-t bg-elevated px-xs"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: BAR + insets.bottom,
          paddingBottom: insets.bottom,
        }}
      >
        {shown.slice(0, half).map((tab) => (
          <TabItem
            key={tab.name}
            tab={tab}
            focused={tab.name === active}
            onPress={() => navigation.navigate(tab.name)}
          />
        ))}

        <View style={{ width: FAB_SLOT }} />

        {shown.slice(half).map((tab) => (
          <TabItem
            key={tab.name}
            tab={tab}
            focused={tab.name === active}
            onPress={() => navigation.navigate(tab.name)}
          />
        ))}
      </View>

      <View
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          marginLeft: -FAB / 2,
          width: FAB,
          height: FAB,
        }}
      >
        <CentreAction onPress={() => router.push("/(modals)/food-capture")} />
      </View>
    </View>
  );
}

function TabItem({
  tab,
  focused,
  onPress,
}: {
  tab: (typeof TABS)[number];
  focused: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={tab.label}
      onPress={onPress}
      className="fill center"
      style={{ minHeight: 48 }}
    >
      <Ionicons
        name={focused ? tab.active : tab.icon}
        size={26}
        color={focused ? colors.ink : colors.mute}
      />
    </Pressable>
  );
}

/**
 * Two earlier attempts at this circle still rendered invisible-but-tappable on
 * Android (a half-size radius instead of `rounded-full`, and an inline
 * `backgroundColor` instead of a className fill) — so the radius and the interop
 * were not the cause. What's left, and unique to this element versus the tab
 * icons beside it, is that the shadow-casting view was also the view Reanimated
 * rewrites every frame: `elevation.floating` (a `boxShadow` string) and
 * `press.style` (a UI-thread `transform` write) sat in the same style array on
 * one `AnimatedPressable`. Android's box-shadow is a composite drawable rebuilt
 * from the view's outline; racing that rebuild against a Reanimated prop write
 * on the same host view is a known source of a drawable that never gets its
 * fill re-painted, on some GPU/OEM combinations.
 *
 * So the two are now on different views: `shadow.floating` (native `elevation`
 * + `shadow*` props, not `boxShadow`) lives on a plain, static `View` that
 * Reanimated never touches. The animated scale lives on its `Animated.View`
 * parent, which carries no visual styling of its own — a transform still scales
 * everything inside it, so the whole circle still presses together.
 */
function CentreAction({ onPress }: { onPress: () => void }) {
  const press = usePressScale(0.92);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Log food"
      onPressIn={press.handlers.onPressIn}
      onPressOut={press.handlers.onPressOut}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <Animated.View style={press.style}>
        <View
          className="center"
          style={[
            {
              width: FAB,
              height: FAB,
              borderRadius: FAB / 2,
              backgroundColor: colors.primary,
            },
            shadow.floating,
          ]}
        >
          <Ionicons name="add" size={28} color={colors["on-primary"]} />
        </View>
      </Animated.View>
    </Pressable>
  );
}
