import { AuthSocialProviders } from "@/components/AuthSocialProviders";
import { useAuth, useSignIn } from "@clerk/expo";
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

export default function SignInScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signIn } = useSignIn();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationStep, setVerificationStep] = useState<
    "device-trust" | "mfa" | null
  >(null);
  const [secondFactorStrategy, setSecondFactorStrategy] = useState<
    "email_code" | "phone_code" | "totp" | "backup_code" | null
  >(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSignIn = async () => {
    setError("");
    setIsSubmitting(true);
    Keyboard.dismiss();

    try {
      const { error: signInError } = await signIn.password({
        identifier: emailAddress,
        password,
      });

      if (signInError) {
        setError(signInError.message);
      } else if (signIn.status === "complete") {
        await finalizeSignIn();
      } else if (signIn.status === "needs_client_trust") {
        const emailCodeFactor = signIn.supportedSecondFactors.find(
          (factor) => factor.strategy === "email_code",
        );

        if (!emailCodeFactor) {
          setError(
            "This device needs verification, but no email code is available.",
          );
          return;
        }

        const { error: sendError } = await signIn.mfa.sendEmailCode();
        if (sendError) {
          setError(sendError.message);
        } else {
          setVerificationStep("device-trust");
          setSecondFactorStrategy("email_code");
        }
      } else if (signIn.status === "needs_second_factor") {
        const factor = signIn.supportedSecondFactors.find((supportedFactor) =>
          ["email_code", "phone_code", "totp", "backup_code"].includes(
            supportedFactor.strategy,
          ),
        );

        if (!factor) {
          setError(
            "Your account requires a verification method this screen does not support.",
          );
          return;
        }

        const strategy = factor.strategy as NonNullable<
          typeof secondFactorStrategy
        >;
        setSecondFactorStrategy(strategy);

        if (strategy === "email_code") {
          const { error: sendError } = await signIn.mfa.sendEmailCode();
          if (sendError) {
            setError(sendError.message);
            return;
          }
        } else if (strategy === "phone_code") {
          const { error: sendError } = await signIn.mfa.sendPhoneCode();
          if (sendError) {
            setError(sendError.message);
            return;
          }
        }

        setVerificationStep("mfa");
      } else {
        setError(`Sign-in could not be completed (${signIn.status}).`);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to sign in right now.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const finalizeSignIn = async () => {
    const { error: finalizeError } = await signIn.finalize();
    if (finalizeError) {
      setError(finalizeError.message);
    } else {
      router.replace("/(tabs)");
    }
  };

  const handleVerifyCode = async () => {
    setError("");
    setIsSubmitting(true);
    Keyboard.dismiss();

    try {
      let verificationError: { message: string } | null = null;

      if (secondFactorStrategy === "email_code") {
        const result = await signIn.mfa.verifyEmailCode({
          code: verificationCode,
        });
        verificationError = result.error;
      } else if (secondFactorStrategy === "phone_code") {
        const result = await signIn.mfa.verifyPhoneCode({
          code: verificationCode,
        });
        verificationError = result.error;
      } else if (secondFactorStrategy === "totp") {
        const result = await signIn.mfa.verifyTOTP({ code: verificationCode });
        verificationError = result.error;
      } else if (secondFactorStrategy === "backup_code") {
        const result = await signIn.mfa.verifyBackupCode({
          code: verificationCode,
        });
        verificationError = result.error;
      }

      if (verificationError) {
        setError(verificationError.message);
      } else if (signIn.status === "complete") {
        await finalizeSignIn();
      } else {
        setError(
          "That code was accepted, but sign-in still needs another step.",
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to verify that code.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setError("");

    try {
      const result =
        secondFactorStrategy === "phone_code"
          ? await signIn.mfa.sendPhoneCode()
          : await signIn.mfa.sendEmailCode();
      if (result.error) setError(result.error.message);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to resend the code.",
      );
    }
  };

  const handleStartOver = async () => {
    setError("");
    setVerificationCode("");
    setVerificationStep(null);
    setSecondFactorStrategy(null);
    await signIn.reset();
  };

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
            <Text style={styles.eyebrow}>
              {verificationStep ? "SECURE SIGN-IN" : "YOUR MONEY, IN FOCUS"}
            </Text>
            <Text style={styles.title}>
              {verificationStep === "device-trust"
                ? "Verify this device"
                : verificationStep === "mfa"
                  ? "Verify your identity"
                  : "Welcome back"}
            </Text>
            <Text style={styles.subtitle}>
              {verificationStep === "device-trust"
                ? "We sent a security code to your email to confirm this device."
                : verificationStep === "mfa"
                  ? "Enter the verification code for your account."
                  : "Sign in to pick up right where you left off."}
            </Text>
          </View>

          {!verificationStep ? <AuthSocialProviders /> : null}

          <View style={styles.form}>
            {verificationStep ? (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  {secondFactorStrategy === "totp"
                    ? "Authenticator code"
                    : secondFactorStrategy === "backup_code"
                      ? "Backup code"
                      : "Verification code"}
                </Text>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType={
                    secondFactorStrategy === "backup_code"
                      ? "default"
                      : "number-pad"
                  }
                  placeholder="Enter your code"
                  placeholderTextColor="#96958d"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  returnKeyType="go"
                  onSubmitEditing={handleVerifyCode}
                  style={styles.input}
                />
              </View>
            ) : (
              <>
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
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    placeholderTextColor="#96958d"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    returnKeyType="go"
                    onSubmitEditing={handleSignIn}
                    style={styles.input}
                  />
                </View>
              </>
            )}

            {error ? (
              <Text accessibilityRole="alert" style={styles.error}>
                {error}
              </Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={
                isSubmitting ||
                (verificationStep
                  ? !verificationCode
                  : !emailAddress || !password)
              }
              onPress={verificationStep ? handleVerifyCode : handleSignIn}
              style={({ pressed }) => [
                styles.primaryButton,
                ((!verificationStep && (!emailAddress || !password)) ||
                  (verificationStep && !verificationCode) ||
                  isSubmitting) &&
                  styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color={palette.white} />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {verificationStep ? "Verify code" : "Sign in"}
                </Text>
              )}
            </Pressable>

            {verificationStep ? (
              <View style={styles.verificationActions}>
                {secondFactorStrategy === "email_code" ||
                secondFactorStrategy === "phone_code" ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={handleResendCode}
                    style={({ pressed }) =>
                      pressed && styles.secondaryButtonPressed
                    }
                  >
                    <Text style={styles.secondaryButtonText}>Resend code</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  onPress={handleStartOver}
                  style={({ pressed }) =>
                    pressed && styles.secondaryButtonPressed
                  }
                >
                  <Text style={styles.secondaryButtonText}>
                    Back to sign in
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>

          {!verificationStep ? (
            <View style={styles.footer}>
              <Text style={styles.footerText}>New to Subscriply?</Text>
              <Link href="/(auth)/sign-up" asChild>
                <Pressable accessibilityRole="link" hitSlop={8}>
                  <Text style={styles.footerLink}>Create an account</Text>
                </Pressable>
              </Link>
            </View>
          ) : null}
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
    marginBottom: 56,
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
    marginBottom: 32,
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
    gap: 20,
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
    minHeight: 54,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 13,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: palette.white,
    color: palette.ink,
    fontFamily: "sans-medium",
    fontSize: 15,
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
  verificationActions: {
    gap: 4,
  },
  secondaryButtonPressed: {
    opacity: 0.65,
  },
  secondaryButtonText: {
    color: palette.ink,
    textAlign: "center",
    fontFamily: "sans-semibold",
    fontSize: 14,
    paddingVertical: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 30,
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
