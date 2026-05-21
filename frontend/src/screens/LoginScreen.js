import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CustomInput from "../components/CustomInput";
import { useAuth } from "../context/AuthContext";
import { colors } from "../styles/theme";

const LoginScreen = ({ onSignup, onForgot, onSuccess }) => {
  const { login } = useAuth();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <View style={styles.card}>
      <Text style={styles.title}>Login</Text>
      <CustomInput placeholder="Mobile Number" keyboardType="phone-pad" value={mobile} onChangeText={setMobile} />
      <CustomInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <TouchableOpacity style={styles.primaryButton} onPress={submit} disabled={loading}>
        <Text style={styles.primaryText}>{loading ? "Please wait" : "Login"}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkButton} onPress={onSignup}>
        <Text style={styles.linkText}>Signup</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkButton} onPress={onForgot}>
        <Text style={styles.linkText}>Forgot Password</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

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
});
