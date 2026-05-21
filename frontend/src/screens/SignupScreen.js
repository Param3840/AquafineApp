import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CustomInput from "../components/CustomInput";
import { useAuth } from "../context/AuthContext";
import { colors } from "../styles/theme";

const SignupScreen = ({ onLogin, onSuccess }) => {
  const { signup } = useAuth();
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
    <View style={styles.card}>
      <Text style={styles.title}>Create Account</Text>
      <CustomInput placeholder="Full Name" value={form.fullName} onChangeText={(value) => update("fullName", value)} />
      <CustomInput placeholder="Email" keyboardType="email-address" value={form.email} onChangeText={(value) => update("email", value)} />
      <CustomInput placeholder="Mobile Number" keyboardType="phone-pad" value={form.mobile} onChangeText={(value) => update("mobile", value)} />
      <CustomInput placeholder="Password" value={form.password} onChangeText={(value) => update("password", value)} secureTextEntry />
      <CustomInput placeholder="Confirm Password" value={form.confirmPassword} onChangeText={(value) => update("confirmPassword", value)} secureTextEntry />
      {!!error && <Text style={styles.error}>{error}</Text>}
      {!!message && <Text style={styles.message}>{message}</Text>}
      <TouchableOpacity style={styles.primaryButton} onPress={submit} disabled={loading}>
        <Text style={styles.primaryText}>{loading ? "Please wait" : "Signup"}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkButton} onPress={onLogin}>
        <Text style={styles.linkText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },
  title: {
    color: colors.slate,
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 18,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.teal,
    borderRadius: 15,
    justifyContent: "center",
    paddingVertical: 13,
  },
  primaryText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "900",
  },
  linkButton: {
    alignItems: "center",
    marginTop: 14,
  },
  linkText: {
    color: colors.teal,
    fontSize: 14,
    fontWeight: "900",
  },
  error: {
    color: colors.red,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 12,
  },
  message: {
    color: colors.teal,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 12,
  },
});
