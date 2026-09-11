import { useRouter } from "expo-router";
import { useState } from "react";
import { TextInput, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Text } from "@/components/ui/Text";
import { colors, fonts } from "@/theme/tokens";

/**
 * Clerk is not wired up in this pass. Android-first launch, so Google and email
 * only — no Apple Sign-In yet.
 */
export default function SignInScreen() {
  const router = useRouter();
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");

  const continueWithEmail = () => {
    if (!email.includes("@")) return;
    router.push({ pathname: "/(auth)/verify-otp", params: { email } });
  };

  return (
    <Screen scroll={false}>
      <ScreenHeader />

      <View className="fill justify-center gap-sm">
        <Text variant="heading-lg">Sign in</Text>
        <Text variant="body-lg" color="body">
          Your photos and logs stay tied to your account, and private by default.
        </Text>
      </View>

      <View className="gap-xs pb-lg">
        {showEmail ? (
          <>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.faint}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
              className="rounded-sm border border-hairline-strong bg-elevated px-md text-ink"
              style={{ fontFamily: fonts.regular, fontSize: 16, minHeight: 48 }}
            />
            <Button label="Continue" fullWidth onPress={continueWithEmail} />
            <Button label="Back" variant="ghost" onPress={() => setShowEmail(false)} />
          </>
        ) : (
          <>
            <Button
              label="Continue with Google"
              variant="secondary"
              fullWidth
              onPress={() => router.replace("/(auth)/onboarding/goal")}
            />
            <Button
              label="Continue with email"
              variant="secondary"
              fullWidth
              onPress={() => setShowEmail(true)}
            />
          </>
        )}
      </View>
    </Screen>
  );
}
