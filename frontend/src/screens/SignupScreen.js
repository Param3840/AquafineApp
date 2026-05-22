import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Easing,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { Droplets } from "lucide-react-native";
import CustomInput from "../components/CustomInput";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const SignupScreen = ({ onLogin, onSuccess }) => {
  const { signup } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Entrance animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 750,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 750,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    setError("");
    setMessage("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const data = await signup(form);
      setMessage(data.message || "Verification email sent. Please verify your email before logging in.");
      setTimeout(() => {
        onLogin?.();
      }, 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.white,
              borderColor: colors.border,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              shadowColor: isDarkMode ? "#000000" : "#0f172a",
            },
          ]}
        >
          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <View style={[styles.miniLogo, { backgroundColor: isDarkMode ? "#101d20" : "#f0fdfa", borderColor: isDarkMode ? "rgba(20, 184, 166, 0.3)" : "rgba(15, 118, 110, 0.15)" }]}>
              <Droplets size={24} color={colors.teal} fill={isDarkMode ? "rgba(20, 184, 166, 0.15)" : "transparent"} />
            </View>
            <Text style={[styles.brandText, { color: colors.slate }]}>
              Aqua<Text style={styles.goldAccent}>fine</Text>
            </Text>
          </View>

          <Text style={[styles.title, { color: colors.slate }]}>Create Account</Text>

          <CustomInput
            placeholder="Full Name"
            value={form.fullName}
            onChangeText={(value) => update("fullName", value)}
          />
          <CustomInput
            placeholder="Email"
            keyboardType="email-address"
            value={form.email}
            onChangeText={(value) => update("email", value)}
          />
          <CustomInput
            placeholder="Mobile Number"
            keyboardType="phone-pad"
            value={form.mobile}
            onChangeText={(value) => update("mobile", value)}
          />
          <CustomInput
            placeholder="Password"
            value={form.password}
            onChangeText={(value) => update("password", value)}
            secureTextEntry
          />
          <CustomInput
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChangeText={(value) => update("confirmPassword", value)}
            secureTextEntry
          />

          {!!error && <Text style={[styles.error, { color: colors.red }]}>{error}</Text>}
          {!!message && <Text style={[styles.message, { color: colors.teal }]}>{message}</Text>}

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.teal }]}
            activeOpacity={0.88}
            onPress={submit}
            disabled={loading}
          >
            <Text style={styles.primaryText}>{loading ? "Creating..." : "Signup"}</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={[styles.line, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.muted }]}>or</Text>
            <View style={[styles.line, { backgroundColor: colors.border }]} />
          </View>

          <TouchableOpacity style={styles.linkButton} onPress={onLogin} activeOpacity={0.7}>
            <Text style={[styles.linkText, { color: colors.teal }]}>Sign In Instead</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    justifyContent: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
    width: "100%",
    alignSelf: "center",
    elevation: 12,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  brandHeader: {
    alignItems: "center",
    marginBottom: 14,
  },
  miniLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  brandText: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  goldAccent: {
    color: "#fbbf24",
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 16,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 16,
    justifyContent: "center",
    paddingVertical: 14,
    marginTop: 10,
    elevation: 4,
    shadowColor: "#0f766e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
  },
  primaryText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  line: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    fontWeight: "700",
  },
  linkButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "900",
  },
  error: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});
