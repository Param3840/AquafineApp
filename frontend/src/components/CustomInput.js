import React, { useState } from "react";
import { StyleSheet, TextInput, View, TouchableOpacity } from "react-native";
import { colors } from "../styles/theme";
import { Eye, EyeOff } from "lucide-react-native";

const CustomInput = ({ secureTextEntry, style, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  if (secureTextEntry) {
    return (
      <View style={[styles.container, style]}>
        <TextInput
          style={styles.input}
          placeholderTextColor="#94a3b8"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          {...props}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeButton}
          activeOpacity={0.7}
        >
          {showPassword ? (
            <EyeOff size={20} color="#94a3b8" />
          ) : (
            <Eye size={20} color="#94a3b8" />
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={styles.input}
        placeholderTextColor="#94a3b8"
        autoCapitalize="none"
        {...props}
      />
    </View>
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8fafc",
    borderColor: "#dbe3ec",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    color: colors.slate,
    fontSize: 15,
    fontWeight: "700",
    paddingVertical: 12,
  },
  eyeButton: {
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
});
