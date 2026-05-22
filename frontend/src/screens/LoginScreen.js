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

const LoginScreen = ({ onSignup, onForgot, onSuccess }) => {
  const { login } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Card entrance animation values
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

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      await login({ mobile, password });
      onSuccess?.();
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
          {/* Custom Premium Mini Branding Header */}
          <View style={styles.brandHeader}>
            <View style={[styles.miniLogo, { backgroundColor: isDarkMode ? "#101d20" : "#f0fdfa", borderColor: isDarkMode ? "rgba(20, 184, 166, 0.3)" : "rgba(15, 118, 110, 0.15)" }]}>
              <Droplets size={26} color={colors.teal} fill={isDarkMode ? "rgba(20, 184, 166, 0.15)" : "transparent"} />
            </View>
            <Text style={[styles.brandText, { color: colors.slate }]}>
              Aqua<Text style={styles.goldAccent}>fine</Text>
            </Text>
            <Text style={[styles.brandTagline, { color: colors.muted }]}>
              Premium Bottled Water
            </Text>
          </View>

          <Text style={[styles.title, { color: colors.slate }]}>Welcome Back</Text>

          <CustomInput
            placeholder="Mobile Number"
            keyboardType="phone-pad"
            value={mobile}
            onChangeText={setMobile}
          />
          
          <CustomInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {!!error && <Text style={[styles.error, { color: colors.red }]}>{error}</Text>}

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.teal }]}
            activeOpacity={0.88}
            onPress={submit}
            disabled={loading}
          >
            <Text style={styles.primaryText}>{loading ? "Please wait..." : "Login"}</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={[styles.line, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.muted }]}>or</Text>
            <View style={[styles.line, { backgroundColor: colors.border }]} />
          </View>

          <TouchableOpacity style={styles.linkButton} onPress={onSignup} activeOpacity={0.7}>
            <Text style={[styles.linkText, { color: colors.teal }]}>Create New Account</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={onForgot} activeOpacity={0.7}>
            <Text style={[styles.forgotText, { color: colors.muted }]}>Forgot Password?</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    justifyContent: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 16,
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
    marginBottom: 20,
  },
  miniLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  brandText: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  goldAccent: {
    color: "#fbbf24", // Gold branding accent
  },
  brandTagline: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginTop: 4,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 18,
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
    marginVertical: 18,
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
    paddingVertical: 10,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "900",
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  error: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },
});
