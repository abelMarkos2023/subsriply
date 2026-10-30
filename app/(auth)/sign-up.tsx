import { AuthSocialProviders } from "@/components/AuthSocialProviders";
import { useAuth, useSignUp } from "@clerk/expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Keyboard,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const palette = {
  background: "#fff9e3",
  ink: "#081126",
  muted: "#626a78",
  border: "#e4dfcd",
  white: "#ffffff",
  accent: "#ea7a53",
  error: "#a8342c",
  errorBackground: "#fff0ed",
};

export default function SignUpScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signUp } = useSignUp();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResendingCode, setIsResendingCode] = useState(false);

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={palette.ink} />
      </SafeAreaView>
    );
  }

  if (isSignedIn) {
    router.replace("/(tabs)");
    return null;
  }

  const handleSignUp = async () => {
    setError("");
    setIsSubmitting(true);
    Keyboard.dismiss();

    try {
      const { error: signUpError } = await signUp.password({
        emailAddress,
        password,
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      const { error: verificationError } =
        await signUp.verifications.sendEmailCode();
      if (verificationError) {
        setError(verificationError.message);
      } else {
        setPendingVerification(true);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to create your account.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setIsSubmitting(true);
    Keyboard.dismiss();

    try {
      const { error: verificationError } =
        await signUp.verifications.verifyEmailCode({ code });

      if (verificationError) {
        setError(verificationError.message);
      } else if (signUp.status === "complete") {
        const { error: finalizeError } = await signUp.finalize();
        if (finalizeError) {
          setError(finalizeError.message);
        } else {
          router.replace("/(tabs)");
        }
      } else {
        setError("Email verification is still pending.");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Verification failed.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setIsResendingCode(true);

    try {
      const { error: resendError } = await signUp.verifications.sendEmailCode();
      if (resendError) setError(resendError.message);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to resend the code.";
      setError(message);
    } finally {
      setIsResendingCode(false);
    }
  };

  if (pendingVerification) {
    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          <View style={styles.content}>
            <View style={styles.brandRow}>
              <View style={styles.brandMark}>
                <Text style={styles.brandInitial}>S</Text>
              </View>
              <Text style={styles.brandName}>Subscriply</Text>
            </View>

            <View style={styles.headingGroup}>
              <Text style={styles.eyebrow}>ONE QUICK LAST STEP</Text>
              <Text style={styles.title}>Check your inbox</Text>
              <Text style={styles.subtitle}>
                We sent a verification code to {emailAddress}. Enter it below to
                finish creating your account.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Verification code</Text>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="number-pad"
                  placeholder="Enter your code"
                  placeholderTextColor="#96958d"
                  value={code}
                  onChangeText={setCode}
                  returnKeyType="go"
                  onSubmitEditing={handleVerify}
                  style={styles.input}
                />
              </View>

              {error ? (
                <Text accessibilityRole="alert" style={styles.error}>
                  {error}
                </Text>
              ) : null}

              <Pressable
                accessibilityRole="button"
                disabled={isSubmitting || !code}
                onPress={handleVerify}
                style={({ pressed }) => [
                  styles.primaryButton,
                  (!code || isSubmitting) && styles.buttonDisabled,
                  pressed && styles.buttonPressed,
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={palette.white} />
                ) : (
                  <Text style={styles.primaryButtonText}>Verify email</Text>
                )}
              </Pressable>

              <Pressable
                accessibilityRole="button"
                disabled={isResendingCode}
                onPress={handleResendCode}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.secondaryButtonPressed,
                ]}
              >
                {isResendingCode ? (
                  <ActivityIndicator color={palette.ink} size="small" />
                ) : (
                  <Text style={styles.secondaryButtonText}>Resend code</Text>
                )}
              </Pressable>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <Link href="/(auth)/sign-in" asChild>
                <Pressable accessibilityRole="link" hitSlop={8}>
                  <Text style={styles.footerLink}>Sign in</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.content}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Text style={styles.brandInitial}>S</Text>
            </View>
            <Text style={styles.brandName}>Subscriply</Text>
          </View>

          <View style={styles.headingGroup}>
            <Text style={styles.eyebrow}>A CLEARER WAY TO SUBSCRIBE</Text>
            <Text style={styles.title}>Take control of it all</Text>
            <Text style={styles.subtitle}>
              Create an account and bring every subscription into focus.
            </Text>
          </View>

          <AuthSocialProviders />

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="you@example.com"
                placeholderTextColor="#96958d"
                value={emailAddress}
                onChangeText={setEmailAddress}
                returnKeyType="next"
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                autoComplete="new-password"
                placeholder="Create a password"
                placeholderTextColor="#96958d"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="go"
                onSubmitEditing={handleSignUp}
                style={styles.input}
              />
              <Text style={styles.fieldHint}>
                Use at least 8 characters for a stronger password.
              </Text>
            </View>

            {error ? (
              <Text accessibilityRole="alert" style={styles.error}>
                {error}
              </Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting || !emailAddress || !password}
              onPress={handleSignUp}
              style={({ pressed }) => [
                styles.primaryButton,
                (!emailAddress || !password || isSubmitting) &&
                  styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color={palette.white} />
              ) : (
                <Text style={styles.primaryButtonText}>Create account</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Link href="/(auth)/sign-in" asChild>
              <Pressable accessibilityRole="link" hitSlop={8}>
                <Text style={styles.footerLink}>Sign in</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  content: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 48,
  },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.ink,
  },
  brandInitial: {
    color: palette.background,
    fontFamily: "sans-extrabold",
    fontSize: 21,
  },
  brandName: {
    color: palette.ink,
    fontFamily: "sans-bold",
    fontSize: 17,
  },
  headingGroup: {
    marginBottom: 28,
  },
  eyebrow: {
    color: palette.accent,
    fontFamily: "sans-bold",
    fontSize: 11,
    marginBottom: 12,
  },
  title: {
    color: palette.ink,
    fontFamily: "sans-bold",
    fontSize: 34,
    lineHeight: 41,
    marginBottom: 8,
  },
  subtitle: {
    color: palette.muted,
    fontFamily: "sans-regular",
    fontSize: 15,
    lineHeight: 23,
  },
  form: {
    gap: 18,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: palette.ink,
    fontFamily: "sans-semibold",
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 13,
    minHeight: 54,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: palette.white,
    color: palette.ink,
    fontFamily: "sans-medium",
    fontSize: 15,
  },
  fieldHint: {
    color: palette.muted,
    fontFamily: "sans-regular",
    fontSize: 12,
    lineHeight: 18,
  },
  error: {
    color: palette.error,
    backgroundColor: palette.errorBackground,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: "sans-medium",
    fontSize: 13,
    lineHeight: 19,
    overflow: "hidden",
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.ink,
    marginTop: 4,
  },
  primaryButtonText: {
    color: palette.white,
    fontFamily: "sans-semibold",
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.48,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  secondaryButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonPressed: {
    opacity: 0.65,
  },
  secondaryButtonText: {
    color: palette.ink,
    fontFamily: "sans-semibold",
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 26,
  },
  footerText: {
    color: palette.muted,
    fontFamily: "sans-regular",
    fontSize: 14,
  },
  footerLink: {
    color: palette.ink,
    fontFamily: "sans-bold",
    fontSize: 14,
  },
});
