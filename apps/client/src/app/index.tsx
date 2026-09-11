import { Redirect } from "expo-router";

import { useUser } from "@/hooks/data";

/**
 * Auth is not wired up in this pass, so entry is decided by the mock user's
 * onboarding state alone.
 */
export default function Entry() {
  const { data: user } = useUser();
  return <Redirect href={user.onboardingComplete ? "/(tabs)/today" : "/(auth)/welcome"} />;
}
