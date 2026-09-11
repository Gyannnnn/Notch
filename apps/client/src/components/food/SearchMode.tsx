import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Badge } from "@/components/ui/Badge";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchBar } from "@/components/ui/SearchBar";
import { Text } from "@/components/ui/Text";
import { useFoodSearch, useLogFood, type FoodFilter } from "@/hooks/data";
import { macrosForPortion } from "@/lib/macros";
import { colors } from "@/theme/tokens";
import type { FoodItem, MealSlot } from "@/types/domain";

const FILTERS: { value: FoodFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "mine", label: "My foods" },
  { value: "presets", label: "Presets" },
  { value: "recent", label: "Recent" },
];

/**
 * Quick-add logs without leaving the screen so several items can go in during
 * one visit; the row confirms inline rather than navigating away.
 */
export function SearchMode({ mealSlot }: { mealSlot: MealSlot }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FoodFilter>("all");
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const { data: results } = useFoodSearch(query, filter);
  const logFood = useLogFood();

  const add = (item: FoodItem) => {
    logFood({
      foodItemId: item.id,
      grams: item.servingSizeG ?? 100,
      mealSlot,
      loggedVia: item.source === "PRESET" ? "PRESET_TAP" : "MANUAL_ENTRY",
    });
    setJustAdded(item.id);
    setTimeout(() => setJustAdded((id) => (id === item.id ? null : id)), 1200);
  };

  return (
    <View className="fill gap-sm">
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search foods and dishes" />

      <View className="row gap-xs">
        {FILTERS.map((f) => (
          <Chip
            key={f.value}
            label={f.label}
            selected={filter === f.value}
            onPress={() => setFilter(f.value)}
          />
        ))}
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        ItemSeparatorComponent={() => <View className="hairline-t" />}
        ListEmptyComponent={
          <EmptyState
            icon="search"
            title="No matches"
            body="Try a different name, or add it manually."
            compact
            className="mt-lg"
          />
        }
        renderItem={({ item }) => (
          <FoodRow
            item={item}
            added={justAdded === item.id}
            onAdd={() => add(item)}
          />
        )}
      />
    </View>
  );
}

/**
 * Preset dishes lead with their real-world portion ("1 katori") and keep grams
 * as the secondary detail, which is how people actually measure these meals.
 */
function FoodRow({
  item,
  added,
  onAdd,
}: {
  item: FoodItem;
  added: boolean;
  onAdd: () => void;
}) {
  const grams = item.servingSizeG ?? 100;
  const macros = macrosForPortion(item, grams);
  const isPreset = item.source === "PRESET";

  return (
    <View className="row-between gap-sm py-sm" style={{ minHeight: 56 }}>
      <View className="fill gap-xxs">
        <View className="row gap-xs">
          <Text variant="heading-sm" numberOfLines={1}>
            {item.name}
          </Text>
          {isPreset && <Badge label="Preset" tone="positive" uppercase />}
        </View>
        <Text variant="body-sm" color="mute">
          {isPreset ? `${item.portionLabel} · ${grams}g` : `${item.brandName} · ${grams}g`}
          {` · ${macros.caloriesLogged} kcal`}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Add ${item.name}`}
        onPress={onAdd}
        hitSlop={8}
        className="center"
        style={{ width: 32, height: 32 }}
      >
        {added ? (
          <Animated.View
            entering={FadeIn.duration(120)}
            className="center rounded-full bg-primary"
            style={{ width: 28, height: 28 }}
          >
            <Feather name="check" size={16} color={colors["on-primary"]} />
          </Animated.View>
        ) : (
          <Feather name="plus-circle" size={26} color={colors.ink} />
        )}
      </Pressable>
    </View>
  );
}
