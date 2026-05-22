import React, { useState } from "react";
import { StyleSheet, TextInput, View, TouchableOpacity } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";

const CustomInput = ({ secureTextEntry, style, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { colors, isDarkMode } = useTheme();

  if (secureTextEntry) {
    return (
      <View style={[
        styles.container,
        {
          backgroundColor: isDarkMode ? "#101d20" : "#f8fafc",
          borderColor: isDarkMode ? "#1f2937" : "#dbe3ec",
        },
        style
      ]}>
        <TextInput
          style={[styles.input, { color: colors.slate }]}
          placeholderTextColor={isDarkMode ? "#64748b" : "#94a3b8"}
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
            <EyeOff size={20} color={isDarkMode ? "#64748b" : "#94a3b8"} />
          ) : (
            <Eye size={20} color={isDarkMode ? "#64748b" : "#94a3b8"} />
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: isDarkMode ? "#101d20" : "#f8fafc",
        borderColor: isDarkMode ? "#1f2937" : "#dbe3ec",
      },
      style
    ]}>
      <TextInput
        style={[styles.input, { color: colors.slate }]}
        placeholderTextColor={isDarkMode ? "#64748b" : "#94a3b8"}
        autoCapitalize="none"
        {...props}
      />
    </View>
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
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
