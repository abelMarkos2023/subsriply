import { useSSO } from "@clerk/expo/experimental";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

const providers = [
  { strategy: "oauth_google", name: "Google", mark: "G", color: "#4285f4" },
  { strategy: "oauth_facebook", name: "Facebook", mark: "f", color: "#1877f2" },
  { strategy: "oauth_x", name: "X", mark: "X", color: "#081126" },
] as const;

export function AuthSocialProviders() {
  const { startSSOFlow } = useSSO();
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleProviderSignIn = async (
    strategy: (typeof providers)[number]["strategy"],
  ) => {
    setActiveProvider(strategy);
    setError("");

    try {
      const { createdSessionId } = await startSSOFlow({ strategy });
      if (createdSessionId) {
        router.replace("/(tabs)");
      }
    } catch (authError) {
      const message =
        authError instanceof Error
          ? authError.message
          : "Social sign-in could not be completed.";
      setError(message);
    } finally {
      setActiveProvider(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.providerList}>
        {providers.map((provider) => {
          const isActive = activeProvider === provider.strategy;
          const isDisabled = activeProvider !== null;

          return (
            <Pressable
              key={provider.strategy}
              accessibilityRole="button"
              accessibilityLabel={`Continue with ${provider.name}`}
              disabled={isDisabled}
              onPress={() => handleProviderSignIn(provider.strategy)}
              style={({ pressed }) => [
                styles.providerButton,
                pressed && styles.providerButtonPressed,
                isDisabled && !isActive && styles.providerButtonDisabled,
              ]}
            >
              {isActive ? (
                <ActivityIndicator size="small" color={provider.color} />
              ) : (
                <Text
                  accessible={false}
                  style={[styles.providerMark, { color: provider.color }]}
                >
                  {provider.mark}
                </Text>
              )}
              <Text style={styles.providerLabel}>
                Continue with {provider.name}
              </Text>
              <View style={styles.trailingSpace} />
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginBottom: 26,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 2,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e4dfcd",
  },
  dividerText: {
    color: "#77796f",
    fontFamily: "sans-semibold",
    fontSize: 10,
  },
  providerList: {
    gap: 10,
  },
  providerButton: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#e4dfcd",
    borderRadius: 13,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
  },
  providerButtonPressed: {
    backgroundColor: "#f6f2e7",
  },
  providerButtonDisabled: {
    opacity: 0.55,
  },
  providerMark: {
    width: 22,
    textAlign: "center",
    fontFamily: "sans-bold",
    fontSize: 19,
  },
  providerLabel: {
    flex: 1,
    color: "#081126",
    textAlign: "center",
    fontFamily: "sans-semibold",
    fontSize: 14,
  },
  trailingSpace: {
    width: 22,
  },
  error: {
    color: "#a8342c",
    backgroundColor: "#fff0ed",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: "sans-medium",
    fontSize: 13,
    lineHeight: 19,
    overflow: "hidden",
  },
});
