import Feather from "@expo/vector-icons/Feather";
import { Pressable, TextInput, View } from "react-native";

import { colors, fonts } from "@/theme/tokens";

interface SearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({ value, onChangeText, placeholder, autoFocus }: SearchBarProps) {
  return (
    <View className="row gap-xs rounded-sm bg-sunken px-sm" style={{ minHeight: 44 }}>
      <Feather name="search" size={18} color={colors.mute} />
      <TextInput
        className="fill text-ink"
        style={{ fontFamily: fonts.regular, fontSize: 16, minWidth: 0 }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.faint}
        autoFocus={autoFocus}
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable accessibilityLabel="Clear search" onPress={() => onChangeText("")} hitSlop={10}>
          <Feather name="x-circle" size={18} color={colors.faint} />
        </Pressable>
      )}
    </View>
  );
}
