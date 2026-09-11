import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Text } from "@/components/ui/Text";
import { colors, fonts } from "@/theme/tokens";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (secondsLeft === 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  // No backend to check against, so any six digits continue.
  const submit = () => {
    if (code.length === CODE_LENGTH) router.replace("/(auth)/onboarding/goal");
  };

  return (
    <Screen scroll={false}>
      <ScreenHeader />

      <View className="fill gap-lg pt-lg">
        <View className="gap-xs">
          <Text variant="heading-lg">Enter your code</Text>
          <Text variant="body-lg" color="body">
            We sent a 6-digit code to {email ?? "your email"}.
          </Text>
        </View>

        <Pressable className="row gap-xs" onPress={() => inputRef.current?.focus()}>
          {Array.from({ length: CODE_LENGTH }).map((_, i) => (
            <View
              key={i}
              className="center rounded-sm border bg-elevated"
              style={{
                width: 48,
                height: 48,
                borderColor: i === code.length ? colors.ink : colors["hairline-strong"],
              }}
            >
              <Text variant="metric-md" tabular>
                {code[i] ?? ""}
              </Text>
            </View>
          ))}
        </Pressable>

        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, "").slice(0, CODE_LENGTH))}
          keyboardType="number-pad"
          autoFocus
          maxLength={CODE_LENGTH}
          style={{ position: "absolute", opacity: 0, fontFamily: fonts.regular }}
        />

        {secondsLeft > 0 ? (
          <Text variant="body-md" color="mute">
            Resend available in {secondsLeft}s
          </Text>
        ) : (
          <Button
            label="Resend code"
            variant="ghost"
            onPress={() => setSecondsLeft(RESEND_SECONDS)}
          />
        )}
      </View>

      <View className="pb-lg">
        <Button
          label="Continue"
          fullWidth
          disabled={code.length !== CODE_LENGTH}
          onPress={submit}
        />
      </View>
    </Screen>
  );
}
