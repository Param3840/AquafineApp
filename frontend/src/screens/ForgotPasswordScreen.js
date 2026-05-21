import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CustomInput from "../components/CustomInput";
import { authService } from "../services/authService";
import { colors } from "../styles/theme";

const ForgotPasswordScreen = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const data = await authService.forgotPassword({ email });
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Reset Password</Text>
      <CustomInput placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />
      {!!error && <Text style={styles.error}>{error}</Text>}
      {!!message && <Text style={styles.message}>{message}</Text>}
      <TouchableOpacity style={styles.primaryButton} onPress={submit} disabled={loading}>
        <Text style={styles.primaryText}>{loading ? "Please wait" : "Send Reset Link"}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkButton} onPress={onLogin}>
        <Text style={styles.linkText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPasswordScreen;

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
